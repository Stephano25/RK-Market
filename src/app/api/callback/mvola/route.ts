import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('MVola callback:', body)

    const { transactionId, status, metadata } = body

    if (!metadata?.orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: metadata.orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Idempotence : ne pas retraiter si déjà payé
    if (order.status === 'PAID') {
      return NextResponse.json({ received: true })
    }

    if (status === 'success' || status === 'completed') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentRef: transactionId,
        },
      })
      console.log(`✅ Commande ${order.id} payée via MVola`)
    } else if (status === 'failed' || status === 'cancelled') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      })
      console.log(`❌ Commande ${order.id} échouée`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('MVola callback error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}