'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { formatAr } from '@/lib/format'
import ReceiptButtons from '@/components/ReceiptButtons'

function SuccessContent() {
  const params = useSearchParams()
  const orderId = params.get('order_id')
  const { refresh } = useCart()
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    refresh()
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setOrder(d?.order))
        .catch(() => {})
    }
  }, [orderId])

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold mb-4">Misaotra ! Commande confirmée</h1>
      <p className="text-gray-600 mb-6">
        Votre paiement a bien été reçu. RK Market vous remercie pour votre
        confiance.
      </p>

      {orderId && (
        <div className="bg-gray-50 p-5 rounded-lg inline-block mb-6 text-left">
          <p className="text-sm text-gray-600">
            N° de commande : <strong>{orderId}</strong>
          </p>
          {order && (
            <>
              <p className="text-sm text-gray-600 mt-1">
                Montant : <strong>{formatAr(order.total)}</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Paiement : <strong>{order.paymentMethod}</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Statut :{' '}
                <strong
                  className={
                    order.status === 'PAID'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }
                >
                  {order.status === 'PAID' ? 'Payé ✅' : 'En attente ⏳'}
                </strong>
              </p>
            </>
          )}
        </div>
      )}

      {order && (
        <div className="mb-8 flex justify-center">
          <ReceiptButtons order={order} />
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Link
          href="/products"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Continuer mes achats
        </Link>
        <Link
          href="/orders"
          className="inline-block bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
        >
          Mes commandes
        </Link>
      </div>
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