"use client"
import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import type { Product } from "@/lib/api"
import { type Region } from "@/contexts/RegionContext"

export interface CartItem {
  product: Product
  quantity: number
}

/** Lightweight record persisted to localStorage (no long text fields) */
interface CartPersistedItem {
  productId: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  registerProducts: (products: Product[]) => void
  itemCount: number
  totalCny: number
  /** Total after member discount (88折) */
  totalWithDiscount: number
  isMember: boolean
  /** Get item price based on region */
  getItemPrice: (product: Product) => number
  /** Currency symbol based on region */
  symbol: string
  /** True while restoring products from API after page load */
  isLoading: boolean
}

const CartContext = createContext<CartState>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  registerProducts: () => {},
  itemCount: 0,
  totalCny: 0,
  totalWithDiscount: 0,
  isMember: false,
  getItemPrice: (p) => p.price_cny,
  symbol: "¥",
  isLoading: false,
})

const STORAGE_KEY = "alpha_mirror_cart"
const MEMBER_DISCOUNT = 0.88

/** Strip long text fields to reduce localStorage size */
function toPersisted(item: CartItem): CartPersistedItem {
  return { productId: item.product.id, quantity: item.quantity }
}

export function CartProvider({ children, isMember = false, region = "domestic" }: { children: ReactNode; isMember?: boolean; region?: Region }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  // In-memory product registry for restoring lightweight localStorage entries
  const [productMap, setProductMap] = useState<Map<string, Product>>(new Map())

  /** Register products from API responses so cart can restore lightweight entries */
  const registerProducts = useCallback((products: Product[]) => {
    setProductMap(prev => {
      const next = new Map(prev)
      for (const p of products) next.set(p.id, p)
      return next
    })
  }, [])

  // Load from localStorage (lightweight format only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return
      const parsed = JSON.parse(stored)
      // Migrate old format: if items have .product, it's the old full-object format
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].product) {
        const migrated: CartPersistedItem[] = (parsed as Array<{ product: { id: string }; quantity: number }>).map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
        }))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
        // Items will be resolved once products are registered
        return
      }
      // New lightweight format: store pending IDs until products are registered
      if (Array.isArray(parsed)) {
        const pendingIds = parsed.map((i: CartPersistedItem) => i.productId)
        setItems(parsed.map((i: CartPersistedItem) => ({
          product: { id: i.productId, name: "", price_cny: 0 } as Product,
          quantity: i.quantity,
        })))
        // Auto-fetch product data so cart works on any page (not just /shop)
        if (pendingIds.length > 0) {
          setIsLoading(true)
          import("@/lib/api").then(({ api }) => {
            Promise.all(
              pendingIds.map((id: string) =>
                api.get<Product>(`/api/products/${id}`).then(r => r.data).catch(() => null)
              )
            ).then(products => {
              const valid = products.filter(Boolean) as Product[]
              if (valid.length > 0) registerProducts(valid)
              setIsLoading(false)
            }).catch(() => setIsLoading(false))
          })
        }
      }
    } catch { /* ignore */ }
  }, [registerProducts])

  // Resolve placeholder items once products are registered
  useEffect(() => {
    if (productMap.size === 0) return
    setItems(prev => {
      let changed = false
      const resolved = prev.map(item => {
        if (item.product.name === "" && productMap.has(item.product.id)) {
          changed = true
          return { ...item, product: productMap.get(item.product.id)! }
        }
        return item
      })
      return changed ? resolved : prev
    })
  }, [productMap])

  // Save to localStorage (lightweight format — only productId + quantity)
  useEffect(() => {
    const persisted = items.map(toPersisted)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
  }, [items])

  const addItem = useCallback((product: Product, quantity = 1) => {
    // Also register the product for future restoration
    setProductMap(prev => {
      const next = new Map(prev)
      next.set(product.id, product)
      return next
    })
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { product, quantity }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId))
      return
    }
    setItems(prev => prev.map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    ))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const getItemPrice = useCallback((product: Product) => {
    if (region === "overseas" && product.price_usd) return product.price_usd
    return product.price_cny
  }, [region])

  const symbol = region === "overseas" ? "$" : "¥"

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalCny = items.reduce((sum, i) => sum + getItemPrice(i.product) * i.quantity, 0)
  const totalWithDiscount = isMember ? totalCny * MEMBER_DISCOUNT : totalCny

  // Memoize context value to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({
    items, addItem, removeItem, updateQuantity, clearCart, registerProducts,
    itemCount, totalCny, totalWithDiscount, isMember, getItemPrice, symbol, isLoading,
  }), [items, addItem, removeItem, updateQuantity, clearCart, registerProducts, itemCount, totalCny, totalWithDiscount, isMember, getItemPrice, symbol, isLoading])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
