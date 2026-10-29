import React, { useState } from 'react';
import { Building2, Check, Users, Receipt } from 'lucide-react';
import { submitCompanyLead, CONTACT_EMAIL } from '../services/leadService';
import { getAttribution } from '../services/session';
import { track } from '../services/tracking';
import { SUBSIDY_OPTIONS, type EmployerSubsidy } from '../config/options';
import { openLegal } from '../services/legal';

const inputClass = (hasError: boolean) =>
  `w-full p-3 sm:p-3.5 bg-[#FFFFFF] border rounded-none font-jakarta text-[14px] text-[#18181B] outline-none focus:border-[#9A7B4F] ${
    hasError ? 'border-[#9A3412]' : 'border-[#E5E0D8]'
  }`;

const fieldLabel = 'text-[11px] font-semibold tracking-[0.16em] uppercase text-[#57534E]';

export const B2BSection: React.FC = () => {
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plz, setPlz] = useState('');
  const [employees, setEmployees] = useState('');
  const [subsidy, setSubsidy] = useState<EmployerSubsidy>('unklar');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentId, setSentId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (company.trim().length < 2) newErrors.company = 'Bitte den Namen Ihres Unternehmens angeben.';
    if (contactName.trim().length < 3) newErrors.name = 'Bitte Vor- und Nachnamen eingeben.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Bitte eine gültige E-Mail-Adresse eingeben.';
    if (!/^\d{5}$/.test(plz)) newErrors.plz = 'Bitte eine 5-stellige Postleitzahl eingeben.';
    const employeeCount = Number(employees);
    if (!Number.isInteger(employeeCount) || employeeCount < 1) {
      newErrors.employeesInterested = 'Bitte die Anzahl interessierter Mitarbeiter angeben (mind. 1).';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await submitCompanyLead({
      company: company.trim(),
      contactName: contactName.trim(),
      role: role.trim() || null,
      email: email.trim(),
      phone: phone.trim() || null,
      plz,
      employeesInterested: employeeCount,
      employerSubsidy: subsidy,
      message: message.trim() || null,
      attribution: getAttribution(),
      website,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    track('b2b_form_submitted');
    setSentId(result.lead.id);
  };

  const fieldErrors = ['company', 'name', 'email', 'plz', 'employeesInterested', 'phone'];
  const serverErrors = Object.entries(errors).filter(([key]) => !fieldErrors.includes(key));

  return (
    <section
      id="unternehmen"
      data-screen-label="Für Unternehmen"
      className="bg-[#0B111E] text-[#F9F8F6] py-[clamp(96px,10vw,128px)] border-b border-white/[0.08]"
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-start">
        {/* Left: Value proposition */}
        <div className="flex flex-col gap-7">
          <div>
            <span className="block text-[11px] font-semibold tracking-[0.22em] text-[#9A7B4F] mb-[18px] font-jakarta">
              FÜR KANZLEIEN &amp; UNTERNEHMEN
            </span>
            <h2 className="font-cormorant font-medium text-[clamp(34px,4.2vw,50px)] leading-[1.1] m-0 mb-5">
              Der Hemdenservice als <em className="italic text-[#D9C3A0]">Team-Benefit</em>
            </h2>
            <p className="m-0 text-[16px] leading-[1.7] text-[#D6D3D1] font-jakarta">
              Ab vier Nutzern an einem Standort übergeben wir gebündelt jeden Montagmorgen am Empfang. Für Ihre Partner,
              Berater und Führungskräfte entfällt jeder Weg zur Reinigung – für Sie entsteht kein Verwaltungsaufwand.
            </p>
          </div>

          <div className="flex flex-col gap-5 font-jakarta">
            {[
              {
                icon: Users,
                t: 'Sammel-Übergabe am Empfang',
                d: 'Ein fester Termin pro Woche für alle Nutzer am Standort, sauber nach Personen getrennt.',
              },
              {
                icon: Receipt,
                t: 'Optional als Arbeitgeberzuschuss',
                d: 'Sie können den Service ganz oder teilweise bezuschussen. Die steuerliche Behandlung (z. B. als Sachbezug) klären Sie bitte mit Ihrer Steuerberatung.',
              },
              {
                icon: Building2,
                t: 'Unverbindliches Erstgespräch',
                d: 'Wir melden uns innerhalb von zwei Werktagen und klären Bedarf, Standort und Konditionen.',
              },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex gap-4 items-start">
                <span className="w-10 h-10 border border-[#9A7B4F]/50 flex items-center justify-center text-[#9A7B4F] shrink-0">
                  <Icon className="w-[18px] h-[18px] stroke-[1.5]" />
                </span>
                <div>
                  <div className="text-[15px] font-semibold text-[#F9F8F6] mb-1">{t}</div>
                  <p className="m-0 text-[14px] leading-[1.65] text-[#D6D3D1]">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Inquiry form */}
        <div className="bg-[#F9F8F6] text-[#18181B] border border-[#9A7B4F]/40 p-5 sm:p-8 font-jakarta">
          {sentId ? (
            <div className="flex flex-col items-center text-center gap-4 py-8">
              <span className="w-14 h-14 border border-[#9A7B4F]/50 flex items-center justify-center text-[#9A7B4F]">
                <Check className="w-6 h-6 stroke-[1.5]" />
              </span>
              <h3 className="font-cormorant font-medium text-[28px] leading-[1.15] m-0">Vielen Dank für Ihre Anfrage.</h3>
              <p className="m-0 text-[14px] leading-[1.7] text-[#57534E] max-w-[380px]">
                Wir melden uns innerhalb von zwei Werktagen bei Ihnen. Ihre Anfrage-Nummer: <strong>{sentId}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <h3 className="font-cormorant font-medium text-[26px] sm:text-[30px] leading-[1.15] m-0 mb-1">
                Firmenanfrage stellen
              </h3>

              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>Unternehmen / Kanzlei *</span>
                <input type="text" autoComplete="organization" maxLength={120} value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass(!!errors.company)} />
                {errors.company && <span className="text-[12px] text-[#9A3412]">{errors.company}</span>}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>Ansprechpartner *</span>
                  <input type="text" autoComplete="name" maxLength={100} value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass(!!errors.name)} />
                  {errors.name && <span className="text-[12px] text-[#9A3412]">{errors.name}</span>}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>Funktion</span>
                  <input type="text" autoComplete="organization-title" placeholder="z. B. Office Manager" maxLength={80} value={role} onChange={(e) => setRole(e.target.value)} className={inputClass(false)} />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>E-Mail *</span>
                  <input type="email" autoComplete="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass(!!errors.email)} />
                  {errors.email && <span className="text-[12px] text-[#9A3412]">{errors.email}</span>}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>Telefon</span>
                  <input type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass(!!errors.phone)} />
                  {errors.phone && <span className="text-[12px] text-[#9A3412]">{errors.phone}</span>}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>Standort-PLZ *</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="z. B. 70173"
                    value={plz}
                    onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className={inputClass(!!errors.plz)}
                  />
                  {errors.plz && <span className="text-[12px] text-[#9A3412]">{errors.plz}</span>}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>Interessierte Mitarbeiter *</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={5000}
                    placeholder="z. B. 6"
                    value={employees}
                    onChange={(e) => setEmployees(e.target.value)}
                    className={inputClass(!!errors.employeesInterested)}
                  />
                  {errors.employeesInterested && <span className="text-[12px] text-[#9A3412]">{errors.employeesInterested}</span>}
                </label>
              </div>

              <div>
                <span className={`${fieldLabel} block mb-2`}>Interesse an einem Arbeitgeberzuschuss?</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(SUBSIDY_OPTIONS) as EmployerSubsidy[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSubsidy(key)}
                      className={`py-2.5 px-2 border rounded-none text-[12px] font-medium cursor-pointer transition-colors ${
                        subsidy === key
                          ? 'bg-[#0B111E] text-[#F9F8F6] border-[#0B111E]'
                          : 'bg-[#FFFFFF] text-[#18181B] border-[#E5E0D8] hover:border-[#9A7B4F]'
                      }`}
                    >
                      {SUBSIDY_OPTIONS[key]}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>Nachricht (optional)</span>
                <textarea rows={3} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} className={inputClass(false)} />
              </label>

              {/* Honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="absolute -left-[9999px] w-px h-px opacity-0"
              />

              {serverErrors.length > 0 && (
                <div role="alert" className="p-3.5 border border-[#9A3412]/40 bg-[#9A3412]/5 text-[12px] leading-[1.6] text-[#9A3412]">
                  {serverErrors.map(([key, msg]) => (
                    <div key={key}>{msg}</div>
                  ))}
                  <div className="mt-1">
                    Alternativ erreichen Sie uns unter{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                      {CONTACT_EMAIL}
                    </a>
                    .
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-1 py-4 px-3 bg-[#9A7B4F] text-[#0B111E] border-0 rounded-none text-[12px] font-semibold tracking-[0.12em] uppercase cursor-pointer hover:bg-[#866941] transition-opacity min-h-[48px] ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Wird gesendet …' : 'Unverbindlich anfragen →'}
              </button>

              <p className="m-0 text-[11px] leading-[1.6] text-[#57534E] text-center">
                Wir verwenden Ihre Angaben ausschließlich zur Bearbeitung Ihrer Anfrage. Details in der{' '}
                <button
                  type="button"
                  onClick={() => openLegal('datenschutz')}
                  className="bg-transparent border-0 p-0 underline text-[#18181B] cursor-pointer text-[11px]"
                >
                  Datenschutzerklärung
                </button>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
