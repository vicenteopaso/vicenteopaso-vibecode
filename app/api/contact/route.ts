import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  phone: z.string().max(50).optional(),
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message is a bit too long. Please shorten it."),
  domain: z.string().min(1).optional(),
  // domain: z.string().url().optional(), // Full URL with protocol and hostname
  turnstileToken: z.string().min(1, "Verification is required."),
  honeypot: z.string().optional(),
});

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvolgybr";
const ALLOWED_DOMAIN = "opa.so";
// const ALLOWED_DOMAIN = "https://opa.so"; // Full URL with protocol and hostname
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!TURNSTILE_SECRET_KEY) {
      // eslint-disable-next-line no-console
      console.error("Turnstile secret key is not configured.");
      return NextResponse.json(
        { error: "Verification service is not configured." },
        { status: 500 },
      );
    }

    const json = await request.json();
    const data = contactSchema.parse(json);

    // Honeypot: if filled, likely a bot. Silently accept without forwarding.
    if (data.honeypot) {
      return NextResponse.json({ ok: true });
    }

    if (data.domain && data.domain !== ALLOWED_DOMAIN) {
      return NextResponse.json(
        { error: "Invalid submission origin." },
        { status: 400 },
      );
    }

    const ipFromHeader =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      undefined;
    const clientIp = ipFromHeader?.split(",")[0].trim();

    const { turnstileToken, ...formspreePayload } = data;

    const params = new URLSearchParams();
    params.append("secret", TURNSTILE_SECRET_KEY);
    params.append("response", turnstileToken);
    if (clientIp) {
      params.append("remoteip", clientIp);
    }

    const turnstileResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    const turnstileResult = (await turnstileResponse.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: "Verification failed. Please try again." },
        { status: 400 },
      );
    }

    const formspreeResponse = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formspreePayload),
    });

    if (!formspreeResponse.ok) {
      let errorMessage = "Failed to submit contact form. Please try again.";
      try {
        const responseData = (await formspreeResponse.json()) as {
          error?: string;
        };
        if (responseData?.error) {
          errorMessage = responseData.error;
        }
      } catch {
        // Ignore JSON parse errors and use the default message.
      }

      return NextResponse.json({ error: errorMessage }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input." },
        { status: 400 },
      );
    }

    // eslint-disable-next-line no-console
    console.error("Error handling contact form submission", error);

    return NextResponse.json(
      { error: "Unexpected error. Please try again in a moment." },
      { status: 500 },
    );
  }
}
