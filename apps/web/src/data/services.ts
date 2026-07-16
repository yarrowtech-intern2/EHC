import {
  Stethoscope,
  Ambulance,
  Droplets,
  Pill,
  Microscope,
  User,
  type LucideIcon,
} from "lucide-react";

export interface ServiceCard {
  icon: LucideIcon;
  title: string;
  features: string[];
  color: string;
}

export const services: ServiceCard[] = [
  {
    icon: User,
    title: "Patient",
    features: [
      "Book appointments",
      "Manage records",
      "Track prescriptions",
      "View health history",
    ],
    color: "#2699FA",
  },
  {
    icon: Ambulance,
    title: "Ambulance Services",
    features: [
      "Emergency booking",
      "Live tracking",
      "Verified providers",
      "Trip updates",
    ],
    color: "#E84545",
  },
  {
    icon: Stethoscope,
    title: "Doctors",
    features: [
      "Appointment management",
      "Patient history",
      "Online consultation",
      "Digital prescriptions",
    ],
    color: "#7857E8",
  },
  {
    icon: Droplets,
    title: "Blood Bank",
    features: [
      "Check blood availability",
      "Submit blood requests",
      "Donor management",
      "Inventory information",
    ],
    color: "#E84545",
  },
  {
    icon: Pill,
    title: "Pharmacy",
    features: [
      "Order medicines",
      "Prescription verification",
      "Delivery tracking",
      "Refill management",
    ],
    color: "#25A96B",
  },
  {
    icon: Microscope,
    title: "Diagnostics",
    features: [
      "Book tests",
      "Home collection",
      "View reports",
      "Diagnostic history",
    ],
    color: "#F4A340",
  },
];

export interface QuickAction {
  icon: LucideIcon;
  title: string;
  href: string;
  isEmergency?: boolean;
}

export const quickActions: QuickAction[] = [
  { icon: Stethoscope, title: "Book a Doctor", href: "/login" },
  {
    icon: Ambulance,
    title: "Request Ambulance",
    href: "/emergency-ambulance",
    isEmergency: true,
  },
  { icon: Droplets, title: "Find Blood", href: "/login" },
  { icon: Pill, title: "Order Medicine", href: "/login" },
  { icon: Microscope, title: "Book Diagnostics", href: "/login" },
  { icon: User, title: "View Health Records", href: "/login" },
];
