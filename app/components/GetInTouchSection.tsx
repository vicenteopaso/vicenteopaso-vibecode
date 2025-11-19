import { ContactDialog } from "./ContactDialog";
import { ContactInfo } from "./ContactInfo";

export function GetInTouchSection() {
  return (
    <section className="section-card space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
          Get in touch
        </h2>
        <ContactDialog
          trigger={
            <button
              type="button"
              className="text-sm font-medium text-[color:var(--accent)] hover:text-[color:var(--accent-hover)] hover:underline underline-offset-4 cursor-pointer"
            >
              Contact me
            </button>
          }
        />
      </div>
      <p className="pt-2 text-sm text-[color:var(--text-primary)]">
        Interested in collaborating, discussing engineering leadership, or
        exploring new opportunities? I&apos;m open to thoughtful conversations.
      </p>
      <ContactInfo variant="inline" />
    </section>
  );
}
