import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, ShieldCheck, Timer, Vote } from 'lucide-react';
import { ELECTION_PHASES } from '../data/electionData';
import { useLanguage } from '../i18n/LanguageContext';

const Process = () => {
  const [activePhase, setActivePhase] = useState(ELECTION_PHASES[0].id);
  const { labels } = useLanguage();
  const activePhaseData = ELECTION_PHASES.find((phase) => phase.id === activePhase) || ELECTION_PHASES[0];
  const overview = [
    { label: 'Phases', value: String(ELECTION_PHASES.length), icon: Vote },
    { label: 'Current focus', value: activePhaseData.title, icon: ShieldCheck },
    { label: 'Typical span', value: activePhaseData.duration, icon: Timer },
  ];

  return (
    <div className="page-shell py-12 sm:py-16">
      <div className="feature-panel mb-12 rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="section-heading">
            <div className="mb-3 inline-flex rounded-full border border-border bg-background/75 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Timeline walkthrough
            </div>
            <h1 className="text-4xl font-bold md:text-5xl">{labels.process.title}</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{labels.process.subtitle}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {overview.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-3xl border border-border bg-background/75 p-4">
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
                <div className="mt-1 text-lg font-bold text-foreground">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-12 lg:flex-row">
        <div className="lg:w-1/3">
          <div className="sticky top-24 rounded-[2rem] border border-border bg-card/90 p-4 shadow-lg shadow-slate-900/5">
            <h2 className="mb-6 px-4 text-lg font-semibold">{labels.process.phases}</h2>
            <div className="relative space-y-2">
              <div className="absolute bottom-6 left-[2.25rem] top-6 -z-10 w-0.5 bg-border" />

              {ELECTION_PHASES.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`flex w-full items-center rounded-2xl p-3 text-left transition-all duration-200 ${
                    activePhase === phase.id ? 'bg-primary/10 ring-1 ring-primary/30 shadow-sm' : 'hover:bg-secondary'
                  }`}
                >
                  <div
                    className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg shadow-sm transition-transform ${
                      activePhase === phase.id ? 'scale-110 ring-2 ring-background' : ''
                    }`}
                    style={{
                      backgroundColor: activePhase === phase.id ? phase.color : 'var(--muted)',
                      color: activePhase === phase.id ? '#fff' : 'inherit',
                    }}
                  >
                    {phase.icon}
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className={`font-semibold ${activePhase === phase.id ? 'text-primary' : ''}`}>
                      {phase.phase}. {phase.title}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{phase.duration}</div>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 transition-transform ${
                      activePhase === phase.id ? 'rotate-90 text-primary opacity-100 lg:rotate-0' : '-translate-x-2 opacity-0'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-2/3">
          <AnimatePresence mode="wait">
            {ELECTION_PHASES.map(
              (phase) =>
                phase.id === activePhase && (
                  <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl shadow-slate-900/5"
                  >
                    <div
                      className="relative flex h-40 items-end p-6 md:h-52 md:p-8"
                      style={{ background: `linear-gradient(135deg, ${phase.color}ee, ${phase.color}55)` }}
                    >
                      <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                      <div className="relative z-10 text-white">
                        <div className="mb-1 text-sm font-bold uppercase tracking-wider opacity-90">
                          Phase {phase.phase} • {phase.duration}
                        </div>
                        <h2 className="text-3xl font-bold md:text-4xl">{phase.title}</h2>
                      </div>
                      <div className="absolute bottom-6 right-6 text-6xl opacity-20 drop-shadow-lg md:text-8xl">
                        {phase.icon}
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      <div className="mb-8 rounded-3xl border border-border bg-background/70 p-5">
                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Why this stage matters</div>
                        <h3 className="mt-2 text-2xl font-bold text-foreground/90">{phase.subtitle}</h3>
                        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{phase.description}</p>
                      </div>

                      <div className="mb-8">
                        <h4 className="mb-4 flex items-center text-lg font-semibold">
                          <span className="mr-2 rounded-md bg-primary/20 p-1.5 text-primary">
                            <CheckCircle2 size={18} />
                          </span>
                          {labels.process.keyActivities}
                        </h4>
                        <ul className="space-y-3">
                          {phase.details.map((detail, idx) => (
                            <motion.li
                              key={detail}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.08 }}
                              className="flex items-start rounded-xl border border-border/50 bg-secondary/50 p-3"
                            >
                              <span className="mr-3 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                {idx + 1}
                              </span>
                              <span className="text-foreground/80">{detail}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent/10 p-6">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
                        <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-accent">{labels.process.didYouKnow}</h4>
                        <p className="relative z-10 font-medium italic text-foreground">{phase.keyFact}</p>
                      </div>
                    </div>
                  </motion.div>
                ),
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Process;
