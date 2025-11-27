"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary component that catches JavaScript errors in child components,
 * logs error details, and displays a fallback UI.
 *
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console for development/debugging
    // In production, this will be captured by Vercel logs if it occurs server-side
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error callback (e.g., for custom logging or analytics)
    this.props.onError?.(error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <div className="section-card max-w-lg space-y-4 text-center">
            <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
              Something went wrong
            </h2>
            <p className="text-sm text-[color:var(--text-muted)]">
              We encountered an unexpected error. Please try refreshing the
              page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mx-auto mt-4 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] px-4 py-2 text-sm font-medium text-[color:var(--text-primary)] transition-colors hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
