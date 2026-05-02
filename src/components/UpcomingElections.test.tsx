// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import UpcomingElections from './UpcomingElections';

vi.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }: any) => {
        const { initial, animate, transition, ...validProps } = props;
        return <div {...validProps}>{children}</div>;
      },
    },
  };
});

describe('UpcomingElections', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the upcoming elections panel', () => {
    render(
      <LanguageProvider>
        <UpcomingElections />
      </LanguageProvider>
    );

    expect(screen.getByText('Example election calendar')).toBeInTheDocument();
    expect(screen.getByText('United States General Election')).toBeInTheDocument();
    expect(screen.getByText('Indian General Election')).toBeInTheDocument();
    expect(screen.getByText('European Parliament Election')).toBeInTheDocument();
  });

  it('hides elections that are in the past', () => {
    // Fast forward past the first election
    vi.setSystemTime(new Date('2028-12-01'));
    
    render(
      <LanguageProvider>
        <UpcomingElections />
      </LanguageProvider>
    );

    expect(screen.queryByText('United States General Election')).not.toBeInTheDocument();
    expect(screen.getByText('Indian General Election')).toBeInTheDocument();
  });

  it('displays the projected badge for projected elections', () => {
    render(
      <LanguageProvider>
        <UpcomingElections />
      </LanguageProvider>
    );

    const badges = screen.getAllByText('Projected date');
    // Indian and European elections are projected in the mock data
    expect(badges.length).toBe(2);
  });
});
