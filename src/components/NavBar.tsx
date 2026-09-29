'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Navbar() {
  const { count } = useCart()
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-green-600 flex items-center gap-2">
          🛒 RK Market
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/products" className="hover:text-green-600 font-medium">
            Produits
          </Link>

          <Link href="/cart" className="relative hover:text-green-600 font-medium">
            🛒 Panier
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">👤 {user.name}</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:underline"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" className="text-green-600 hover:underline">
                Connexion
              </Link>
              <Link
                href="/register"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}