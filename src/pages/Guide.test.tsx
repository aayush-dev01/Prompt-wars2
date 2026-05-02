// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import Guide from './Guide';
import { FAQ_DATA, VOTER_GUIDE_STEPS } from '../data/electionData';
import { MemoryRouter } from 'react-router-dom';

vi.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }: any) => {
        const { initial, animate, whileInView, viewport, transition, ...validProps } = props;
        return <div {...validProps}>{children}</div>;
      },
      details: ({ children, ...props }: any) => {
        const { initial, animate, whileInView, viewport, transition, ...validProps } = props;
        return <details {...validProps}>{children}</details>;
      },
    },
  };
});

// Mock VoterToolkit because it has its own complexity and might need router
vi.mock('../components/VoterToolkit', () => ({
  default: () => <div data-testid="mock-toolkit">Mock Toolkit</div>,
}));

describe('Guide Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderGuide = () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Guide />
        </LanguageProvider>
      </MemoryRouter>
    );
  };

  it('renders the main guide header', () => {
    renderGuide();
    expect(screen.getByText(/Voter-ready checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/Voter guide/i)).toBeInTheDocument();
  });

  it('renders the VoterToolkit component', () => {
    renderGuide();
    expect(screen.getByTestId('mock-toolkit')).toBeInTheDocument();
  });

  it('renders all voter guide steps', () => {
    renderGuide();
    VOTER_GUIDE_STEPS.forEach((step) => {
      expect(screen.getByText(step.title)).toBeInTheDocument();
      expect(screen.getByText(step.description)).toBeInTheDocument();
      
      // Check that at least one checklist item from the step is rendered
      if (step.checklist.length > 0) {
        expect(screen.getByText(step.checklist[0])).toBeInTheDocument();
      }
    });
  });

  it('renders the FAQ section', () => {
    renderGuide();
    
    FAQ_DATA.forEach((faq) => {
      expect(screen.getByText(faq.question)).toBeInTheDocument();
      expect(screen.getByText(faq.answer)).toBeInTheDocument();
    });
  });
});
