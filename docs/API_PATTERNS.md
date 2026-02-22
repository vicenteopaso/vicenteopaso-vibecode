# API Patterns

This document covers patterns for API routes in this Next.js application.

## Route Handler Structure

All API routes follow this structure:

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/error-logging";

// 1. Define schema
const requestSchema = z.object({
  field: z.string().min(1),
});

// 2. Export handler
export async function POST(request: Request) {
  try {
    // 3. Parse and validate
    const body = await request.json();
    const data = requestSchema.parse(body);

    // 4. Process request
    const result = await processData(data);

    // 5. Return success
    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    // 6. Handle errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }

    logError(error, { context: "api-route" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

## Input Validation

Always use Zod schemas for input validation:

```typescript
import { z } from "zod";

const contactSchema = z.object({
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  phone: z.string().optional(),
  turnstileToken: z.string().min(1),
});
```

## Error Responses

| Status | When to Use                              |
| ------ | ---------------------------------------- |
| 400    | Invalid input, validation failure        |
| 401    | Authentication required                  |
| 403    | Forbidden (authorized but not permitted) |
| 404    | Resource not found                       |
| 429    | Rate limit exceeded                      |
| 500    | Internal server error                    |
| 502    | Upstream service error                   |

## Error Handling

```typescript
// Always log errors server-side
logError(error, {
  context: "contact-api",
  email: data.email, // Safe metadata only
});

// Never expose internal details to client
return NextResponse.json(
  { error: "Something went wrong" }, // Generic message
  { status: 500 },
);
```

## Rate Limiting

Use `lib/rate-limit.ts` for rate limiting:

```typescript
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  if (!rateLimit.check(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  // ...
}
```

## Security Checklist

- [ ] Zod schema validates all input
- [ ] Rate limiting applied
- [ ] No secrets in responses
- [ ] Errors logged with `logError()`
- [ ] Generic error messages to client
- [ ] CORS configured if needed
- [ ] Authentication verified if required

## Testing

API routes should have tests covering:

1. Success path
2. Validation errors
3. Rate limiting
4. Upstream failures
5. Missing environment variables

See `test/unit/contact-route.test.ts` for examples.
