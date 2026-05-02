// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { LanguageProvider } from '../i18n/LanguageContext';
import Quiz from './Quiz';

const { mockQuestions } = vi.hoisted(() => ({
  mockQuestions: [
    {
      id: 'q1',
      question: 'Which office usually manages voter registration?',
      options: ['Election office', 'Weather office', 'Tax board', 'School board'],
      correctAnswer: 0,
      explanation: 'Election offices commonly administer registration.',
      category: 'Registration',
      difficulty: 'easy',
    },
    {
      id: 'q2',
      question: 'Why should voters verify deadlines locally?',
      options: ['Because deadlines vary', 'Because colors vary', 'Because fonts vary', 'Because logos vary'],
      correctAnswer: 0,
      explanation: 'Election rules and deadlines vary by jurisdiction.',
      category: 'Deadlines',
      difficulty: 'medium',
    },
    {
      id: 'q3',
      question: 'What should a voter review before election day?',
      options: ['Sample ballot', 'Only ads', 'Only slogans', 'Only hashtags'],
      correctAnswer: 0,
      explanation: 'Reviewing a sample ballot improves preparation.',
      category: 'Preparation',
      difficulty: 'easy',
    },
    {
      id: 'q4',
      question: 'What is a trustworthy source for voting rules?',
      options: ['Official election authority', 'Random forum', 'Anonymous chat', 'Chain message'],
      correctAnswer: 0,
      explanation: 'Official election authorities publish the current rules.',
      category: 'Official Sources',
      difficulty: 'medium',
    },
    {
      id: 'q5',
      question: 'What should happen after polls close?',
      options: ['Votes are counted under election procedures', 'Results are guessed', 'Rules disappear', 'Polls reopen forever'],
      correctAnswer: 0,
      explanation: 'Vote counting follows defined procedures.',
      category: 'Counting',
      difficulty: 'hard',
    },
  ],
}));

const { geminiMock } = vi.hoisted(() => ({
  geminiMock: {
    getGeminiApiKeys: vi.fn(),
    generateGeminiText: vi.fn(),
    formatGeminiError: vi.fn((error: unknown) => (error instanceof Error ? error.message : 'Unknown error')),
    GEMINI_MODELS: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'],
  },
}));

vi.mock('../lib/gemini', () => geminiMock);
vi.mock('../data/electionData', () => ({
  QUIZ_QUESTIONS: mockQuestions,
}));
vi.mock('framer-motion', () => {
  const motionProps = ['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap', 'whileDrag', 'whileFocus', 'whileInView', 'layoutId'];
  const motionProxy = new Proxy(
    {},
    {
      get: (_, tag: string) => ({ children, ...props }: Record<string, unknown>) => {
        const validProps = { ...props };
        motionProps.forEach(prop => delete validProps[prop]);
        return createElement(tag, validProps, children as ReactNode);
      },
    },
  );

  return {
    AnimatePresence: ({ children }: { children: unknown }) => children,
    motion: motionProxy,
  };
});

const renderQuiz = () =>
  render(
    <LanguageProvider>
      <Quiz />
    </LanguageProvider>,
  );

describe('Quiz', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  beforeEach(() => {
    vi.clearAllMocks();
    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);
  });

  it('walks through the quiz flow and shows the final score', async () => {
    renderQuiz();

    fireEvent.click(screen.getByRole('button', { name: /start quiz/i }));

    for (let index = 0; index < mockQuestions.length; index += 1) {
      await screen.findByRole('heading', { level: 2 });
      fireEvent.click(screen.getAllByRole('button')[0]);
      await screen.findByText(/Election offices commonly administer registration|Election rules and deadlines vary by jurisdiction|Reviewing a sample ballot improves preparation|Official election authorities publish the current rules|Vote counting follows defined procedures/);
      fireEvent.click(
        screen.getByRole('button', {
          name: /next question|see results/i,
        }),
      );
    }

    expect(await screen.findByText(/Excellent result|Good result|Keep learning/)).toBeInTheDocument();
    expect(screen.getByText('5/5')).toBeInTheDocument();
    expect(screen.getByText(/No coaching needed this round/i)).toBeInTheDocument();
  });

  it('requests adaptive coaching after missed questions', async () => {
    geminiMock.generateGeminiText.mockResolvedValue({
      text: 'What You Already Know\nRegistration basics\n\nWhere You Need Work\nDeadline verification',
      modelName: 'gemini-2.5-flash-lite',
    });

    renderQuiz();

    fireEvent.click(screen.getByRole('button', { name: /start quiz/i }));

    await screen.findByRole('heading', { level: 2 });
    fireEvent.click(screen.getAllByRole('button')[1]);
    fireEvent.click(screen.getByRole('button', { name: /next question/i }));

    for (let index = 1; index < mockQuestions.length; index += 1) {
      await screen.findByRole('heading', { level: 2 });
      fireEvent.click(screen.getAllByRole('button')[0]);
      fireEvent.click(
        screen.getByRole('button', {
          name: /next question|see results/i,
        }),
      );
    }

    fireEvent.click(screen.getByRole('button', { name: /generate gemini coaching/i }));

    expect(await screen.findByText(/What You Already Know/)).toBeInTheDocument();
    expect(geminiMock.generateGeminiText).toHaveBeenCalledTimes(1);
  });

  it('restarts the quiz and resets state', async () => {
    renderQuiz();
    fireEvent.click(screen.getByRole('button', { name: /start quiz/i }));
    await screen.findByRole('heading', { level: 2 });
    
    // Quick exit to results (not possible via UI usually, but testing the logic)
    // Actually just finish the quiz to see the restart button
    for (let index = 0; index < mockQuestions.length; index += 1) {
      fireEvent.click(screen.getAllByRole('button')[0]);
      fireEvent.click(screen.getByRole('button', { name: /next question|see results/i }));
    }
    
    const restartButton = await screen.findByRole('button', { name: /retake quiz/i });
    fireEvent.click(restartButton);
    
    expect(await screen.findByText(/Question 1/i)).toBeInTheDocument();
    expect(screen.queryByText('5/5')).not.toBeInTheDocument();
  });

  it('shows warning when requesting coaching without API keys', async () => {
    geminiMock.getGeminiApiKeys.mockReturnValue([]);
    renderQuiz();
    fireEvent.click(screen.getByRole('button', { name: /start quiz/i }));

    // Answer incorrectly to enable coaching
    fireEvent.click(screen.getAllByRole('button')[1]);
    fireEvent.click(screen.getByRole('button', { name: /next question/i }));
    
    // Skip rest
    for (let index = 1; index < mockQuestions.length; index += 1) {
      fireEvent.click(screen.getAllByRole('button')[0]);
      fireEvent.click(screen.getByRole('button', { name: /next question|see results/i }));
    }

    const coachingButton = await screen.findByRole('button', { name: /generate gemini coaching/i });
    fireEvent.click(coachingButton);

    expect(await screen.findByText(/Add `VITE_GEMINI_API_KEY`/i)).toBeInTheDocument();
  });

  it('displays error message when coaching generation fails', async () => {
    geminiMock.generateGeminiText.mockRejectedValue(new Error('API Failure'));
    renderQuiz();
    fireEvent.click(screen.getByRole('button', { name: /start quiz/i }));

    fireEvent.click(screen.getAllByRole('button')[1]);
    fireEvent.click(screen.getByRole('button', { name: /next question/i }));
    
    for (let index = 1; index < mockQuestions.length; index += 1) {
      fireEvent.click(screen.getAllByRole('button')[0]);
      fireEvent.click(screen.getByRole('button', { name: /next question|see results/i }));
    }

    const coachingButton = await screen.findByRole('button', { name: /generate gemini coaching/i });
    fireEvent.click(coachingButton);

    expect(await screen.findByText(/API Failure/i)).toBeInTheDocument();
  });
});
