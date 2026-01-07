import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ToolsSection from "@/components/ToolsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-20">
        <HeroSection />
        <ToolsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
