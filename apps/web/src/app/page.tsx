import { Navbar } from "@/components/landing2/layout/Navbar";
import { Footer } from "@/components/landing2/layout/Footer";
import { HeroSection } from "@/components/landing2/sections/HeroSection";
import { ServicesOverview } from "@/components/landing2/sections/ServicesOverview";
import { ServiceStories } from "@/components/landing2/sections/ServiceStories";
import { EmergencyExperience } from "@/components/landing2/sections/EmergencyExperience";
import { HowItWorks } from "@/components/landing2/sections/HowItWorks";
import { RoleExperience } from "@/components/landing2/sections/RoleExperience";
import { HealthRecordsShowcase } from "@/components/landing2/sections/HealthRecordsShowcase";
import { AIInsightsShowcase } from "@/components/landing2/sections/AIInsightsShowcase";
import { SecuritySection } from "@/components/landing2/sections/SecuritySection";
import { PartnerSection } from "@/components/landing2/sections/PartnerSection";
import { FAQSection } from "@/components/landing2/sections/FAQSection";
import { FinalCTA } from "@/components/landing2/sections/FinalCTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f3f1ef]">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesOverview />
        <ServiceStories />
        <EmergencyExperience />
        <HowItWorks />
        <RoleExperience />
        <HealthRecordsShowcase />
        <AIInsightsShowcase />
        <SecuritySection />
        <PartnerSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
