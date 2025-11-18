"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { getWebsiteJsonLd, getPersonJsonLd } from "../../lib/seo";

export function SeoJsonLd() {
  const pathname = usePathname();

  const includePerson = pathname === "/about" || pathname === "/cv";

  return (
    <>
      <Script
        id="website-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getWebsiteJsonLd()),
        }}
      />
      {includePerson ? (
        <Script
          id="person-json-ld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getPersonJsonLd()),
          }}
        />
      ) : null}
    </>
  );
}
