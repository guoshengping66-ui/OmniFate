"use client"

interface Crumb {
  name: string
  href: string
}

export default function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const itemListElement = items.map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: crumb.href,
  }))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement,
        }),
      }}
    />
  )
}
