import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "EHC - Electronic Healthcare",
  description:
    "EHC connects patients with doctors, ambulances, blood banks, pharmacies, diagnostics and secure digital health records through one integrated healthcare platform.",
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
      <body className="font-onest antialiased">{children}</body>
    </html>
  );
}
