"use client";

import { useMemo, useState, type ReactNode } from "react";
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

import { apiRequest } from "@/lib/api";
import {
  getAuthRedirectPath,
  getSupabaseBrowserClient,
  savePendingSignup,
  type AppActorType,
} from "@/lib/supabase-browser";

const signupSchema = z
  .object({
    actorType: z.enum(["tenant_admin", "facility_operator", "ambulance_driver"]),
    signupMethod: z.enum(["email_password", "google", "magic_link"]),
    fullName: z.string().min(2, "Enter your name"),
    email: z.string().email("Enter a valid email").optional().or(z.literal("")),
    organizationName: z.string().optional(),
    password: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (!value.email) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email is required",
        path: ["email"],
      });
    }

    if (value.signupMethod === "email_password" && (!value.password || value.password.length < 8)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use at least 8 characters",
        path: ["password"],
      });
    }

    if (!value.organizationName || value.organizationName.trim().length < 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Organization is required",
        path: ["organizationName"],
      });
    }
  });

type SignupValues = z.infer<typeof signupSchema>;

const steps = ["Access", "Method", "Details", "Review"] as const;

const roleChoices = [
  { value: "tenant_admin", label: "Tenant Admin" },
  { value: "facility_operator", label: "Facility Operator" },
  { value: "ambulance_driver", label: "Ambulance Driver" },
] as const;

const methodChoices = [
  { value: "email_password", label: "Email + Password" },
  { value: "google", label: "Google" },
  { value: "magic_link", label: "Magic Link" },
] as const;

export function AuthSignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      actorType: "tenant_admin",
      signupMethod: "email_password",
      fullName: "",
      email: "",
      organizationName: "",
      password: "",
    },
  });

  const actorType = form.watch("actorType");
  const signupMethod = form.watch("signupMethod");

  const reviewItems = useMemo(
    () => [
      { label: "Access", value: actorType.replace("_", " ") },
      { label: "Method", value: signupMethod.replace("_", " ") },
      { label: "Name", value: form.getValues("fullName") || "Not added" },
      { label: "Email", value: form.getValues("email") || "Required" },
      {
        label: "Organization",
        value: form.getValues("organizationName") || "Required",
      },
    ],
    [actorType, form, signupMethod],
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
          options: { redirectTo },
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

        setSubmitMessage("Magic link sent. Open your email to continue.");
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

      setSubmitMessage("Account created. Check your email to continue.");
    } catch (error) {
      setSubmitMessage(formatSignupError(error, "Signup could not be started."));
    }
  });

  return (
    <div className="rounded-[36px] bg-[#d2d2d2] px-8 pb-8 pt-7 shadow-[inset_-30px_-23px_87px_rgba(0,0,0,0.21),inset_40px_39px_109.3px_rgba(255,255,255,0.71)] sm:px-[68px] sm:pb-[48px] sm:pt-[42px]">
      <h1 className="text-[31px] font-semibold leading-none tracking-[-0.03em] text-[#7779fc]">
        Create Account
      </h1>
      <p className="mt-1 text-[13px] text-[#6f6f6f]">Provider signup</p>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {steps.map((step, index) => (
          <button
            key={step}
            type="button"
            onClick={() => setCurrentStep(index)}
            className="text-left"
            aria-label={`Go to ${step} step`}
          >
            <span
              className={`block h-2 rounded-full ${
                index <= currentStep ? "bg-[#aaa6ff]" : "bg-[#efefeb]"
              }`}
            />
            <span className="mt-1 block text-[10px] font-medium text-[#6f6f6f]">{step}</span>
          </button>
        ))}
      </div>

      <form className="mt-6" onSubmit={onSubmit}>
        {currentStep === 0 ? (
          <ChoiceGrid
            choices={roleChoices}
            value={actorType}
            onSelect={(value) => form.setValue("actorType", value)}
          />
        ) : null}

        {currentStep === 1 ? (
          <ChoiceGrid
            choices={methodChoices}
            value={signupMethod}
            onSelect={(value) => form.setValue("signupMethod", value)}
          />
        ) : null}

        {currentStep === 2 ? (
          <div className="grid gap-4">
            <Field
              label="Full name"
              value={form.watch("fullName")}
              onChange={(value) => form.setValue("fullName", value)}
              error={form.formState.errors.fullName?.message}
            />
            <Field
              label="Email"
              value={form.watch("email") ?? ""}
              onChange={(value) => form.setValue("email", value)}
              error={form.formState.errors.email?.message}
            />
            {signupMethod === "email_password" ? (
              <Field
                label="Password"
                type={showPassword ? "text" : "password"}
                value={form.watch("password") ?? ""}
                onChange={(value) => form.setValue("password", value)}
                error={form.formState.errors.password?.message}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-[34px] text-[#707070]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            ) : null}
            <Field
              label="Organization"
              value={form.watch("organizationName") ?? ""}
              onChange={(value) => form.setValue("organizationName", value)}
              error={form.formState.errors.organizationName?.message}
            />
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="grid gap-2">
            {reviewItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[14px] bg-[#efefeb]/70 px-4 py-3 text-[12px] text-[#6f6f6f]"
              >
                <span className="font-semibold text-[#050608]">{item.label}:</span>{" "}
                {item.value}
              </div>
            ))}
          </div>
        ) : null}

        {submitMessage ? (
          <div className="mt-4 rounded-[12px] bg-white/50 px-3 py-2 text-[12px] leading-5 text-[#444]">
            {submitMessage}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={moveBack}
            disabled={currentStep === 0}
            className="flex h-[30px] w-[88px] items-center justify-center rounded-full bg-white text-[11px] font-medium text-[#050608] shadow-[5px_5px_7px_rgba(0,0,0,0.2)] disabled:opacity-40"
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={moveNext}
              className="flex h-[30px] w-[110px] items-center justify-center rounded-full bg-[#aaa6ff] text-[11px] font-medium text-[#050608] shadow-[inset_10px_9px_20.6px_rgba(255,255,255,0.32),5px_5px_7px_rgba(0,0,0,0.18)]"
            >
              Next
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex h-[30px] w-[132px] items-center justify-center rounded-full bg-[#aaa6ff] text-[11px] font-medium text-[#050608] shadow-[inset_10px_9px_20.6px_rgba(255,255,255,0.32),5px_5px_7px_rgba(0,0,0,0.18)] disabled:opacity-60"
            >
              {form.formState.isSubmitting ? (
                <LoaderCircle className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : null}
              Start signup
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function ChoiceGrid<T extends string>({
  choices,
  value,
  onSelect,
}: {
  choices: readonly { value: T; label: string }[];
  value: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="grid gap-3">
      {choices.map((choice) => {
        const selected = value === choice.value;

        return (
          <button
            key={choice.value}
            type="button"
            onClick={() => onSelect(choice.value)}
            className={`flex h-[42px] items-center justify-between rounded-[14px] border-2 px-4 text-[13px] font-medium ${
              selected
                ? "border-[#aaa6ff] bg-[#efefeb]"
                : "border-transparent bg-[#efefeb]/70"
            }`}
          >
            {choice.label}
            {selected ? <CheckCircle2 className="h-4 w-4 text-[#7779fc]" /> : null}
          </button>
        );
      })}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  error,
  trailing,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  trailing?: ReactNode;
}) {
  return (
    <label className="relative block text-[12px] font-medium text-[#707070]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 h-[39px] w-full rounded-[10px] border-2 border-[#aaa6ff] bg-[#efefeb] px-3 text-[14px] text-[#050608] outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(170,166,255,0.22)] ${
          trailing ? "pr-10" : ""
        }`}
      />
      {trailing}
      {error ? <span className="mt-1 block text-[11px] text-rose-600">{error}</span> : null}
    </label>
  );
}

function formatSignupError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;

  if (message.includes("exceed_cached_egress_quota")) {
    return "Signup is blocked because the Supabase project exceeded its cached egress quota. The project owner must upgrade the plan or remove spend caps.";
  }

  if (message.toLowerCase().includes("invalid api key")) {
    return "Supabase API key is invalid or stale. Restart the API and web dev servers after changing .env, then confirm the anon and service role keys belong to the same Supabase project URL.";
  }

  return message;
}
