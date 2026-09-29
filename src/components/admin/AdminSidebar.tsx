'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const MENU = [
  { href: '/admin', label: 'Tableau de bord', icon: '📊' },
  { href: '/admin/stocks', label: 'Stocks', icon: '📦' },
  { href: '/admin/ventes', label: 'Ventes', icon: '🛒' },
  { href: '/admin/rapports', label: 'Rapports', icon: '📈' },
  { href: '/admin/produits', label: 'Produits', icon: '🏷️' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-green-700">
        <Link href="/admin" className="text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🛒 RK Market
          </h1>
          <p className="text-green-200 text-xs mt-1">Administration</p>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {MENU.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                active
                  ? 'bg-white text-green-700 font-semibold shadow'
                  : 'text-green-100 hover:bg-green-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-green-700 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-green-100 hover:bg-green-700 transition"
        >
          <span className="text-xl">🏠</span>
          <span>Voir le site</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white bg-red-600 hover:bg-red-700 transition font-semibold"
        >
          <span className="text-xl">🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Header mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-green-700 text-white p-4 flex items-center justify-between">
        <span className="font-bold">👑 Admin RK Market</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-2xl">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar desktop : FIXE à gauche */}
      <aside className="hidden lg:flex flex-col w-64 bg-green-700 text-white fixed top-0 left-0 bottom-0 z-40">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-green-700 text-white flex flex-col pt-16">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}