# Policy Modal Components

## Overview

Three similar modal components that display policy content loaded from the `/api/content/` endpoint. Each wraps the base Modal component and uses ReactMarkdown for content rendering.

**Locations:**

- `app/components/CookiePolicyModal.tsx`
- `app/components/PrivacyPolicyModal.tsx`
- `app/components/TechStackModal.tsx`

## Components

### CookiePolicyModal

Displays cookie policy content from `/api/content/cookie-policy`.

**Usage:** Linked from Footer component

```tsx
<CookiePolicyModal />
```

### PrivacyPolicyModal

Displays privacy policy content from `/api/content/privacy-policy`.

**Usage:** Linked from Footer component

```tsx
<PrivacyPolicyModal />
```

### TechStackModal

Displays technical stack information from `/api/content/tech-stack`.

**Usage:** Linked from Footer component

```tsx
<TechStackModal />
```

## Shared Features

### Content Loading

All three components:

1. Fetch content from API route on mount
2. Show loading state while fetching
3. Display error message if fetch fails
4. Render markdown content when loaded

### Content API Response

```typescript
interface ContentResponse {
  title: string; // Page title from frontmatter
  body: string; // Markdown content
}
```

### Modal Configuration

- **Size**: `lg` (768px max width) for long-form content
- **Analytics**: Tracks modal opens with Vercel Analytics
- **Trigger**: Styled link from Footer

## Props

None - All three components are self-contained.

## Implementation Pattern

```typescript
// 1. State management
const [content, setContent] = useState<ContentResponse | null>(null);
const [error, setError] = useState<string | null>(null);

// 2. Fetch content on mount
useEffect(() => {
  let isMounted = true;

  async function load() {
    try {
      const res = await fetch("/api/content/{slug}");
      const data = await res.json();
      if (isMounted) setContent(data);
    } catch (err) {
      if (isMounted) setError(message);
    }
  }

  load();
  return () => {
    isMounted = false;
  };
}, []);

// 3. Render in Modal with ReactMarkdown
```

## Content Rendering

Uses `markdownComponents` from `lib/markdown-components.tsx`:

- Semantic HTML elements
- Styled headings, lists, links
- Code blocks with syntax highlighting
- Tables with responsive layout
- Consistent typography matching site design

## Design Tokens

```css
--bg-surface     /* Modal background */
--text-primary   /* Content text */
--text-muted     /* Loading/error text */
--link           /* Link color in content */
--border-subtle  /* Table borders */
```

## Accessibility

- **Loading state**: Shows "Loading..." text while fetching
- **Error handling**: Displays user-friendly error message
- **Semantic HTML**: ReactMarkdown outputs proper heading hierarchy
- **Keyboard navigation**: Modal handles keyboard interaction
- **Focus management**: Modal traps focus and returns on close

## Usage in Footer

```tsx
<Link href="#" onClick={() => /* open modal */}>
  Cookie Policy
</Link>
<CookiePolicyModal />
```

Note: Footer uses Link components that navigate to dedicated pages (`/cookie-policy`, etc.) instead of opening modals. These modal components are available but not currently used in the Footer.

## Testing

**Test files:**

- `test/unit/policy-modals.test.tsx` - Unit tests for all three modals
- `test/e2e/policies-and-a11y.spec.ts` - E2E tests for policy pages

Tests verify:

- ✅ Triggers render correctly
- ✅ Content loads on mount
- ✅ ReactMarkdown renders content
- ✅ Error states handled gracefully
- ✅ Analytics events tracked

## API Routes

Content served by:

- `/api/content/cookie-policy` → `content/cookie-policy.md`
- `/api/content/privacy-policy` → `content/privacy-policy.md`
- `/api/content/tech-stack` → `content/tech-stack.md`

API route reads markdown files, parses frontmatter, returns JSON.

## Related Components

- **[Modal](./Modal.md)** - Base modal component
- **[Footer](./Footer.md)** - Links to policy pages

## Related Documentation

- [Content API Route](../../app/api/content/[slug]/route.ts)
- [Markdown Components](../../lib/markdown-components.tsx)
- [Privacy Policy](../PRIVACY_POLICY.md)
