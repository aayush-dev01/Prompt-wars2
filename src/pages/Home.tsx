import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Globe, SearchCheck, Shield, Users } from 'lucide-react';
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
      icon: <SearchCheck className="text-blue-600 w-8 h-8" />,
      link: '/action-center',
    },
    {
      title: labels.home.features.timelineTitle,
      description: labels.home.features.timelineBody,
      icon: <Globe className="text-primary w-8 h-8" />,
      link: '/process',
    },
    {
      title: labels.home.features.guideTitle,
      description: labels.home.features.guideBody,
      icon: <Users className="text-accent w-8 h-8" />,
      link: '/guide',
    },
    {
      title: labels.home.features.quizTitle,
      description: labels.home.features.quizBody,
      icon: <BookOpen className="text-rose-500 w-8 h-8" />,
      link: '/quiz',
    },
    {
      title: labels.process.didYouKnow,
      description: 'Learn why observers, audits, secret ballots, and procedural rules matter for election credibility.',
      icon: <Shield className="text-emerald-600 w-8 h-8" />,
      link: '/process',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(194,65,12,0.10),_transparent_32%),radial-gradient(circle_at_70%_20%,_rgba(22,50,79,0.12),_transparent_34%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm mb-6">
                {labels.home.badge}
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
                {labels.home.titlePrefix} <span className="text-gradient">{labels.home.titleHighlight}</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 font-medium leading-relaxed">
                {labels.home.subtitle}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/action-center"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg transition-transform hover:scale-[1.02] shadow-lg shadow-primary/25"
              >
                {labels.home.ctaPrimary}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/process"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-card text-foreground font-semibold text-lg transition-transform hover:scale-[1.02] border border-border"
              >
                {labels.home.ctaSecondary}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 border-y border-border bg-card/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {ELECTION_STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{labels.home.nextStepsTitle}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {labels.home.nextStepsBody}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <VoterToolkit />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <UpcomingElections />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{labels.home.clarityTitle}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {labels.home.clarityBody}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="bg-card border border-border rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:border-primary/40 group"
              >
                <div className="bg-background rounded-2xl w-16 h-16 flex items-center justify-center mb-6 border border-border shadow-sm group-hover:-translate-y-1 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
                <Link to={feature.link} className="inline-flex items-center text-primary font-semibold group-hover:underline">
                  {labels.home.learnMore}
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{labels.home.closingTitle}</h2>
          <p className="text-xl md:text-2xl mb-10 opacity-90 font-medium">
            {labels.home.closingBody}
          </p>
          <Link
            to="/action-center"
            className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-background text-foreground font-bold text-lg hover:scale-[1.02] transition-transform shadow-2xl"
          >
            {labels.home.closingCta}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
