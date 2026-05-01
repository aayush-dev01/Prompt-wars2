import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Globe,
  SearchCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { ELECTION_STATS } from '../data/electionData';
import UpcomingElections from '../components/UpcomingElections';
import VoterToolkit from '../components/VoterToolkit';
import { useLanguage } from '../i18n/LanguageContext';

const Home = () => {
  const { labels } = useLanguage();

  const features = [
    {
      title: labels.home.features.actionCenterTitle,
      description: labels.home.features.actionCenterBody,
      icon: SearchCheck,
      color: 'text-sky-700 dark:text-sky-300',
      link: '/action-center',
    },
    {
      title: labels.home.features.timelineTitle,
      description: labels.home.features.timelineBody,
      icon: Globe,
      color: 'text-primary',
      link: '/process',
    },
    {
      title: labels.home.features.guideTitle,
      description: labels.home.features.guideBody,
      icon: Users,
      color: 'text-accent',
      link: '/guide',
    },
    {
      title: labels.home.features.quizTitle,
      description: labels.home.features.quizBody,
      icon: BookOpen,
      color: 'text-rose-600 dark:text-rose-300',
      link: '/quiz',
    },
  ];

  const highlights = [
    'Neutral explanations instead of campaign messaging',
    'Fast paths for first-time voters and deadline checkers',
    'Accessible, mobile-friendly layouts across the full site',
  ];

  const pathways = [
    {
      title: 'Start with the big picture',
      body: 'Use the timeline to understand what happens before, during, and after voting.',
      link: '/process',
    },
    {
      title: 'Get personally ready',
      body: 'Use the guide and toolkit to turn knowledge into a real voting plan.',
      link: '/guide',
    },
    {
      title: 'Check what you know',
      body: 'Take the quiz and generate adaptive coaching where you still feel unsure.',
      link: '/quiz',
    },
  ];

  return (
    <div className="pb-6">
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="page-shell">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="feature-panel rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10 lg:px-10"
            >
              <div className="relative z-10">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/75 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm">
                  <Sparkles className="h-4 w-4 text-accent" />
                  {labels.home.badge}
                </div>

                <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
                  {labels.home.titlePrefix} <span className="text-gradient">{labels.home.titleHighlight}</span>
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                  {labels.home.subtitle}
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    to="/action-center"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-4 text-lg font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition hover:translate-y-[-1px]"
                  >
                    {labels.home.ctaPrimary}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/process"
                    className="inline-flex items-center justify-center rounded-full border border-border bg-background/80 px-7 py-4 text-lg font-semibold text-foreground transition hover:border-primary/30 hover:bg-card"
                  >
                    {labels.home.ctaSecondary}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {highlights.map((highlight) => (
                    <div key={highlight} className="rounded-2xl border border-border bg-background/70 px-4 py-4 text-sm text-foreground/90">
                      <CheckCircle2 className="mb-2 h-4 w-4 text-primary" />
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="grid gap-4"
            >
              <div className="feature-panel rounded-[2rem] p-6">
                <div className="relative z-10">
                  <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">What makes this useful</div>
                  <div className="space-y-4">
                    {features.slice(0, 3).map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.title} className="rounded-2xl border border-border bg-background/75 p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                              <Icon className={`h-6 w-6 ${feature.color}`} />
                            </div>
                            <div>
                              <div className="font-bold text-foreground">{feature.title}</div>
                              <div className="mt-1 text-sm leading-6 text-muted-foreground">{feature.description}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-primary/15 bg-primary px-6 py-6 text-primary-foreground shadow-2xl shadow-primary/20">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/70">Fast orientation</div>
                <div className="text-3xl font-bold">From confusion to confidence in a few minutes</div>
                <p className="mt-3 text-sm leading-6 text-primary-foreground/80">
                  Open the Action Center when you need practical help right now, or browse the guide and process pages when you want context first.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/45 py-10 backdrop-blur-sm">
        <div className="page-shell">
          <div className="grid gap-4 md:grid-cols-4">
            {ELECTION_STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                className="rounded-[1.75rem] border border-border bg-background/75 p-5 text-center shadow-sm"
              >
                <div className="mb-3 text-3xl">{stat.icon}</div>
                <div className="text-3xl font-black text-foreground">{stat.value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="page-shell">
          <div className="mb-10 section-heading">
            <h2 className="text-3xl font-bold md:text-4xl">{labels.home.nextStepsTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{labels.home.nextStepsBody}</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <VoterToolkit />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <UpcomingElections />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="page-shell">
          <div className="mb-10 section-heading">
            <h2 className="text-3xl font-bold md:text-4xl">{labels.home.clarityTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{labels.home.clarityBody}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                  className="group rounded-[2rem] border border-border bg-card/90 p-7 shadow-lg shadow-slate-900/5 transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
                    <Icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold transition-colors group-hover:text-primary">{feature.title}</h3>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">{feature.description}</p>
                  <Link to={feature.link} className="mt-6 inline-flex items-center font-semibold text-primary">
                    {labels.home.learnMore}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="page-shell">
          <div className="feature-panel rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
            <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">How to use ElectED</div>
                <h2 className="text-3xl font-bold md:text-4xl">Choose your path in under a minute</h2>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">
                  If you are in a hurry, start with the tool that matches your problem. If you want confidence first, use the learning flow.
                </p>
              </div>

              <div className="grid gap-4">
                {pathways.map((pathway, index) => (
                  <div key={pathway.title} className="rounded-3xl border border-border bg-background/75 p-5">
                    <div className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Path {index + 1}</div>
                    <div className="text-xl font-bold">{pathway.title}</div>
                    <div className="mt-2 text-sm leading-6 text-muted-foreground">{pathway.body}</div>
                    <Link to={pathway.link} className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                      Open this path
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="page-shell">
          <div className="rounded-[2rem] bg-primary px-6 py-10 text-primary-foreground shadow-2xl shadow-primary/25 sm:px-8 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <h2 className="text-4xl font-bold tracking-tight md:text-5xl">{labels.home.closingTitle}</h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-primary-foreground/85">{labels.home.closingBody}</p>
              </div>

              <div className="flex flex-col gap-4 lg:items-end">
                <Link
                  to="/action-center"
                  className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-lg font-bold text-foreground shadow-xl transition hover:translate-y-[-1px]"
                >
                  {labels.home.closingCta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <div className="text-sm text-primary-foreground/75">Use the Action Center, guide, and quiz together for the strongest experience.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
