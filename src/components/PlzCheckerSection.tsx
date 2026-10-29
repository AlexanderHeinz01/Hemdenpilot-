import React, { useState } from 'react';
import { ROUTES, lookupPlz } from '../data/mockRoutes';
import { PlzRouteInfo } from '../types';
import { track } from '../services/tracking';

interface PlzCheckerSectionProps {
  onReservePlz: (plz: string) => void;
}

export const PlzCheckerSection: React.FC<PlzCheckerSectionProps> = ({ onReservePlz }) => {
  const [plzQuery, setPlzQuery] = useState('');
  const [plzResult, setPlzResult] = useState<PlzRouteInfo | null>(null);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 5);
    setPlzQuery(v);
    if (v.length === 5) {
      showResult(v);
    } else {
      setPlzResult(null);
    }
  };

  const showResult = (plz: string) => {
    const result = lookupPlz(plz);
    setPlzResult(result);
    track('plz_check', result.status === 'planned' ? 'outside' : result.status);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (plzQuery.length === 5) {
      showResult(plzQuery);
    }
  };

  const pickChip = (plz: string) => {
    setPlzQuery(plz);
    showResult(plz);
  };

  const activeChips = Object.keys(ROUTES)
    .filter((p) => ROUTES[p][1] === 'active')
    .map((p) => ({
      plz: p,
      name: ROUTES[p][0].split('/')[0].trim(),
    }));

  const upcomingChips = Object.keys(ROUTES)
    .filter((p) => ROUTES[p][1] === 'prep')
    .map((p) => ({
      plz: p,
      name: ROUTES[p][0].split('/')[0].trim(),
    }));

  const getStatusText = (r: PlzRouteInfo) => {
    if (r.status === 'active') return 'Geplantes Pilotgebiet · Vormerkung möglich';
    if (r.status === 'prep') return 'Start abhängig von der Nachfrage · Vormerkung möglich';
    return 'Pilot zunächst nur in Stuttgart · Vormerkung möglich';
  };

  return (
    <section
      id="plz-check"
      data-screen-label="PLZ-Check"
      className="bg-[#F2EFE9] py-[clamp(96px,10vw,128px)] border-b border-[#E5E0D8]"
    >
      <div className="max-w-[1024px] mx-auto px-5 md:px-8">
        
        {/* Header */}
        <div className="max-w-[720px] mx-auto mb-12 text-center">
          <span className="block text-[11px] font-semibold tracking-[0.22em] text-[#9A7B4F] mb-[18px] font-jakarta">
            STUTTGARTER ROUTEN-ÜBERSICHT
          </span>
          <h2 className="font-cormorant font-medium text-[clamp(34px,4.2vw,50px)] leading-[1.1] m-0 mb-5 text-[#18181B]">
            Liefergebiet &amp; Verfügbarkeit in <em className="italic">Stuttgart</em>
          </h2>
          <p className="m-0 text-[16px] leading-[1.7] text-[#57534E] text-pretty font-jakarta">
            Unser Pilot startet im Stuttgarter Stadtgebiet mit festen wöchentlichen Kurier-Routen. Prüfen Sie die Postleitzahl Ihrer Wohnung oder Kanzlei und merken Sie sich unverbindlich einen Platz vor.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearch} className="max-w-[560px] mx-auto flex flex-col sm:flex-row gap-2 sm:gap-0">
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="Stuttgarter PLZ, z. B. 70173"
            value={plzQuery}
            onChange={handleQueryChange}
            className="w-full sm:flex-1 min-w-0 p-3.5 sm:p-4 px-4 sm:px-[18px] bg-[#FFFFFF] border border-[#E5E0D8] sm:border-r-0 rounded-none font-jakarta text-[15px] text-[#18181B] outline-none focus:border-[#9A7B4F]"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3.5 sm:py-0 min-h-[46px] bg-[#0B111E] text-[#F9F8F6] border-0 rounded-none font-jakarta text-[11px] font-semibold tracking-[0.16em] uppercase cursor-pointer hover:bg-[#18181B] transition-colors flex items-center justify-center text-center"
          >
            Prüfen
          </button>
        </form>

        {/* Live Result Box */}
        {plzResult && (
          <div
            className={`max-w-[560px] mx-auto mt-3 bg-[#FFFFFF] border p-4 sm:p-5 px-4 sm:px-[22px] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-5 ${
              plzResult.status === 'active' ? 'border-[#9A7B4F]' : 'border-[#E5E0D8]'
            }`}
          >
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="font-cormorant text-[20px] sm:text-[22px] font-semibold text-[#18181B]">
                PLZ {plzResult.plz}{' '}
                <span className="font-jakarta text-[13px] font-normal text-[#57534E]">
                  · {plzResult.district}
                </span>
              </span>
              <span
                className={`text-[11px] font-semibold tracking-[0.12em] uppercase font-jakarta ${
                  plzResult.status === 'active' ? 'text-[#9A7B4F]' : 'text-[#57534E]'
                }`}
              >
                {getStatusText(plzResult)}
              </span>
            </div>

            <button
              onClick={() => onReservePlz(plzResult.plz)}
              className="w-full sm:w-auto py-3 px-5 bg-[#9A7B4F] text-[#0B111E] border-0 rounded-none font-jakarta text-[11px] font-semibold tracking-[0.12em] sm:tracking-[0.14em] uppercase cursor-pointer whitespace-nowrap min-h-[44px] flex items-center justify-center text-center hover:bg-[#866941] transition-colors shrink-0"
            >
              Vormerken →
            </button>
          </div>
        )}

        {/* 2-Column Grid: Active & Upcoming */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#E5E0D8] border border-[#E5E0D8] mt-10 sm:mt-14">
          
          {/* Active Tours */}
          <div className="bg-[#FFFFFF] p-5 sm:p-7">
            <div className="flex justify-between items-baseline gap-3 mb-4 pb-3.5 border-b border-[#E5E0D8]">
              <span className="font-cormorant text-[20px] sm:text-[22px] font-semibold text-[#18181B]">
                Geplante Pilotgebiete
              </span>
              <span className="text-[10px] font-semibold tracking-[0.18em] text-[#9A7B4F] font-jakarta">
                ERSTE ROUTEN
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeChips.map((c) => (
                <button
                  key={c.plz}
                  type="button"
                  onClick={() => pickChip(c.plz)}
                  className="flex gap-1.5 items-center py-2 px-3 bg-[#F9F8F6] border border-[#E5E0D8] rounded-none font-jakarta text-[12px] text-[#18181B] cursor-pointer hover:border-[#9A7B4F] transition-colors min-h-[38px]"
                >
                  <strong className="font-semibold tabular-nums">{c.plz}</strong>
                  <span className="text-[#57534E]">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Tours */}
          <div className="bg-[#FFFFFF] p-5 sm:p-7">
            <div className="flex justify-between items-baseline gap-3 mb-4 pb-3.5 border-b border-[#E5E0D8]">
              <span className="font-cormorant text-[20px] sm:text-[22px] font-semibold text-[#18181B]">
                Weitere Stadtteile
              </span>
              <span className="text-[10px] font-semibold tracking-[0.18em] text-[#57534E] font-jakarta">
                START NACH NACHFRAGE
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {upcomingChips.map((c) => (
                <button
                  key={c.plz}
                  type="button"
                  onClick={() => pickChip(c.plz)}
                  className="flex gap-1.5 items-center py-2 px-3 bg-[#F9F8F6] border border-[#E5E0D8] rounded-none font-jakarta text-[12px] text-[#18181B] cursor-pointer hover:border-[#9A7B4F] transition-colors min-h-[38px]"
                >
                  <strong className="font-semibold tabular-nums">{c.plz}</strong>
                  <span className="text-[#57534E]">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
