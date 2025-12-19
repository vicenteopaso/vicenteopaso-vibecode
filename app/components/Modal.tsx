"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { track } from "@vercel/analytics";
import type { ReactNode } from "react";

export type ModalSize = "sm" | "md" | "lg";

// Use the exact metadata type expected by Vercel Analytics `track`.
type AnalyticsMetadata = Parameters<typeof track>[1];

interface ModalProps {
  trigger: ReactNode;
  children: ReactNode;
  size?: ModalSize;
  /** Optional custom analytics event name for Vercel Analytics. */
  analyticsEventName?: string;
  /** Optional extra metadata to send with the analytics event. */
  analyticsMetadata?: AnalyticsMetadata;
  /** Controlled open state for the modal. */
  open?: boolean;
  /** Callback when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Optional test ID for E2E testing. */
  testId?: string;
}

function getSizeClasses(size: ModalSize = "md") {
  switch (size) {
    case "sm":
      return "w-[92vw] max-w-md";
    case "md":
      return "w-[92vw] max-w-xl";
    case "lg":
      return "w-[94vw] max-w-3xl";
    default: {
      // This should be unreachable due to the `ModalSize` union, but keep a runtime
      // guard so incorrect usage fails fast (and tests can assert on it).
      const exhaustiveCheck: never = size;
      throw new Error(`Invalid modal size: ${exhaustiveCheck}`);
    }
  }
}

export function Modal({
  trigger,
  children,
  size = "md",
  analyticsEventName,
  analyticsMetadata,
  open,
  onOpenChange,
  testId,
}: ModalProps) {
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && analyticsEventName && !process.env.PLAYWRIGHT) {
      track(analyticsEventName, analyticsMetadata);
    }
    onOpenChange?.(newOpen);
  };

  // Always provide onOpenChange; only spread open if defined
  const dialogProps = {
    ...(open !== undefined && { open }),
    onOpenChange: handleOpenChange,
  };

  return (
    <Dialog.Root {...dialogProps}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className={`${getSizeClasses(size)} fixed left-1/2 top-1/2 max-h-[90dvh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overflow-x-hidden rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)]/95 p-6 text-sm text-[color:var(--text-primary)] shadow-[0_18px_60px_rgba(15,23,42,0.9)] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/60`}
          data-testid={testId}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
