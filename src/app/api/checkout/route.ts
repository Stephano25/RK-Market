import { NextRequest, NextResponse } from 'next/server'
import { PaidMada, Provider } from 'paidmada'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Initialisation PaidMada (mode Mock activé)
const paidmada = new PaidMada({
  sandbox: true,
  callbackBaseUrl: process.env.CALLBACK_BASE_URL!,
  mockMode: {
    enabled: process.env.MOCK_MODE === 'true',
    successRate: parseInt(process.env.MOCK_SUCCESS_RATE || '90'),
    responseDelay: parseInt(process.env.MOCK_RESPONSE_DELAY || '0'),
    simulatePending: process.env.MOCK_SIMULATE_PENDING === 'true',
  },
  // Ces configs sont vides en mode mock, mais requises par le SDK
  mvola: {
    consumerKey: process.env.MVOLA_CONSUMER_KEY || 'mock',
    consumerSecret: process.env.MVOLA_CONSUMER_SECRET || 'mock',
    merchantNumber: process.env.MVOLA_MERCHANT_NUMBER || '0343500003',
    partnerName: 'RK Market',
  },
  orangeMoney: {
    clientId: process.env.ORANGE_CLIENT_ID || 'mock',
    clientSecret: process.env.ORANGE_CLIENT_SECRET || 'mock',
    merchantKey: process.env.ORANGE_MERCHANT_KEY || 'mock',
  },
  airtelMoney: {
    clientId: process.env.AIRTEL_CLIENT_ID || 'mock',
    clientSecret: process.env.AIRTEL_CLIENT_SECRET || 'mock',
    publicKey: process.env.AIRTEL_PUBLIC_KEY || 'mock',
  },
})

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const {
      shippingName,
      shippingAddr,
      shippingCity,
      shippingZip,
      paymentPhone,
    } = await req.json()

    // Validation du numéro de téléphone
    if (!paymentPhone || !/^(034|038|032|037|033)\d{7}$/.test(paymentPhone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Numéro de téléphone invalide. Utilisez un numéro MVola (034, 038), Orange (032, 037) ou Airtel (033).' },
        { status: 400 }
      )
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.userId },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    // Créer la commande en base
    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        total,
        shippingName,
        shippingAddr,
        shippingCity,
        shippingZip,
        paymentPhone: paymentPhone.replace(/\s/g, ''),
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    })

    // Initier le paiement avec PaidMada (auto-détection du provider)
    const result = await paidmada.smartPay(paymentPhone.replace(/\s/g, ''), total, {
      description: `Commande RK Market #${order.id}`,
      metadata: {
        orderId: order.id,
        userId: user.userId,
      },
    })

    if (!result.success) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      })
      return NextResponse.json(
        { error: result.error || 'Erreur de paiement' },
        { status: 400 }
      )
    }

    // Sauvegarder la référence de transaction
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentRef: result.transactionId,
        paymentMethod: result.provider.toUpperCase(),
        status: result.status === 'success' ? 'PAID' : 'PENDING',
        paidAt: result.status === 'success' ? new Date() : null,
      },
    })

    // Vider le panier
    await prisma.cartItem.deleteMany({ where: { userId: user.userId } })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      transactionId: result.transactionId,
      provider: result.provider,
      status: result.status,
      message:
        result.status === 'pending'
          ? 'Consultez votre téléphone pour valider le paiement.'
          : 'Paiement effectué avec succès.',
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}