import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { FAQ_DATA, VOTER_GUIDE_STEPS } from '../data/electionData';
import VoterToolkit from '../components/VoterToolkit';
import { useLanguage } from '../i18n/LanguageContext';

const Guide = () => {
  const { labels } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{labels.guide.title}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {labels.guide.subtitle}
        </p>
      </div>

      <div className="mb-16">
        <VoterToolkit />
      </div>

      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-8 flex items-center">
          <span className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mr-4 text-xl">
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
              className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 text-[150px] font-black text-muted/30 leading-none select-none z-0">
                {step.step}
              </div>

              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0 z-10">
                {step.icon}
              </div>

              <div className="flex-grow z-10">
                <h3 className="text-2xl font-bold mb-2 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-lg mb-6">{step.description}</p>

                <div className="bg-secondary/50 rounded-2xl p-5 border border-border/50">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">{labels.guide.checklist}</h4>
                  <ul className="space-y-3">
                    {step.checklist.map((item) => (
                      <li key={item} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-primary mr-3 shrink-0 mt-0.5" />
                        <span className="text-foreground/90 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-primary mr-3" />
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
              className="bg-card border border-border rounded-2xl group overflow-hidden"
            >
              <summary className="font-semibold text-lg p-6 cursor-pointer list-none flex justify-between items-center hover:bg-secondary/30 transition-colors">
                <span className="pr-8">{faq.question}</span>
                <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 group-open:bg-primary group-open:text-primary-foreground transition-colors">
                  <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                </span>
              </summary>
              <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border mt-2 pt-4">{faq.answer}</div>
            </motion.details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Guide;
