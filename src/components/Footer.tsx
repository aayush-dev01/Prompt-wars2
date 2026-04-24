import { Globe, Heart, Mail, MessageCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const Footer = () => {
  const { labels } = useLanguage();
  const links = [
    { href: 'https://vote.gov/', label: labels.footer.links.voterHelp, icon: Mail },
    { href: 'https://www.idea.int/', label: labels.footer.links.globalResources, icon: Globe },
    { href: 'https://www.un.org/en/global-issues/democracy', label: labels.footer.links.democracyBackground, icon: MessageCircle },
  ];

  return (
    <footer className="mt-12 border-t border-border bg-card/70 py-10 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row">
          <div className="max-w-xl">
            <div className="mb-3 flex items-center gap-3">
              <div className="text-xl font-bold tracking-tight">ElectED</div>
              <span className="text-sm text-muted-foreground">© {new Date().getFullYear()}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{labels.footer.body}</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart size={14} className="fill-red-500 text-red-500" />
              {labels.footer.designed}
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              {links.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2 transition-colors hover:bg-secondary hover:text-primary"
                  aria-label={label}
                  title={label}
                >
                  <Icon size={18} />
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
