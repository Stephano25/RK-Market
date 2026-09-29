import type { Metadata } from 'next'
import './globals.css'
import Navbar from '../components/NavBar'
import { CartProvider } from '../context/CartContext'

export const metadata: Metadata = {
  title: 'RK Market - Votre supermarché en ligne',
  description: 'Produits PPN, électroménager, beauté, produits laitiers et boissons gazeuses',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}