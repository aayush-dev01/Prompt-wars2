// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import Footer from './Footer';

describe('Footer', () => {
  it('renders the footer content and links', () => {
    render(
      <LanguageProvider>
        <Footer />
      </LanguageProvider>
    );

    expect(screen.getByText('ElectED')).toBeInTheDocument();
    expect(screen.getByText('Educational civic tool')).toBeInTheDocument();
    
    // Check for the presence of the dynamic year
    expect(screen.getByText(`© ${new Date().getFullYear()}`)).toBeInTheDocument();

    // Check for the presence of the translated links
    expect(screen.getByText('US voter help')).toBeInTheDocument();
    expect(screen.getByText('Global election resources')).toBeInTheDocument();
    expect(screen.getByText('Democracy background')).toBeInTheDocument();

    // Check link URLs
    const usHelpLink = screen.getByRole('link', { name: /US voter help/i });
    expect(usHelpLink).toHaveAttribute('href', 'https://vote.gov/');

    const globalLink = screen.getByRole('link', { name: /Global election resources/i });
    expect(globalLink).toHaveAttribute('href', 'https://www.idea.int/');

    const democracyLink = screen.getByRole('link', { name: /Democracy background/i });
    expect(democracyLink).toHaveAttribute('href', 'https://www.un.org/en/global-issues/democracy');
  });
});
