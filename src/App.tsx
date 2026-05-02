import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { trackPageView } from './lib/firebase';

const Home = lazy(() => import('./pages/Home'));
const Process = lazy(() => import('./pages/Process'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Guide = lazy(() => import('./pages/Guide'));
const ActionCenter = lazy(() => import('./pages/ActionCenter'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));

const PAGE_TITLES: Record<string, string> = {
  '/': 'ElectED | Understand Elections Clearly',
  '/action-center': 'Action Center | ElectED',
  '/process': 'Election Process | ElectED',
  '/guide': 'Voter Guide | ElectED',
  '/quiz': 'Quiz | ElectED',
};

const RouteTelemetry = () => {
  const location = useLocation();

  useEffect(() => {
    void trackPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = PAGE_TITLES[location.pathname] || 'ElectED';
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <ErrorBoundary>
    <Router>
      <RouteTelemetry />
      <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(194,65,12,0.12),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(22,50,79,0.14),_transparent_26%),radial-gradient(circle_at_50%_100%,_rgba(214,160,93,0.12),_transparent_28%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] [background-size:72px_72px]"
        />
        <a
          href="#main-content"
          className="sr-only z-[60] rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main id="main-content" tabIndex={-1} className="flex-grow pt-16">
          <Suspense
            fallback={
              <div
                className="flex min-h-[50vh] items-center justify-center px-4 text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                Loading experience...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/process" element={<Process />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/action-center" element={<ActionCenter />} />
            </Routes>
          </Suspense>
          </main>
          <Footer />
          <Suspense fallback={null}>
            <AIAssistant />
          </Suspense>
        </div>
      </div>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
