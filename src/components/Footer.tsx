import { ArrowUpRight, Globe, Heart, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const Footer = () => {
  const { labels } = useLanguage();
  const links = [
    { href: 'https://vote.gov/', label: labels.footer.links.voterHelp, icon: Mail },
    { href: 'https://www.idea.int/', label: labels.footer.links.globalResources, icon: Globe },
    { href: 'https://www.un.org/en/global-issues/democracy', label: labels.footer.links.democracyBackground, icon: MessageCircle },
  ];

  return (
    <footer className="mt-16 border-t border-border bg-card/70 py-10 transition-colors duration-300">
      <div className="page-shell">
        <div className="feature-panel rounded-[2rem] px-6 py-8 sm:px-8">
          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <ShieldCheck size={14} className="text-primary" />
                Educational civic tool
              </div>
              <div className="mb-3 flex items-center gap-3">
                <div className="text-2xl font-bold tracking-tight">ElectED</div>
                <span className="text-sm text-muted-foreground">© {new Date().getFullYear()}</span>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{labels.footer.body}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[30rem]">
              <div className="rounded-3xl border border-border bg-background/70 p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Principles</div>
                <div className="text-sm text-foreground">Clarity, neutrality, accessibility, and practical voter prep.</div>
              </div>
              <div className="rounded-3xl border border-border bg-background/70 p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Built for</div>
                <div className="text-sm text-foreground">First-time voters, curious learners, and anyone checking election basics quickly.</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 flex flex-col gap-5 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart size={14} className="fill-red-500 text-red-500" />
              {labels.footer.designed}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {links.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  aria-label={label}
                  title={label}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
