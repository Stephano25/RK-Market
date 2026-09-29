import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'

export async function GET() {
  const user = getCurrentUser()
  if (!user) return NextResponse.json({ items: [] }, { status: 401 })

  const items = await prisma.cartItem.findMany({
    where: { userId: user.userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { productId, quantity = 1 } = await req.json()

  const item = await prisma.cartItem.upsert({
    where: {
      userId_productId: { userId: user.userId, productId },
    },
    update: { quantity: { increment: quantity } },
    create: { userId: user.userId, productId, quantity },
    include: { product: true },
  })

  return NextResponse.json({ item })
}

export async function PATCH(req: NextRequest) {
  const user = getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { itemId, quantity } = await req.json()
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } })
    return NextResponse.json({ success: true })
  }

  const item = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  })
  return NextResponse.json({ item })
}

export async function DELETE(req: NextRequest) {
  const user = getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const itemId = searchParams.get('itemId')

  if (itemId) {
    await prisma.cartItem.delete({ where: { id: itemId } })
  } else {
    await prisma.cartItem.deleteMany({ where: { userId: user.userId } })
  }

  return NextResponse.json({ success: true })
}