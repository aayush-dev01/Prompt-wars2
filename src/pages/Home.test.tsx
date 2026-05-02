// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import Home from './Home';

vi.mock('framer-motion', () => {
  const motionMock = new Proxy(
    function (Component: any) {
      return ({ children, ...props }: any) => {
        const { initial, animate, whileInView, viewport, transition, ...validProps } = props;
        return <Component {...validProps}>{children}</Component>;
      };
    },
    {
      get: (_, tag: string) => ({ children, ...props }: any) => {
        const { initial, animate, whileInView, viewport, transition, ...validProps } = props;
        const Component = tag as any;
        return <Component {...validProps}>{children}</Component>;
      },
    }
  );

  return { motion: motionMock, AnimatePresence: ({ children }: any) => <>{children}</> };
});

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHome = () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Home />
        </LanguageProvider>
      </MemoryRouter>
    );
  };

  it('renders the main hero section correctly', () => {
    renderHome();
    expect(screen.getByText('Understand how')).toBeInTheDocument();
    expect(screen.getByText('elections actually work')).toBeInTheDocument();
    expect(screen.getByText('Civic learning without the jargon')).toBeInTheDocument();
  });

  it('renders primary and secondary call-to-action buttons', () => {
    renderHome();
    const primaryCta = screen.getByRole('link', { name: /Open Action Center/i });
    expect(primaryCta).toHaveAttribute('href', '/action-center');

    const secondaryCta = screen.getByRole('link', { name: /Explore the process/i });
    expect(secondaryCta).toHaveAttribute('href', '/process');
  });

  it('renders highlights', () => {
    renderHome();
    expect(screen.getByText('Neutral explanations instead of campaign messaging')).toBeInTheDocument();
    expect(screen.getByText('Fast paths for first-time voters and deadline checkers')).toBeInTheDocument();
    expect(screen.getByText('Accessible, mobile-friendly layouts across the full site')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    renderHome();
    expect(screen.getAllByText('Gemini Action Center').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Interactive timeline').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Voter guide').length).toBeGreaterThan(0);
  });

  it('renders election statistics section', () => {
    renderHome();
    // From ELECTION_STATS
    expect(screen.getByText('4B+')).toBeInTheDocument();
    expect(screen.getByText('Eligible Voters Globally')).toBeInTheDocument();
  });

  it('renders the clarity section', () => {
    renderHome();
    expect(screen.getByText('Built for clarity')).toBeInTheDocument();
  });

  it('renders the pathways section', () => {
    renderHome();
    expect(screen.getByText('Start with the big picture')).toBeInTheDocument();
    expect(screen.getByText('Get personally ready')).toBeInTheDocument();
    expect(screen.getByText('Check what you know')).toBeInTheDocument();
  });

  it('renders the closing call-to-action section', () => {
    renderHome();
    expect(screen.getByText('Better voters make stronger democracies')).toBeInTheDocument();
    const closingCta = screen.getByRole('link', { name: /Launch Action Center/i });
    expect(closingCta).toHaveAttribute('href', '/action-center');
  });
});
