'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { useCart } from '../../../context/CartContext'

function SuccessContent() {
  const params = useSearchParams()
  const orderId = params.get('order_id')
  const { refresh } = useCart()

  useEffect(() => {
    refresh()
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold mb-4">Merci pour votre commande !</h1>
      <p className="text-gray-600 mb-2">
        Votre paiement a été traité avec succès. RK Market vous remercie.
      </p>
      {orderId && (
        <p className="text-sm text-gray-500 mb-8">
          Numéro de commande : <strong>{orderId}</strong>
        </p>
      )}
      <Link
        href="/products"
        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
      >
        Continuer mes achats
      </Link>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}