import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { QuickActions } from "@/components/landing/QuickActions";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { EmergencySection } from "@/components/landing/EmergencySection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RoleDashboardPreview } from "@/components/landing/RoleDashboardPreview";
import { HealthRecordsSection } from "@/components/landing/HealthRecordsSection";
import { AIInsightsSection } from "@/components/landing/AIInsightsSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { PartnerSection } from "@/components/landing/PartnerSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Landing3Page() {
  return (
    <div className="min-h-screen bg-[#f3f1ef]">
      <Navbar />
      <main>
        <HeroSection />
        <QuickActions />
        <ServicesSection />
        <EmergencySection />
        <HowItWorks />
        <RoleDashboardPreview />
        <HealthRecordsSection />
        <AIInsightsSection />
        <SecuritySection />
        <PartnerSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
