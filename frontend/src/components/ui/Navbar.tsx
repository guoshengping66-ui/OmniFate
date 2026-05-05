"use client"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Menu, X, Sparkles, User, LogOut, ChevronDown, Crown, ShoppingBag } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { CartDrawer } from "@/components/shop/CartDrawer"
import { LanguageSwitch } from "@/components/ui/LanguageSwitch"

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, loading, logout } = useAuth()
  const { itemCount } = useCart()
  const { t } = useLanguage()

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/reading/new", label: t("nav.reading") },
    { href: "/pricing", label: t("nav.pricing") },
    { href: "/shop", label: t("nav.shop") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/about", label: t("nav.about") },
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-ink/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
 <div className="w-9 h-9 rounded-full bg-gold-shine flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.5)] group-hover:scale-110 transition-transform">
              <Sparkles size={18} className="text-ink" />
            </div>
            <span className="font-serif font-bold text-lg text-gold">{t("app.name")}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className="text-sm text-white/70 hover:text-gold transition-colors duration-200">
                {l.label}
              </Link>
            ))}

            {/* Cart icon */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative text-white/60 hover:text-gold transition-colors"
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
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm text-white/80 hover:text-gold transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                    <User size={14} className="text-gold" />
                  </div>
                  <span className="max-w-[100px] truncate">{user.display_name || user.email}</span>
                  <ChevronDown size={14} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 card-glass p-2 flex flex-col gap-1 z-50">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-white/80 text-sm font-medium truncate">{user.display_name || user.email}</p>
                      <p className="text-white/40 text-xs truncate">{user.email}</p>
                      {user.is_premium && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-gold bg-gold/10 px-1.5 py-0.5 rounded-full">
                          <Crown size={10} /> {user.subscription_tier === "premium_yearly" ? t("membership.yearly") : user.subscription_tier === "premium_monthly" ? t("membership.monthly") : t("membership.trial")}
                        </span>
                      )}
                      {/* Coupon balance */}
                      {user.shop_coupon_balance > 0 && (
                        <p className="text-gold/60 text-[10px] mt-0.5">
                          {t("coupon.balance")}: ¥{user.shop_coupon_balance}
                        </p>
                      )}
                    </div>
                    <Link
                      href="/reading/new"
                      onClick={() => setMenuOpen(false)}
                      className="px-3 py-2 text-sm text-white/60 hover:text-gold hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {t("nav.reading")}
                    </Link>
                    <Link
                      href="/readings"
                      onClick={() => setMenuOpen(false)}
                      className="px-3 py-2 text-sm text-white/60 hover:text-gold hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {t("nav.myReports")}
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="px-3 py-2 text-sm text-white/60 hover:text-gold hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {t("nav.account")}
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
                <Link href="/login" className="text-sm text-white/60 hover:text-gold transition-colors">
                  {t("nav.login")}
                </Link>
                <Link href="/register" className="btn-gold text-sm py-2 px-6">
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Cart icon mobile */}
            <button onClick={() => setCartOpen(true)} className="relative text-white/60">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-ink text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
            {/* Language Switch mobile */}
            <LanguageSwitch />
            <button onClick={() => setOpen(!open)} className="text-white/70">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-ink/95 border-t border-white/10 px-4 py-4 flex flex-col gap-4">
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="text-white/80 hover:text-gold py-2">
                {l.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-1">
                    <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                      <User size={14} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">{user.display_name || user.email}</p>
                      <p className="text-white/40 text-xs">{user.email}</p>
                      {user.shop_coupon_balance > 0 && (
                        <p className="text-gold/60 text-[10px]">{t("coupon.short")}: ¥{user.shop_coupon_balance}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setOpen(false) }}
                    className="flex items-center gap-2 text-white/60 hover:text-red-400 py-2 w-full"
                  >
                    <LogOut size={14} /> {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2 rounded-full border border-white/20 text-white/60">
                    {t("nav.login")}
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}
                    className="flex-1 text-center btn-gold py-2">
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
