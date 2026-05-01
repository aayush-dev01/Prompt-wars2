import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, BookOpen, CheckCircle, Loader2, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/electionData';
import { formatGeminiError, generateGeminiText, GEMINI_MODELS, getGeminiApiKeys, type GeminiModelName } from '../lib/gemini';
import { useLanguage } from '../i18n/LanguageContext';

type QuizQuestion = (typeof QUIZ_QUESTIONS)[number];

const QUIZ_COACH_PROMPT = `You are a civic learning coach.
The user has just finished a short elections quiz.
Analyze weak areas kindly and concretely.
Do not shame the user.
Use these headings exactly:
What You Already Know
Where You Need Work
Three-Minute Learning Plan
Three Follow-Up Questions
Respond in the user's selected language.`;

const pickQuestions = (): QuizQuestion[] => [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);

const Quiz = () => {
  const apiKeys = getGeminiApiKeys();
  const { labels, geminiLanguageLabel } = useLanguage();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>(pickQuestions);
  const [missedQuestions, setMissedQuestions] = useState<QuizQuestion[]>([]);
  const [coachResult, setCoachResult] = useState('');
  const [coachModel, setCoachModel] = useState<GeminiModelName>(GEMINI_MODELS[0]);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState('');

  const missedCategories = useMemo(() => {
    const counts = missedQuestions.reduce<Record<string, number>>((accumulator, question) => {
      accumulator[question.category] = (accumulator[question.category] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts)
      .sort((left, right) => right[1] - left[1])
      .map(([category]) => category);
  }, [missedQuestions]);

  const startQuiz = () => {
    setQuestions(pickQuestions());
    setStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setMissedQuestions([]);
    setCoachResult('');
    setCoachError('');
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;

    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === questions[currentQuestion].correctAnswer) {
      setScore((currentScore) => currentScore + 1);
      return;
    }

    setMissedQuestions((currentMisses) => [...currentMisses, questions[currentQuestion]]);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((question) => question + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const buildCoach = async () => {
    if (apiKeys.length === 0) {
      setCoachError('Add `VITE_GEMINI_API_KEY` or `VITE_GEMINI_API_KEYS` in `.env` to generate adaptive quiz coaching.');
      return;
    }

    setCoachLoading(true);
    setCoachError('');

    try {
      const result = await generateGeminiText({
        apiKey: apiKeys,
        systemInstruction: QUIZ_COACH_PROMPT,
        prompt: `Respond in ${geminiLanguageLabel}.

Quiz score: ${score}/${questions.length}
Missed categories: ${missedCategories.join(', ') || 'None'}

Missed questions:
${missedQuestions
  .map(
    (question, index) =>
      `${index + 1}. ${question.question}
Correct answer: ${question.options[question.correctAnswer]}
Explanation: ${question.explanation}
Category: ${question.category}`,
  )
  .join('\n\n') || 'None'}

Create a short custom coaching plan.`,
        temperature: 0.4,
        maxOutputTokens: 900,
      });

      setCoachResult(result.text);
      setCoachModel(result.modelName);
    } catch (error) {
      setCoachError(formatGeminiError(error));
    } finally {
      setCoachLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-700 bg-green-500/10 border-green-500/20 dark:text-green-400';
      case 'medium':
        return 'text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-300';
      case 'hard':
        return 'text-red-700 bg-red-500/10 border-red-500/20 dark:text-red-400';
      default:
        return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  if (!started) {
    return (
      <div className="page-shell flex min-h-[calc(100vh-16rem)] max-w-5xl flex-col justify-center py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="feature-panel rounded-[2rem] p-8 shadow-xl md:p-12">
          <div className="relative z-10">
            <div className="mx-auto mb-4 inline-flex rounded-full border border-border bg-background/75 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Knowledge check
            </div>
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">{labels.quiz.introTitle}</h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              {labels.quiz.introBody}
            </p>

            <div className="mx-auto mb-8 grid max-w-3xl gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/80 p-4 text-left">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Format</div>
                <div className="mt-2 text-sm font-semibold text-foreground">5 randomized questions</div>
              </div>
              <div className="rounded-2xl border border-border bg-background/80 p-4 text-left">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{labels.quiz.coachingLanguage}</div>
                <div className="mt-2 text-sm font-semibold text-foreground">{geminiLanguageLabel}</div>
              </div>
              <div className="rounded-2xl border border-border bg-background/80 p-4 text-left">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Outcome</div>
                <div className="mt-2 text-sm font-semibold text-foreground">Instant explanations plus optional Gemini coaching</div>
              </div>
            </div>

            <button onClick={startQuiz} className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02]">
              {labels.quiz.start}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const activeQuestion = questions[currentQuestion];

  return (
    <div className="page-shell flex min-h-[calc(100vh-16rem)] max-w-4xl flex-col py-12">
      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div key={activeQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-grow flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
            <div className="h-2 w-full bg-secondary">
              <motion.div className="h-full bg-gradient-to-r from-primary to-accent" initial={{ width: `${(currentQuestion / questions.length) * 100}%` }} animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
            </div>

            <div className="flex flex-grow flex-col p-8">
              <div className="mb-8 flex items-center justify-between gap-4">
                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  {labels.quiz.questionLabel} {currentQuestion + 1} {labels.quiz.of} {questions.length}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getDifficultyColor(activeQuestion.difficulty)}`}>
                  {activeQuestion.difficulty}
                </span>
              </div>

              <h2 className="mb-2 text-2xl font-bold leading-tight md:text-3xl">{activeQuestion.question}</h2>
              <div className="mb-8 text-sm text-muted-foreground">{activeQuestion.category}</div>

              <div className="flex-grow space-y-4">
                {activeQuestion.options.map((option, index) => {
                  let buttonClass = 'w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 text-lg font-medium ';
                  let icon = null;

                  if (!isAnswered) {
                    buttonClass += 'border-border hover:border-primary hover:bg-primary/5';
                  } else if (index === activeQuestion.correctAnswer) {
                    buttonClass += 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400';
                    icon = <CheckCircle className="h-6 w-6 shrink-0 text-green-500" />;
                  } else if (index === selectedAnswer) {
                    buttonClass += 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400';
                    icon = <XCircle className="h-6 w-6 shrink-0 text-red-500" />;
                  } else {
                    buttonClass += 'border-border opacity-50';
                  }

                  return (
                    <button key={option} onClick={() => handleAnswer(index)} disabled={isAnswered} className={`${buttonClass} flex items-center justify-between`}>
                      <span>{option}</span>
                      {icon && <span className="ml-4">{icon}</span>}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-2xl border border-border bg-secondary/60 p-6">
                  <h4 className="mb-2 flex items-center font-bold">
                    <AlertCircle className="mr-2 h-5 w-5 text-primary" />
                    {labels.quiz.explanation}
                  </h4>
                  <p className="leading-relaxed text-muted-foreground">{activeQuestion.explanation}</p>
                  <div className="mt-6 text-right">
                    <button onClick={nextQuestion} className="rounded-xl bg-foreground px-6 py-3 font-bold text-background transition-colors hover:bg-foreground/90">
                      {currentQuestion < questions.length - 1 ? labels.quiz.nextQuestion : labels.quiz.seeResults}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[2rem] border border-border bg-card p-8 shadow-xl md:p-12">
            <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
              <div className="text-center">
                <div className="relative mx-auto mb-8 h-32 w-32">
                  <svg className="h-full w-full" viewBox="0 0 36 36" aria-hidden="true">
                    <path className="stroke-current text-secondary" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <motion.path
                      className={`${score >= 3 ? 'text-green-500' : 'text-primary'} stroke-current`}
                      strokeWidth="3"
                      strokeDasharray={`${(score / questions.length) * 100}, 100`}
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      initial={{ strokeDasharray: '0, 100' }}
                      animate={{ strokeDasharray: `${(score / questions.length) * 100}, 100` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">
                      {score}/{questions.length}
                    </span>
                  </div>
                </div>

                <h2 className="mb-4 text-3xl font-bold">
                  {score === questions.length ? labels.quiz.perfect : score >= 3 ? labels.quiz.strong : labels.quiz.keepLearning}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {labels.quiz.scoreBody.replace('{score}', String(score)).replace('{total}', String(questions.length))}
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-background p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-accent" />
                  {labels.quiz.adaptiveTitle}
                </div>

                <div className="mb-4 text-sm text-muted-foreground">
                  {labels.quiz.weakAreas}: {missedCategories.length > 0 ? missedCategories.join(', ') : labels.quiz.noWeakAreas}
                </div>

                <button onClick={buildCoach} disabled={coachLoading || missedQuestions.length === 0} className="inline-flex items-center rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50">
                  {coachLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {labels.quiz.generateCoaching}
                </button>

                {missedQuestions.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {labels.quiz.noCoachingNeeded}
                  </div>
                )}

                {coachError && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{coachError}</div>}

                {coachResult && (
                  <div className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-sm">
                    <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                      {coachModel}
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">{coachResult}</div>
                  </div>
                )}
              </div>
            </div>

            <button onClick={startQuiz} className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-transform hover:scale-[1.02]">
              <RotateCcw className="mr-2 h-5 w-5" />
              {labels.quiz.retake}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
