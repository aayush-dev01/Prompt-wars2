export const supportedLanguages = ['en', 'hi', 'es', 'fr', 'ar'] as const;

export type AppLanguage = (typeof supportedLanguages)[number];

export const languageLabels: Record<AppLanguage, string> = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  ar: 'Arabic',
};

export const geminiLanguageLabels: Record<AppLanguage, string> = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  ar: 'Arabic',
};

export const translations: Record<
  AppLanguage,
  {
    nav: {
      home: string;
      actionCenter: string;
      process: string;
      guide: string;
      quiz: string;
      language: string;
      switchToLight: string;
      switchToDark: string;
      openMenu: string;
      closeMenu: string;
      tagline: string;
    };
    home: {
      badge: string;
      titlePrefix: string;
      titleHighlight: string;
      subtitle: string;
      ctaPrimary: string;
      ctaSecondary: string;
      nextStepsTitle: string;
      nextStepsBody: string;
      clarityTitle: string;
      clarityBody: string;
      closingTitle: string;
      closingBody: string;
      closingCta: string;
      features: {
        actionCenterTitle: string;
        actionCenterBody: string;
        timelineTitle: string;
        timelineBody: string;
        guideTitle: string;
        guideBody: string;
        quizTitle: string;
        quizBody: string;
      };
      learnMore: string;
    };
    footer: {
      body: string;
      designed: string;
      links: {
        voterHelp: string;
        globalResources: string;
        democracyBackground: string;
      };
    };
    toolkit: {
      title: string;
      body: string;
      tools: {
        checkRegistrationTitle: string;
        checkRegistrationBody: string;
        checkRegistrationAction: string;
        registerTitle: string;
        registerBody: string;
        registerAction: string;
        pollingTitle: string;
        pollingBody: string;
        pollingAction: string;
        ballotTitle: string;
        ballotBody: string;
        ballotAction: string;
      };
    };
    elections: {
      title: string;
      body: string;
      aboutPrefix: string;
      projected: string;
      ariaPrefix: string;
      footer: string;
      globalCalendar: string;
    };
    guide: {
      title: string;
      subtitle: string;
      pathTitle: string;
      checklist: string;
      faqTitle: string;
      faqBody: string;
    };
    process: {
      title: string;
      subtitle: string;
      phases: string;
      phaseLabel: string;
      keyActivities: string;
      didYouKnow: string;
    };
    quiz: {
      introTitle: string;
      introBody: string;
      coachingLanguage: string;
      start: string;
      questionLabel: string;
      of: string;
      explanation: string;
      nextQuestion: string;
      seeResults: string;
      perfect: string;
      strong: string;
      keepLearning: string;
      scoreBody: string;
      adaptiveTitle: string;
      weakAreas: string;
      noWeakAreas: string;
      generateCoaching: string;
      noCoachingNeeded: string;
      retake: string;
    };
    actionCenter: {
      heroBadge: string;
      heroTitle: string;
      heroBody: string;
      geminiOnly: string;
      saveModeLocal: string;
      saveModeHybrid: string;
      zeroBudget: string;
      outputLanguage: string;
      outputLanguageBody: string;
      missingKey: string;
      savedTitle: string;
      savedBody: string;
      loadingSaved: string;
      noSaved: string;
      polishedChecklist: string;
      realityTitle: string;
      realityBody: string;
    };
    assistant: {
      title: string;
      welcome: string;
      open: string;
      educational: string;
      thinking: string;
      placeholder: string;
      voiceOn: string;
      voiceOff: string;
      micAvailable: string;
      micUnavailable: string;
      voiceRepliesOn: string;
      voiceRepliesOff: string;
    };
  }
> = {
  en: {
    nav: {
      home: 'Home',
      actionCenter: 'Action Center',
      process: 'Election Process',
      guide: 'Voter Guide',
      quiz: 'Take Quiz',
      language: 'Language',
      switchToLight: 'Switch to light theme',
      switchToDark: 'Switch to dark theme',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      tagline: 'Civic literacy hub',
    },
    home: {
      badge: 'Civic learning without the jargon',
      titlePrefix: 'Understand how',
      titleHighlight: 'elections actually work',
      subtitle:
        'ElectED turns election timelines, voting rights, and ballot preparation into something you can explore quickly and trust more easily.',
      ctaPrimary: 'Open Action Center',
      ctaSecondary: 'Explore the process',
      nextStepsTitle: 'Useful next steps',
      nextStepsBody:
        'Move from learning to action with quick voter prep links and a reality check on how major election dates are usually presented.',
      clarityTitle: 'Built for clarity',
      clarityBody: 'The goal is simple: make election systems easier to navigate without flattening the details that matter.',
      closingTitle: 'Better voters make stronger democracies',
      closingBody:
        'Start with the Action Center for a live Gemini experience, then use the guide and quiz to deepen understanding.',
      closingCta: 'Launch Action Center',
      features: {
        actionCenterTitle: 'Gemini Action Center',
        actionCenterBody:
          'Ask grounded questions with sources, generate a personal voting plan, and explain real election documents with Gemini.',
        timelineTitle: 'Interactive timeline',
        timelineBody:
          'Walk through the full election cycle from announcement to certification in a format that feels clear instead of overwhelming.',
        guideTitle: 'Voter guide',
        guideBody:
          'Get a practical checklist for registration, ballot research, polling-day prep, and final vote submission.',
        quizTitle: 'Knowledge check',
        quizBody:
          'Use the quiz to spot what you already know and what parts of election systems still feel fuzzy.',
      },
      learnMore: 'Learn more',
    },
    footer: {
      body:
        'Built for civic learning. ElectED is educational, not an official election authority, so always confirm deadlines and requirements with your local election office.',
      designed: 'Designed to make democracy easier to understand',
      links: {
        voterHelp: 'US voter help',
        globalResources: 'Global election resources',
        democracyBackground: 'Democracy background',
      },
    },
    toolkit: {
      title: 'Voter Toolkit',
      body:
        'Practical links for getting ready to vote. These tools lean US-focused, so international visitors should treat them as examples and verify equivalent official resources locally.',
      tools: {
        checkRegistrationTitle: 'Check registration',
        checkRegistrationBody: 'Confirm whether you are already registered and whether your address is current.',
        checkRegistrationAction: 'Verify status',
        registerTitle: 'Register to vote',
        registerBody: 'Start or review your registration with an official portal.',
        registerAction: 'Start registration',
        pollingTitle: 'Find your polling place',
        pollingBody: 'Locate where you need to vote or confirm your local polling site.',
        pollingAction: 'Find location',
        ballotTitle: 'Preview your ballot',
        ballotBody: 'Review candidates and measures before election day.',
        ballotAction: 'View sample ballot',
      },
    },
    elections: {
      title: 'Example election calendar',
      body:
        'These are major upcoming elections to help orient the timeline. Dates can change, and projected entries should always be checked against official sources.',
      aboutPrefix: 'About',
      projected: 'Projected date',
      ariaPrefix: 'Official information for',
      footer: 'Always confirm your local dates and eligibility rules.',
      globalCalendar: 'Global calendar',
    },
    guide: {
      title: 'Voter guide',
      subtitle:
        'Use this page as a practical checklist for getting ready, avoiding common mistakes, and showing up informed.',
      pathTitle: 'Your path to the ballot',
      checklist: 'Checklist',
      faqTitle: 'Frequently asked questions',
      faqBody: 'Answers to a few of the concerns people most often have before voting.',
    },
    process: {
      title: 'The election lifecycle',
      subtitle:
        'From the first announcement to the final certification, this timeline explains the main stages that help an election stay organized, fair, and understandable.',
      phases: 'Election phases',
      phaseLabel: 'Phase',
      keyActivities: 'Key activities',
      didYouKnow: 'Did you know?',
    },
    quiz: {
      introTitle: 'Test your democracy knowledge',
      introBody:
        'Take a short five-question challenge on voting rights, election rules, and how democratic systems stay accountable.',
      coachingLanguage: 'Coaching language',
      start: 'Start quiz',
      questionLabel: 'Question',
      of: 'of',
      explanation: 'Explanation',
      nextQuestion: 'Next question',
      seeResults: 'See results',
      perfect: 'Excellent result',
      strong: 'Good result',
      keepLearning: 'Keep learning',
      scoreBody: 'You answered {score} out of {total} questions correctly.',
      adaptiveTitle: 'Adaptive quiz coaching',
      weakAreas: 'Weak areas',
      noWeakAreas: 'None. You cleared every category in this round.',
      generateCoaching: 'Generate Gemini coaching',
      noCoachingNeeded: 'No coaching needed this round. Try another quiz if you want a different question mix.',
      retake: 'Retake quiz',
    },
    actionCenter: {
      heroBadge: 'Gemini Action Center',
      heroTitle: 'Seven practical tools in one place',
      heroBody:
        'Research with sources, build a voting plan, explain documents, check claims, decode ballot text, simulate real voting problems, save sessions, export results, and switch languages without leaving the app.',
      geminiOnly: 'Gemini-only intelligence',
      saveModeLocal: 'Local browser save',
      saveModeHybrid: 'Firestore + local fallback',
      zeroBudget: 'Zero-budget friendly',
      outputLanguage: 'Output language',
      outputLanguageBody: 'All Gemini-generated outputs in this Action Center use the selected language.',
      missingKey: 'Add `VITE_GEMINI_API_KEY` or `VITE_GEMINI_API_KEYS` in `.env` to enable the Gemini tools below.',
      savedTitle: 'Saved Sessions',
      savedBody: 'Everything you save appears here for quick reference.',
      loadingSaved: 'Loading saved sessions...',
      noSaved: 'Save any result and it will appear here.',
      polishedChecklist: 'Tool checklist',
      realityTitle: 'Reality check',
      realityBody:
        'Use these results for guidance, then verify final deadlines, ID rules, and polling details with the official election authority.',
    },
    assistant: {
      title: 'ElectED Gemini assistant',
      welcome:
        'Ask about voter registration, polling places, ballots, election timelines, vote counting, certification, or civic rights.',
      open: 'Open assistant',
      educational:
        'Gemini answers are educational. Verify deadlines, eligibility, and legal requirements with official election sources.',
      thinking: 'Thinking...',
      placeholder: 'Ask about elections or voting...',
      voiceOn: 'Enable voice replies',
      voiceOff: 'Disable voice replies',
      micAvailable: 'Mic input available',
      micUnavailable: 'Mic unavailable',
      voiceRepliesOn: 'Voice replies on',
      voiceRepliesOff: 'Voice replies off',
    },
  },
  hi: {
    nav: {
      home: 'होम',
      actionCenter: 'एक्शन सेंटर',
      process: 'चुनाव प्रक्रिया',
      guide: 'मतदाता गाइड',
      quiz: 'क्विज़',
      language: 'भाषा',
      switchToLight: 'लाइट थीम पर जाएँ',
      switchToDark: 'डार्क थीम पर जाएँ',
      openMenu: 'मेनू खोलें',
      closeMenu: 'मेनू बंद करें',
      tagline: 'नागरिक साक्षरता हब',
    },
    home: {
      badge: 'बिना कठिन शब्दों के नागरिक शिक्षा',
      titlePrefix: 'समझिए कि',
      titleHighlight: 'चुनाव वास्तव में कैसे काम करते हैं',
      subtitle: 'ElectED चुनाव समयरेखा, मतदान अधिकार और बैलेट तैयारी को आसान और भरोसेमंद तरीके से समझने में मदद करता है।',
      ctaPrimary: 'एक्शन सेंटर खोलें',
      ctaSecondary: 'प्रक्रिया देखें',
      nextStepsTitle: 'अगले उपयोगी कदम',
      nextStepsBody: 'सीखने से कार्रवाई तक जाएँ, त्वरित मतदाता तैयारी लिंक और प्रमुख चुनाव तिथियों की समझ के साथ।',
      clarityTitle: 'स्पष्टता के लिए बनाया गया',
      clarityBody: 'लक्ष्य सरल है: चुनाव प्रणालियों को आसान बनाना, बिना जरूरी विवरण खोए।',
      closingTitle: 'बेहतर मतदाता, मजबूत लोकतंत्र',
      closingBody: 'पहले एक्शन सेंटर से शुरू करें, फिर समझ गहरी करने के लिए गाइड और क्विज़ का उपयोग करें।',
      closingCta: 'एक्शन सेंटर शुरू करें',
      features: {
        actionCenterTitle: 'Gemini एक्शन सेंटर',
        actionCenterBody: 'स्रोतों के साथ प्रश्न पूछें, व्यक्तिगत मतदान योजना बनाएँ और Gemini से वास्तविक चुनाव दस्तावेज़ समझें।',
        timelineTitle: 'इंटरएक्टिव टाइमलाइन',
        timelineBody: 'घोषणा से प्रमाणन तक पूरे चुनाव चक्र को स्पष्ट तरीके से समझें।',
        guideTitle: 'मतदाता गाइड',
        guideBody: 'पंजीकरण, बैलेट रिसर्च, मतदान दिवस तैयारी और वोट जमा करने के लिए व्यावहारिक चेकलिस्ट पाएँ।',
        quizTitle: 'ज्ञान जाँच',
        quizBody: 'क्विज़ के जरिए जानें कि आप क्या जानते हैं और किन हिस्सों पर अभी काम चाहिए।',
      },
      learnMore: 'और जानें',
    },
    footer: {
      body: 'यह नागरिक शिक्षा के लिए बनाया गया है। ElectED कोई आधिकारिक चुनाव प्राधिकरण नहीं है, इसलिए अंतिम तिथियाँ और नियम हमेशा स्थानीय चुनाव कार्यालय से जाँचें।',
      designed: 'लोकतंत्र को आसान समझने के लिए डिज़ाइन किया गया',
      links: {
        voterHelp: 'अमेरिकी मतदाता सहायता',
        globalResources: 'वैश्विक चुनाव संसाधन',
        democracyBackground: 'लोकतंत्र पृष्ठभूमि',
      },
    },
    toolkit: {
      title: 'मतदाता टूलकिट',
      body: 'मतदान की तैयारी के लिए उपयोगी लिंक। ये लिंक अमेरिका-केंद्रित हैं, इसलिए अन्य देशों के उपयोगकर्ता इन्हें उदाहरण मानें और स्थानीय आधिकारिक स्रोत जाँचें।',
      tools: {
        checkRegistrationTitle: 'पंजीकरण जाँचें',
        checkRegistrationBody: 'पक्का करें कि आप पंजीकृत हैं और आपका पता सही है।',
        checkRegistrationAction: 'स्थिति जाँचें',
        registerTitle: 'मतदाता पंजीकरण',
        registerBody: 'आधिकारिक पोर्टल से पंजीकरण शुरू करें या समीक्षा करें।',
        registerAction: 'पंजीकरण शुरू करें',
        pollingTitle: 'मतदान केंद्र खोजें',
        pollingBody: 'आप कहाँ वोट करेंगे, यह जानें या स्थानीय मतदान स्थल की पुष्टि करें।',
        pollingAction: 'स्थान खोजें',
        ballotTitle: 'अपना बैलेट देखें',
        ballotBody: 'चुनाव दिवस से पहले उम्मीदवारों और मुद्दों की समीक्षा करें।',
        ballotAction: 'नमूना बैलेट देखें',
      },
    },
    elections: {
      title: 'उदाहरण चुनाव कैलेंडर',
      body: 'ये प्रमुख आगामी चुनाव केवल दिशा-निर्देशन के लिए हैं। तिथियाँ बदल सकती हैं, इसलिए अनुमानित प्रविष्टियों को हमेशा आधिकारिक स्रोतों से जाँचें।',
      aboutPrefix: 'लगभग',
      projected: 'अनुमानित तिथि',
      ariaPrefix: 'आधिकारिक जानकारी',
      footer: 'हमेशा स्थानीय तिथियाँ और पात्रता नियम जाँचें।',
      globalCalendar: 'वैश्विक कैलेंडर',
    },
    guide: {
      title: 'मतदाता गाइड',
      subtitle: 'इस पेज को तैयारी, सामान्य गलतियों से बचने और जानकारी के साथ मतदान करने की व्यावहारिक चेकलिस्ट की तरह उपयोग करें।',
      pathTitle: 'बैलेट तक आपका रास्ता',
      checklist: 'चेकलिस्ट',
      faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
      faqBody: 'मतदान से पहले लोगों की आम चिंताओं के कुछ उत्तर।',
    },
    process: {
      title: 'चुनाव जीवनचक्र',
      subtitle: 'पहली घोषणा से अंतिम प्रमाणन तक, यह टाइमलाइन उन चरणों को समझाती है जो चुनाव को व्यवस्थित, निष्पक्ष और स्पष्ट बनाते हैं।',
      phases: 'चुनाव चरण',
      phaseLabel: 'चरण',
      keyActivities: 'मुख्य गतिविधियाँ',
      didYouKnow: 'क्या आप जानते हैं?',
    },
    quiz: {
      introTitle: 'अपने लोकतंत्र ज्ञान की जाँच करें',
      introBody: 'मतदान अधिकार, चुनाव नियम और जवाबदेह लोकतांत्रिक प्रणालियों पर पाँच प्रश्नों की छोटी चुनौती लें।',
      coachingLanguage: 'कोचिंग भाषा',
      start: 'क्विज़ शुरू करें',
      questionLabel: 'प्रश्न',
      of: 'में से',
      explanation: 'व्याख्या',
      nextQuestion: 'अगला प्रश्न',
      seeResults: 'परिणाम देखें',
      perfect: 'पूर्ण अंक',
      strong: 'मजबूत परिणाम',
      keepLearning: 'सीखते रहें',
      scoreBody: 'आपने {total} में से {score} प्रश्न सही किए।',
      adaptiveTitle: 'अनुकूली क्विज़ कोचिंग',
      weakAreas: 'कमज़ोर क्षेत्र',
      noWeakAreas: 'कोई नहीं। इस राउंड में आपने हर श्रेणी साफ़ कर दी।',
      generateCoaching: 'Gemini कोचिंग बनाएँ',
      noCoachingNeeded: 'इस राउंड में कोचिंग की ज़रूरत नहीं। अलग प्रश्न सेट के लिए फिर कोशिश करें।',
      retake: 'फिर से क्विज़ लें',
    },
    actionCenter: {
      heroBadge: 'Gemini एक्शन सेंटर',
      heroTitle: 'जीतने योग्य डेमो के लिए सात परिष्कृत फीचर',
      heroBody: 'स्रोतों के साथ रिसर्च करें, मतदान योजना बनाएँ, दस्तावेज़ समझें, दावे जाँचें, बैलेट टेक्स्ट को सरल करें, वास्तविक समस्याओं का सिमुलेशन चलाएँ, सेशन सेव करें, परिणाम एक्सपोर्ट करें और भाषा बदलें।',
      geminiOnly: 'केवल Gemini इंटेलिजेंस',
      saveModeLocal: 'लोकल ब्राउज़र सेव',
      saveModeHybrid: 'Firestore + लोकल फॉलबैक',
      zeroBudget: 'शून्य-बजट अनुकूल',
      outputLanguage: 'आउटपुट भाषा',
      outputLanguageBody: 'इस एक्शन सेंटर में सभी Gemini आउटपुट चुनी हुई भाषा में होंगे।',
      missingKey: 'नीचे दिए Gemini टूल्स के लिए `.env` में `VITE_GEMINI_API_KEY` या `VITE_GEMINI_API_KEYS` जोड़ें।',
      savedTitle: 'सहेजे गए सेशन',
      savedBody: 'जो भी आप सेव करेंगे, वह यहाँ तेज़ डेमो और पुनः उपयोग के लिए दिखेगा।',
      loadingSaved: 'सहेजे गए सेशन लोड हो रहे हैं...',
      noSaved: 'कोई भी परिणाम सेव करें, वह यहाँ दिखेगा।',
      polishedChecklist: 'परिष्कृत फीचर चेकलिस्ट',
      realityTitle: 'वास्तविकता जाँच',
      realityBody: 'इन परिणामों को मार्गदर्शन के रूप में लें, फिर अंतिम तिथियाँ, पहचान नियम और मतदान विवरण आधिकारिक चुनाव प्राधिकरण से जाँचें।',
    },
    assistant: {
      title: 'ElectED Gemini चैट',
      welcome: 'मैं Gemini द्वारा संचालित हूँ। मतदाता पंजीकरण, मतदान केंद्र, बैलेट, चुनाव समयरेखा, मतगणना, प्रमाणन या नागरिक अधिकारों के बारे में पूछें।',
      open: 'Gemini सहायक खोलें',
      educational: 'Gemini के उत्तर केवल शैक्षिक हैं। तिथियाँ, पात्रता और कानूनी आवश्यकताएँ आधिकारिक स्रोतों से जाँचें।',
      thinking: 'Gemini सोच रहा है...',
      placeholder: 'Gemini से चुनाव या मतदान के बारे में पूछें...',
      voiceOn: 'वॉइस रिप्लाई चालू करें',
      voiceOff: 'वॉइस रिप्लाई बंद करें',
      micAvailable: 'माइक उपलब्ध',
      micUnavailable: 'माइक उपलब्ध नहीं',
      voiceRepliesOn: 'वॉइस रिप्लाई चालू',
      voiceRepliesOff: 'वॉइस रिप्लाई बंद',
    },
  },
  es: {
    nav: { home: 'Inicio', actionCenter: 'Centro de Acción', process: 'Proceso electoral', guide: 'Guía del votante', quiz: 'Quiz', language: 'Idioma', switchToLight: 'Cambiar a tema claro', switchToDark: 'Cambiar a tema oscuro', openMenu: 'Abrir menú', closeMenu: 'Cerrar menú', tagline: 'Centro de alfabetización cívica' },
    home: { badge: 'Aprendizaje cívico sin jerga', titlePrefix: 'Entiende cómo', titleHighlight: 'funcionan realmente las elecciones', subtitle: 'ElectED convierte los calendarios electorales, los derechos de voto y la preparación de la boleta en algo fácil de explorar y más confiable.', ctaPrimary: 'Abrir Centro de Acción', ctaSecondary: 'Explorar el proceso', nextStepsTitle: 'Siguientes pasos útiles', nextStepsBody: 'Pasa del aprendizaje a la acción con enlaces rápidos y una visión clara de cómo suelen presentarse las fechas electorales.', clarityTitle: 'Diseñado para la claridad', clarityBody: 'La meta es simple: hacer que los sistemas electorales sean más fáciles de entender sin perder los detalles importantes.', closingTitle: 'Mejores votantes fortalecen la democracia', closingBody: 'Empieza con el Centro de Acción y luego usa la guía y el quiz para profundizar.', closingCta: 'Lanzar Centro de Acción', features: { actionCenterTitle: 'Centro de Acción Gemini', actionCenterBody: 'Haz preguntas con fuentes, crea un plan de voto personal y explica documentos electorales reales con Gemini.', timelineTitle: 'Línea de tiempo interactiva', timelineBody: 'Recorre todo el ciclo electoral desde el anuncio hasta la certificación de forma clara.', guideTitle: 'Guía del votante', guideBody: 'Obtén una lista práctica para registro, investigación de boleta y preparación para el día de la votación.', quizTitle: 'Chequeo de conocimiento', quizBody: 'Usa el quiz para ver qué sabes y qué partes siguen siendo confusas.' }, learnMore: 'Más información' },
    footer: { body: 'Creado para aprendizaje cívico. ElectED es educativo y no una autoridad electoral oficial, así que siempre confirma fechas y requisitos con tu oficina electoral local.', designed: 'Diseñado para hacer la democracia más fácil de entender', links: { voterHelp: 'Ayuda electoral en EE. UU.', globalResources: 'Recursos electorales globales', democracyBackground: 'Contexto sobre democracia' } },
    toolkit: { title: 'Kit del votante', body: 'Enlaces prácticos para prepararte para votar. Estos recursos están orientados a EE. UU., así que los visitantes internacionales deben verificarlos con fuentes locales oficiales.', tools: { checkRegistrationTitle: 'Verificar registro', checkRegistrationBody: 'Confirma si ya estás registrado y si tu dirección es correcta.', checkRegistrationAction: 'Verificar estado', registerTitle: 'Registrarse para votar', registerBody: 'Inicia o revisa tu registro en un portal oficial.', registerAction: 'Comenzar registro', pollingTitle: 'Encontrar tu centro de votación', pollingBody: 'Ubica dónde debes votar o confirma tu lugar de votación local.', pollingAction: 'Encontrar lugar', ballotTitle: 'Ver tu boleta', ballotBody: 'Revisa candidatos y medidas antes del día de la elección.', ballotAction: 'Ver boleta de muestra' } },
    elections: { title: 'Calendario electoral de ejemplo', body: 'Estas son elecciones importantes para ubicar la línea de tiempo. Las fechas pueden cambiar y las entradas proyectadas deben verificarse con fuentes oficiales.', aboutPrefix: 'Aproximadamente', projected: 'Fecha proyectada', ariaPrefix: 'Información oficial para', footer: 'Confirma siempre tus fechas y reglas locales de elegibilidad.', globalCalendar: 'Calendario global' },
    guide: { title: 'Guía del votante', subtitle: 'Usa esta página como una lista práctica para prepararte, evitar errores comunes y presentarte informado.', pathTitle: 'Tu camino hacia la boleta', checklist: 'Lista de verificación', faqTitle: 'Preguntas frecuentes', faqBody: 'Respuestas a algunas preocupaciones comunes antes de votar.' },
    process: { title: 'El ciclo electoral', subtitle: 'Desde el primer anuncio hasta la certificación final, esta línea de tiempo explica las etapas principales que hacen que una elección sea organizada, justa y comprensible.', phases: 'Fases electorales', phaseLabel: 'Fase', keyActivities: 'Actividades clave', didYouKnow: '¿Sabías que?' },
    quiz: { introTitle: 'Pon a prueba tus conocimientos democráticos', introBody: 'Haz un desafío corto de cinco preguntas sobre derechos de voto, reglas electorales y rendición de cuentas democrática.', coachingLanguage: 'Idioma de coaching', start: 'Comenzar quiz', questionLabel: 'Pregunta', of: 'de', explanation: 'Explicación', nextQuestion: 'Siguiente pregunta', seeResults: 'Ver resultados', perfect: 'Resultado excelente', strong: 'Buen resultado', keepLearning: 'Sigue aprendiendo', scoreBody: 'Respondiste correctamente {score} de {total} preguntas.', adaptiveTitle: 'Coaching adaptativo del quiz', weakAreas: 'Áreas débiles', noWeakAreas: 'Ninguna. Superaste todas las categorías en esta ronda.', generateCoaching: 'Generar coaching con Gemini', noCoachingNeeded: 'No necesitas coaching en esta ronda. Intenta otra vez si quieres un conjunto diferente de preguntas.', retake: 'Repetir quiz' },
    actionCenter: { heroBadge: 'Centro de Acción Gemini', heroTitle: 'Siete herramientas prácticas en un solo lugar', heroBody: 'Investiga con fuentes, crea un plan de voto, explica documentos, verifica afirmaciones, simplifica textos de boletas, simula problemas reales, guarda sesiones, exporta resultados y cambia de idioma.', geminiOnly: 'Inteligencia solo con Gemini', saveModeLocal: 'Guardado local del navegador', saveModeHybrid: 'Firestore + respaldo local', zeroBudget: 'Amigable para presupuesto cero', outputLanguage: 'Idioma de salida', outputLanguageBody: 'Todos los resultados generados por Gemini en este Centro de Acción usan el idioma seleccionado.', missingKey: 'Agrega `VITE_GEMINI_API_KEY` o `VITE_GEMINI_API_KEYS` en `.env` para activar las herramientas Gemini.', savedTitle: 'Sesiones guardadas', savedBody: 'Todo lo que guardes aparecerá aquí para consulta rápida.', loadingSaved: 'Cargando sesiones guardadas...', noSaved: 'Guarda cualquier resultado y aparecerá aquí.', polishedChecklist: 'Lista de herramientas', realityTitle: 'Verificación final', realityBody: 'Usa estos resultados como guía y luego verifica fechas finales, reglas de identificación y detalles de votación con la autoridad electoral oficial.' },
    assistant: { title: 'Asistente Gemini de ElectED', welcome: 'Pregunta sobre registro de votantes, centros de votación, boletas, calendarios electorales, conteo, certificación o derechos cívicos.', open: 'Abrir asistente', educational: 'Las respuestas de Gemini son educativas. Verifica fechas, elegibilidad y requisitos legales con fuentes oficiales.', thinking: 'Pensando...', placeholder: 'Pregunta sobre elecciones o voto...', voiceOn: 'Activar respuestas por voz', voiceOff: 'Desactivar respuestas por voz', micAvailable: 'Micrófono disponible', micUnavailable: 'Micrófono no disponible', voiceRepliesOn: 'Respuestas por voz activadas', voiceRepliesOff: 'Respuestas por voz desactivadas' },
  },
  fr: {
    nav: { home: 'Accueil', actionCenter: 'Centre d’action', process: 'Processus électoral', guide: 'Guide électoral', quiz: 'Quiz', language: 'Langue', switchToLight: 'Passer au thème clair', switchToDark: 'Passer au thème sombre', openMenu: 'Ouvrir le menu', closeMenu: 'Fermer le menu', tagline: 'Hub de culture civique' },
    home: { badge: 'Éducation civique sans jargon', titlePrefix: 'Comprenez comment', titleHighlight: 'les élections fonctionnent réellement', subtitle: 'ElectED transforme les calendriers électoraux, les droits de vote et la préparation du bulletin en quelque chose de simple à explorer et plus fiable.', ctaPrimary: 'Ouvrir le Centre d’action', ctaSecondary: 'Explorer le processus', nextStepsTitle: 'Étapes utiles', nextStepsBody: 'Passez de l’apprentissage à l’action grâce à des liens rapides et une vision claire des grandes dates électorales.', clarityTitle: 'Conçu pour la clarté', clarityBody: 'L’objectif est simple : rendre les systèmes électoraux plus faciles à comprendre sans perdre les détails importants.', closingTitle: 'De meilleurs électeurs renforcent la démocratie', closingBody: 'Commencez par le Centre d’action, puis utilisez le guide et le quiz pour approfondir.', closingCta: 'Lancer le Centre d’action', features: { actionCenterTitle: 'Centre d’action Gemini', actionCenterBody: 'Posez des questions sourcées, créez un plan de vote personnel et expliquez de vrais documents électoraux avec Gemini.', timelineTitle: 'Frise interactive', timelineBody: 'Parcourez tout le cycle électoral de l’annonce à la certification avec clarté.', guideTitle: 'Guide électoral', guideBody: 'Obtenez une checklist pratique pour l’inscription, la recherche sur le bulletin et la préparation du jour du vote.', quizTitle: 'Test de connaissances', quizBody: 'Utilisez le quiz pour voir ce que vous savez déjà et ce qui reste flou.' }, learnMore: 'En savoir plus' },
    footer: { body: 'Conçu pour l’éducation civique. ElectED est éducatif et non une autorité électorale officielle, alors vérifiez toujours les dates et règles auprès de votre bureau électoral local.', designed: 'Conçu pour rendre la démocratie plus facile à comprendre', links: { voterHelp: 'Aide électorale américaine', globalResources: 'Ressources électorales mondiales', democracyBackground: 'Contexte démocratique' } },
    toolkit: { title: 'Boîte à outils du votant', body: 'Des liens pratiques pour préparer votre vote. Ces outils sont plutôt centrés sur les États-Unis, donc les visiteurs internationaux doivent vérifier les équivalents officiels locaux.', tools: { checkRegistrationTitle: 'Vérifier l’inscription', checkRegistrationBody: 'Confirmez que vous êtes bien inscrit et que votre adresse est à jour.', checkRegistrationAction: 'Vérifier', registerTitle: 'S’inscrire pour voter', registerBody: 'Commencez ou vérifiez votre inscription sur un portail officiel.', registerAction: 'Commencer', pollingTitle: 'Trouver votre bureau de vote', pollingBody: 'Localisez votre lieu de vote ou confirmez votre bureau local.', pollingAction: 'Trouver le lieu', ballotTitle: 'Prévisualiser votre bulletin', ballotBody: 'Passez en revue les candidats et mesures avant le jour du vote.', ballotAction: 'Voir un exemple' } },
    elections: { title: 'Calendrier électoral exemple', body: 'Ces grandes élections servent de repère. Les dates peuvent changer et les entrées projetées doivent toujours être vérifiées auprès de sources officielles.', aboutPrefix: 'Environ', projected: 'Date projetée', ariaPrefix: 'Informations officielles pour', footer: 'Vérifiez toujours vos dates locales et règles d’éligibilité.', globalCalendar: 'Calendrier mondial' },
    guide: { title: 'Guide électoral', subtitle: 'Utilisez cette page comme une checklist pratique pour vous préparer, éviter les erreurs courantes et voter en étant bien informé.', pathTitle: 'Votre chemin vers le bulletin', checklist: 'Checklist', faqTitle: 'Questions fréquentes', faqBody: 'Réponses à quelques préoccupations courantes avant de voter.' },
    process: { title: 'Le cycle électoral', subtitle: 'De la première annonce à la certification finale, cette frise explique les étapes qui rendent une élection organisée, équitable et compréhensible.', phases: 'Phases électorales', phaseLabel: 'Phase', keyActivities: 'Activités clés', didYouKnow: 'Le saviez-vous ?' },
    quiz: { introTitle: 'Testez vos connaissances démocratiques', introBody: 'Relevez un petit défi de cinq questions sur les droits de vote, les règles électorales et la responsabilité démocratique.', coachingLanguage: 'Langue du coaching', start: 'Commencer le quiz', questionLabel: 'Question', of: 'sur', explanation: 'Explication', nextQuestion: 'Question suivante', seeResults: 'Voir les résultats', perfect: 'Excellent résultat', strong: 'Bon résultat', keepLearning: 'Continuez à apprendre', scoreBody: 'Vous avez répondu correctement à {score} questions sur {total}.', adaptiveTitle: 'Coaching adaptatif du quiz', weakAreas: 'Points faibles', noWeakAreas: 'Aucun. Vous avez réussi toutes les catégories cette fois.', generateCoaching: 'Générer un coaching Gemini', noCoachingNeeded: 'Pas besoin de coaching cette fois. Recommencez si vous voulez d’autres questions.', retake: 'Recommencer le quiz' },
    actionCenter: { heroBadge: 'Centre d’action Gemini', heroTitle: 'Sept outils pratiques au même endroit', heroBody: 'Recherchez avec sources, construisez un plan de vote, expliquez des documents, vérifiez des affirmations, simplifiez des textes de bulletin, simulez des problèmes réels, sauvegardez des sessions, exportez les résultats et changez de langue.', geminiOnly: 'Intelligence Gemini uniquement', saveModeLocal: 'Sauvegarde locale', saveModeHybrid: 'Firestore + secours local', zeroBudget: 'Compatible budget zéro', outputLanguage: 'Langue de sortie', outputLanguageBody: 'Tous les résultats Gemini du Centre d’action utilisent la langue sélectionnée.', missingKey: 'Ajoutez `VITE_GEMINI_API_KEY` ou `VITE_GEMINI_API_KEYS` dans `.env` pour activer les outils Gemini.', savedTitle: 'Sessions sauvegardées', savedBody: 'Tout ce que vous enregistrez apparaît ici pour consultation rapide.', loadingSaved: 'Chargement des sessions...', noSaved: 'Enregistrez un résultat et il apparaîtra ici.', polishedChecklist: 'Liste des outils', realityTitle: 'Vérification finale', realityBody: 'Utilisez ces résultats comme guide, puis vérifiez les dates, règles d’identité et détails de vote auprès de l’autorité électorale officielle.' },
    assistant: { title: 'Assistant Gemini ElectED', welcome: 'Posez vos questions sur l’inscription, les bureaux de vote, les bulletins, les calendriers électoraux, le dépouillement, la certification ou les droits civiques.', open: 'Ouvrir l’assistant', educational: 'Les réponses de Gemini sont éducatives. Vérifiez toujours les dates, l’éligibilité et les exigences légales auprès de sources officielles.', thinking: 'Réflexion en cours...', placeholder: 'Posez une question sur les élections ou le vote...', voiceOn: 'Activer les réponses vocales', voiceOff: 'Désactiver les réponses vocales', micAvailable: 'Micro disponible', micUnavailable: 'Micro indisponible', voiceRepliesOn: 'Réponses vocales activées', voiceRepliesOff: 'Réponses vocales désactivées' },
  },
  ar: {
    nav: { home: 'الرئيسية', actionCenter: 'مركز الإجراءات', process: 'العملية الانتخابية', guide: 'دليل الناخب', quiz: 'الاختبار', language: 'اللغة', switchToLight: 'التبديل إلى الوضع الفاتح', switchToDark: 'التبديل إلى الوضع الداكن', openMenu: 'فتح القائمة', closeMenu: 'إغلاق القائمة', tagline: 'منصة الثقافة المدنية' },
    home: { badge: 'تعلم مدني بدون تعقيد', titlePrefix: 'افهم كيف', titleHighlight: 'تعمل الانتخابات فعلاً', subtitle: 'يحّول ElectED الجداول الانتخابية وحقوق التصويت والتحضير للاقتراع إلى تجربة أسهل وأكثر وضوحاً.', ctaPrimary: 'افتح مركز الإجراءات', ctaSecondary: 'استكشف العملية', nextStepsTitle: 'خطوات مفيدة تالية', nextStepsBody: 'انتقل من التعلم إلى الفعل عبر روابط سريعة واستيعاب أوضح لكيفية عرض المواعيد الانتخابية.', clarityTitle: 'مصمم من أجل الوضوح', clarityBody: 'الهدف بسيط: جعل الأنظمة الانتخابية أسهل للفهم من دون فقدان التفاصيل المهمة.', closingTitle: 'الناخب الأفضل يقوي الديمقراطية', closingBody: 'ابدأ من مركز الإجراءات ثم استخدم الدليل والاختبار لتعميق الفهم.', closingCta: 'ابدأ مركز الإجراءات', features: { actionCenterTitle: 'مركز إجراءات Gemini', actionCenterBody: 'اطرح أسئلة مدعومة بالمصادر، وابنِ خطة تصويت شخصية، واشرح مستندات انتخابية حقيقية عبر Gemini.', timelineTitle: 'خط زمني تفاعلي', timelineBody: 'تتبع دورة الانتخابات كاملة من الإعلان حتى التصديق بشكل واضح.', guideTitle: 'دليل الناخب', guideBody: 'احصل على قائمة عملية للتسجيل والبحث في ورقة الاقتراع والاستعداد ليوم التصويت.', quizTitle: 'اختبار المعرفة', quizBody: 'استخدم الاختبار لمعرفة ما تتقنه وما يزال يحتاج إلى توضيح.' }, learnMore: 'اعرف المزيد' },
    footer: { body: 'تم بناؤه للتعلم المدني. ElectED منصة تعليمية وليست جهة انتخابية رسمية، لذا تحقق دائماً من المواعيد والمتطلبات لدى مكتب الانتخابات المحلي.', designed: 'مصمم لجعل الديمقراطية أسهل للفهم', links: { voterHelp: 'مساعدة الناخبين في الولايات المتحدة', globalResources: 'موارد انتخابية عالمية', democracyBackground: 'خلفية عن الديمقراطية' } },
    toolkit: { title: 'أدوات الناخب', body: 'روابط عملية للاستعداد للتصويت. هذه الأدوات تميل للتركيز على الولايات المتحدة، لذا ينبغي للزوار الدوليين التحقق من البدائل الرسمية المحلية.', tools: { checkRegistrationTitle: 'تحقق من التسجيل', checkRegistrationBody: 'أكد ما إذا كنت مسجلاً بالفعل وما إذا كان عنوانك محدثاً.', checkRegistrationAction: 'تحقق من الحالة', registerTitle: 'سجل للتصويت', registerBody: 'ابدأ أو راجع تسجيلك عبر بوابة رسمية.', registerAction: 'ابدأ التسجيل', pollingTitle: 'اعثر على مركز الاقتراع', pollingBody: 'حدد مكان التصويت أو أكد موقعك المحلي.', pollingAction: 'اعثر على المكان', ballotTitle: 'استعرض ورقة الاقتراع', ballotBody: 'راجع المرشحين والقرارات قبل يوم الانتخاب.', ballotAction: 'اعرض نموذج الاقتراع' } },
    elections: { title: 'تقويم انتخابي نموذجي', body: 'هذه انتخابات كبيرة للمساعدة في فهم الخط الزمني. قد تتغير التواريخ ويجب دائماً التحقق من البنود المتوقعة من المصادر الرسمية.', aboutPrefix: 'حوالي', projected: 'تاريخ متوقع', ariaPrefix: 'معلومات رسمية عن', footer: 'تحقق دائماً من التواريخ المحلية وقواعد الأهلية.', globalCalendar: 'التقويم العالمي' },
    guide: { title: 'دليل الناخب', subtitle: 'استخدم هذه الصفحة كقائمة عملية للاستعداد وتجنب الأخطاء الشائعة والوصول إلى التصويت بشكل واعٍ.', pathTitle: 'طريقك إلى ورقة الاقتراع', checklist: 'قائمة التحقق', faqTitle: 'الأسئلة الشائعة', faqBody: 'إجابات لبعض المخاوف الأكثر شيوعاً قبل التصويت.' },
    process: { title: 'دورة الانتخابات', subtitle: 'من الإعلان الأول إلى التصديق النهائي، يشرح هذا الخط الزمني المراحل الرئيسية التي تساعد على تنظيم الانتخابات وعدالتها ووضوحها.', phases: 'مراحل الانتخابات', phaseLabel: 'المرحلة', keyActivities: 'الأنشطة الرئيسية', didYouKnow: 'هل تعلم؟' },
    quiz: { introTitle: 'اختبر معرفتك بالديمقراطية', introBody: 'خض تحدياً قصيراً من خمسة أسئلة حول حقوق التصويت وقواعد الانتخابات والمساءلة الديمقراطية.', coachingLanguage: 'لغة التوجيه', start: 'ابدأ الاختبار', questionLabel: 'السؤال', of: 'من', explanation: 'الشرح', nextQuestion: 'السؤال التالي', seeResults: 'عرض النتائج', perfect: 'نتيجة ممتازة', strong: 'نتيجة جيدة', keepLearning: 'واصل التعلم', scoreBody: 'أجبت بشكل صحيح عن {score} من أصل {total} أسئلة.', adaptiveTitle: 'توجيه تكيفي للاختبار', weakAreas: 'نقاط الضعف', noWeakAreas: 'لا توجد. لقد تجاوزت كل الفئات في هذه الجولة.', generateCoaching: 'أنشئ توجيهاً عبر Gemini', noCoachingNeeded: 'لا حاجة للتوجيه في هذه الجولة. أعد المحاولة إذا أردت مجموعة أسئلة مختلفة.', retake: 'أعد الاختبار' },
    actionCenter: { heroBadge: 'مركز إجراءات Gemini', heroTitle: 'سبع أدوات عملية في مكان واحد', heroBody: 'ابحث مع المصادر، وابنِ خطة تصويت، واشرح المستندات، وتحقق من الادعاءات، وبسّط نصوص الاقتراع، وحاكِ المشكلات الواقعية، واحفظ الجلسات، وصدّر النتائج، وبدّل اللغة.', geminiOnly: 'ذكاء Gemini فقط', saveModeLocal: 'حفظ محلي في المتصفح', saveModeHybrid: 'Firestore مع بديل محلي', zeroBudget: 'مناسب لميزانية صفرية', outputLanguage: 'لغة المخرجات', outputLanguageBody: 'كل مخرجات Gemini في هذا المركز تستخدم اللغة المختارة.', missingKey: 'أضف `VITE_GEMINI_API_KEY` أو `VITE_GEMINI_API_KEYS` داخل `.env` لتفعيل أدوات Gemini.', savedTitle: 'الجلسات المحفوظة', savedBody: 'كل ما تحفظه سيظهر هنا للوصول السريع.', loadingSaved: 'جارٍ تحميل الجلسات المحفوظة...', noSaved: 'احفظ أي نتيجة وستظهر هنا.', polishedChecklist: 'قائمة الأدوات', realityTitle: 'تحقق واقعي', realityBody: 'استخدم هذه النتائج كإرشاد، ثم تحقق من المواعيد النهائية وقواعد الهوية وتفاصيل التصويت مع الجهة الانتخابية الرسمية.' },
    assistant: { title: 'مساعد ElectED Gemini', welcome: 'اسأل عن تسجيل الناخبين أو مراكز الاقتراع أو أوراق التصويت أو الجداول الانتخابية أو الفرز أو التصديق أو الحقوق المدنية.', open: 'افتح المساعد', educational: 'إجابات Gemini تعليمية. تحقق من المواعيد والأهلية والمتطلبات القانونية من المصادر الرسمية.', thinking: 'جارٍ التفكير...', placeholder: 'اسأل عن الانتخابات أو التصويت...', voiceOn: 'تفعيل الردود الصوتية', voiceOff: 'إيقاف الردود الصوتية', micAvailable: 'الميكروفون متاح', micUnavailable: 'الميكروفون غير متاح', voiceRepliesOn: 'الردود الصوتية مفعلة', voiceRepliesOff: 'الردود الصوتية متوقفة' },
  },
};
