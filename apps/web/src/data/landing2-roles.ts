import {
  User,
  Stethoscope,
  Ambulance,
  Droplets,
  Pill,
  type LucideIcon,
} from "lucide-react";

export interface RoleData {
  id: string;
  label: string;
  icon: LucideIcon;
  heading: string;
  description: string;
  features: string[];
  video: string;
}

export const roles: RoleData[] = [
  {
    id: "patient",
    label: "Patient",
    icon: User,
    heading: "Your healthcare, in one dashboard.",
    description:
      "Manage appointments, prescriptions, reports, health records, orders and payments from a single workspace.",
    features: [
      "Appointments",
      "Prescriptions",
      "Reports",
      "Health records",
      "Orders",
      "Payments",
    ],
    video: "/videos/patient-dashboard.mp4",
  },
  {
    id: "doctor",
    label: "Doctor",
    icon: Stethoscope,
    heading: "Focused tools for clinical care.",
    description:
      "Access appointment schedules, patient history, consultations, prescriptions, and clinical reports.",
    features: [
      "Appointment schedule",
      "Patient history",
      "Consultations",
      "Prescriptions",
      "Reports",
      "Notifications",
    ],
    video: "/videos/doctor-dashboard.mp4",
  },
  {
    id: "ambulance",
    label: "Ambulance",
    icon: Ambulance,
    heading: "Emergency operations, coordinated.",
    description:
      "Manage emergency requests, live trips, vehicle fleet, staff assignments and trip history.",
    features: [
      "Emergency requests",
      "Live trips",
      "Vehicles",
      "Staff",
      "Location tracking",
      "Trip history",
    ],
    video: "/videos/ambulance-dashboard.mp4",
  },
  {
    id: "blood-bank",
    label: "Blood Bank",
    icon: Droplets,
    heading: "Blood inventory at your fingertips.",
    description:
      "Track blood inventory, manage donor records, handle blood requests, and oversee donor registration.",
    features: [
      "Blood inventory",
      "Donor details",
      "Blood requests",
      "Donor registration",
      "Notifications",
    ],
    video: "/videos/blood-bank-dashboard.mp4",
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    icon: Pill,
    heading: "Orders, inventory and logistics unified.",
    description:
      "Handle medicine orders, manage inventory, track logistics, process transactions, and resolve complaints.",
    features: [
      "Medicine orders",
      "Inventory",
      "Logistics",
      "Transactions",
      "Staff",
      "Complaints",
    ],
    video: "/videos/pharmacy-dashboard.mp4",
  },
];
