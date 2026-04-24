import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { ELECTION_PHASES } from '../data/electionData';
import { useLanguage } from '../i18n/LanguageContext';

const Process = () => {
  const [activePhase, setActivePhase] = useState(ELECTION_PHASES[0].id);
  const { labels } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{labels.process.title}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {labels.process.subtitle}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-1/3">
          <div className="sticky top-24 bg-card border border-border rounded-3xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 px-4">{labels.process.phases}</h3>
            <div className="space-y-2 relative">
              <div className="absolute left-[2.25rem] top-6 bottom-6 w-0.5 bg-border -z-10" />

              {ELECTION_PHASES.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`w-full flex items-center p-3 rounded-2xl transition-all duration-200 text-left ${
                    activePhase === phase.id
                      ? 'bg-primary/10 ring-1 ring-primary/30 shadow-sm'
                      : 'hover:bg-secondary'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 shrink-0 shadow-sm transition-transform ${
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
                    <div className="text-xs text-muted-foreground mt-0.5">{phase.duration}</div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${
                      activePhase === phase.id ? 'text-primary opacity-100 rotate-90 lg:rotate-0' : 'opacity-0 -translate-x-2'
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
                    className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg"
                  >
                    <div
                      className="h-32 md:h-48 relative flex items-end p-6 md:p-8"
                      style={{
                        background: `linear-gradient(135deg, ${phase.color}ee, ${phase.color}55)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                      <div className="relative z-10 text-white">
                        <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-1">
                          Phase {phase.phase} • {phase.duration}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold">{phase.title}</h2>
                      </div>
                      <div className="absolute right-6 bottom-6 text-6xl md:text-8xl opacity-20 transform rotate-12 drop-shadow-lg">
                        {phase.icon}
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      <h3 className="text-2xl font-bold mb-4 text-foreground/90">{phase.subtitle}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed mb-8">{phase.description}</p>

                      <div className="mb-8">
                        <h4 className="text-lg font-semibold mb-4 flex items-center">
                          <span className="bg-primary/20 text-primary p-1.5 rounded-md mr-2">
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
                              className="flex items-start bg-secondary/50 p-3 rounded-xl border border-border/50"
                            >
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-foreground/80">{detail}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                        <h4 className="text-sm font-bold uppercase text-accent mb-2 tracking-wider">{labels.process.didYouKnow}</h4>
                        <p className="font-medium text-foreground relative z-10 italic">{phase.keyFact}</p>
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
