import { motion } from 'framer-motion';
import { ArrowRight, Calendar, ExternalLink, MapPin } from 'lucide-react';
import { format, formatDistanceToNow, isFuture, parseISO } from 'date-fns';
import { useLanguage } from '../i18n/LanguageContext';

const UPCOMING_ELECTIONS = [
  {
    id: '1',
    title: 'United States General Election',
    date: '2028-11-07',
    location: 'Nationwide, USA',
    type: 'Presidential and congressional',
    link: 'https://vote.gov/',
  },
  {
    id: '2',
    title: 'Indian General Election',
    date: '2029-04-15',
    location: 'Nationwide, India',
    type: 'Parliamentary',
    link: 'https://voters.eci.gov.in/',
    projected: true,
  },
  {
    id: '3',
    title: 'European Parliament Election',
    date: '2029-06-06',
    location: 'European Union',
    type: 'Parliamentary',
    link: 'https://elections.europa.eu/',
    projected: true,
  },
];

const UpcomingElections = () => {
  const { labels } = useLanguage();
  const elections = [...UPCOMING_ELECTIONS]
    .filter((election) => isFuture(parseISO(election.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-primary/10 p-2 rounded-xl">
          <Calendar className="text-primary w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold">{labels.elections.title}</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        {labels.elections.body}
      </p>

      <div className="flex-grow space-y-4">
        {elections.map((election, index) => (
          <motion.div
            key={election.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="flex items-start p-4 rounded-2xl hover:bg-secondary/50 border border-transparent hover:border-border transition-colors group"
          >
            <div className="bg-background border border-border rounded-xl p-3 text-center min-w-[84px] mr-4 shadow-sm group-hover:border-primary/30 transition-colors">
              <div className="text-xs font-bold uppercase text-primary mb-1">
                {format(parseISO(election.date), 'MMM')}
              </div>
              <div className="text-2xl font-black text-foreground">
                {format(parseISO(election.date), 'dd')}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {format(parseISO(election.date), 'yyyy')}
              </div>
            </div>

            <div className="flex-grow">
              <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {election.title}
              </h4>
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <MapPin className="w-3 h-3 mr-1" />
                {election.location}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {labels.elections.aboutPrefix} {formatDistanceToNow(parseISO(election.date), { addSuffix: true })}
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="text-xs font-medium text-accent-foreground bg-accent/90 inline-block px-2 py-0.5 rounded-full">
                  {election.type}
                </div>
                {election.projected && (
                  <div className="text-[10px] font-bold text-muted-foreground bg-muted border border-border inline-block px-2 py-0.5 rounded-full uppercase tracking-tight">
                    {labels.elections.projected}
                  </div>
                )}
              </div>
            </div>

            <a
              href={election.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors ml-2"
              aria-label={`${labels.elections.ariaPrefix} ${election.title}`}
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-sm gap-4">
        <span className="text-muted-foreground italic">{labels.elections.footer}</span>
        <a
          href="https://www.idea.int/advanced-search"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium hover:underline flex items-center shrink-0"
        >
          {labels.elections.globalCalendar}
          <ArrowRight className="w-3 h-3 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default UpcomingElections;
