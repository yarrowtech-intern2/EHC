import type { Metadata } from "next";

import { AuthProvider } from "@/components/providers/auth-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "EHC - Electronic Healthcare",
  description:
    "EHC connects patients with doctors, ambulances, blood banks, pharmacies, diagnostics and secure digital health records through one integrated healthcare platform.",
  icons: {
    icon: "/favicon/favicon.png",
    shortcut: "/favicon/favicon.png",
    apple: "/favicon/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-onest antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
