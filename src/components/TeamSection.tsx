import React from 'react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  fallbackImage: string;
  tag: string;
  isAdvisory?: boolean;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'alexander-heinz',
    name: 'Alexander Heinz',
    role: 'Founder / Operations',
    description:
      'Verantwortet die reibungslose Kurier-Logistik und das Qualitätsmanagement. Zuvor jahrelange Expertise im Supply Chain Management.',
    image: '/assets/aistudio/Heinz_57c4fc75.jpg',
    fallbackImage: '/team-heinz.jpg',
    tag: 'OPERATIONS',
  },
  {
    id: 'victoria-dornier',
    name: 'Victoria Dornier',
    role: 'Co-Founder / Digital & Experience',
    description:
      'Ex-Tier-1-Strategieberaterin. Kennt den Schmerzpunkt der Zielgruppe aus 8 Jahren auf Reisen und verantwortet die nahtlose digitale Kundenerfahrung.',
    image: '/assets/aistudio/Dornier_489e66bf.jpg',
    fallbackImage: '/team-dornier.jpg',
    tag: 'EXPERIENCE',
  },
  {
    id: 'maximilian-aurel',
    name: 'Maximilian Aurel',
    role: 'Co-Founder / Finance & B2B',
    description:
      'Steuert die Skalierung und die strategischen B2B-Partnerschaften mit Kanzleien und Wirtschaftsprüfungsgesellschaften.',
    image: '/assets/aistudio/Aurel_b0dfe65c.jpg',
    fallbackImage: '/team-aurel.jpg',
    tag: 'PARTNERSHIPS',
  },
  {
    id: 'henrik-falkenberg',
    name: 'Dr. Henrik Falkenberg',
    role: 'Advisory Board / Textil-Infrastruktur',
    description:
      'Ehemaliger Vorstand einer der größten europäischen Großwäschereien. Sichert unsere industriellen Qualitäts- und Pflegestandards ab Tag 1.',
    image: '/assets/aistudio/Falkenberg_14041776.jpg',
    fallbackImage: '/team-falkenberg.jpg',
    tag: 'ADVISORY',
    isAdvisory: true,
  },
];

export const TeamSection: React.FC = () => {
  return (
    <section
      id="team"
      data-screen-label="Team & Advisory"
      className="bg-[#F2EFE9] text-[#18181B] py-24 sm:py-32 border-b border-[#E5E0D8]"
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="inline-block uppercase tracking-[0.2em] text-[11px] sm:text-xs font-semibold text-[#9A7B4F] mb-3.5 sm:mb-4 font-jakarta">
            VERTRAUEN DURCH EXZELLENZ
          </span>

          <h2 className="font-cormorant font-medium text-[clamp(30px,4.5vw,48px)] leading-[1.15] text-[#18181B] m-0 mb-4 sm:mb-5 tracking-tight text-balance">
            Das Team hinter der Rotation
          </h2>

          <p className="font-jakarta text-[15px] sm:text-[17px] leading-[1.65] text-[#57534E] max-w-2xl mx-auto m-0 text-pretty">
            Wir kennen die Ansprüche von Beratern, Juristen und Führungskräften aus eigener Erfahrung. Unser Anspruch: Diskretion, absolute Zuverlässigkeit und kompromisslose Qualität.
          </p>
        </div>

        {/* 4-spaltiges Grid (Desktop) / 2x2 Grid (Tablet) mit feinen 1px-Trennlinien */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#E5E0D8] bg-[#FFFFFF] divide-y sm:divide-y-0 sm:divide-x divide-[#E5E0D8]">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={member.id}
              className={`flex flex-col p-6 sm:p-7 lg:p-8 bg-[#FFFFFF] ${
                idx >= 2 ? 'sm:border-t sm:border-[#E5E0D8] lg:border-t-0' : ''
              } transition-colors hover:bg-[#FAFAF8]`}
            >
              {/* Professionelles Porträt im strengen Hochformat (4:5) */}
              <div className="relative aspect-[4/5] w-full bg-[#141A26] border border-[#E5E0D8] mb-6 overflow-hidden select-none shadow-sm group">
                <img
                  src={member.image}
                  onError={(e) => {
                    e.currentTarget.src = member.fallbackImage;
                  }}
                  alt={`${member.name} – ${member.role}`}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="eager"
                  decoding="async"
                />

                {/* Subtiles horizontales Haarlinien-Detail mit Tag */}
                <div className="absolute bottom-2.5 left-3 right-3 flex justify-between items-center text-[9px] font-semibold uppercase tracking-[0.2em] text-[#F9F8F6]/85 font-jakarta z-10 drop-shadow-md">
                  <span>HEMDENPILOT</span>
                  <span className={member.isAdvisory ? 'text-[#D9C3A0]' : 'text-[#F9F8F6]'}>
                    {member.tag}
                  </span>
                </div>

                {/* Feine Vignette am unteren Bildrand für Textlesbarkeit */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0B101B]/70 via-[#0B101B]/25 to-transparent pointer-events-none" />
              </div>

              {/* Name in Cormorant Garamond */}
              <h3 className="font-cormorant font-semibold text-[22px] sm:text-[24px] leading-[1.2] text-[#18181B] m-0 mb-1.5">
                {member.name}
              </h3>

              {/* Rolle in Plus Jakarta Sans */}
              <div className="text-[11px] sm:text-[12px] font-semibold tracking-[0.12em] uppercase text-[#9A7B4F] mb-4 font-jakarta">
                {member.role}
              </div>

              {/* Beschreibung (bei Henrik Falkenberg leicht in #9A7B4F abgesetzt) */}
              <p
                className={`font-jakarta text-[13px] sm:text-[14px] leading-[1.65] m-0 mt-auto ${
                  member.isAdvisory
                    ? 'text-[#866941] font-medium'
                    : 'text-[#57534E]'
                }`}
              >
                {member.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
