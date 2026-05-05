import type { ReactNode } from "react";

export function ContentPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1180px] p-8">
      {children}
    </div>
  );
}
