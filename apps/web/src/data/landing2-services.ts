import {
  Stethoscope,
  Ambulance,
  Droplets,
  Pill,
  Microscope,
  FolderHeart,
  type LucideIcon,
} from "lucide-react";

export interface ServiceStory {
  id: string;
  icon: LucideIcon;
  label: string;
  heading: string;
  features: string[];
  cta: string;
  ctaHref: string;
  video: string;
}

export const serviceLabels: { icon: LucideIcon; label: string }[] = [
  { icon: Stethoscope, label: "Doctors" },
  { icon: Ambulance, label: "Ambulance" },
  { icon: Droplets, label: "Blood Bank" },
  { icon: Pill, label: "Pharmacy" },
  { icon: Microscope, label: "Diagnostics" },
  { icon: FolderHeart, label: "Health Records" },
];

export const serviceStories: ServiceStory[] = [
  {
    id: "doctors",
    icon: Stethoscope,
    label: "Doctors",
    heading: "Consult the right doctor with less friction.",
    features: [
      "Discover doctors by speciality and location",
      "Book appointments with available time slots",
      "Attend online consultations",
      "Access full appointment history",
      "Receive digital prescriptions",
    ],
    cta: "Book an Appointment",
    ctaHref: "/login",
    video: "/videos/doctor-dashboard.mp4",
  },
  {
    id: "ambulance",
    icon: Ambulance,
    label: "Ambulance",
    heading: "Emergency response you can follow in real time.",
    features: [
      "Submit an emergency request instantly",
      "Automatic patient location detection",
      "Match with the nearest ambulance",
      "Track the vehicle en route",
      "Receive ETA and driver details",
    ],
    cta: "Request an Ambulance",
    ctaHref: "/emergency-ambulance",
    video: "/videos/ambulance-tracking.mp4",
  },
  {
    id: "blood-bank",
    icon: Droplets,
    label: "Blood Bank",
    heading: "Find critical blood availability faster.",
    features: [
      "Search by blood group and location",
      "View real-time blood availability",
      "Submit urgent blood requests",
      "Connect with verified blood banks",
      "Manage donor information",
    ],
    cta: "Search Blood Banks",
    ctaHref: "/login",
    video: "/videos/blood-bank-dashboard.mp4",
  },
  {
    id: "pharmacy",
    icon: Pill,
    label: "Pharmacy",
    heading: "Prescriptions and medicines, organised.",
    features: [
      "Upload prescriptions digitally",
      "Order medicines with verified pricing",
      "Receive order confirmation",
      "Track delivery in real time",
      "Manage refill history",
    ],
    cta: "Order Medicine",
    ctaHref: "/login",
    video: "/videos/pharmacy-dashboard.mp4",
  },
  {
    id: "diagnostics",
    icon: Microscope,
    label: "Diagnostics",
    heading: "Tests, reports and follow-ups in one place.",
    features: [
      "Book diagnostic tests online",
      "Request home sample collection",
      "Access reports securely",
      "Share reports with authorised doctors",
      "View complete diagnostic history",
    ],
    cta: "Book a Test",
    ctaHref: "/login",
    video: "/videos/patient-dashboard.mp4",
  },
  {
    id: "health-records",
    icon: FolderHeart,
    label: "Health Records",
    heading: "Your health history, securely connected.",
    features: [
      "Medical reports and imaging",
      "Prescription history",
      "Appointment timeline",
      "Diagnostic history",
      "Billing records and patient profile",
    ],
    cta: "Explore Health Records",
    ctaHref: "/login",
    video: "/videos/patient-dashboard.mp4",
  },
];
