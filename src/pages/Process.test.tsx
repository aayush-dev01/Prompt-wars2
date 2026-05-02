// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import Process from './Process';
import { ELECTION_PHASES } from '../data/electionData';

vi.mock('framer-motion', () => {
  return {
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: any) => {
        const { initial, animate, exit, transition, ...validProps } = props;
        return <div {...validProps}>{children}</div>;
      },
      li: ({ children, ...props }: any) => {
        const { initial, animate, transition, ...validProps } = props;
        return <li {...validProps}>{children}</li>;
      },
    },
  };
});

describe('Process Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderProcess = () => {
    render(
      <LanguageProvider>
        <Process />
      </LanguageProvider>
    );
  };

  it('renders the header and overview stats', () => {
    renderProcess();
    expect(screen.getByText('Timeline walkthrough')).toBeInTheDocument();
    expect(screen.getByText('Phases')).toBeInTheDocument();
    expect(screen.getByText(String(ELECTION_PHASES.length))).toBeInTheDocument();
  });

  it('renders all election phases in the sidebar menu', () => {
    renderProcess();
    ELECTION_PHASES.forEach((phase) => {
      // It matches the 'Phase number. Title' format
      expect(screen.getByText(new RegExp(`${phase.phase}\\.\\s*${phase.title}`, 'i'))).toBeInTheDocument();
    });
  });

  it('displays the first phase details by default', () => {
    renderProcess();
    const firstPhase = ELECTION_PHASES[0];
    expect(screen.getByText(firstPhase.subtitle)).toBeInTheDocument();
    expect(screen.getByText(firstPhase.description)).toBeInTheDocument();
    expect(screen.getByText(firstPhase.keyFact)).toBeInTheDocument();
  });

  it('changes active phase when a sidebar item is clicked', () => {
    renderProcess();
    const secondPhase = ELECTION_PHASES[1];
    
    // Find the button for the second phase
    const secondPhaseButton = screen.getByText(new RegExp(`${secondPhase.phase}\\.\\s*${secondPhase.title}`, 'i'));
    fireEvent.click(secondPhaseButton);

    // The details of the second phase should now be visible
    expect(screen.getByText(secondPhase.subtitle)).toBeInTheDocument();
    expect(screen.getByText(secondPhase.description)).toBeInTheDocument();
    expect(screen.getByText(secondPhase.keyFact)).toBeInTheDocument();
  });
});
