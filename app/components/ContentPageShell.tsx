import type { ReactNode } from "react";

const CONTENT_MAX_W = 1180;

export function ContentPageShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: CONTENT_MAX_W,
        margin: "0 auto",
        width: "100%",
        padding: "32px",
      }}
    >
      {children}
    </div>
  );
}
