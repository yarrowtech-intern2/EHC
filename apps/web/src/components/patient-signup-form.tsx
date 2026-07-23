"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import {
  getSupabaseBrowserClient,
  savePendingSignup,
} from "@/lib/supabase-browser";

const steps = ["Name", "Age", "Blood", "Location", "Email", "Password", "Done"] as const;
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export function PatientSignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canGoNext =
    (currentStep === 0 && fullName.trim().length >= 2) ||
    (currentStep === 1 && isValidAge(age)) ||
    currentStep === 2 ||
    (currentStep === 3 && location.trim().length >= 2) ||
    (currentStep === 4 && isValidEmail(email)) ||
    (currentStep === 5 && password.length >= 8);

  const moveNext = () => {
    setMessage(null);

    if (!canGoNext) {
      setMessage(getStepError(currentStep));
      return;
    }

    setCurrentStep((value) => Math.min(steps.length - 1, value + 1));
  };

  const moveBack = () => {
    setMessage(null);
    setCurrentStep((value) => Math.max(0, value - 1));
  };

  const submit = async () => {
    if (
      fullName.trim().length < 2 ||
      !isValidAge(age) ||
      location.trim().length < 2 ||
      !isValidEmail(email) ||
      password.length < 8
    ) {
      setMessage("Complete all required details before creating the account.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await apiRequest<{
        session: { id: string };
      }>("/auth/signup/begin", {
        method: "POST",
        body: {
          actorType: "patient",
          signupMethod: "email_password",
          email,
          fullName,
        },
      });

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            actorType: "patient",
            fullName,
            age: Number(age),
            bloodGroup: bloodGroup || null,
            location,
            onboardingSessionId: response.session.id,
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
            actorType: "patient",
            onboardingSessionId: response.session.id,
            age: Number(age),
            bloodGroup: bloodGroup || undefined,
            location,
          },
        });

        router.push("/profile-completion");
        return;
      }

      setMessage("Account created. Check your email to continue.");
    } catch (error) {
      setMessage(formatSignupError(error, "Could not create account."));
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await apiRequest<{
        session: { id: string };
      }>("/auth/signup/begin", {
        method: "POST",
        body: {
          actorType: "patient",
          signupMethod: "google",
          email: email || undefined,
          fullName: fullName || undefined,
        },
      });

      savePendingSignup({
        actorType: "patient",
        signupMethod: "google",
        onboardingSessionId: response.session.id,
        nextPath: "/profile-completion",
        age: isValidAge(age) ? Number(age) : undefined,
        bloodGroup: bloodGroup || undefined,
        location: location || undefined,
      });

      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setLoading(false);
      setMessage(formatSignupError(error, "Google signup failed."));
    }
  };

  return (
    <div className="rounded-[36px] bg-[#d2d2d2] px-8 pb-8 pt-7 shadow-[inset_-30px_-23px_87px_rgba(0,0,0,0.21),inset_40px_39px_109.3px_rgba(255,255,255,0.71)] sm:px-[68px] sm:pb-[48px] sm:pt-[42px]">
      <h1 className="text-[31px] font-semibold leading-none tracking-[-0.03em] text-[#7779fc]">
        Create Account
      </h1>
      <p className="mt-1 text-[13px] text-[#6f6f6f]">For patients</p>

      <div className="mt-6 grid grid-cols-7 gap-1.5">
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
            <span className="mt-1 block text-[9px] font-medium text-[#6f6f6f]">{step}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 min-h-[144px]">
        {currentStep === 0 ? (
          <Field
            label="Your name"
            helper="Enter your name as you want it shown."
            value={fullName}
            onChange={setFullName}
          />
        ) : null}

        {currentStep === 1 ? (
          <Field
            label="Age"
            helper="This helps providers understand your care needs."
            type="number"
            value={age}
            onChange={setAge}
          />
        ) : null}

        {currentStep === 2 ? (
          <BloodGroupStep value={bloodGroup} onChange={setBloodGroup} />
        ) : null}

        {currentStep === 3 ? (
          <Field
            label="Location"
            helper="City or area where you usually need care."
            value={location}
            onChange={setLocation}
          />
        ) : null}

        {currentStep === 4 ? (
          <Field
            label="Email"
            helper="We will use this for sign in."
            type="email"
            value={email}
            onChange={setEmail}
          />
        ) : null}

        {currentStep === 5 ? (
          <Field
            label="Password"
            helper="Use at least 8 characters."
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
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

        {currentStep === 6 ? (
          <div className="grid gap-2">
            <ReviewRow label="Name" value={fullName} />
            <ReviewRow label="Age" value={age} />
            <ReviewRow label="Blood" value={bloodGroup || "Skipped"} />
            <ReviewRow label="Location" value={location} />
            <ReviewRow label="Email" value={email} />
          </div>
        ) : null}
      </div>

      {message ? (
        <div className="mt-4 rounded-[12px] bg-white/50 px-3 py-2 text-[12px] leading-5 text-[#444]">
          {message}
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={moveBack}
          disabled={currentStep === 0 || loading}
          className="flex h-[30px] w-[84px] items-center justify-center rounded-full bg-white text-[11px] font-medium text-[#050608] shadow-[5px_5px_7px_rgba(0,0,0,0.2)] disabled:opacity-40"
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
          Back
        </button>

        {currentStep === 2 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            disabled={loading}
            className="flex h-[30px] w-[84px] items-center justify-center rounded-full bg-white text-[11px] font-medium text-[#050608] shadow-[5px_5px_7px_rgba(0,0,0,0.2)] disabled:opacity-40"
          >
            Skip
          </button>
        ) : null}

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={moveNext}
            disabled={loading}
            className="flex h-[30px] w-[100px] items-center justify-center rounded-full bg-[#aaa6ff] text-[11px] font-medium text-[#050608] shadow-[inset_10px_9px_20.6px_rgba(255,255,255,0.32),5px_5px_7px_rgba(0,0,0,0.18)] disabled:opacity-60"
          >
            Next
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="flex h-[30px] w-[132px] items-center justify-center rounded-full bg-[#aaa6ff] text-[11px] font-medium text-[#050608] shadow-[inset_10px_9px_20.6px_rgba(255,255,255,0.32),5px_5px_7px_rgba(0,0,0,0.18)] disabled:opacity-60"
          >
            {loading ? <LoaderCircle className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
            Create
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={signUpWithGoogle}
        disabled={loading}
        className="mx-auto mt-5 flex h-[34px] items-center gap-2 rounded-full bg-white px-5 text-[11px] font-semibold text-[#050608] shadow-[inset_5px_5px_12px_rgba(255,255,255,0.75),5px_8px_18px_rgba(0,0,0,0.22)] disabled:opacity-60"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full text-[13px] font-bold text-[#4285f4]">
          G
        </span>
        Sign up with Google
      </button>
    </div>
  );
}

function Field({
  label,
  helper,
  value,
  onChange,
  type = "text",
  trailing,
}: {
  label: string;
  helper: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
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
      <span className="mt-2 block text-[11px] leading-4 text-[#6f6f6f]">{helper}</span>
    </label>
  );
}

function BloodGroupStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-[12px] font-medium text-[#707070]">Blood group</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {bloodGroups.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => onChange(group)}
            className={`h-[34px] rounded-[10px] border-2 text-[12px] font-semibold ${
              value === group
                ? "border-[#aaa6ff] bg-[#efefeb] text-[#050608]"
                : "border-transparent bg-[#efefeb]/70 text-[#707070]"
            }`}
          >
            {group}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-4 text-[#6f6f6f]">
        Optional. You can skip if you do not know it.
      </p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-[#efefeb]/70 px-4 py-3 text-[12px] text-[#6f6f6f]">
      <span className="font-semibold text-[#050608]">{label}:</span> {value}
    </div>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidAge(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 130;
}

function getStepError(step: number) {
  if (step === 0) {
    return "Enter your name to continue.";
  }

  if (step === 1) {
    return "Enter a valid age to continue.";
  }

  if (step === 3) {
    return "Enter your location to continue.";
  }

  if (step === 4) {
    return "Enter a valid email to continue.";
  }

  return "Password must be at least 8 characters.";
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
