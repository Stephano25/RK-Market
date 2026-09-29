import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Orange Money callback:', body)

    const { status, order_id, txnid, metadata } = body

    const orderId = metadata?.orderId || order_id
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

    if (status === 'SUCCESS') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentRef: txnid,
        },
      })
      console.log(`✅ Commande ${order.id} payée via Orange Money`)
    } else if (status === 'FAILED' || status === 'EXPIRED') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Orange callback error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}