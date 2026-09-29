import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const u = getCurrentUser()
  if (!u || u.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const body = await req.json()
  const product = await prisma.product.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json({ product })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const u = getCurrentUser()
  if (!u || u.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}