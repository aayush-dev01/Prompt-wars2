export const LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Arabic',
  'Portuguese',
] as const;

export const SCENARIO_PRESETS = [
  {
    id: 'moved-recently',
    title: 'I moved recently',
    description: 'Help a voter who changed address and is worried about registration, polling place, and ballot method.',
  },
  {
    id: 'missing-id',
    title: 'I lost my ID',
    description: 'Guide a voter who may not have their normal identification and needs backup steps.',
  },
  {
    id: 'first-time-voter',
    title: 'First-time voter anxiety',
    description: 'Make the process less intimidating and explain each step in reassuring language.',
  },
  {
    id: 'accessibility-support',
    title: 'I need accessibility support',
    description: 'Plan for accommodations, assistance rules, and what should be confirmed in advance.',
  },
  {
    id: 'mail-ballot-delay',
    title: 'My mail ballot may be late',
    description: 'Help a voter understand fallback options and what they should verify quickly.',
  },
] as const;

export const TOOL_LABELS = {
  grounded_answer: 'Grounded answer',
  voting_plan: 'Voting plan',
  document_explainer: 'Document explainer',
  misinformation_check: 'Claim checker',
  ballot_explainer: 'Ballot / manifesto explainer',
  scenario_simulation: 'Scenario simulator',
} as const;
