import { motion } from 'framer-motion';
import { ArrowRight, CheckSquare, FileText, MapPin, Search } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const VoterToolkit = () => {
  const { labels } = useLanguage();
  const tools = [
    {
      icon: <CheckSquare className="w-6 h-6 text-primary" />,
      title: labels.toolkit.tools.checkRegistrationTitle,
      description: labels.toolkit.tools.checkRegistrationBody,
      actionText: labels.toolkit.tools.checkRegistrationAction,
      link: 'https://vote.gov/register',
    },
    {
      icon: <FileText className="w-6 h-6 text-accent" />,
      title: labels.toolkit.tools.registerTitle,
      description: labels.toolkit.tools.registerBody,
      actionText: labels.toolkit.tools.registerAction,
      link: 'https://vote.gov/',
    },
    {
      icon: <MapPin className="w-6 h-6 text-green-600" />,
      title: labels.toolkit.tools.pollingTitle,
      description: labels.toolkit.tools.pollingBody,
      actionText: labels.toolkit.tools.pollingAction,
      link: 'https://www.vote.org/polling-place-locator/',
    },
    {
      icon: <Search className="w-6 h-6 text-rose-500" />,
      title: labels.toolkit.tools.ballotTitle,
      description: labels.toolkit.tools.ballotBody,
      actionText: labels.toolkit.tools.ballotAction,
      link: 'https://ballotpedia.org/Sample_Ballot_Lookup',
    },
  ];

  return (
    <div className="feature-panel flex h-full flex-col rounded-[2rem] p-6">
      <div className="relative z-10 mb-6">
        <div className="mb-3 inline-flex rounded-full border border-border bg-background/75 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Useful links
        </div>
        <h3 className="mb-2 text-2xl font-bold">{labels.toolkit.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {labels.toolkit.body}
        </p>
      </div>

      <div className="relative z-10 grid flex-grow grid-cols-1 gap-4 sm:grid-cols-2">
        {tools.map((tool, index) => (
          <motion.a
            key={tool.title}
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[1.6rem] border border-border bg-background/85 p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-secondary/40 hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 mb-4">
              <div className="mb-3 bg-card w-11 h-11 rounded-xl flex items-center justify-center border border-border shadow-sm group-hover:-translate-y-1 transition-transform">
                {tool.icon}
              </div>
              <h4 className="font-bold text-foreground mb-1">{tool.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
            </div>

            <div className="relative z-10 mt-auto flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
              {tool.actionText}
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default VoterToolkit;
