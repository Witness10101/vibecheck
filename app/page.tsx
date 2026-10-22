
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { VibeCategories } from "@/components/landing/VibeCategories";
import { GroupChatPreview } from "@/components/landing/GroupChatPreview";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <VibeCategories />
        <GroupChatPreview />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
