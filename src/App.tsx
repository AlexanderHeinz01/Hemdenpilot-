import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProblemComparison } from './components/ProblemComparison';
import { HowItWorks } from './components/HowItWorks';
import { Packages } from './components/Packages';
import { FaqSection } from './components/FaqSection';
import { FunnelModal } from './components/FunnelModal';
import { AdminLeadDrawer } from './components/AdminLeadDrawer';
import { Footer } from './components/Footer';
import { PackageType, LeadData } from './types';

export default function App() {
  const [isFunnelOpen, setIsFunnelOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('paket-a');
  const [lastUpdatedLeads, setLastUpdatedLeads] = useState<number>(Date.now());

  const scrollToPackages = () => {
    const el = document.getElementById('pakete');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPackage = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    const eventName = pkg === 'paket-b' ? 'select_package_B' : 'select_package_A';
    
    // Fire tracking event
    if (typeof window !== 'undefined') {
      console.log(`📡 [Tracking] Event fired: ${eventName}`, { package: pkg });
      // @ts-ignore
      if (typeof window.gtag === 'function') {
        // @ts-ignore
        window.gtag('event', eventName, { package: pkg });
      }
    }

    setIsFunnelOpen(true);
  };

  const handleLeadSubmitted = (lead: LeadData) => {
    setLastUpdatedLeads(Date.now());
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#9A7B4F] selection:text-white">
      {/* Header */}
      <Header onScrollToPackages={scrollToPackages} />

      {/* Main Content Sections (1:1 Text & Structure) */}
      <main className="flex-grow">
        {/* Sektion 1: Hero-Section (Above the Fold) */}
        <Hero onScrollToPackages={scrollToPackages} />

        {/* Sektion 2: Problem & Kontrast */}
        <ProblemComparison />

        {/* Sektion 3: So funktioniert der wöchentliche Autopilot (3 Schritte) */}
        <HowItWorks />

        {/* Sektion 4: Die Paket-Auswahl (A/B-Test-Sektion) */}
        <Packages onSelectPackage={handleSelectPackage} />

        {/* Sektion 5: Einwandbehandlung (FAQ) */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interaktives Pop-up-Modal: Der 3-Schritte-Micro-Funnel */}
      <FunnelModal
        isOpen={isFunnelOpen}
        onClose={() => setIsFunnelOpen(false)}
        selectedPackage={selectedPackage}
        onLeadSubmitted={handleLeadSubmitted}
      />

      {/* Diskreter Tester/Admin Lead Viewer */}
      <AdminLeadDrawer lastUpdated={lastUpdatedLeads} />
    </div>
  );
}
