import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      // Un utilisateur ne voit que ses commandes, un admin voit tout
      ...(user.role === 'ADMIN' ? {} : { userId: user.userId }),
    },
    include: {
      items: { include: { product: true } },
      user: { select: { name: true, email: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  return NextResponse.json({ order })
}