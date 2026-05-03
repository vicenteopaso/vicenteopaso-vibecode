# LocaleProvider

Client-side locale context provider. Makes the active locale available to all child components, persists the preference to a cookie for the server-side proxy, and keeps `<html lang>` in sync.

**File**: `app/components/LocaleProvider.tsx`

## Behaviour

1. Reads initial locale from the `[lang]` route segment (`initialLocale` prop)
2. Exposes `{ locale }` via `useLocale()` to any descendant
3. On mount and on locale change, writes `preferred-locale=<locale>` cookie so `proxy.ts` detects it on the next request
4. Updates `document.documentElement.lang` to keep `<html lang>` correct after client-side locale switches (SSR sets this from the `x-locale` header; `LocaleProvider` keeps it in sync)

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `initialLocale` | `"en" \| "es"` | Locale from the `[lang]` route segment |
| `children` | `ReactNode` | Child tree |

## Hook

```ts
import { useLocale } from "@/app/components/LocaleProvider";

const { locale } = useLocale();
```

## Testing

Covered by `test/unit/locale-provider.test.tsx`.
