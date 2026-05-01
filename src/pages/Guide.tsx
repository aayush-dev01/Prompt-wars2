import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, HelpCircle, ShieldCheck } from 'lucide-react';
import { FAQ_DATA, VOTER_GUIDE_STEPS } from '../data/electionData';
import VoterToolkit from '../components/VoterToolkit';
import { useLanguage } from '../i18n/LanguageContext';

const Guide = () => {
  const { labels } = useLanguage();

  return (
    <div className="page-shell py-12 sm:py-16">
      <div className="feature-panel mb-12 rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="section-heading">
            <div className="mb-3 inline-flex rounded-full border border-border bg-background/75 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Voter-ready checklist
            </div>
            <h1 className="text-4xl font-bold md:text-5xl">{labels.guide.title}</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{labels.guide.subtitle}</p>
          </div>

          <div className="rounded-3xl border border-border bg-background/75 p-5">
            <ShieldCheck className="mb-3 h-6 w-6 text-primary" />
            <div className="text-sm leading-7 text-muted-foreground">
              Use this guide when you want a practical flow: confirm eligibility, get registered, research the ballot, and show up prepared.
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <VoterToolkit />
      </div>

      <div className="mb-20">
        <h2 className="mb-8 flex items-center text-3xl font-bold">
          <span className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-xl text-primary-foreground">
            1
          </span>
          {labels.guide.pathTitle}
        </h2>

        <div className="space-y-6">
          {VOTER_GUIDE_STEPS.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: index * 0.08 }}
              className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-lg shadow-slate-900/5 md:p-8"
            >
              <div className="absolute -right-8 -top-8 select-none text-[150px] font-black leading-none text-muted/30">
                {step.step}
              </div>

              <div className="relative z-10 flex flex-col gap-6 md:flex-row">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                  {step.icon}
                </div>

                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                  <p className="mb-6 mt-2 text-lg text-muted-foreground">{step.description}</p>

                  <div className="rounded-2xl border border-border/50 bg-secondary/50 p-5">
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {labels.guide.checklist}
                    </h4>
                    <ul className="space-y-3">
                      {step.checklist.map((item) => (
                        <li key={item} className="flex items-start">
                          <CheckCircle2 className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <span className="font-medium text-foreground/90">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-10 text-center">
          <h2 className="mb-4 flex items-center justify-center text-3xl font-bold">
            <HelpCircle className="mr-3 h-8 w-8 text-primary" />
            {labels.guide.faqTitle}
          </h2>
          <p className="text-muted-foreground">{labels.guide.faqBody}</p>
        </div>

        <div className="grid gap-4">
          {FAQ_DATA.map((faq, index) => (
            <motion.details
              key={faq.question}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group overflow-hidden rounded-[1.6rem] border border-border bg-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 text-lg font-semibold transition-colors hover:bg-secondary/30">
                <span className="pr-8">{faq.question}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary transition-colors group-open:bg-primary group-open:text-primary-foreground">
                  <ChevronRight className="h-5 w-5 transition-transform group-open:rotate-90" />
                </span>
              </summary>
              <div className="mt-2 border-t border-border px-6 pb-6 pt-4 leading-relaxed text-muted-foreground">{faq.answer}</div>
            </motion.details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Guide;
