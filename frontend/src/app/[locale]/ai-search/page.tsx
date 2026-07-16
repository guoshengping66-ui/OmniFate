import Link from "next/link"
import { AI_SEARCH_REFERENCE } from "@/data/seo/aiSearchReference"

export default function AiSearchReferencePage() {
  return (
    <article className="min-h-screen px-4 pb-20 pt-28">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-4 border-b border-white/10 pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-gold/70">Public reference</p>
          <h1 className="font-serif text-3xl font-bold text-white md:text-5xl">{AI_SEARCH_REFERENCE.title}</h1>
          <p className="text-base leading-7 text-white/65">{AI_SEARCH_REFERENCE.description}</p>
        </header>

        <section aria-labelledby="methods-heading" className="space-y-5">
          <h2 id="methods-heading" className="font-serif text-2xl text-white">Methods and cultural guides</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {AI_SEARCH_REFERENCE.methods.map((method) => (
              <section key={method.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="mb-2 text-lg font-medium text-gold/90">
                  <Link href={method.href} className="hover:text-gold">{method.name}</Link>
                </h3>
                <p className="text-sm leading-6 text-white/60">{method.description}</p>
              </section>
            ))}
          </div>
        </section>

        <section aria-labelledby="links-heading" className="space-y-4">
          <h2 id="links-heading" className="font-serif text-2xl text-white">Public resources</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {AI_SEARCH_REFERENCE.links.map((link) => (
              <li key={link.href}>
                <Link className="text-sm text-gold/90 underline decoration-gold/30 underline-offset-4 hover:text-gold" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq-heading" className="space-y-5">
          <h2 id="faq-heading" className="font-serif text-2xl text-white">Frequently asked questions</h2>
          {AI_SEARCH_REFERENCE.faq.map((item) => (
            <section key={item.question} className="space-y-2">
              <h3 className="text-lg font-medium text-white/90">{item.question}</h3>
              <p className="leading-7 text-white/60">{item.answer}</p>
            </section>
          ))}
        </section>

        <aside aria-label="Responsible-use limitations" className="rounded-xl border border-gold/20 bg-gold/5 p-6">
          <h2 className="mb-3 font-serif text-xl text-gold/90">Responsible-use limitations</h2>
          <p className="leading-7 text-white/70">{AI_SEARCH_REFERENCE.limitations}</p>
        </aside>
      </div>
    </article>
  )
}
