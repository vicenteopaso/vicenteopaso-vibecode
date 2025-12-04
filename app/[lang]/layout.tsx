import React from "react";

import { getLocaleFromParams } from "@/lib/i18n";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params;
  // Locale validation happens here but can be used by child components
  getLocaleFromParams({ lang });

  return <>{children}</>;
}
