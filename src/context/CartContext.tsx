'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Product {
  id: string
  name: string
  price: number
  image: string
}

interface CartItem {
  id: string
  quantity: number
  product: Product
}

interface CartContextType {
  items: CartItem[]
  count: number
  total: number
  loading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  refresh: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      } else {
        setItems([])
      }
    } catch {
      setItems([])
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const addToCart = async (productId: string, quantity = 1) => {
    setLoading(true)
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      })
      await refresh()
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity }),
    })
    await refresh()
  }

  const removeItem = async (itemId: string) => {
    await fetch(`/api/cart?itemId=${itemId}`, { method: 'DELETE' })
    await refresh()
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, count, total, loading, addToCart, updateQuantity, removeItem, refresh }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}