"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import React from "react";

import { getPersonJsonLd, getWebsiteJsonLd } from "../../lib/seo";

export function SeoJsonLd() {
  const pathname = usePathname();

  const includePerson = pathname === "/" || pathname === "/cv";

  return (
    <>
      <Script
        id="website-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(getWebsiteJsonLd())}
      </Script>
      {includePerson ? (
        <Script
          id="person-json-ld"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(getPersonJsonLd())}
        </Script>
      ) : null}
    </>
  );
}
