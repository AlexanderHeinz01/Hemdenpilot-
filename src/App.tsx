import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProblemComparison } from './components/ProblemComparison';
import { HowItWorks } from './components/HowItWorks';
import { Packages } from './components/Packages';
import { TeamSection } from './components/TeamSection';
import { PlzCheckerSection } from './components/PlzCheckerSection';
import { FaqSection } from './components/FaqSection';
import { FunnelModal } from './components/FunnelModal';
import { LeadManagementModal } from './components/LeadManagementModal';
import { Footer } from './components/Footer';
import { PackageType, LeadData } from './types';

export default function App() {
  const [isFunnelOpen, setIsFunnelOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('A');
  const [prefillPlz, setPrefillPlz] = useState<string>('');
  const [lastUpdatedLeads, setLastUpdatedLeads] = useState<number>(Date.now());

  // Listen for discreet URL triggers (?admin or #admin) and keyboard shortcuts (Ctrl+Shift+L)
  useEffect(() => {
    const checkUrlParams = () => {
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
        search.includes('admin') ||
        search.includes('pilot') ||
        search.includes('leads') ||
        hash.includes('admin') ||
        hash.includes('leads')
      ) {
        setIsAdminOpen(true);
      }
    };

    checkUrlParams();
    window.addEventListener('popstate', checkUrlParams);
    window.addEventListener('hashchange', checkUrlParams);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut: Ctrl + Shift + L or Cmd + Shift + L
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
    const eventName = pkg === 'B' ? 'select_package_B' : 'select_package_A';

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

  const handleHeroCta = () => {
    handleSelectPackage('A');
  };

  const handleReservePlz = (plz: string) => {
    setPrefillPlz(plz);
    handleSelectPackage(selectedPackage);
  };

  const handlePackageChange = (pkg: PackageType) => {
    setSelectedPackage(pkg);
  };

  const handleLeadSubmitted = (lead: LeadData) => {
    setLastUpdatedLeads(Date.now());
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#18181B] flex flex-col font-jakarta selection:bg-[#9A7B4F] selection:text-white">
      {/* 1. Header (fixed h-20) */}
      <Header
        spotsFree={14}
        onNavigate={handleNavigate}
        onGoPakete={() => handleNavigate('pakete')}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* 2. Hero Section (Above the Fold) */}
        <Hero onOpenHero={handleHeroCta} />

        {/* 3. Problem & Kontrast */}
        <ProblemComparison />

        {/* 4. Ablauf (3 Schritte) */}
        <HowItWorks />

        {/* 5. Pakete (A/B-Auswahl) */}
        <Packages onSelectPackage={handleSelectPackage} />

        {/* 5b. Sektion 4b: Das Gründer- & Advisory-Team */}
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
        onPackageChange={handlePackageChange}
        onLeadSubmitted={handleLeadSubmitted}
      />

      {/* Diskretes Lead Management Center für den Betreiber (kein sichtbarer Public-Button) */}
      <LeadManagementModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        lastUpdated={lastUpdatedLeads}
      />
    </div>
  );
}
