import React from "react";
import type { Metadata } from "next";

import { getLocaleFromParams } from "@/lib/i18n";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    manifest: `/${lang}/manifest.webmanifest`,
  };
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params;
  // Locale validation happens here but can be used by child components
  getLocaleFromParams({ lang });

  return <>{children}</>;
}
