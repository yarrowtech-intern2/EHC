"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { UIButton } from "@/components/ui-button";
import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  getAuthRedirectPath,
  getSupabaseBrowserClient,
  savePendingSignup,
  type AppActorType,
} from "@/lib/supabase-browser";

const signupSchema = z
  .object({
    actorType: z.enum(["patient", "tenant_admin", "facility_operator"]),
    signupMethod: z.enum(["email_password", "google", "magic_link"]),
    fullName: z.string().min(2, "Enter a valid name"),
    email: z.string().email("Enter a valid email").optional().or(z.literal("")),
    organizationName: z.string().optional(),
    password: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (!value.email) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email is required for this sign-up method",
        path: ["email"],
      });
    }

    if (value.signupMethod === "email_password" && (!value.password || value.password.length < 8)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 8 characters",
        path: ["password"],
      });
    }
  });

type SignupValues = z.infer<typeof signupSchema>;

const steps = ["Choose role", "Choose sign-in", "Identity details", "Review"];

const roleChoices = [
  {
    value: "patient",
    title: "Patient",
    text: "Main customer path for appointments, care, medicine, and emergency help.",
  },
  {
    value: "tenant_admin",
    title: "Tenant Admin",
    text: "Create an organization and manage branches, teams, and onboarding.",
  },
  {
    value: "facility_operator",
    title: "Facility Operator",
    text: "Operate a clinic, pharmacy, lab, or ambulance unit inside a tenant.",
  },
] as const;

const methodChoices = [
  {
    value: "email_password",
    title: "Email and password",
    text: "Create an account directly in EHC.",
  },
  {
    value: "google",
    title: "Google",
    text: "Fast sign-in for patients and staff.",
  },
  {
    value: "magic_link",
    title: "Magic link",
    text: "Passwordless email access.",
  },
] as const;

export function AuthSignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      actorType: "patient",
      signupMethod: "email_password",
      fullName: "",
      email: "",
      organizationName: "",
      password: "",
    },
  });

  const actorType = form.watch("actorType");
  const signupMethod = form.watch("signupMethod");
  const isPatient = actorType === "patient";

  const reviewItems = useMemo(
    () => [
      { label: "Role", value: actorType.replace("_", " ") },
      { label: "Method", value: signupMethod.replace("_", " ") },
      { label: "Name", value: form.getValues("fullName") || "Not added" },
      { label: "Email", value: form.getValues("email") || "Required" },
      {
        label: "Organization",
        value: form.getValues("organizationName") || (isPatient ? "Independent patient" : "Skipped"),
      },
    ],
    [actorType, form, isPatient, signupMethod],
  );

  const moveNext = async () => {
    if (currentStep === 2) {
      const valid = await form.trigger(["fullName", "email", "organizationName", "password"]);
      if (!valid) {
        return;
      }
    }

    setCurrentStep((value) => Math.min(steps.length - 1, value + 1));
  };

  const moveBack = () => setCurrentStep((value) => Math.max(0, value - 1));

  const skipOptional = () => {
    if (currentStep === 2) {
      form.setValue("organizationName", "");
    }
    moveNext();
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const supabase = getSupabaseBrowserClient();
    setSubmitMessage(null);

    try {
      const response = await apiRequest<{
        message: string;
        session: { id: string };
      }>("/auth/signup/begin", {
        method: "POST",
        body: {
          actorType: values.actorType,
          signupMethod: values.signupMethod,
          email: values.email,
          organizationName: values.organizationName,
          fullName: values.fullName,
        },
      });

      const onboardingSessionId = response.session.id;
      const actor = values.actorType as AppActorType;
      const redirectTo = `${window.location.origin}/auth/callback`;

      if (values.signupMethod === "google") {
        savePendingSignup({
          actorType: actor,
          signupMethod: "google",
          onboardingSessionId,
          nextPath: getAuthRedirectPath(actor),
        });

        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
          },
        });

        if (error) {
          throw error;
        }

        return;
      }

      if (values.signupMethod === "magic_link") {
        savePendingSignup({
          actorType: actor,
          signupMethod: "magic_link",
          onboardingSessionId,
          nextPath: getAuthRedirectPath(actor),
        });

        const { error } = await supabase.auth.signInWithOtp({
          email: values.email!,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              actorType: values.actorType,
              fullName: values.fullName,
              onboardingSessionId,
            },
          },
        });

        if (error) {
          throw error;
        }

        setSubmitMessage("Magic link sent. Open the email to continue sign in.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: values.email!,
        password: values.password!,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            actorType: values.actorType,
            fullName: values.fullName,
            onboardingSessionId,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session?.access_token) {
        await apiRequest("/auth/sync-profile", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
          body: {
            actorType: values.actorType,
            onboardingSessionId,
          },
        });

        router.push(getAuthRedirectPath(actor));
        return;
      }

      setSubmitMessage("Account created. Check your email to verify and continue.");
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Signup flow could not be started.");
    }
  });

  return (
    <div className="rounded-[32px] border border-sapphire/10 bg-cloud p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-azure">Signup flow</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Patient-first onboarding</h2>
        </div>
        <div className="rounded-full bg-cloud px-3 py-2 text-xs font-medium text-slate-600">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex-1">
            <div
              className={cn("h-2 rounded-full", index <= currentStep ? "bg-sapphire" : "bg-skywash/40")}
            />
            <p className="mt-2 text-xs text-slate-500">{step}</p>
          </div>
        ))}
      </div>

      <form className="mt-6 space-y-6" onSubmit={onSubmit}>
        {currentStep === 0 ? (
          <div className="grid gap-3">
            {roleChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => form.setValue("actorType", choice.value)}
                className={cn(
                  "rounded-[24px] border p-4 text-left transition",
                  actorType === choice.value
                    ? "border-sapphire bg-skywash/20"
                    : "border-sapphire/10 bg-cloud hover:bg-skywash/30",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-ink">{choice.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{choice.text}</p>
                  </div>
                  {actorType === choice.value ? <CheckCircle2 className="h-5 w-5 text-sapphire" /> : null}
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {methodChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => form.setValue("signupMethod", choice.value)}
                className={cn(
                  "rounded-[24px] border p-4 text-left transition",
                  signupMethod === choice.value
                    ? "border-sapphire bg-skywash/20"
                    : "border-sapphire/10 bg-cloud hover:bg-skywash/30",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-ink">{choice.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{choice.text}</p>
                  </div>
                  {signupMethod === choice.value ? <CheckCircle2 className="h-5 w-5 text-sapphire" /> : null}
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Full name
              <input
                className="mt-2 w-full rounded-2xl border border-sapphire/10 bg-white/70 px-4 py-3 outline-none"
                placeholder="Enter your full name"
                {...form.register("fullName")}
              />
              <FieldError message={form.formState.errors.fullName?.message} />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Email
              <input
                className="mt-2 w-full rounded-2xl border border-sapphire/10 bg-white/70 px-4 py-3 outline-none"
                placeholder="name@example.com"
                {...form.register("email")}
              />
              <FieldError message={form.formState.errors.email?.message} />
            </label>

            {signupMethod === "email_password" ? (
              <label className="text-sm font-medium text-slate-700">
                Password
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-2xl border border-sapphire/10 bg-white/70 px-4 py-3 pr-10 outline-none"
                    placeholder="At least 8 characters"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={form.formState.errors.password?.message} />
              </label>
            ) : (
              <div className="rounded-[24px] bg-skywash/30 p-4 text-sm leading-6 text-slate-600">
                {signupMethod === "google"
                  ? "Google sign-up will continue in a secure popup/redirect flow."
                  : "Magic link sign-up sends a secure email sign-in link."}
              </div>
            )}

            {!isPatient ? (
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Organization name
                <input
                  className="mt-2 w-full rounded-2xl border border-sapphire/10 bg-white/70 px-4 py-3 outline-none"
                  placeholder="Healthcare organization name"
                  {...form.register("organizationName")}
                />
              </label>
            ) : (
              <div className="sm:col-span-2 rounded-[24px] bg-cloud p-4 text-sm leading-6 text-slate-600">
                Patients do not belong to a tenant by default. They will complete profile setup
                first, then go to facility discovery and booking.
              </div>
            )}
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {reviewItems.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-sapphire/10 bg-cloud px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-azure">{item.label}</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {submitMessage ? (
          <div className="rounded-[20px] bg-skywash/20 px-4 py-3 text-sm text-slate-700">
            {submitMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <UIButton type="button" variant="secondary" onClick={moveBack} disabled={currentStep === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </UIButton>

          {currentStep < steps.length - 1 ? (
            <>
              <UIButton type="button" onClick={moveNext}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </UIButton>
              <UIButton type="button" variant="ghost" onClick={skipOptional}>
                Skip
              </UIButton>
            </>
          ) : (
            <UIButton type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              Start signup
            </UIButton>
          )}
        </div>
      </form>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-xs text-rose-600">{message}</p>;
}
