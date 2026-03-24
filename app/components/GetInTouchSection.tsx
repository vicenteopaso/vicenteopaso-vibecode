import { getTranslations, type Locale } from "@/lib/i18n";

import { ContactDialog } from "./ContactDialog";
import { ContactInfo } from "./ContactInfo";

export function GetInTouchSection({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);

  return (
    <section className="glass-card">
      <div className="glass-card-inner section-card space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
            {t("getInTouch.title")}
          </h2>
          <ContactDialog
            triggerLabel={t("getInTouch.contactButton")}
            triggerClassName="btn-primary h-8 px-4 text-sm font-semibold"
          />
        </div>
        <p className="pt-2 text-sm text-[color:var(--text-primary)]">
          {t("getInTouch.description")}
        </p>
        <ContactInfo variant="inline" />
      </div>
    </section>
  );
}
