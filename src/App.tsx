import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';

const Home = lazy(() => import('./pages/Home'));
const Process = lazy(() => import('./pages/Process'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Guide = lazy(() => import('./pages/Guide'));
const ActionCenter = lazy(() => import('./pages/ActionCenter'));

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <a
          href="#main-content"
          className="sr-only z-[60] rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
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
        <AIAssistant />
      </div>
    </Router>
  );
}

export default App;
