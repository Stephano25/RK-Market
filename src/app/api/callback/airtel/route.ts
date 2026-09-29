import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Airtel Money callback:', body)

    const { transaction, metadata } = body
    const orderId = metadata?.orderId

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'PAID') {
      return NextResponse.json({ received: true })
    }

    if (transaction?.status === 'SUCCESS' || transaction?.status === 'TS') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentRef: transaction.id,
        },
      })
      console.log(`✅ Commande ${order.id} payée via Airtel Money`)
    } else if (transaction?.status === 'FAILED' || transaction?.status === 'TF') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Airtel callback error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}