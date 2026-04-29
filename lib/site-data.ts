// Static site data used by the brutalist v3 design (landing + CV)
// These values come from the approved design prototype and complement content/*/cv.json

export const SITE_TLDR = [
  'I lead engineering teams and architect frontend platforms.',
  'I care about composable architecture, design systems, and developer experience.',
  'I ship accessible, performant, globally-localized products.',
  'I scale Communities of Practice and mentor distributed teams.',
  'I am, very likely, the only Frontend Architect you will meet who was also an RF engineer at Nokia.',
] as const;

export const SITE_TLDR_LABELS = ['WHO', 'CRAFT', 'SHIP', 'SCALE', 'EXTRA'] as const;

export const SITE_FOCUS = [
  { h: 'Frontend Architecture', b: 'Composable React / Next.js ecosystems built for global delivery.' },
  { h: 'Design Systems & UI Governance', b: 'Component libraries, tokens, accessibility, multi-surface consistency.' },
  { h: 'Developer Experience', b: 'CI/CD automation, code-quality guardrails, onboarding, tooling.' },
  { h: 'Engineering Leadership', b: 'Distributed teams, strategy, aligning product, design and engineering.' },
  { h: 'Performance, A11y & SEO', b: 'Core Web Vitals, edge delivery, WCAG 2.1, technical SEO.' },
] as const;

export const SITE_IMPACT = [
  { k: '25%', v: 'Core Web Vitals improvement across 6 markets' },
  { k: '40%', v: 'Reduction in release friction via CI/CD' },
  { k: '€1B+', v: 'Annual turnover on platforms I architected' },
  { k: '15y+', v: 'Shipping on the web — and 10 years in telecom before' },
] as const;

export const SITE_BRANDS = [
  'Nexthink', 'EUROCONTROL', 'Carlsberg', 'Nokia',
  'General Motors', 'NCAA', 'Paulson Institute',
  'Hilton', 'Anheuser-Busch', 'T-Mobile',
] as const;

export const SITE_LANDING_TOC = [
  { n: '01', t: 'TL;DR', s: "The 5-point version" },
  { n: '02', t: 'WHAT I DO', s: 'Five areas of focus' },
  { n: '03', t: 'EXPERIENCE', s: '25 years · 8 roles' },
  { n: '04', t: 'TECH & TOOLS', s: 'The current stack' },
  { n: '05', t: 'CONTACT', s: "Let's talk" },
] as const;

export const CV_TOC = [
  { n: '01', t: 'SUMMARY', s: 'TL;DR + highlights' },
  { n: '02', t: 'EXPERIENCE', s: '8 roles · 15 years on the web' },
  { n: '03', t: 'SKILLS', s: 'Languages · frameworks · tools' },
  { n: '04', t: 'EDUCATION', s: 'Education & languages' },
  { n: '05', t: 'PUBLICATIONS', s: 'Selected writing' },
  { n: '06', t: 'REFERENCES', s: 'What people say' },
] as const;
