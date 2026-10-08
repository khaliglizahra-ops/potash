import type { Product } from "./types";

export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const abs = (p: string) => (p.startsWith("http") ? p : `${SITE}${p}`);

export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Nükleon Lab",
    url: SITE,
    logo: abs("/img/site/nukleon-logo.png"),
    description: "Ankara'da üretilen laboratuvar cihazları: inkübatör, etüv, çeker ocak, güvenlik kabini ve analiz sistemleri.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "İvedik OSB, Öz Ankara San. Sit. 1464 (675). Sk. No: 37",
      addressLocality: "Yenimahalle",
      addressRegion: "Ankara",
      addressCountry: "TR",
    },
    contactPoint: [{ "@type": "ContactPoint", telephone: "+90-312-395-66-13", contactType: "sales", availableLanguage: ["Turkish"], email: "info@nukleonlab.com.tr" }],
  };
}

export function breadcrumbLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.href) })),
  };
}

export function productLd(p: Product, brandName: string, categoryName: string) {
  const url = abs(`/urunler/${p.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    mpn: p.sku,
    description: p.shortDescription,
    category: categoryName,
    image: p.images.map(abs),
    brand: { "@type": "Brand", name: brandName },
    manufacturer: { "@type": "Organization", name: "Nükleon Lab" },
    url,
    ...(p.price !== null
      ? {
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "TRY",
            price: p.price,
            priceValidUntil: new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10),
            availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "Nükleon Lab" },
          },
        }
      : {}),
  };
}
