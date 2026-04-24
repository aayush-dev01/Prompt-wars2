import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cloud, Loader2, LogIn, LogOut, Menu, Moon, Sun, Vote, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { languageLabels, supportedLanguages, type AppLanguage } from '../i18n/translations';
import { hasGoogleAuth, signInWithGoogle, signOutFromGoogle } from '../lib/firebase';
import { useGoogleAuthState } from '../hooks/useGoogleAuthState';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const location = useLocation();
  const { language, setLanguage, labels } = useLanguage();
  const { user, loading: authLoading } = useGoogleAuthState();

  const navLinks = [
    { name: labels.nav.home, path: '/' },
    { name: labels.nav.actionCenter, path: '/action-center' },
    { name: labels.nav.process, path: '/process' },
    { name: labels.nav.guide, path: '/guide' },
    { name: labels.nav.quiz, path: '/quiz' },
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(event.matches);
        document.documentElement.classList.toggle('dark', event.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  const isActive = (path: string) => location.pathname === path;

  const handleGoogleAuth = async () => {
    if (!hasGoogleAuth || authBusy) {
      return;
    }

    setAuthBusy(true);
    setAuthError('');

    try {
      if (user) {
        await signOutFromGoogle();
      } else {
        await signInWithGoogle();
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google Sign-In could not be completed.');
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <nav aria-label="Primary" className="fixed top-0 w-full z-50 glass border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20">
              <Vote size={22} />
            </div>
            <div>
              <div className="font-bold text-xl tracking-tight">ElectED</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {labels.nav.tagline}
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="ml-2">
              <label className="sr-only" htmlFor="language-switcher">
                {labels.nav.language}
              </label>
              <select
                id="language-switcher"
                value={language}
                onChange={(event) => setLanguage(event.target.value as AppLanguage)}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground outline-none transition hover:text-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                aria-label={labels.nav.language}
              >
                {supportedLanguages.map((option) => (
                  <option key={option} value={option}>
                    {languageLabels[option]}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGoogleAuth}
              disabled={!hasGoogleAuth || authBusy || authLoading}
              className="ml-2 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={user ? 'Sign out from Google' : 'Sign in with Google'}
              title={hasGoogleAuth ? (user ? 'Cloud sync is active for your account.' : 'Sign in to enable Google-backed sync.') : 'Add Firebase config to enable Google Sign-In.'}
            >
              {authBusy || authLoading ? <Loader2 size={16} className="animate-spin" /> : user?.photoURL ? <img src={user.photoURL} alt="" className="h-4 w-4 rounded-full" /> : <Cloud size={16} />}
              <span>{user ? user.displayName?.split(' ')[0] || 'Google account' : hasGoogleAuth ? 'Google Sign-In' : 'Google setup'}</span>
              {user ? <LogOut size={14} /> : <LogIn size={14} />}
            </button>

            <button
              onClick={toggleTheme}
              className="ml-3 p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label={isDark ? labels.nav.switchToLight : labels.nav.switchToDark}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <label className="sr-only" htmlFor="mobile-language-switcher">
              {labels.nav.language}
            </label>
            <select
              id="mobile-language-switcher"
              value={language}
              onChange={(event) => setLanguage(event.target.value as AppLanguage)}
              className="rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground outline-none transition hover:text-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              aria-label={labels.nav.language}
            >
              {supportedLanguages.map((option) => (
                <option key={option} value={option}>
                  {languageLabels[option]}
                </option>
              ))}
            </select>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label={isDark ? labels.nav.switchToLight : labels.nav.switchToDark}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen((open) => !open)}
              className="text-foreground hover:text-primary transition-colors p-2"
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
              aria-label={isOpen ? labels.nav.closeMenu : labels.nav.openMenu}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {authError && !isOpen && (
        <div className="border-t border-border bg-rose-50 px-4 py-2 text-center text-sm text-rose-700">
          {authError}
        </div>
      )}

      {isOpen && (
        <div id="mobile-nav" className="md:hidden glass border-b border-border absolute w-full">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`block px-4 py-3 rounded-2xl text-base font-semibold ${
                  isActive(link.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={handleGoogleAuth}
              disabled={!hasGoogleAuth || authBusy || authLoading}
              className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left text-base font-semibold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{user ? `Connected: ${user.displayName || user.email || 'Google account'}` : hasGoogleAuth ? 'Sign in with Google' : 'Google setup required'}</span>
              {authBusy || authLoading ? <Loader2 size={18} className="animate-spin" /> : user ? <LogOut size={18} /> : <LogIn size={18} />}
            </button>
            {authError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {authError}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
