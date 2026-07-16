"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";
import { UIButton } from "@/components/ui-button";

const signupSchema = z
  .object({
    actorType: z.enum(["patient", "tenant_admin", "facility_operator"]),
    signupMethod: z.enum(["email_password", "google", "magic_link", "phone_otp"]),
    fullName: z.string().min(2, "Enter a valid name"),
    email: z.string().email("Enter a valid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    organizationName: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (
      ["email_password", "magic_link", "google"].includes(value.signupMethod) &&
      !value.email
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email is required for this signup method",
        path: ["email"],
      });
    }

    if (value.signupMethod === "phone_otp" && !value.phone) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number is required for phone OTP",
        path: ["phone"],
      });
    }
  });

type SignupValues = z.infer<typeof signupSchema>;

const steps = [
  "Choose role",
  "Choose sign-in",
  "Identity details",
  "Review",
];

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
    text: "Good default for most users.",
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
  {
    value: "phone_otp",
    title: "Phone OTP",
    text: "Best for mobile-first patient onboarding.",
  },
] as const;

export function AuthSignupForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      actorType: "patient",
      signupMethod: "phone_otp",
      fullName: "",
      email: "",
      phone: "",
      organizationName: "",
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
      { label: "Email", value: form.getValues("email") || "Skipped" },
      { label: "Phone", value: form.getValues("phone") || "Skipped" },
      {
        label: "Organization",
        value: form.getValues("organizationName") || (isPatient ? "Not needed" : "Skipped"),
      },
    ],
    [actorType, form, isPatient, signupMethod],
  );

  const moveNext = async () => {
    if (currentStep === 2) {
      const valid = await form.trigger(["fullName", "email", "phone", "organizationName"]);
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
      if (signupMethod !== "phone_otp") {
        form.setValue("phone", "");
      }
      if (signupMethod === "phone_otp") {
        form.setValue("email", "");
      }
    }
    moveNext();
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitMessage(null);

    try {
      const response = await apiRequest<{
        message: string;
        session: { id: string };
      }>("/auth/signup/begin", {
        method: "POST",
        body: values,
      });

      setSubmitMessage(
        `${response.message}. Session ${response.session.id} created for ${values.actorType}.`,
      );
      form.reset({
        actorType: "patient",
        signupMethod: "phone_otp",
        fullName: "",
        email: "",
        phone: "",
        organizationName: "",
      });
      setCurrentStep(0);
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Signup flow could not be started.",
      );
    }
  });

  return (
    <div className="rounded-[32px] border border-sapphire/10 bg-cloud p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-azure">
            Signup flow
          </p>
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
              className={cn(
                "h-2 rounded-full",
                index <= currentStep ? "bg-sapphire" : "bg-skywash/40",
              )}
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
                  {actorType === choice.value ? (
                    <CheckCircle2 className="h-5 w-5 text-sapphire" />
                  ) : null}
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
                  {signupMethod === choice.value ? (
                    <CheckCircle2 className="h-5 w-5 text-sapphire" />
                  ) : null}
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

            <label className="text-sm font-medium text-slate-700">
              Phone
              <input
                className="mt-2 w-full rounded-2xl border border-sapphire/10 bg-white/70 px-4 py-3 outline-none"
                placeholder="+91 90000 00000"
                {...form.register("phone")}
              />
              <FieldError message={form.formState.errors.phone?.message} />
            </label>

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
                Patients do not need an organization to start. They can join care
                journeys directly and connect to providers later.
              </div>
            )}
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {reviewItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-sapphire/10 bg-cloud px-4 py-4"
              >
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
              {form.formState.isSubmitting ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
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
