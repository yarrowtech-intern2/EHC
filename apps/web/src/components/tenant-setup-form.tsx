"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";

import { UIButton } from "@/components/ui-button";
import { apiRequest } from "@/lib/api";

const tenantSetupSchema = z.object({
  legalName: z.string().min(2, "Legal name is required"),
  displayName: z.string().min(2, "Display name is required"),
  category: z.enum(["organization", "small_vendor"]),
  countryCode: z.string().min(2, "Country code is required"),
  allowsPatientSelfService: z.boolean(),
  facilityName: z.string().min(2, "Facility name is required"),
  facilityType: z.enum([
    "hospital",
    "clinic",
    "pharmacy",
    "lab",
    "ambulance_unit",
    "independent_vendor",
  ]),
  city: z.string().optional(),
  contactNumber: z.string().optional(),
});

type TenantSetupValues = z.infer<typeof tenantSetupSchema>;

export function TenantSetupForm() {
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const form = useForm<TenantSetupValues>({
    resolver: zodResolver(tenantSetupSchema),
    defaultValues: {
      legalName: "",
      displayName: "",
      category: "organization",
      countryCode: "IN",
      allowsPatientSelfService: true,
      facilityName: "",
      facilityType: "clinic",
      city: "",
      contactNumber: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setResultMessage(null);

    try {
      const tenantResponse = await apiRequest<{
        tenant: { id: string; display_name: string };
      }>("/tenants", {
        method: "POST",
        body: {
          legalName: values.legalName,
          displayName: values.displayName,
          category: values.category,
          countryCode: values.countryCode,
          allowsPatientSelfService: values.allowsPatientSelfService,
        },
      });

      const facilityResponse = await apiRequest<{
        facility: { id: string; name: string };
      }>("/facilities", {
        method: "POST",
        body: {
          tenantId: tenantResponse.tenant.id,
          name: values.facilityName,
          type: values.facilityType,
          city: values.city,
          contactNumber: values.contactNumber,
        },
      });

      setResultMessage(
        `Created tenant ${tenantResponse.tenant.display_name} and facility ${facilityResponse.facility.name}.`,
      );
      form.reset({
        legalName: "",
        displayName: "",
        category: "organization",
        countryCode: "IN",
        allowsPatientSelfService: true,
        facilityName: "",
        facilityType: "clinic",
        city: "",
        contactNumber: "",
      });
    } catch (error) {
      setResultMessage(
        error instanceof Error ? error.message : "Tenant setup failed.",
      );
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <section className="rounded-[28px] bg-cloud p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-ink">Organization basics</h2>
        <p className="mt-1 text-sm text-slate-600">
          Create a real tenant category for either an organization or a small vendor.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <InputField
            label="Legal name"
            placeholder="EHC Health Services Pvt Ltd"
            registration={form.register("legalName")}
            error={form.formState.errors.legalName?.message}
          />
          <InputField
            label="Display name"
            placeholder="EHC Health"
            registration={form.register("displayName")}
            error={form.formState.errors.displayName?.message}
          />

          <label className="text-sm font-medium text-slate-700">
            Tenant category
            <select
              className="mt-2 w-full rounded-2xl border border-sapphire/10 bg-white px-4 py-3 outline-none"
              {...form.register("category")}
            >
              <option value="organization">Organization</option>
              <option value="small_vendor">Small vendor</option>
            </select>
          </label>

          <InputField
            label="Country code"
            placeholder="IN"
            registration={form.register("countryCode")}
            error={form.formState.errors.countryCode?.message}
          />
        </div>

        <label className="mt-4 flex items-center gap-3 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4" {...form.register("allowsPatientSelfService")} />
          Allow direct patient self-service
        </label>
      </section>

      <section className="rounded-[28px] bg-cloud p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-ink">Primary facility</h2>
        <p className="mt-1 text-sm text-slate-600">
          Every tenant starts with one service location or vendor unit.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <InputField
            label="Facility name"
            placeholder="EHC Central Clinic"
            registration={form.register("facilityName")}
            error={form.formState.errors.facilityName?.message}
          />
          <label className="text-sm font-medium text-slate-700">
            Facility type
            <select
              className="mt-2 w-full rounded-2xl border border-sapphire/10 bg-white px-4 py-3 outline-none"
              {...form.register("facilityType")}
            >
              <option value="hospital">Hospital</option>
              <option value="clinic">Clinic</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="lab">Lab</option>
              <option value="ambulance_unit">Ambulance Unit</option>
              <option value="independent_vendor">Independent Vendor</option>
            </select>
          </label>
          <InputField
            label="City"
            placeholder="Kolkata"
            registration={form.register("city")}
            error={form.formState.errors.city?.message}
          />
          <InputField
            label="Contact number"
            placeholder="+91 90000 00000"
            registration={form.register("contactNumber")}
            error={form.formState.errors.contactNumber?.message}
          />
        </div>
      </section>

      {resultMessage ? (
        <div className="rounded-[20px] bg-skywash/20 px-4 py-3 text-sm text-slate-700">
          {resultMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <UIButton type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Save tenant and facility
        </UIButton>
        <UIButton type="button" variant="secondary" onClick={() => form.reset()}>
          Reset form
        </UIButton>
      </div>
    </form>
  );
}

function InputField({
  label,
  placeholder,
  registration,
  error,
}: {
  label: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <input
        className="mt-2 w-full rounded-2xl border border-sapphire/10 bg-white px-4 py-3 outline-none ring-0"
        placeholder={placeholder}
        {...registration}
      />
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </label>
  );
}
