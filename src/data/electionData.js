/**
 * Educational election data used across the site.
 * The content is intentionally global and explanatory rather than jurisdiction-specific legal advice.
 */

export const ELECTION_PHASES = [
  {
    id: 'announcement',
    phase: 1,
    title: 'Election Announcement',
    subtitle: 'The starting signal',
    icon: '📢',
    color: '#29567f',
    duration: 'Varies by country',
    description:
      'The election authority announces the vote, publishes the schedule, and activates the rules that govern the campaign period.',
    details: [
      'Official notices and the election calendar are published',
      'Key dates for nominations, campaigning, polling, and counting are confirmed',
      'Campaign conduct rules take effect for parties and candidates',
      'Election officials brief the public, press, and stakeholders',
      'Administrative preparations begin across constituencies',
    ],
    keyFact:
      'Many democracies require elections to occur within a constitutionally defined time window.',
  },
  {
    id: 'nomination',
    phase: 2,
    title: 'Nomination and Filing',
    subtitle: 'Who can run?',
    icon: '📝',
    color: '#5f4bb6',
    duration: 'Several days to a few weeks',
    description:
      'Candidates formally enter the race by filing the required paperwork and passing eligibility checks.',
    details: [
      'Candidates submit nomination forms and supporting documents',
      'Election officers review filings for eligibility and completeness',
      'Withdrawals are allowed until the legal deadline',
      'The final list of candidates is published',
      'Party symbols or ballot positions are assigned where applicable',
    ],
    keyFact:
      'Eligibility rules commonly include age, citizenship, residency, and disclosure requirements.',
  },
  {
    id: 'campaigning',
    phase: 3,
    title: 'Election Campaign',
    subtitle: 'Making the case',
    icon: '🎤',
    color: '#8a3b69',
    duration: 'Usually 2 to 6 weeks',
    description:
      'Candidates and parties communicate their platforms through debates, events, outreach, advertising, and media appearances.',
    details: [
      'Parties publish manifestos or policy plans',
      'Candidates hold rallies, canvassing drives, and public forums',
      'Campaign finance and advertising rules are monitored',
      'Media coverage and political messaging may face specific limits',
      'Campaigning usually ends before polling begins',
    ],
    keyFact:
      'Many systems include a short silence period before voting to reduce last-minute pressure on voters.',
  },
  {
    id: 'voter-registration',
    phase: 4,
    title: 'Voter Registration',
    subtitle: 'Getting on the roll',
    icon: '✅',
    color: '#bb4d34',
    duration: 'Ongoing, with deadlines',
    description:
      'Eligible citizens confirm or update their registration so they can vote at the correct polling location or by the correct method.',
    details: [
      'Voters check whether they are already registered',
      'New voters submit registration applications',
      'Addresses and personal details are updated when needed',
      'Electoral rolls are revised and published',
      'Absentee, overseas, or accessibility-related arrangements may be processed here',
    ],
    keyFact:
      'Some countries use automatic registration, while others require every voter to sign up manually.',
  },
  {
    id: 'polling',
    phase: 5,
    title: 'Polling Day',
    subtitle: 'Democracy in action',
    icon: '🗳️',
    color: '#d1603d',
    duration: 'One day or several phases',
    description:
      'Voters cast ballots at polling stations or through approved early, postal, or absentee methods.',
    details: [
      'Polling stations open according to the published schedule',
      'Voters verify identity and receive their ballot or access to the voting machine',
      'Ballots are cast in secret to protect voter choice',
      'Party agents and observers monitor the process',
      'Support is provided for elderly, disabled, or first-time voters where available',
    ],
    keyFact:
      'Accessibility, secrecy, and orderly queue management are core parts of a trustworthy polling process.',
  },
  {
    id: 'counting',
    phase: 6,
    title: 'Vote Counting',
    subtitle: 'Every vote counts',
    icon: '📊',
    color: '#b23a48',
    duration: 'Hours to a few days',
    description:
      'Votes are counted under observation, recorded carefully, and checked through the safeguards used in that jurisdiction.',
    details: [
      'Ballot boxes or machines are secured and transported to counting centers',
      'Counting occurs in the presence of officials, agents, and observers',
      'Results are tabulated round by round where required',
      'Audits, recounts, or paper trail checks may be performed',
      'Disputes are documented through formal legal processes',
    ],
    keyFact:
      'Paper records or audit trails help strengthen confidence in both electronic and manual counting systems.',
  },
  {
    id: 'results',
    phase: 7,
    title: 'Results and Declaration',
    subtitle: 'The public verdict',
    icon: '🏛️',
    color: '#d38b1f',
    duration: 'Usually 1 to 2 days',
    description:
      'The election authority certifies the outcome, declares winners, and the next government or legislative term begins to take shape.',
    details: [
      'Official results are published by the election authority',
      'Winning candidates are certified under the applicable rules',
      'Challenges and recount requests proceed through legal channels',
      'Coalition talks or government formation may begin',
      'A peaceful transfer of power reinforces democratic legitimacy',
    ],
    keyFact:
      'A credible election depends not just on voting, but on public trust in certification and transfer of power.',
  },
];

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'What is the minimum voting age in most democratic countries?',
    options: ['16 years', '18 years', '21 years', '25 years'],
    correctAnswer: 1,
    explanation:
      'Most democracies set the voting age at 18, though some allow voting earlier in certain elections.',
    difficulty: 'easy',
    category: 'Voter Rights',
  },
  {
    id: 2,
    question: 'What is a silent period in the context of elections?',
    options: [
      'When candidates cannot speak publicly at all',
      'A pause on campaigning shortly before voting',
      'When media outlets stop all political reporting',
      'A period of mourning after results',
    ],
    correctAnswer: 1,
    explanation:
      'A silent period is a short window before polling when campaigning must stop under election law.',
    difficulty: 'medium',
    category: 'Campaign Rules',
  },
  {
    id: 3,
    question: 'What does EVM stand for in election administration?',
    options: [
      'Electronic Vote Manager',
      'Election Verification Method',
      'Electronic Voting Machine',
      'Electoral Vote Mechanism',
    ],
    correctAnswer: 2,
    explanation:
      'Electronic Voting Machine is the standard expansion of EVM in jurisdictions that use them.',
    difficulty: 'easy',
    category: 'Technology',
  },
  {
    id: 4,
    question: 'What is VVPAT?',
    options: [
      'Voter Verified Paper Audit Trail',
      'Virtual Voting Platform and Technology',
      'Vote Verification Process and Testing',
      'Validated Voter Participation and Tracking',
    ],
    correctAnswer: 0,
    explanation:
      'VVPAT is a paper audit record that lets voters confirm that their vote was recorded as intended.',
    difficulty: 'hard',
    category: 'Technology',
  },
  {
    id: 5,
    question: 'What is a constituency?',
    options: [
      'A political party office',
      'A geographic area represented by an elected official',
      'A type of ballot paper',
      'A government building',
    ],
    correctAnswer: 1,
    explanation:
      'A constituency is the area whose voters choose a specific representative.',
    difficulty: 'easy',
    category: 'Electoral System',
  },
  {
    id: 6,
    question: 'What does universal adult suffrage mean?',
    options: [
      'Everyone must vote by law',
      'Only educated adults can vote',
      'All adult citizens can vote without discrimination',
      'Voting is limited to property owners',
    ],
    correctAnswer: 2,
    explanation:
      'Universal adult suffrage means the right to vote is broadly available to adult citizens regardless of wealth, gender, or status.',
    difficulty: 'medium',
    category: 'Voter Rights',
  },
  {
    id: 7,
    question: 'What is the purpose of an election manifesto?',
    options: [
      'To register voters',
      'To outline a party’s promises and policy plans',
      'To announce polling dates',
      'To declare election results',
    ],
    correctAnswer: 1,
    explanation:
      'A manifesto explains what a political party says it will do if elected.',
    difficulty: 'easy',
    category: 'Campaign Rules',
  },
  {
    id: 8,
    question: 'What is gerrymandering?',
    options: [
      'A type of voting machine',
      'Manipulating electoral boundaries for political advantage',
      'A method of counting votes',
      'A voter registration campaign',
    ],
    correctAnswer: 1,
    explanation:
      'Gerrymandering means drawing district boundaries in a way that unfairly benefits a party or group.',
    difficulty: 'hard',
    category: 'Electoral System',
  },
  {
    id: 9,
    question: 'What happens in a first-past-the-post system?',
    options: [
      'The first candidate to start campaigning wins',
      'The candidate with the most votes wins even without a majority',
      'Voters rank candidates by preference',
      'Two rounds of voting are always held',
    ],
    correctAnswer: 1,
    explanation:
      'First-past-the-post awards victory to the candidate with the highest vote total, not necessarily more than 50 percent.',
    difficulty: 'medium',
    category: 'Electoral System',
  },
  {
    id: 10,
    question: 'What is the role of election observers?',
    options: [
      'To campaign for candidates',
      'To count the votes themselves',
      'To monitor the process for fairness and transparency',
      'To register new voters',
    ],
    correctAnswer: 2,
    explanation:
      'Observers watch whether rules are followed and whether the election appears free, fair, and transparent.',
    difficulty: 'medium',
    category: 'Transparency',
  },
  {
    id: 11,
    question: 'What is proportional representation?',
    options: [
      'Each region gets exactly one representative',
      'Seats are allocated in proportion to votes received',
      'Representatives are appointed by the executive',
      'Only large parties can win seats',
    ],
    correctAnswer: 1,
    explanation:
      'Proportional representation aims to match a party’s share of seats with its share of the vote.',
    difficulty: 'hard',
    category: 'Electoral System',
  },
  {
    id: 12,
    question: 'What is a by-election?',
    options: [
      'A secondary election after the main one',
      'An election held to fill a vacant seat between general elections',
      'An uncontested election',
      'A neighborhood advisory vote',
    ],
    correctAnswer: 1,
    explanation:
      'A by-election is held when a seat becomes vacant before the next scheduled general election.',
    difficulty: 'medium',
    category: 'Electoral System',
  },
];

export const VOTER_GUIDE_STEPS = [
  {
    step: 1,
    title: 'Check Your Eligibility',
    icon: '🔍',
    description: 'Confirm that you meet the legal requirements to vote in your jurisdiction.',
    checklist: [
      'Confirm your citizenship or legal voting status',
      'Verify that you meet the minimum voting age',
      'Check whether your current address is on file',
      'Review any local restrictions or deadlines',
    ],
  },
  {
    step: 2,
    title: 'Register or Update Your Record',
    icon: '📝',
    description: 'Get onto the electoral roll and make sure your details are correct.',
    checklist: [
      'Use the official registration portal or your local election office',
      'Submit any required identification documents',
      'Review your name, address, and polling district carefully',
      'Save proof of registration or confirmation if available',
    ],
  },
  {
    step: 3,
    title: 'Research the Ballot',
    icon: '📚',
    description: 'Make an informed choice by understanding the offices, candidates, and measures.',
    checklist: [
      'Read candidate positions and public disclosures',
      'Compare viewpoints using trusted nonpartisan sources',
      'Learn what each office on the ballot actually does',
      'Review any referendums or local measures before voting day',
    ],
  },
  {
    step: 4,
    title: 'Prepare for Voting Day',
    icon: '📅',
    description: 'Reduce stress by knowing exactly where, when, and how you will vote.',
    checklist: [
      'Check your polling place or mail ballot instructions',
      'Confirm opening hours and local ID requirements',
      'Plan transportation and any accessibility accommodations',
      'Bring the documents or materials your jurisdiction requires',
    ],
  },
  {
    step: 5,
    title: 'Cast Your Vote',
    icon: '🗳️',
    description: 'Vote carefully, privately, and according to the official instructions.',
    checklist: [
      'Follow the posted steps at the polling place or on the ballot packet',
      'Ask election staff for help if instructions are unclear',
      'Review your selections before final submission',
      'Keep any receipt, confirmation, or follow-up instructions you receive',
    ],
  },
];

export const ELECTION_STATS = [
  { label: 'Democracies Worldwide', value: '160+', icon: '🌍' },
  { label: 'Eligible Voters Globally', value: '4B+', icon: '👥' },
  { label: 'Elections Held Yearly', value: '100+', icon: '🗳️' },
  { label: 'Common Goal', value: 'Fair Representation', icon: '⚖️' },
];

export const FAQ_DATA = [
  {
    question: 'What if I cannot go to the polling station on election day?',
    answer:
      'Many places offer alternatives such as early voting, absentee voting, postal ballots, or proxy voting. Always confirm the rules with your local election authority because options vary widely.',
  },
  {
    question: 'Is my vote really secret?',
    answer:
      'In a well-run election, yes. Secret ballot rules are designed to make sure nobody can legally know how you voted, which protects you from pressure or retaliation.',
  },
  {
    question: 'What happens if there is a tie?',
    answer:
      'Tie-breaking rules depend on the jurisdiction. They may involve a recount, a runoff election, or another legal method defined in election law.',
  },
  {
    question: 'Can I vote if I have a disability?',
    answer:
      'You should be able to vote with reasonable accommodations. Many election systems provide accessible polling places, companion assistance rules, or alternative ballot formats.',
  },
  {
    question: 'What is the difference between a primary and a general election?',
    answer:
      'A primary helps parties choose their candidates. A general election is the broader public vote that decides who wins the office.',
  },
  {
    question: 'How are election results verified?',
    answer:
      'Verification may include observer review, signed tally sheets, audits, recount procedures, paper records, and formal certification by the election authority.',
  },
];

export const ELECTION_SYSTEMS = [
  {
    name: 'First-Past-The-Post (FPTP)',
    description:
      'The candidate with the most votes wins the seat. It is simple, but results can be disproportionate.',
    countries: ['USA', 'UK', 'India', 'Canada'],
    pros: ['Simple to understand', 'Usually produces clear winners', 'Strong local representation'],
    cons: ['Many votes do not affect the outcome', 'Can favor larger parties', 'A winner may lack majority support'],
  },
  {
    name: 'Proportional Representation (PR)',
    description:
      'Seats are allocated roughly in proportion to the votes each party receives.',
    countries: ['Germany', 'Netherlands', 'Sweden', 'Israel'],
    pros: ['Broader representation', 'Fewer wasted votes', 'Encourages multi-party politics'],
    cons: ['Coalitions are common', 'Can weaken local ties', 'Counting and ballots may be more complex'],
  },
  {
    name: 'Ranked Choice Voting (RCV)',
    description:
      'Voters rank candidates in order of preference and lower-ranked candidates are eliminated in rounds.',
    countries: ['Australia', 'Ireland', 'New Zealand (local)'],
    pros: ['Encourages majority support', 'Reduces strategic voting', 'Allows more candidate choice'],
    cons: ['Counting takes longer', 'Rules are less intuitive for new voters', 'Ballot design matters a lot'],
  },
];
