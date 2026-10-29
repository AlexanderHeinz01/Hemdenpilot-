import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProblemComparison } from './components/ProblemComparison';
import { HowItWorks } from './components/HowItWorks';
import { Packages } from './components/Packages';
import { B2BSection } from './components/B2BSection';
import { TeamSection } from './components/TeamSection';
import { PlzCheckerSection } from './components/PlzCheckerSection';
import { FaqSection } from './components/FaqSection';
import { FunnelModal } from './components/FunnelModal';
import { LeadManagementModal } from './components/LeadManagementModal';
import { Footer } from './components/Footer';
import { PackageType, LeadData } from './types';
import { PILOT_SPOTS } from './config/pricing';
import { fetchStats } from './services/leadService';
import { trackFirstPackageChoice, trackPageViewOnce } from './services/tracking';

export default function App() {
  const [isFunnelOpen, setIsFunnelOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('B');
  const [prefillPlz, setPrefillPlz] = useState<string>('');
  const [lastUpdatedLeads, setLastUpdatedLeads] = useState<number>(Date.now());
  const [spotsFree, setSpotsFree] = useState<number | null>(null);

  useEffect(() => {
    trackPageViewOnce();
  }, []);

  useEffect(() => {
    fetchStats().then((stats) => {
      if (stats) setSpotsFree(Math.max(0, stats.spots - stats.reserved));
    });
  }, [lastUpdatedLeads]);

  // Betreiber-Zugang: ?admin oder #admin in der URL bzw. Strg/Cmd + Shift + L.
  // Das Modal selbst verlangt ein Admin-Token, bevor Daten geladen werden.
  useEffect(() => {
    const checkUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has('admin') || window.location.hash.toLowerCase() === '#admin') {
        setIsAdminOpen(true);
      }
    };

    checkUrlParams();
    window.addEventListener('popstate', checkUrlParams);
    window.addEventListener('hashchange', checkUrlParams);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', checkUrlParams);
      window.removeEventListener('hashchange', checkUrlParams);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavigate = (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const offsetPosition = elementRect - bodyRect - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleSelectPackage = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    trackFirstPackageChoice(pkg);
    setIsFunnelOpen(true);
  };

  const handleReservePlz = (plz: string) => {
    setPrefillPlz(plz);
    handleSelectPackage(selectedPackage);
  };

  const handleLeadSubmitted = (_lead: LeadData) => {
    setLastUpdatedLeads(Date.now());
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#18181B] flex flex-col font-jakarta selection:bg-[#9A7B4F] selection:text-white">
      {/* 1. Header (fixed h-20) */}
      <Header
        spotsFree={spotsFree}
        spotsTotal={PILOT_SPOTS}
        onNavigate={handleNavigate}
        onGoPakete={() => handleNavigate('pakete')}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* 2. Hero Section (Above the Fold) – CTA führt zur Paketauswahl, damit die Klickrate eine echte Wahl misst */}
        <Hero onOpenHero={() => handleNavigate('pakete')} />

        {/* 3. Problem & Kontrast */}
        <ProblemComparison />

        {/* 4. Ablauf (3 Schritte) */}
        <HowItWorks />

        {/* 5. Pakete (A/B-Auswahl) */}
        <Packages onSelectPackage={handleSelectPackage} />

        {/* 5a. B2B: Kanzleien & Unternehmen */}
        <B2BSection />

        {/* 5b. Das Gründer- & Advisory-Team */}
        <TeamSection />

        {/* 6. PLZ-Check */}
        <PlzCheckerSection onReservePlz={handleReservePlz} />

        {/* 7. Einwandbehandlung (FAQ) */}
        <FaqSection />
      </main>

      {/* 8. Footer (mit diskretem Betreiber-Zugang über Copyright) */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* 3-Schritte-Konfigurator-Modal */}
      <FunnelModal
        isOpen={isFunnelOpen}
        onClose={() => setIsFunnelOpen(false)}
        selectedPackage={selectedPackage}
        prefillPlz={prefillPlz}
        onPackageChange={setSelectedPackage}
        onLeadSubmitted={handleLeadSubmitted}
      />

      {/* Lead Management Center für den Betreiber (Token-geschützt) */}
      <LeadManagementModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        lastUpdated={lastUpdatedLeads}
      />
    </div>
  );
}
