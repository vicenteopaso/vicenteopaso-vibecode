"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { track } from "@vercel/analytics";

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
}

function getSizeClasses(size: ModalSize = "md") {
  switch (size) {
    case "sm":
      return "w-[92vw] max-w-md";
    case "lg":
      return "w-[94vw] max-w-3xl";
    case "md":
    default:
      return "w-[92vw] max-w-xl";
  }
}

export function Modal({
  trigger,
  children,
  size = "md",
  analyticsEventName,
  analyticsMetadata,
}: ModalProps) {
  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (open && analyticsEventName) {
          track(analyticsEventName, analyticsMetadata);
        }
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className={`${getSizeClasses(size)} fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)]/95 p-6 text-[0.8rem] text-[color:var(--text-primary)] shadow-[0_18px_60px_rgba(15,23,42,0.9)] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/60`}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
