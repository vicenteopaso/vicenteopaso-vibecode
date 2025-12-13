# AI Guardrails: Runtime Assertions and Error Handling

This document provides guidelines for AI-assisted code generation to ensure robust error handling and prevent silent failures.

## Table of Contents

- [Overview](#overview)
- [Runtime Assertions](#runtime-assertions)
- [Error Handling Patterns](#error-handling-patterns)
- [ESLint Rules](#eslint-rules)
- [Common Pitfalls](#common-pitfalls)
- [Examples](#examples)

## Overview

AI-generated code often makes optimistic assumptions that "things just work." In production, this leads to:

- **Silent failures**: Empty catch blocks swallow errors, making debugging impossible
- **Unreachable code paths**: Switch statements without exhaustiveness checks miss edge cases
- **Missing validation**: Functions don't validate preconditions, leading to cryptic errors downstream
- **Scattered errors**: Inconsistent error handling patterns make logs hard to aggregate

This document provides guardrails to prevent these issues.

## Runtime Assertions

### `assertNever`: Exhaustiveness Checking

Use `assertNever()` in the default case of switch statements to catch unhandled enum/union cases.

**Location**: `lib/assertions.ts`

```typescript
import { assertNever } from "@/lib/assertions";

type Status = "idle" | "loading" | "success" | "error";

function getStatusMessage(status: Status): string {
  switch (status) {
    case "idle":
      return "Ready to start";
    case "loading":
      return "Processing...";
    case "success":
      return "Completed successfully";
    case "error":
      return "An error occurred";
    default:
      // If Status type is extended but this switch isn't updated,
      // TypeScript will catch it at compile time and runtime will throw
      return assertNever(status);
  }
}
```

**Benefits**:

- TypeScript enforces that all cases are handled at compile time
- Runtime throws a descriptive error if an unexpected value is encountered
- Automatically logs the error with context for observability
- Makes code assumptions explicit

**When to use**:

- In switch statement default cases for enums or union types
- When handling discriminated unions
- Any time you want to assert that a code path is unreachable

### `invariant`: Precondition Checking

Use `invariant()` to enforce critical preconditions and business logic constraints.

**Location**: `lib/assertions.ts`

```typescript
import { invariant } from "@/lib/assertions";

function divide(a: number, b: number): number {
  invariant(b !== 0, "Cannot divide by zero");
  return a / b;
}

function processUser(user: User | null, requiredRole: string) {
  invariant(user !== null, "User must be authenticated");
  invariant(user.role === requiredRole, `User must have ${requiredRole} role`);
  // TypeScript now knows user is non-null
  return user.performAction();
}

function applyDiscount(price: number, discountPercentage: number): number {
  invariant(price >= 0, "Price must be non-negative");
  invariant(
    discountPercentage >= 0 && discountPercentage <= 100,
    "Discount percentage must be between 0 and 100",
  );
  return price * (1 - discountPercentage / 100);
}
```

**Benefits**:

- Makes preconditions explicit and self-documenting
- TypeScript type narrowing works correctly (e.g., `user` is non-null after check)
- Fails fast with clear error messages instead of causing mysterious bugs downstream
- Automatically logs violations with context for debugging

**When to use**:

- Validating function arguments
- Checking business logic constraints
- Asserting that required data is present
- Enforcing state transitions

**When NOT to use**:

- For user input validation (use Zod schemas instead)
- For expected errors that should be handled gracefully (use try/catch)
- For optional parameters (use optional chaining or default values)

## Error Handling Patterns

### Structured Error Logging

Always use `logError()` from `lib/error-logging.ts` for unexpected errors.

```typescript
import { logError, logWarning } from "@/lib/error-logging";

try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  // ✅ Good: Structured logging with context
  logError(error, {
    component: "MyComponent",
    action: "riskyOperation",
    metadata: { userId: user.id, attempt: retryCount },
  });
  throw error; // Re-throw or handle gracefully
}
```

**Benefits**:

- Consistent log format across the application
- Logs are captured by Vercel and forwarded to Sentry
- Context helps with debugging and aggregating related errors
- Breadcrumbs enrich subsequent error reports

### Empty Catch Blocks (ESLint Warning)

ESLint is configured to warn on empty catch blocks (`no-empty` rule).

```typescript
// ❌ Bad: Silent failure
try {
  await fetchData();
} catch {
  // Empty catch block - error is swallowed
}

// ✅ Good: Log the error
try {
  await fetchData();
} catch (error) {
  logError(error, { component: "DataFetcher", action: "fetchData" });
  setError("Failed to load data");
}

// ✅ Also acceptable: Explicit comment when safe to ignore
try {
  const config = JSON.parse(localStorage.getItem("config"));
} catch {
  // Ignore JSON parse errors and use default config
  return defaultConfig;
}
```

### Error Boundaries for React Components

Wrap components with `ErrorBoundary` to catch rendering errors.

```typescript
import { ErrorBoundary } from "@/app/components/ErrorBoundary";

<ErrorBoundary
  fallback={<ErrorFallbackUI />}
  onError={(error) => {
    logError(error, { component: "MyFeature" });
  }}
>
  <MyComponent />
</ErrorBoundary>
```

## ESLint Rules

The following ESLint rules help enforce error handling best practices:

| Rule | Level | Purpose |
|------|-------|---------|
| `no-empty` | `warn` | Prevents empty catch blocks that swallow errors |
| `@typescript-eslint/no-unused-vars` | `error` | Prevents unused error variables (suggests intentional ignoring) |
| `security/detect-*` | `error/warn` | Various security-focused rules to catch common vulnerabilities |

## Common Pitfalls

### Pitfall 1: Assuming Data is Always Present

```typescript
// ❌ Bad: Assumes data.user always exists
function getUserName(data: Response) {
  return data.user.name; // Crashes if data.user is null/undefined
}

// ✅ Good: Use invariant to validate
function getUserName(data: Response) {
  invariant(data.user, "User data must be present in response");
  return data.user.name;
}

// ✅ Alternative: Optional chaining with fallback
function getUserName(data: Response) {
  return data.user?.name ?? "Unknown User";
}
```

### Pitfall 2: Incomplete Switch Statements

```typescript
type Theme = "light" | "dark" | "auto";

// ❌ Bad: Missing case and no default
function getThemeStyles(theme: Theme) {
  switch (theme) {
    case "light":
      return lightStyles;
    case "dark":
      return darkStyles;
    // "auto" case is missing - silent bug!
  }
}

// ✅ Good: assertNever catches missing cases
function getThemeStyles(theme: Theme) {
  switch (theme) {
    case "light":
      return lightStyles;
    case "dark":
      return darkStyles;
    case "auto":
      return autoStyles;
    default:
      return assertNever(theme);
  }
}
```

### Pitfall 3: Swallowing Errors Without Logging

```typescript
// ❌ Bad: Error is swallowed
async function loadUserData(userId: string) {
  try {
    const data = await fetchUser(userId);
    return data;
  } catch {
    return null; // Error information is lost!
  }
}

// ✅ Good: Log before returning fallback
async function loadUserData(userId: string) {
  try {
    const data = await fetchUser(userId);
    return data;
  } catch (error) {
    logError(error, {
      component: "UserLoader",
      action: "loadUserData",
      metadata: { userId },
    });
    return null;
  }
}
```

### Pitfall 4: Missing Input Validation

```typescript
// ❌ Bad: No validation, crashes on invalid input
function calculateArea(width: number, height: number) {
  return width * height;
}

// ✅ Good: Validate preconditions
function calculateArea(width: number, height: number) {
  invariant(width > 0, "Width must be positive");
  invariant(height > 0, "Height must be positive");
  return width * height;
}
```

## Examples

### Example 1: API Route Handler

```typescript
import { invariant } from "@/lib/assertions";
import { logError } from "@/lib/error-logging";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().email(),
  message: z.string().min(5),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const data = requestSchema.parse(body);

    // Validate environment configuration
    const apiKey = process.env.API_KEY;
    invariant(apiKey, "API_KEY environment variable must be configured");

    // Process request
    const result = await processMessage(data.email, data.message, apiKey);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    // Log all errors with context
    logError(error, {
      component: "ContactAPI",
      action: "POST",
    });

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400 },
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
```

### Example 2: Form Component with Validation

```typescript
import { invariant } from "@/lib/assertions";
import { logError } from "@/lib/error-logging";
import { useState } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      const email = formData.get("email") as string;
      const message = formData.get("message") as string;

      // Validate required fields
      invariant(email, "Email is required");
      invariant(message, "Message is required");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setStatus("success");
    } catch (error) {
      logError(error, {
        component: "ContactForm",
        action: "handleSubmit",
      });
      setStatus("error");
      setErrorMessage("Failed to submit. Please try again.");
    }
  };

  // Render form with status handling
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {renderStatusUI(status, errorMessage)}
    </form>
  );
}

function renderStatusUI(status: FormStatus, errorMessage: string | null) {
  switch (status) {
    case "idle":
      return null;
    case "submitting":
      return <p>Submitting...</p>;
    case "success":
      return <p>Thank you for your message!</p>;
    case "error":
      return <p className="error">{errorMessage}</p>;
    default:
      return assertNever(status);
  }
}
```

### Example 3: Data Processing Utility

```typescript
import { invariant } from "@/lib/assertions";

interface Product {
  id: string;
  price: number;
  discount?: number;
}

export function calculateFinalPrice(product: Product): number {
  // Validate product data
  invariant(product.id, "Product must have an ID");
  invariant(product.price >= 0, "Price must be non-negative");

  if (product.discount !== undefined) {
    invariant(
      product.discount >= 0 && product.discount <= 100,
      "Discount must be between 0 and 100",
    );
    return product.price * (1 - product.discount / 100);
  }

  return product.price;
}

export function aggregateTotal(products: Product[]): number {
  invariant(products.length > 0, "Cannot calculate total of empty cart");

  return products.reduce((total, product) => {
    return total + calculateFinalPrice(product);
  }, 0);
}
```

## Related Documentation

- [Error Handling](./ERROR_HANDLING.md) - Comprehensive error handling guide
- [Engineering Standards](./ENGINEERING_STANDARDS.md) - Project-wide engineering principles
- [Testing](./TESTING.md) - Testing strategies including error scenarios

---

**Last updated**: 2025-12-13  
**Purpose**: Provide guardrails for AI-assisted development to prevent silent failures and ensure robust error handling  
**Audience**: AI code generation tools, developers, code reviewers
