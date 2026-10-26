import React, { useState } from 'react';
import { MapPin, Search, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { KNOWN_ROUTES, lookupPlz } from '../data/mockRoutes';
import { PlzRouteInfo } from '../types';

interface PlzCheckerSectionProps {
  onSelectPlz: (plz: string) => void;
}

export const PlzCheckerSection: React.FC<PlzCheckerSectionProps> = ({ onSelectPlz }) => {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<PlzRouteInfo | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    const res = lookupPlz(query);
    setSearchResult(res);
  };

  const activeStuttgart = ['70173', '70174', '70176', '70178', '70182', '70184', '70191', '70192', '70197', '70597'];
  const upcomingStuttgart = ['70190', '70567', '70569', '70372', '70469'];

  return (
    <section id="plz-check" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-wider text-sky-600 uppercase mb-2 block">
            Stuttgart Routen-Explorer
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
            Liefergebiet & PLZ-Verfügbarkeit in Stuttgart
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Unser Pilot startet exklusiv im Stuttgarter Stadtgebiet mit festen sonntäglichen Kurier-Routen. Prüfe direkt deine Straße oder Kanzleiadresse.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Stuttgarter PLZ (z. B. 70173, 70174, 70192)"
                value={query}
                maxLength={5}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setQuery(val);
                  if (val.length === 5) {
                    setSearchResult(lookupPlz(val));
                  } else {
                    setSearchResult(null);
                  }
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-sky-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition shrink-0 cursor-pointer"
            >
              Prüfen
            </button>
          </form>

          {/* Search Result Card */}
          {searchResult && (
            <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-base">PLZ {searchResult.plz}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-sm text-slate-600">{searchResult.district} ({searchResult.city})</span>
                  </div>

                  {searchResult.status === 'active' ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 w-fit">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Stuttgart Pilot-Route aktiv: Noch {searchResult.spotsRemaining} von 50 Plätzen verfügbar</span>
                    </div>
                  ) : searchResult.status === 'in_preparation' ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 w-fit">
                      <Clock className="w-3.5 h-3.5" />
                      <span>In Vorbereitung: Noch {searchResult.reservationsNeeded} Reservierungen bis zum Tour-Start in Stuttgart</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 w-fit">
                      <span>Aktuell nur in Stuttgart aktiv – Vormerkung für spätere Ausbaustufen möglich</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onSelectPlz(searchResult.plz)}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                >
                  <span>Reservieren</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stuttgart Neighborhood Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>Aktive Stuttgarter Pilot-Touren</span>
              </h4>
              <span className="text-xs text-emerald-600 font-semibold">Sofort buchbar</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeStuttgart.map((p) => {
                const info = KNOWN_ROUTES[p];
                return (
                  <button
                    key={p}
                    onClick={() => {
                      setQuery(p);
                      setSearchResult(info);
                      onSelectPlz(p);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 text-xs text-slate-700 transition flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span className="font-mono font-semibold">{p}</span>
                    <span className="text-slate-400">·</span>
                    <span className="truncate max-w-[140px]">{info.district.split('/')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Stuttgart: In Vorbereitung</span>
              </h4>
              <span className="text-xs text-amber-700 font-semibold">Start ab 15 Vormerkungen</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {upcomingStuttgart.map((p) => {
                const info = KNOWN_ROUTES[p];
                return (
                  <button
                    key={p}
                    onClick={() => {
                      setQuery(p);
                      setSearchResult(info);
                      onSelectPlz(p);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 text-xs text-slate-700 transition flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span className="font-mono font-semibold">{p}</span>
                    <span className="text-slate-400">·</span>
                    <span className="truncate max-w-[140px]">{info.district.split('/')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
