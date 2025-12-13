# AI Guardrails

This document describes the guardrails in place to ensure safe and high-quality AI-assisted development in this codebase. These guardrails are implemented through a combination of ESLint rules, TypeScript strict mode, automated tests, and documentation.

## Table of Contents

- [Philosophy](#philosophy)
- [ESLint Configuration](#eslint-configuration)
- [Guardrail Categories](#guardrail-categories)
- [Working with Guardrails](#working-with-guardrails)
- [Exception Handling](#exception-handling)

---

## Philosophy

AI coding assistants are powerful tools that can accelerate development, but they require guardrails to ensure:

1. **Type Safety**: Strong TypeScript typing prevents runtime errors
2. **Accessibility**: Automated checks ensure WCAG compliance
3. **Security**: Prevent common vulnerabilities and unsafe patterns
4. **Maintainability**: Enforce consistent patterns and best practices
5. **Performance**: Optimize for Core Web Vitals and user experience

The guardrails in this project are designed to **guide** rather than **block** AI assistants, providing clear feedback when patterns deviate from established conventions.

---

## ESLint Configuration

All guardrails are configured in `eslint.config.mjs`. The configuration includes:

### Core Plugins

- `@typescript-eslint`: TypeScript-specific rules and type checking
- `eslint-plugin-jsx-a11y`: Accessibility rules for JSX
- `@next/eslint-plugin-next`: Next.js best practices
- `eslint-plugin-security`: Security vulnerability detection
- `eslint-plugin-simple-import-sort`: Consistent import ordering

### Configuration Structure

```javascript
export default [
  // Ignores
  { ignores: ['**/.next/**', '**/node_modules/**', ...] },
  
  // Base configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  nextPlugin.configs['core-web-vitals'],
  jsxA11y.flatConfigs.recommended,
  
  // Custom rules
  {
    rules: {
      // TypeScript guardrails
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      
      // Console guardrails
      'no-console': ['error', { allow: [] }],
      
      // DOM access guardrails
      'no-restricted-globals': [...],
      
      // Pattern guardrails
      'no-restricted-syntax': [...],
    }
  },
  
  // Overrides for specific contexts
  { files: ['test/**', 'scripts/**'], rules: {...} },
];
```

---

## Guardrail Categories

### 1. TypeScript Type Safety

**Goal**: Prevent `any` types that bypass type checking

**Rules**:
- `@typescript-eslint/no-explicit-any`: Error on explicit `any` types
- `@typescript-eslint/consistent-type-imports`: Enforce `import type` for type-only imports

**Why**:
- AI assistants may default to `any` when uncertain about types
- Type safety is our first line of defense against runtime errors
- `import type` helps with tree-shaking and bundle size

**Example**:
```typescript
// ❌ Bad
function process(data: any) {
  return data.value;
}

// ✅ Good
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: unknown }).value;
  }
  throw new Error('Invalid data structure');
}

// ✅ Good - type-only import
import type { User } from '@/types/user';
```

### 2. Logging and Debugging

**Goal**: Centralize logging through `lib/error-logging.ts`

**Rules**:
- `no-console`: Disallow direct console usage in production code

**Why**:
- AI assistants often add `console.log` for debugging
- Direct console usage can leak sensitive information
- Centralized logging enables monitoring and error tracking via Sentry

**Example**:
```typescript
// ❌ Bad
console.log('Processing user data', userData);

// ✅ Good
import { logError, logWarning } from '@/lib/error-logging';

try {
  processData(userData);
} catch (error) {
  logError(error, {
    component: 'DataProcessor',
    action: 'process-user-data',
    metadata: { userId: userData.id }
  });
}
```

**Exceptions**:
- `lib/error-logging.ts`: Console usage is the purpose of this file
- `test/**`: Console usage allowed for test debugging
- `scripts/**`: Console usage allowed for CLI output

### 3. DOM Manipulation

**Goal**: Prevent direct DOM access that bypasses React

**Rules**:
- `no-restricted-globals`: Restrict `document` and `window` in React components

**Why**:
- AI assistants may suggest direct DOM manipulation as a quick fix
- Direct DOM access breaks React's virtual DOM
- Can introduce XSS vulnerabilities
- Makes code harder to test

**Example**:
```typescript
// ❌ Bad - direct DOM manipulation
function MyComponent() {
  useEffect(() => {
    document.getElementById('header').style.color = 'red';
  }, []);
}

// ✅ Good - use React refs
function MyComponent() {
  const headerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.style.color = 'red';
    }
  }, []);
  
  return <div ref={headerRef}>Header</div>;
}
```

**Exceptions**:
- `test/**`: DOM access needed for test assertions
- `test/visual/utils.ts`: Purpose is DOM manipulation for visual tests
- Global event listeners in effects (when properly cleaned up)
- Third-party library integration (e.g., Turnstile widget)

### 4. React & Next.js Best Practices

**Goal**: Enforce Next.js patterns and prevent anti-patterns

**Rules**:
- `@next/next/no-html-link-for-pages`: Enforce `next/link` for internal navigation
- `@next/next/no-img-element`: Enforce `next/image` for optimized images
- `@typescript-eslint/no-misused-promises`: Prevent async event handlers without proper error handling

**Why**:
- AI assistants may use standard HTML patterns instead of Next.js optimized components
- Async event handlers can silently fail without proper error handling
- Next.js components provide automatic optimization

**Example**:
```typescript
// ❌ Bad - HTML anchor
<a href="/about">About</a>

// ✅ Good - Next.js Link
import Link from 'next/link';
<Link href="/about">About</Link>

// ❌ Bad - HTML img
<img src="/logo.png" alt="Logo" />

// ✅ Good - Next.js Image
import Image from 'next/image';
<Image src="/logo.png" alt="Logo" width={100} height={100} />

// ❌ Bad - async event handler without error handling
<button onClick={async () => { await save(); }}>Save</button>

// ✅ Good - wrapped async with error handling
<button onClick={() => {
  void (async () => {
    try {
      await save();
    } catch (error) {
      logError(error, { component: 'SaveButton', action: 'save' });
    }
  })();
}}>Save</button>
```

### 5. Accessibility (A11y)

**Goal**: Maintain WCAG 2.1 AA compliance

**Rules**:
- `jsx-a11y/recommended`: Full suite of accessibility rules
  - Proper heading hierarchy
  - Alt text on images
  - Keyboard navigation support
  - ARIA labels and roles
  - Focus management
  - Color contrast

**Why**:
- AI assistants may generate visually correct but inaccessible markup
- Accessibility is a legal requirement and moral imperative
- Good accessibility improves UX for all users

**Example**:
```typescript
// ❌ Bad - missing alt text, no keyboard support
<div onClick={handleClick}>
  <img src="/icon.png" />
</div>

// ✅ Good - semantic button with alt text
<button onClick={handleClick}>
  <Image src="/icon.png" alt="Settings" width={24} height={24} />
  <span className="sr-only">Settings</span>
</button>
```

### 6. Security

**Goal**: Prevent common security vulnerabilities

**Rules**:
- `security/detect-unsafe-regex`: Prevent ReDoS attacks
- `security/detect-eval-with-expression`: Prevent eval usage
- `security/detect-non-literal-regexp`: Warn on dynamic regex
- Custom restrictions on dangerous APIs

**Why**:
- AI assistants may not consider security implications
- Security vulnerabilities can have severe consequences
- Prevention is easier than remediation

**Example**:
```typescript
// ❌ Bad - unsafe HTML injection
element.innerHTML = userInput;

// ✅ Good - sanitized HTML
import sanitizeHtml from 'sanitize-html';
const clean = sanitizeHtml(userInput);
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

---

## Working with Guardrails

### Development Workflow

1. **Write code**: AI assistant generates code
2. **Lint**: Run `pnpm lint` to check for violations
3. **Fix**: Address any ESLint errors
4. **Commit**: Pre-commit hooks run linting automatically
5. **CI**: GitHub Actions verify all checks pass

### Common Patterns

#### Pattern 1: Replacing Console Statements

```bash
# Find all console usage
grep -r "console\." app/ lib/
```

Replace with:
```typescript
import { logError, logWarning } from '@/lib/error-logging';
```

#### Pattern 2: Fixing `any` Types

```bash
# Find all any types
grep -r ": any\|as any" app/ lib/
```

Replace with proper types or `unknown` with type guards.

#### Pattern 3: Converting HTML to Next.js Components

Search and replace:
- `<a href="` → `<Link href="`
- `<img src="` → `<Image src="`

---

## Exception Handling

### When to Allow Exceptions

Exceptions should be **rare** and **justified**. Valid reasons include:

1. **Third-party library constraints**: Untyped legacy libraries
2. **Test utilities**: DOM access for test assertions
3. **Performance-critical code**: After profiling shows a real benefit
4. **Temporary migration**: With a TODO and issue number

### How to Document Exceptions

Always use ESLint disable comments with clear justification:

```typescript
// ❌ Bad - no justification
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = getValue();

// ✅ Good - clear justification
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Turnstile library has no type definitions; types would require significant maintenance
const turnstileWidget: any = window.turnstile;
```

### Exception Comment Template

```typescript
// eslint-disable-next-line [rule-name] -- [Reason]: [What you tried]. [Link to issue if applicable]
```

Examples:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Legacy API: no types available; refactor tracked in #123
const legacyResult: any = oldAPI.getData();

// eslint-disable-next-line no-console -- Error logging: this is the centralized error logging utility
console.error('Application Error:', error);

// eslint-disable-next-line no-restricted-globals -- Test utility: DOM access required for Playwright visual regression baseline
const height = document.body.scrollHeight;
```

---

## Guardrail Override Patterns

### Test Files

Test files have relaxed rules for pragmatic testing:

```javascript
{
  files: ['test/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  rules: {
    'no-console': 'off',
    'no-restricted-globals': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  }
}
```

### Scripts

Build and utility scripts have pragmatic overrides:

```javascript
{
  files: ['scripts/**/*.{js,mjs,ts}', '*.config.{js,mjs,ts}'],
  rules: {
    'no-console': 'off',
    'security/detect-non-literal-fs-filename': 'off',
    'security/detect-child-process': 'off',
  }
}
```

### API Routes

API routes allow server-side patterns:

```javascript
{
  files: ['app/api/**/*.ts'],
  rules: {
    // API routes can use console.error for server-side logging
    'no-console': ['error', { allow: ['error'] }],
  }
}
```

---

## Continuous Improvement

These guardrails are **living documentation**. They evolve as:

1. **New patterns emerge**: Add rules for new anti-patterns
2. **False positives**: Refine rules to reduce noise
3. **Technology changes**: Update for new Next.js features
4. **Team learning**: Incorporate lessons from code reviews

### Feedback Loop

1. **Observe**: Notice patterns in AI-generated code
2. **Document**: Add to [FORBIDDEN_PATTERNS.md](./FORBIDDEN_PATTERNS.md)
3. **Automate**: Add ESLint rule if possible
4. **Educate**: Update this document

### Measuring Success

- **Lint pass rate**: Should be 100% on main branch
- **CI failure rate**: Track ESLint-related CI failures
- **Code review feedback**: Reduce manual catch of pattern violations
- **Runtime errors**: Decrease in production errors

---

## Resources

- [FORBIDDEN_PATTERNS.md](./FORBIDDEN_PATTERNS.md) - Detailed pattern catalog
- [ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md) - Overall engineering guidelines
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - A11y requirements
- [SECURITY_POLICY.md](./SECURITY_POLICY.md) - Security practices
- `eslint.config.mjs` - ESLint configuration source

---

## Summary

AI guardrails in this project:

1. ✅ **Prevent common mistakes** through automated linting
2. ✅ **Guide AI assistants** toward best practices
3. ✅ **Maintain quality** across AI-assisted and human contributions
4. ✅ **Enable fast iteration** with quick feedback loops
5. ✅ **Ensure consistency** across the entire codebase

When AI assistants are properly constrained by these guardrails, they become powerful force multipliers that maintain high code quality while accelerating development velocity.
