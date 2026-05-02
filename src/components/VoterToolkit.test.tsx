// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import VoterToolkit from './VoterToolkit';

vi.mock('framer-motion', () => {
  const motionProxy = new Proxy(
    function () {},
    {
      get: (_, tag: string) => ({ children, ...props }: any) => {
        const { initial, animate, whileInView, viewport, transition, ...validProps } = props;
        const Component = tag as any;
        return <Component {...validProps}>{children}</Component>;
      },
    }
  );
  return { motion: motionProxy, AnimatePresence: ({ children }: any) => <>{children}</> };
});

describe('VoterToolkit', () => {
  const renderToolkit = () =>
    render(
      <MemoryRouter>
        <LanguageProvider>
          <VoterToolkit />
        </LanguageProvider>
      </MemoryRouter>
    );

  it('renders all four voter tool cards', () => {
    renderToolkit();
    expect(screen.getByText('Check registration')).toBeInTheDocument();
    expect(screen.getByText('Register to vote')).toBeInTheDocument();
    expect(screen.getByText('Find your polling place')).toBeInTheDocument();
    expect(screen.getByText('Preview your ballot')).toBeInTheDocument();
  });

  it('links to the correct external resources', () => {
    renderToolkit();
    const links = screen.getAllByRole('link');
    const hrefs = links.map(l => l.getAttribute('href'));
    expect(hrefs).toContain('https://vote.gov/register');
    expect(hrefs).toContain('https://vote.gov/');
    expect(hrefs).toContain('https://www.vote.org/polling-place-locator/');
    expect(hrefs).toContain('https://ballotpedia.org/Sample_Ballot_Lookup');
  });

  it('opens external links in new tabs with security attributes', () => {
    renderToolkit();
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
