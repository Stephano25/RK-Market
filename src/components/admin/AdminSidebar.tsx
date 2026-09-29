'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

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
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Persiste l'état collapsed dans localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved === 'true') setCollapsed(true)
         document.body.classList.add('sidebar-collapsed')
  }, [])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('admin-sidebar-collapsed', String(next))
    document.body.classList.toggle('sidebar-collapsed', next)
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = isMobile ? false : collapsed

    return (
      <>
        {/* Header avec logo + toggle */}
        <div
          className={`p-4 border-b border-green-700 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!isCollapsed && (
            <Link href="/admin" className="text-white overflow-hidden">
              <h1 className="text-xl font-bold flex items-center gap-2 whitespace-nowrap">
                🛒 RK Market
              </h1>
              <p className="text-green-200 text-xs mt-1">Administration</p>
            </Link>
          )}

          {isCollapsed && (
            <Link href="/admin" className="text-2xl">
              🛒
            </Link>
          )}

          {/* Bouton rétracter (desktop uniquement) */}
          {!isMobile && (
            <button
              onClick={toggleCollapsed}
              className="text-white hover:bg-green-600 p-1.5 rounded transition"
              title={collapsed ? 'Déplier' : 'Replier'}
            >
              {collapsed ? '▶' : '◀'}
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {MENU.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setMobileOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  active
                    ? 'bg-white text-green-700 font-semibold shadow'
                    : 'text-green-100 hover:bg-green-700'
                }`}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-green-700 space-y-1">
          <Link
            href="/"
            title={isCollapsed ? 'Voir le site' : undefined}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-green-100 hover:bg-green-700 transition ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <span className="text-xl flex-shrink-0">🏠</span>
            {!isCollapsed && <span className="whitespace-nowrap">Voir le site</span>}
          </Link>

          <button
            onClick={logout}
            title={isCollapsed ? 'Déconnexion' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white bg-red-600 hover:bg-red-700 transition font-semibold ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <span className="text-xl flex-shrink-0">🚪</span>
            {!isCollapsed && <span className="whitespace-nowrap">Déconnexion</span>}
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Header mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-green-700 text-white p-4 flex items-center justify-between">
        <span className="font-bold">👑 Admin RK Market</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-2xl">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar desktop : FIXE à gauche, largeur variable */}
      <aside
        className={`hidden lg:flex flex-col bg-green-700 text-white fixed top-0 left-0 bottom-0 z-40 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
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
            <SidebarContent isMobile />
          </aside>
        </div>
      )}
    </>
  )
}