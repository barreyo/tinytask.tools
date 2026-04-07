export type Theme =
  | 'lorem'
  | 'fintech'
  | 'startup'
  | 'corporate'
  | 'developer'
  | 'design'
  | 'legal'
  | 'hipster';

export type Format = 'paragraphs' | 'sentences' | 'words' | 'headlines';

export interface ThemeMeta {
  id: Theme;
  label: string;
  description: string;
}

export const THEMES: ThemeMeta[] = [
  { id: 'lorem', label: 'Lorem Ipsum', description: 'The classic placeholder text' },
  {
    id: 'fintech',
    label: 'Fintech Ipsum',
    description: 'Blockchain, yield, and frictionless payments',
  },
  {
    id: 'startup',
    label: 'Startup Ipsum',
    description: 'Disruption, pivots, and AI-first thinking',
  },
  {
    id: 'corporate',
    label: 'Corporate Ipsum',
    description: 'Synergies, stakeholders, and transformation',
  },
  {
    id: 'developer',
    label: 'Developer Ipsum',
    description: 'Microservices, deploys, and tech debt',
  },
  {
    id: 'design',
    label: 'Design Ipsum',
    description: 'Whitespace, type scales, and pixel perfection',
  },
  {
    id: 'legal',
    label: 'Legal Ipsum',
    description: 'Whereas, notwithstanding, and indemnification',
  },
  {
    id: 'hipster',
    label: 'Hipster Ipsum',
    description: 'Artisanal, small-batch, and farm-to-table',
  },
];

// ── Word banks ────────────────────────────────────────────────────────────────

const LOREM_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'curabitur',
  'pretium',
  'tincidunt',
  'lacus',
  'nunc',
  'pulvinar',
  'nisi',
  'tortor',
  'convallis',
  'porttitor',
  'sollicitudin',
  'tristique',
  'facilisis',
  'pellentesque',
];

const LOREM_SENTENCES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Curabitur pretium tincidunt lacus, nec ultrices mi tempus sit amet.',
  'Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero.',
  'Pellentesque habitant morbi tristique senectus et netus et malesuada fames.',
  'Proin libero nunc consequat interdum varius sit amet mattis vulputate.',
  'Malesuada fames ac turpis egestas maecenas pharetra convallis posuere.',
  'Volutpat ac tincidunt vitae semper quis lectus nulla at volutpat.',
  'Eget aliquet nibh praesent tristique magna sit amet purus gravida.',
  'Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam.',
  'Amet cursus sit amet dictum sit amet justo donec enim diam.',
  'Molestie ac feugiat sed lectus vestibulum mattis ullamcorper velit sed.',
];

const FINTECH_WORDS = [
  'blockchain',
  'yield',
  'frictionless',
  'cross-border',
  'payments',
  'rails',
  'liquidity',
  'tokenization',
  'DeFi',
  'compliance',
  'KYC',
  'AML',
  'ledger',
  'settlement',
  'custody',
  'treasury',
  'reconciliation',
  'interchange',
  'float',
  'on-ramp',
  'off-ramp',
  'wallet',
  'stablecoin',
  'real-time',
  'netting',
  'clearing',
  'embedded',
  'open-banking',
  'PSD2',
  'ISO 20022',
  'SWIFT',
  'ACH',
  'SEPA',
  'remittance',
  'FX',
  'hedging',
  'underwriting',
  'origination',
  'securitization',
  'collateral',
  'escrow',
  'disbursement',
  'regulatory',
  'sandbox',
  'API-first',
  'orchestration',
  'decisioning',
  'credit-scoring',
];

const FINTECH_SENTENCES = [
  'Seamless cross-border payment rails eliminate friction while unlocking real-time liquidity for global merchants.',
  'Our tokenization layer enables institutional-grade custody with programmable compliance baked into every transaction.',
  'By embedding KYC and AML decisioning at the API layer, we reduce onboarding friction by over 70 percent.',
  'Frictionless FX hedging powered by real-time clearing gives treasury teams the visibility they demand.',
  'Open-banking integrations via ISO 20022 messaging unlock richer data flows for credit-scoring models.',
  'Our blockchain-native settlement network collapses three-day clearing cycles into milliseconds.',
  'Yield optimization across stablecoin and money-market instruments drives superior risk-adjusted returns.',
  'Programmable escrow and smart disbursement logic eliminate the reconciliation overhead of legacy core banking.',
  'Embedded lending at the point of sale converts checkout intent into approved credit in under two seconds.',
  'By orchestrating ACH, SEPA, and card rails through a single API, we abstract away the complexity of global payments.',
  'Real-time interchange optimization and dynamic routing cut payment costs without compromising acceptance rates.',
  'Our regulatory sandbox enables fintechs to test novel products under supervisory oversight before market launch.',
  'Collateral management and repo automation reduce counterparty risk while improving capital efficiency.',
  'Decentralized identity primitives power consent-driven data sharing across the entire financial ecosystem.',
  'Next-generation underwriting models fuse alternative data signals to extend credit to the underbanked.',
];

const STARTUP_WORDS = [
  'disrupting',
  'paradigm',
  'AI-first',
  'platform',
  'scalable',
  'horizontal',
  'vertical',
  'north-star',
  'flywheel',
  'moat',
  'traction',
  'pivot',
  'iterate',
  'sprint',
  'roadmap',
  'runway',
  'burn-rate',
  'seed',
  'Series-A',
  'unicorn',
  'decacorn',
  'product-market-fit',
  'growth-hacking',
  'virality',
  'retention',
  'churn',
  'LTV',
  'CAC',
  'ARR',
  'MRR',
  'DAU',
  'MAU',
  'activation',
  'funnel',
  'onboarding',
  'conversion',
  'cohort',
  'segment',
  'persona',
  'ICP',
  'go-to-market',
  'PLG',
  'outbound',
  'inbound',
  'ABM',
  'land-and-expand',
  'ecosystem',
  'network-effect',
  'marketplace',
  'two-sided',
  'defensible',
];

const STARTUP_SENTENCES = [
  'We are disrupting the legacy paradigm with an AI-first platform that scales horizontally across every vertical.',
  'Our flywheel compounds faster than competitors can erect defenses, giving us a durable network-effect moat.',
  'After three pivots we found genuine product-market fit and our MRR has tripled every quarter since.',
  'The north-star metric guides every sprint decision, from activation flows to long-tail retention campaigns.',
  'We land with a high-conviction ICP, expand through usage-based pricing, and let product-led growth do the heavy lifting.',
  'Our growth-hacking playbook drove viral coefficients above one, making paid acquisition almost entirely optional.',
  'By compressing CAC and extending LTV, we have reached payback periods under three months at Series A scale.',
  'Our two-sided marketplace creates defensible liquidity that incumbents cannot replicate without cannibalizing their core.',
  'We are building the operating system for the next generation of knowledge work, starting with the highest-value workflows.',
  'Day-one retention is our proxy for real value delivery, and it has never been more predictive of long-run ARR.',
  'The ecosystem play compounds over time: every integration deepens the moat and raises the switching cost.',
  'We allocate runway ruthlessly toward initiatives that move the north-star metric and kill everything else.',
  'Our seed investors backed a contrarian thesis, and the data from our beta cohorts is proving them right.',
  'Go-to-market motion combines bottom-up PLG with a targeted outbound overlay for enterprise land-and-expand.',
  'We are six weeks from a milestone that unlocks the next tranche and puts us on a direct path to Series B.',
];

const CORPORATE_WORDS = [
  'synergies',
  'stakeholders',
  'alignment',
  'transformation',
  'initiatives',
  'bandwidth',
  'leverage',
  'paradigm-shift',
  'best-in-class',
  'benchmarking',
  'deliverables',
  'action-items',
  'circle-back',
  'deep-dive',
  'boil-the-ocean',
  'low-hanging-fruit',
  'move-the-needle',
  'value-add',
  'core-competency',
  'strategic-pillars',
  'key-performance-indicators',
  'holistic',
  'integrated',
  'cross-functional',
  'proactive',
  'robust',
  'scalable',
  'sustainable',
  'mission-critical',
  'game-changing',
  'disruptive',
  'innovative',
  'agile',
  'ecosystem',
  'end-to-end',
  'turnkey',
  'solution-oriented',
  'customer-centric',
  'data-driven',
  'outcomes-focused',
  'empowerment',
  'accountability',
];

const CORPORATE_SENTENCES = [
  'Leveraging synergies across business units will drive stakeholder alignment throughout our enterprise transformation.',
  'We need to circle back on the deliverables and ensure all action items are captured before end of business Friday.',
  'Our strategic pillars are designed to move the needle on KPIs while maintaining focus on core competencies.',
  'A deep-dive into the data confirms that the low-hanging fruit has already been harvested — we need bolder initiatives.',
  'Cross-functional collaboration is mission-critical if we are going to achieve the holistic integration our customers expect.',
  'We remain agile and outcomes-focused as we execute against the roadmap our stakeholders have signed off on.',
  'Best-in-class benchmarking reveals a significant gap between our current performance and where we need to be.',
  'The end-to-end solution we are proposing will future-proof our infrastructure while delivering measurable value-add.',
  'Empowering teams with the right tools and bandwidth is foundational to our culture of accountability.',
  'Sustainable growth requires us to balance short-term wins against the long-term health of our ecosystem.',
  'Our customer-centric approach ensures that every initiative maps directly to a prioritized customer pain point.',
  'Data-driven decision-making has become our north star, replacing intuition with evidence at every layer of the organization.',
  'We are committed to a proactive communication cadence so that no stakeholder is caught off-guard by material changes.',
  'The game-changing potential of this partnership cannot be overstated — it is truly a paradigm shift for our industry.',
  'Robust governance frameworks and a clear escalation path will keep our transformation on track and on budget.',
];

const DEVELOPER_WORDS = [
  'microservices',
  'monolith',
  'refactoring',
  'event-driven',
  'blue-green',
  'canary-release',
  'zero-downtime',
  'CI/CD',
  'pipeline',
  'observability',
  'telemetry',
  'distributed-tracing',
  'idempotency',
  'eventual-consistency',
  'CQRS',
  'event-sourcing',
  'saga-pattern',
  'rate-limiting',
  'throttling',
  'backpressure',
  'dead-letter-queue',
  'schema-migration',
  'database-sharding',
  'read-replica',
  'cache-invalidation',
  'CDN',
  'edge-computing',
  'serverless',
  'containers',
  'Kubernetes',
  'Helm',
  'Terraform',
  'GitOps',
  'IaC',
  'rolling-deploy',
  'feature-flags',
  'A/B-testing',
  'dark-launch',
  'tech-debt',
  'linting',
  'static-analysis',
  'type-safety',
  'dependency-injection',
  'DRY',
];

const DEVELOPER_SENTENCES = [
  'Refactoring the legacy monolith into event-driven microservices unlocked zero-downtime deployments and independent scaling.',
  'Our CI/CD pipeline catches regressions before they reach production through exhaustive unit, integration, and contract tests.',
  'Distributed tracing across service boundaries finally gave us the observability we needed to diagnose latency spikes.',
  'The dead-letter queue pattern gracefully handles poison messages without stalling the entire processing pipeline.',
  'We adopted the saga pattern to manage long-running transactions across services while preserving eventual consistency.',
  'Blue-green deploys paired with feature flags let us release continuously and roll back in under thirty seconds.',
  'Schema migrations now run as backward-compatible steps so we can deploy the application and the database independently.',
  'Database sharding pushed our write throughput past ten million events per second without increasing latency.',
  'Cache invalidation and CDN purging logic are versioned and tested the same way we test application code.',
  'GitOps with Terraform and Helm charts means our entire infrastructure is auditable, reviewable, and reproducible.',
  'Backpressure propagation throughout the event stream prevents any single consumer from becoming a bottleneck under load.',
  'CQRS let us tune read and write models independently, dramatically simplifying our most complex reporting queries.',
  'Idempotency keys at every external API boundary mean retries are always safe and duplicates are silently deduplicated.',
  'Static analysis and strict type-safety eliminated an entire class of runtime errors before the first line reaches production.',
  'We surfaced the worst tech debt with architecture fitness functions that run on every commit and fail the build when violated.',
];

const DESIGN_WORDS = [
  'whitespace',
  'type-scale',
  'visual-hierarchy',
  'grid',
  'alignment',
  'proximity',
  'contrast',
  'affordance',
  'signifier',
  'microinteraction',
  'motion',
  'easing',
  'atomic-design',
  'design-token',
  'component',
  'variant',
  'state',
  'accessibility',
  'WCAG',
  'color-theory',
  'hue',
  'saturation',
  'luminance',
  'kerning',
  'leading',
  'tracking',
  'baseline-grid',
  'modular-scale',
  'golden-ratio',
  'gestalt',
  'figure-ground',
  'closure',
  'continuity',
  'symmetry',
  'user-research',
  'prototype',
  'iteration',
  'feedback-loop',
  'usability-test',
  'information-architecture',
  'wayfinding',
  'empty-state',
  'skeleton-screen',
  'progressive-disclosure',
];

const DESIGN_SENTENCES = [
  'Intentional whitespace and a harmonious type scale create breathing room that guides the eye without effort.',
  'Every microinteraction is choreographed with easing curves that feel physical and immediate, never mechanical.',
  'Atomic design principles ensure that components compose predictably from token to organism to template to page.',
  'Rigorous color-theory work ensures sufficient contrast ratios across every state in both light and dark themes.',
  'The modular scale enforces visual rhythm, making it impossible for a designer to choose a font size that feels wrong.',
  'Baseline-grid alignment across the layout ensures text and interface elements breathe together as a unified system.',
  'Progressive disclosure reduces cognitive load by surfacing only what users need, precisely when they need it.',
  'Skeleton screens replace loading spinners, setting accurate spatial expectations before real content arrives.',
  'User research uncovered three job stories we had never prioritized — and they became the next design sprint focus.',
  'Gestalt principles of proximity and closure allow us to communicate grouping without adding explicit borders or backgrounds.',
  'Design tokens decouple visual decisions from implementation, letting one change propagate across every platform simultaneously.',
  'The empty state is a first-impression moment — we treat it as premium real estate for coaching and delight.',
  'Usability testing with five representative users surfaced the same critical flow breakdown every time, which we fixed immediately.',
  'Thoughtful affordances and clear signifiers mean users never have to wonder what an element does or how to interact with it.',
  'Motion design communicates system status and spatial relationships, earning its place in the UI by reducing confusion.',
];

const LEGAL_WORDS = [
  'notwithstanding',
  'foregoing',
  'indemnifying',
  'hold-harmless',
  'liability',
  'warranty',
  'representation',
  'covenant',
  'obligation',
  'consideration',
  'jurisdiction',
  'venue',
  'arbitration',
  'dispute-resolution',
  'severability',
  'entire-agreement',
  'governing-law',
  'force-majeure',
  'breach',
  'remedy',
  'injunctive-relief',
  'liquidated-damages',
  'intellectual-property',
  'assignment',
  'sublicense',
  'royalty-free',
  'perpetual',
  'irrevocable',
  'confidentiality',
  'non-disclosure',
  'trade-secret',
  'proprietary',
  'indemnification',
  'exclusion',
  'limitation',
  'aggregate-liability',
  'consequential-damages',
  'fiduciary',
  'officer-and-director',
  'beneficial-owner',
  'due-diligence',
  'representations',
];

const LEGAL_SENTENCES = [
  'Notwithstanding the foregoing provisions, the indemnifying party shall hold harmless the indemnitee from all third-party claims.',
  'The limitation of liability set forth herein shall survive termination and shall apply to the fullest extent permitted by law.',
  'This agreement constitutes the entire agreement of the parties and supersedes all prior negotiations, representations, or warranties.',
  'In the event of any dispute, the parties shall submit to binding arbitration under the rules of the American Arbitration Association.',
  'The representations and warranties contained herein shall be deemed to be reaffirmed at each closing as if made on such date.',
  'Force majeure events include, without limitation, acts of God, governmental action, labor disputes, and failures of third-party networks.',
  'Each party hereby grants a royalty-free, perpetual, irrevocable license to use the contributed intellectual property for the stated purpose.',
  'Confidential information shall not include information that is publicly available or independently developed without reference to the disclosing party.',
  'The severability clause ensures that any provision found unenforceable shall be modified to the minimum extent necessary to make it enforceable.',
  'Injunctive relief may be sought in a court of competent jurisdiction without the requirement to post bond or other security.',
  'Aggregate liability under this agreement shall not exceed the total fees paid in the twelve months preceding the claim.',
  'The assignment of rights hereunder is prohibited without the prior written consent of the non-assigning party.',
  'Consequential, incidental, and punitive damages are expressly excluded from any recovery under this agreement, regardless of the form of action.',
  'Each party represents that it has full authority to enter into this agreement and that doing so does not conflict with any other obligation.',
  'Trade secrets and proprietary information disclosed during due diligence shall remain subject to the non-disclosure obligations indefinitely.',
];

const HIPSTER_WORDS = [
  'artisanal',
  'cold-brew',
  'kombucha',
  'avocado',
  'heritage',
  'sourdough',
  'small-batch',
  'farm-to-table',
  'organic',
  'ethically-sourced',
  'single-origin',
  'hand-roasted',
  'terroir',
  'heirloom',
  'fermented',
  'biodynamic',
  'zero-waste',
  'upcycled',
  'slow-food',
  'hyperlocal',
  'foraged',
  'curated',
  'bespoke',
  'crafted',
  'intentional',
  'mindful',
  'sustainable',
  'regenerative',
  'analog',
  'vinyl',
  'fixie',
  'co-working',
  'tiny-house',
  'minimalist',
  'maximalist',
  'normcore',
  'cottagecore',
  'dark-academia',
  'moss-wall',
  'narrative',
  'community-supported',
  'pop-up',
  'underground',
  'speakeasy',
  'avant-garde',
];

const HIPSTER_SENTENCES = [
  'Artisanal cold-brew kombucha, paired with ethically sourced avocado toast on heritage sourdough, anchors the weekend brunch menu.',
  'Small-batch, single-origin espresso hand-roasted to highlight the natural terroir of the high-altitude Yirgacheffe farm.',
  'Our zero-waste kitchen transforms every heirloom vegetable trim into a fermented condiment that tells the story of the harvest.',
  'The pop-up dining experience is fully foraged, regeneratively farmed, and plated on locally thrown ceramic ware.',
  'Biodynamic wine poured by candlelight in a converted warehouse — the moss wall provides natural acoustic diffusion.',
  'We curated a hyperlocal menu that rotates weekly based on what our community-supported agriculture box delivers.',
  'The bespoke cocktail menu draws on forgotten botanical ingredients and analog fermentation techniques from pre-prohibition Brooklyn.',
  'Our fixie-friendly bike valet and reclaimed-wood interior speak to the intentional, minimalist lifestyle our guests cultivate.',
  'Slow-food philosophy means our ragu simmers for 36 hours; you can taste the narrative in every spoonful.',
  'The speakeasy entrance, hidden behind a vintage bookshelf, rewards those who know the neighborhood well enough to ask.',
  'Upcycled denim aprons and hand-stamped paper menus signal our commitment to craftsmanship over convenience.',
  'Cottagecore aesthetics meet dark-academia playlists in this tiny-house studio we converted into a mindful co-working space.',
  'Every element — from the beeswax candles to the linen napkins — is thoughtfully sourced with regenerative values in mind.',
  'The underground supper club sells out in minutes; discovering it still feels like stumbling onto something avant-garde and secret.',
  'Our normcore approach to hospitality strips away performance so the genuine warmth of the hosts can fill the room.',
];

// ── Headline banks ────────────────────────────────────────────────────────────

const HEADLINES: Record<Theme, string[]> = {
  lorem: [
    'Lorem Ipsum Dolor Sit Amet',
    'Consectetur Adipiscing Elit',
    'Sed Do Eiusmod Tempor',
    'Ut Labore et Dolore Magna',
    'Quis Nostrud Exercitation',
    'Duis Aute Irure Dolor',
    'Excepteur Sint Occaecat',
    'Nulla Pariatur Consequat',
    'Pellentesque Habitant Morbi',
    'Curabitur Pretium Tincidunt',
  ],
  fintech: [
    'Frictionless Payments for a Borderless Economy',
    'Real-Time Settlement, Zero Complexity',
    'Tokenize Everything. Settle Instantly.',
    'The New Infrastructure for Global Money Movement',
    'Embedded Finance at the Speed of Software',
    'Compliance Without the Friction',
    'Yield Optimization for Modern Treasuries',
    'Open Banking, Closed Gaps',
    'From On-Ramp to Off-Ramp in Milliseconds',
    'Credit Decisioning Reimagined for the Digital Age',
  ],
  startup: [
    'The Operating System for Modern Work',
    "We Didn't Disrupt the Category. We Replaced It.",
    'Product-Market Fit Was Just the Beginning',
    'Scaling Past $1M ARR: What We Learned',
    'The Flywheel Is Spinning. Now We Build the Moat.',
    'A Contrarian Bet That the Data Proved Right',
    'From Zero to Unicorn in 36 Months',
    'Why We Killed Our Roadmap and Started Over',
    'Land, Expand, and Never Look Back',
    'The Network Effect That Changes Everything',
  ],
  corporate: [
    'Driving Strategic Alignment Across the Enterprise',
    'Unlocking Synergies Through Digital Transformation',
    'Q3 Initiative Update: Moving the Needle on KPIs',
    'Cross-Functional Excellence: A Best-Practice Framework',
    'Empowering Teams for Sustainable Competitive Advantage',
    'From Data-Driven Insights to Mission-Critical Action',
    'A Holistic Approach to Customer-Centric Innovation',
    'Leveraging Core Competencies in a Disrupted Landscape',
    'Stakeholder Communication: Building Trust at Scale',
    'The Roadmap to Operational Excellence',
  ],
  developer: [
    'Zero-Downtime Deploys at 10,000 Requests Per Second',
    'How We Killed the Monolith Without Killing the Team',
    'Event-Driven Architecture: Lessons from Production',
    "Observability Is Not Monitoring — Here's the Difference",
    'The Cache Invalidation Problem, Finally Solved',
    'Why We Chose Eventual Consistency and How We Sleep at Night',
    'A GitOps Migration That Actually Worked',
    'Type Safety Across the Full Stack',
    'From Tech Debt to Fitness Functions',
    "Database Sharding at Scale: What They Don't Tell You",
  ],
  design: [
    'The Case for Radical Whitespace',
    'Building a Design System That Scales',
    'Motion Design as a Communication Tool',
    'Why Your Empty States Are Your Best First Impression',
    'Type Scale, Baseline Grid, and the Harmony Between Them',
    "Accessibility Is Not a Feature — It's a Foundation",
    'From Research to Prototype in 48 Hours',
    'Gestalt in the Wild: Patterns We Use Every Day',
    'Design Tokens as the Bridge Between Design and Code',
    'How Microinteractions Build or Break User Trust',
  ],
  legal: [
    'Understanding Indemnification Clauses in SaaS Agreements',
    'Force Majeure in the Age of Supply Chain Disruption',
    'Intellectual Property Assignment: What Founders Must Know',
    'Limitation of Liability Provisions and Their Limits',
    "Arbitration vs. Litigation: A Practitioner's Perspective",
    'Confidentiality Obligations That Survive Termination',
    'Data Processing Agreements Under GDPR and CCPA',
    'Representations and Warranties at Closing',
    'The Entire Agreement Clause and Why It Matters',
    'Injunctive Relief Without Bond: When Courts Allow It',
  ],
  hipster: [
    'Small-Batch Fermentation and the Art of Patience',
    'A Love Letter to Single-Origin Everything',
    'The Slow-Food Manifesto for a Fast-Moving World',
    'Foraged, Fermented, and Fully Intentional',
    'Why Analog Experiences Are the Ultimate Luxury',
    'The Speakeasy Revival and What It Tells Us About Belonging',
    'Terroir, Traceability, and the New Consumer',
    'From Farm Gate to Flat White: The Single-Origin Journey',
    'Cottagecore as Resistance: Reclaiming the Unhurried Life',
    'Bespoke Everything: The Return of the Craftsperson',
  ],
};

// ── Sentence pools ────────────────────────────────────────────────────────────

const SENTENCES: Record<Theme, string[]> = {
  lorem: LOREM_SENTENCES,
  fintech: FINTECH_SENTENCES,
  startup: STARTUP_SENTENCES,
  corporate: CORPORATE_SENTENCES,
  developer: DEVELOPER_SENTENCES,
  design: DESIGN_SENTENCES,
  legal: LEGAL_SENTENCES,
  hipster: HIPSTER_SENTENCES,
};

const WORDS: Record<Theme, string[]> = {
  lorem: LOREM_WORDS,
  fintech: FINTECH_WORDS,
  startup: STARTUP_WORDS,
  corporate: CORPORATE_WORDS,
  developer: DEVELOPER_WORDS,
  design: DESIGN_WORDS,
  legal: LEGAL_WORDS,
  hipster: HIPSTER_WORDS,
};

// ── Seeded pseudo-random ──────────────────────────────────────────────────────

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

function pickFrom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ── Paragraph builder ─────────────────────────────────────────────────────────

function buildParagraph(theme: Theme, rng: () => number): string {
  const pool = SENTENCES[theme];
  const shuffled = shuffle(pool, rng);
  const count = 3 + Math.floor(rng() * 4); // 3–6 sentences
  return shuffled.slice(0, count).join(' ');
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface GenerateOptions {
  theme: Theme;
  format: Format;
  count: number;
  seed?: number;
}

export function generate(options: GenerateOptions): string {
  const { theme, format, count } = options;
  const seed = options.seed ?? Date.now();
  const rng = seededRng(seed);

  const clampedCount = Math.max(
    1,
    Math.min(
      count,
      format === 'paragraphs' ? 20 : format === 'sentences' ? 100 : format === 'words' ? 500 : 30,
    ),
  );

  switch (format) {
    case 'paragraphs': {
      const paras: string[] = [];
      for (let i = 0; i < clampedCount; i++) {
        paras.push(buildParagraph(theme, rng));
      }
      return paras.join('\n\n');
    }

    case 'sentences': {
      const pool = SENTENCES[theme];
      const shuffled = shuffle(pool, rng);
      const sentences: string[] = [];
      for (let i = 0; i < clampedCount; i++) {
        sentences.push(shuffled[i % shuffled.length]);
        if (i % shuffled.length === shuffled.length - 1) {
          // reshuffle on wrap
          shuffled.splice(0, shuffled.length, ...shuffle(pool, rng));
        }
      }
      return sentences.join(' ');
    }

    case 'words': {
      const pool = WORDS[theme];
      const words: string[] = [];
      for (let i = 0; i < clampedCount; i++) {
        words.push(pickFrom(pool, rng));
      }
      return words.join(' ');
    }

    case 'headlines': {
      const pool = HEADLINES[theme];
      const shuffled = shuffle(pool, rng);
      const headlines: string[] = [];
      for (let i = 0; i < clampedCount; i++) {
        headlines.push(shuffled[i % shuffled.length]);
        if (i % shuffled.length === shuffled.length - 1) {
          shuffled.splice(0, shuffled.length, ...shuffle(pool, rng));
        }
      }
      return headlines.join('\n');
    }
  }
}

export const FORMAT_DEFAULTS: Record<Format, number> = {
  paragraphs: 3,
  sentences: 5,
  words: 50,
  headlines: 5,
};

export const FORMAT_LIMITS: Record<Format, { min: number; max: number }> = {
  paragraphs: { min: 1, max: 20 },
  sentences: { min: 1, max: 100 },
  words: { min: 1, max: 500 },
  headlines: { min: 1, max: 30 },
};
