"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { FormEvent, ReactNode } from "react";
import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ContactInfo } from "./ContactInfo";
import { Modal } from "./Modal";

declare global {
  interface Window {
    onTurnstileSuccess?: (token: string) => void;
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          size?: "normal" | "flexible" | "compact" | string;
        },
      ) => void;
      reset: () => void;
    };
  }
}

interface ContactDialogProps {
  triggerLabel?: string;
  trigger?: ReactNode;
  children?: ReactNode;
}

const COUNTDOWN_DURATION = 10;

export function ContactDialog({
  triggerLabel = "Contact me",
  trigger,
  children,
}: ContactDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [isChallengeVisible, setIsChallengeVisible] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Whether the form is in success state with countdown
  const isSuccessState = countdown !== null;

  // Reset all form state to initial values
  const resetFormState = useCallback(() => {
    setEmail("");
    setPhone("");
    setMessage("");
    setError(null);
    setSuccess(null);
    setEmailError(null);
    setMessageError(null);
    setCountdown(null);
    setSubmitting(false);
    // Clear any running countdown
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Handle modal open/close
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (open) {
        // Reset form when modal opens to ensure fresh state
        resetFormState();
        // Reset Turnstile for fresh verification
        window.turnstile?.reset();
        setTurnstileToken(null);
        setIsChallengeVisible(false);
      }
    },
    [resetFormState],
  );

  // Start countdown after successful submission
  const startCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_DURATION);

    countdownIntervalRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          // Clear interval and close modal
          if (countdownIntervalRef.current !== null) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setIsOpen(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current !== null) {
        window.clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (!siteKey) {
      // eslint-disable-next-line no-console
      console.error(
        "Turnstile site key is not configured. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY.",
      );
      return;
    }

    const tryRenderTurnstile = () => {
      if (!turnstileContainerRef.current || !window.turnstile?.render) {
        return false;
      }

      window.turnstile.render(turnstileContainerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          setTurnstileToken(token);
          setIsChallengeVisible(true);
        },
        // Let Turnstile auto-size responsively to the container width
        size: "flexible",
      });

      return true;
    };

    if (tryRenderTurnstile()) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (tryRenderTurnstile()) {
        window.clearInterval(intervalId);
      }
    }, 200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setEmailError(null);
    setMessageError(null);

    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail || !trimmedMessage) {
      if (!trimmedEmail) {
        setEmailError("Please provide an email address.");
      }
      if (!trimmedMessage) {
        setMessageError("Please provide a message.");
      }
      setError("Please fix the errors highlighted below.");
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the verification.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const honeypot = (formData.get("website") ?? "").toString().trim();

    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          phone: trimmedPhone || undefined,
          message: trimmedMessage,
          turnstileToken,
          honeypot: honeypot || undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        const message =
          data?.error || "Something went wrong. Please try again.";
        throw new Error(message);
      }

      setSuccess("Message sent. I'll get back to you as soon as I can.");
      setEmail("");
      setPhone("");
      setMessage("");
      setEmailError(null);
      setMessageError(null);
      // Start countdown for auto-close
      startCountdown();
    } catch (err) {
      // Reset Turnstile so the user can try again after an error.
      window.turnstile?.reset();
      setTurnstileToken(null);
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const triggerNode = trigger ?? (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)]/90 px-3.5 py-1.5 text-xs font-medium text-[color:var(--text-primary)] shadow-sm shadow-black/5 transition hover:border-[color:var(--accent)]/50 hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
    >
      {triggerLabel}
    </button>
  );

  return (
    <Modal
      trigger={triggerNode}
      size="md"
      analyticsEventName="contact_open"
      analyticsMetadata={{ component: "ContactDialog" }}
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <Dialog.Title className="flex items-center gap-2 text-base font-semibold tracking-tight text-[color:var(--text-primary)]">
        Contact me
      </Dialog.Title>
      <Dialog.Description className="mt-1 text-sm text-[color:var(--text-muted)]">
        Reach out with a short note about what you&apos;d like to explore.
      </Dialog.Description>
      <form
        className="mt-4 space-y-3 text-sm"
        onSubmit={handleSubmit}
        noValidate
        aria-describedby="contact-status"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[color:var(--text-primary)]">Email</span>
          <input
            type="email"
            name="email"
            className="rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-app)] px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-sm transition focus-visible:border-[color:var(--accent)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/60 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={isSuccessState}
            aria-required="true"
            aria-invalid={emailError ? "true" : "false"}
            aria-describedby={
              emailError
                ? "contact-email-error contact-status"
                : "contact-status"
            }
          />
          {emailError ? (
            <p id="contact-email-error" className="text-[11px] text-red-400">
              {emailError}
            </p>
          ) : null}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[color:var(--text-primary)]">
            Phone (optional)
          </span>
          <input
            type="tel"
            name="phone"
            className="rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-app)] px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-sm transition focus-visible:border-[color:var(--accent)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/60 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Phone number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            disabled={isSuccessState}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[color:var(--text-primary)]">Message</span>
          <textarea
            name="message"
            className="min-h-[96px] rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-app)] px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-sm transition focus-visible:border-[color:var(--accent)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/60 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="A few words about your project or question"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            disabled={isSuccessState}
            aria-required="true"
            aria-invalid={messageError ? "true" : "false"}
            aria-describedby={
              messageError
                ? "contact-message-error contact-status"
                : "contact-status"
            }
          />
          {messageError ? (
            <p id="contact-message-error" className="text-[11px] text-red-400">
              {messageError}
            </p>
          ) : null}
        </label>
        {/* Honeypot field: hidden from users, traps bots */}
        <input
          type="text"
          name="website"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <div
          className="pt-1"
          aria-describedby={
            isChallengeVisible
              ? "contact-verification-help contact-status"
              : "contact-status"
          }
        >
          <div ref={turnstileContainerRef} className="cf-turnstile" />
        </div>
        {isChallengeVisible ? (
          <p
            id="contact-verification-help"
            className="mt-1 text-sm text-[color:var(--text-muted)]"
          >
            This Cloudflare Turnstile verification helps protect this form from
            automated spam.
          </p>
        ) : null}

        <div
          id="contact-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-[11px]"
        >
          {error ? <span className="text-red-400">{error}</span> : null}
          {!error && success ? (
            <span className="text-emerald-400">{success}</span>
          ) : null}
          {isSuccessState ? (
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              This dialog will close in{" "}
              <span className="font-semibold text-[color:var(--text-primary)]">
                {countdown}
              </span>{" "}
              {countdown === 1 ? "second" : "seconds"}.
            </p>
          ) : null}
        </div>

        {children}

        <ContactInfo variant="dialog" />

        <div className="mt-4 flex justify-end gap-2 border-t border-[color:var(--border-subtle)] pt-3 text-sm">
          <Dialog.Close
            className="rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-app)]/60 px-4 py-1.5 text-[color:var(--text-primary)] shadow-sm transition hover:border-[color:var(--accent)]/40 hover:text-[color:var(--link-hover)] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            disabled={submitting}
          >
            Close
          </Dialog.Close>
          <button
            type="submit"
            className="rounded-full bg-[color:var(--accent)] px-4 py-1.5 font-semibold text-slate-50 shadow-md shadow-[color:var(--accent)]/30 transition hover:bg-[color:var(--accent-hover)] hover:shadow-lg hover:shadow-[color:var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            disabled={submitting || !turnstileToken || isSuccessState}
          >
            {submitting ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
