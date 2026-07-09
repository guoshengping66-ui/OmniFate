"use client"
import Link from "next/link"
import { useState, useRef, useEffect, lazy, Suspense } from "react"
import { Menu, X, Sparkles, User, LogOut, ChevronDown, ShoppingBag } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { formatCouponBalance } from "@/lib/regionPrice"
import { LanguageSwitch } from "@/components/ui/LanguageSwitch"
import MembershipBadge, { getUserTier } from "@/components/ui/MembershipBadge"

const StardustBalance = lazy(() => import("@/components/ui/StardustBalance").then(m => ({ default: m.StardustBalance })))
const CartDrawer = lazy(() => import("@/components/shop/CartDrawer").then(m => ({ default: m.CartDrawer })))

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, loading, logout } = useAuth()
  const { itemCount } = useCart()
  const { t, localeHref } = useLanguage()
  const { region } = useRegion()

  // Track scroll for compact header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Core links: keep the new-user path visible before secondary content.
  const coreLinks: Array<{ href: string; label: string; highlight?: boolean }> = [
    { href: localeHref("/reading/new"), label: t("nav.reading") || "开始分析 / Start Reading", highlight: true },
    { href: localeHref("/almanac"), label: t("nav.almanac") || "每日状态 / Almanac" },
    { href: localeHref("/tools"), label: t("nav.tools") || "Tools" },
    { href: localeHref("/shop"), label: t("nav.shop") || t("treasureHall.hero.title") },
    { href: localeHref("/pricing"), label: t("nav.pricing") },
  ]

  // Secondary trust/content links stay visible on wide screens and collapse on smaller ones.
  const extraLinks = [
    { href: localeHref("/knowledge"), label: t("nav.knowledge") || "Knowledge" },
    { href: localeHref("/about"), label: t("nav.about") },
  ]

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#020617]/98 border-b border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          : "bg-[#020617]/95 border-b border-white/[0.04]"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href={localeHref("/")} className="flex items-center group flex-shrink-0">
            <span className="font-serif font-bold text-lg text-gold">{t("app.name")}</span>
          </Link>

          {/* Desktop nav — wide screens: all links visible */}
          <nav className="hidden lg:flex items-center gap-5">
            {coreLinks.map(l => (
              <Link key={l.href} href={l.href} prefetch={null}
                className={`text-sm transition-colors duration-200 ${
                  l.highlight
                    ? "text-gold font-medium hover:text-gold-light"
                    : "text-white/70 hover:text-gold"
                }`}>
                {l.label}
              </Link>
            ))}
            {/* Extra links visible on lg+ */}
            {extraLinks.map(l => (
              <Link key={l.href} href={l.href} prefetch={null}
                className="text-sm text-white/50 hover:text-gold transition-colors duration-200">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Medium screens: core links + hamburger for extras */}
          <nav className="hidden md:flex lg:hidden items-center gap-4">
            {coreLinks.map(l => (
              <Link key={l.href} href={l.href} prefetch={null}
                className={`text-sm transition-colors duration-200 ${
                  l.highlight
                    ? "text-gold font-medium hover:text-gold-light"
                    : "text-white/70 hover:text-gold"
                }`}>
                {l.label}
              </Link>
            ))}
            {/* Hamburger for extra links */}
            <button
              onClick={() => setOpen(!open)}
              className="text-white/50 hover:text-gold transition-colors p-1"
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>
          </nav>

          {/* Mobile hamburger — visible below md */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Cart icon mobile */}
            <button onClick={() => setCartOpen(true)} className="relative text-white/60" aria-label="Shopping cart">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-ink text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
            <LanguageSwitch />
            <button onClick={() => setOpen(!open)} className="text-white/70" aria-label={open ? "Close menu" : "Open menu"}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Right section — hidden on mobile, visible on md+ */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart icon */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative text-white/60 hover:text-gold transition-colors hidden sm:block"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-ink text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            {/* Language Switch */}
            <LanguageSwitch />

            {/* Auth section */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
            ) : user ? (
              <div ref={menuRef} className="relative flex items-center gap-2">
                {/* Stardust Balance — left of avatar */}
                <Suspense fallback={null}>
                  <StardustBalance />
                </Suspense>

                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm text-white/80 hover:text-gold transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                    <User size={14} className="text-gold" />
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">{user.display_name || user.email}</span>
                  <ChevronDown size={14} className={`transition-transform hidden sm:inline ${menuOpen ? "rotate-180" : ""}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/[0.06] p-2 flex flex-col gap-1 z-50" style={{ background: "linear-gradient(135deg, #060E24, #030918)" }}>
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-white/80 text-sm font-medium truncate">{user.display_name || user.email}</p>
                      <p className="text-white/40 text-xs truncate">{user.email}</p>
                      <div className="mt-1">
                        <MembershipBadge tier={getUserTier(user)} size="sm" />
                      </div>
                      {user.shop_coupon_balance > 0 && (
                        <p className="text-gold/60 text-[10px] mt-0.5">
                          {t("coupon.balance")}: {formatCouponBalance(user.shop_coupon_balance, region)}
                        </p>
                      )}
                    </div>
                    <Link
                      href={localeHref("/dashboard")}
                      onClick={() => setMenuOpen(false)}
                      className="px-3 py-2 text-sm text-white/60 hover:text-gold hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {t("nav.dashboard")}
                    </Link>
                    <Link
                      href={localeHref("/divination")}
                      onClick={() => setMenuOpen(false)}
                      className="px-3 py-2 text-sm text-white/60 hover:text-gold hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {t("nav.divination")}
                    </Link>
                    <Link
                      href={localeHref("/am16")}
                      onClick={() => setMenuOpen(false)}
                      className="px-3 py-2 text-sm text-white/60 hover:text-gold hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {t("nav.am16")}
                    </Link>
                    <Link
                      href={localeHref("/readings")}
                      onClick={() => setMenuOpen(false)}
                      className="px-3 py-2 text-sm text-white/60 hover:text-gold hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {t("nav.myReports")}
                    </Link>
                    <Link
                      href={localeHref("/account")}
                      onClick={() => setMenuOpen(false)}
                      className="px-3 py-2 text-sm text-white/60 hover:text-gold hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {t("nav.account")}
                    </Link>
                    <Link
                      href={localeHref("/referral")}
                      onClick={() => setMenuOpen(false)}
                      className="px-3 py-2 text-sm text-white/60 hover:text-gold hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {t("nav.referral")}
                    </Link>
                    <button
                      onClick={() => { setCartOpen(true); setMenuOpen(false) }}
                      className="px-3 py-2 text-sm text-white/60 hover:text-gold hover:bg-white/5 rounded-lg transition-colors text-left"
                    >
                      {t("nav.cart")} {itemCount > 0 && `(${itemCount})`}
                    </button>
                    <button
                      onClick={() => { logout(); setMenuOpen(false) }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <LogOut size={14} /> {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href={localeHref("/login")} className="text-sm text-white/60 hover:text-gold transition-colors">
                  {t("nav.login")}
                </Link>
                <Link href={localeHref("/register")} className="btn-gold text-sm py-2 px-6">
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile & Medium hamburger dropdown — visible below lg */}
        {open && (
          <div className="lg:hidden bg-[#020617] border-t border-white/[0.06] px-4 py-3 flex flex-col gap-0.5 max-h-[80vh] overflow-y-auto">
            {coreLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`py-3.5 px-2 rounded-lg ${l.highlight ? "text-gold font-medium" : "text-white/80 hover:text-gold hover:bg-white/5"}`}>
                {l.label}
              </Link>
            ))}
            <div className="border-t border-white/10 my-1.5" />
            {extraLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="text-white/80 hover:text-gold py-3.5 px-2 rounded-lg hover:bg-white/5">
                {l.label}
              </Link>
            ))}
            <div className="border-t border-white/10 my-1.5" />
            {/* Auth section for mobile */}
            {user ? (
              <>
                <div className="flex items-center gap-2.5 py-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                    <User size={14} className="text-gold" />
                  </div>
                  <span className="text-white/80 text-sm truncate flex-1">{user.display_name || user.email}</span>
                  <MembershipBadge tier={getUserTier(user)} size="sm" className="ml-auto" />
                </div>
                <Link href={localeHref("/dashboard")} onClick={() => setOpen(false)}
                  className="text-white/60 hover:text-gold py-3 pl-6 text-sm rounded-lg hover:bg-white/5">
                  {t("nav.dashboard")}
                </Link>
                <Link href={localeHref("/readings")} onClick={() => setOpen(false)}
                  className="text-white/60 hover:text-gold py-3 pl-6 text-sm rounded-lg hover:bg-white/5">
                  {t("nav.myReports")}
                </Link>
                <Link href={localeHref("/account")} onClick={() => setOpen(false)}
                  className="text-white/60 hover:text-gold py-3 pl-6 text-sm rounded-lg hover:bg-white/5">
                  {t("nav.account")}
                </Link>
                <button
                  onClick={() => { logout(); setOpen(false) }}
                  className="flex items-center gap-2 text-white/50 hover:text-red-400 py-3.5 px-2 text-sm text-left rounded-lg hover:bg-white/5"
                >
                  <LogOut size={14} /> {t("nav.logout")}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 py-3 px-2">
                <Link href={localeHref("/login")} onClick={() => setOpen(false)}
                  className="text-sm text-white/60 hover:text-gold transition-colors py-2 px-4">
                  {t("nav.login")}
                </Link>
                <Link href={localeHref("/register")} onClick={() => setOpen(false)}
                  className="btn-gold text-sm py-2.5 px-6 flex-1 text-center">
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <Suspense fallback={null}>
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </Suspense>
    </>
  )
}
