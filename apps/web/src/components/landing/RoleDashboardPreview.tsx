"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Stethoscope,
  Ambulance,
  Droplets,
  Pill,
  Calendar,
  FileText,
  ClipboardList,
  CreditCard,
  Bell,
  Clock,
  Truck,
  Users,
  Package,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

interface DashboardItem {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
}

interface RoleTab {
  id: string;
  label: string;
  icon: LucideIcon;
  items: DashboardItem[];
}

const roleTabs: RoleTab[] = [
  {
    id: "patient",
    label: "Patient",
    icon: User,
    items: [
      { icon: Calendar, label: "Appointments", value: "3", sub: "Upcoming" },
      { icon: FileText, label: "Prescriptions", value: "5", sub: "Active" },
      { icon: ClipboardList, label: "Reports", value: "12", sub: "Total" },
      { icon: Clock, label: "Health Records", value: "8", sub: "Documents" },
      { icon: CreditCard, label: "Payments", value: "2", sub: "Pending" },
    ],
  },
  {
    id: "doctor",
    label: "Doctor",
    icon: Stethoscope,
    items: [
      { icon: Calendar, label: "Today's Appointments", value: "7", sub: "Scheduled" },
      { icon: Users, label: "Patient History", value: "142", sub: "Records" },
      { icon: FileText, label: "Prescriptions", value: "18", sub: "This week" },
      { icon: AlertTriangle, label: "Emergency Consults", value: "1", sub: "Active" },
      { icon: Bell, label: "Notifications", value: "4", sub: "Unread" },
    ],
  },
  {
    id: "ambulance",
    label: "Ambulance",
    icon: Ambulance,
    items: [
      { icon: Bell, label: "Active Requests", value: "3", sub: "Incoming" },
      { icon: Truck, label: "Live Trips", value: "2", sub: "In progress" },
      { icon: Ambulance, label: "Vehicles", value: "8", sub: "Registered" },
      { icon: Users, label: "Staff", value: "16", sub: "On duty" },
      { icon: Clock, label: "Trip History", value: "234", sub: "Completed" },
    ],
  },
  {
    id: "blood-bank",
    label: "Blood Bank",
    icon: Droplets,
    items: [
      { icon: Droplets, label: "Blood Inventory", value: "45", sub: "Units" },
      { icon: Users, label: "Donor Records", value: "312", sub: "Registered" },
      { icon: Bell, label: "Blood Requests", value: "6", sub: "Pending" },
      { icon: ClipboardList, label: "Registration", value: "12", sub: "This month" },
    ],
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    icon: Pill,
    items: [
      { icon: Package, label: "New Orders", value: "14", sub: "Today" },
      { icon: ClipboardList, label: "Inventory", value: "850", sub: "Items" },
      { icon: Truck, label: "Logistics", value: "5", sub: "In transit" },
      { icon: CreditCard, label: "Transactions", value: "32", sub: "This week" },
      { icon: AlertTriangle, label: "Complaints", value: "1", sub: "Open" },
    ],
  },
];

export function RoleDashboardPreview() {
  const [activeTab, setActiveTab] = useState("patient");
  const activeRole = roleTabs.find((t) => t.id === activeTab)!;

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-heading tracking-tight">
            A dedicated experience for every healthcare participant
          </h2>
        </motion.div>

        {/* Role tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {roleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-brand text-white shadow-md shadow-brand/20"
                    : "neu-btn text-body hover:text-heading"
                }`}
                aria-pressed={isActive}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="neu-card p-5 sm:p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="text-xs font-medium text-body font-mono">
                {activeRole.label} Dashboard Preview
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
              >
                {activeRole.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-white border border-border p-4 text-center"
                    >
                      <Icon className="h-5 w-5 text-brand mx-auto mb-2" />
                      <p className="text-xl font-bold font-mono text-heading">
                        {item.value}
                      </p>
                      <p className="text-xs font-semibold text-heading mt-1">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-body mt-0.5">
                        {item.sub}
                      </p>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <p className="mt-6 text-xs text-body text-center italic">
              Dashboard previews are illustrative. Sign in to access your secure
              workspace.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
