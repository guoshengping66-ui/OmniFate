"use client"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Product } from "@/lib/api"

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  totalCny: number
  /** Total after member discount (88折) */
  totalWithDiscount: number
  isMember: boolean
}

const CartContext = createContext<CartState>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  totalCny: 0,
  totalWithDiscount: 0,
  isMember: false,
})

const STORAGE_KEY = "alpha_mirror_cart"
const MEMBER_DISCOUNT = 0.88

export function CartProvider({ children, isMember = false }: { children: ReactNode; isMember?: boolean }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product: Product, quantity = 1) => {
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

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalCny = items.reduce((sum, i) => sum + i.product.price_cny * i.quantity, 0)
  const totalWithDiscount = isMember ? totalCny * MEMBER_DISCOUNT : totalCny

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      itemCount, totalCny, totalWithDiscount, isMember,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
