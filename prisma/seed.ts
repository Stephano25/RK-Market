import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Nettoyage
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.product.deleteMany()

  const products = [
    // ===== PPN (Produits de Première Nécessité) =====
    {
      name: 'Riz Basmati 5kg',
      description: 'Riz basmati premium, grain long, sac de 5kg',
      price: 12.5,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
      stock: 100,
      category: 'PPN',
    },
    {
      name: 'Huile de Tournesol 1L',
      description: 'Huile de tournesol raffinée, bouteille 1L',
      price: 3.2,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
      stock: 150,
      category: 'PPN',
    },
    {
      name: 'Sucre Blanc 1kg',
      description: 'Sucre blanc cristallisé, paquet 1kg',
      price: 1.8,
      image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=800',
      stock: 200,
      category: 'PPN',
    },
    {
      name: 'Farine de Blé 1kg',
      description: 'Farine de blé tendre T55, paquet 1kg',
      price: 2.1,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
      stock: 180,
      category: 'PPN',
    },

    // ===== Électroménager =====
    {
      name: 'Réfrigérateur Samsung 300L',
      description: 'Réfrigérateur combiné, classe A+, 300L',
      price: 549.99,
      image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800',
      stock: 15,
      category: 'Électroménager',
    },
    {
      name: 'Machine à Laver LG 7kg',
      description: 'Lave-linge frontal, 1200 tours/min, 7kg',
      price: 429.99,
      image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800',
      stock: 12,
      category: 'Électroménager',
    },
    {
      name: 'Micro-ondes Moulinex 25L',
      description: 'Four micro-ondes 900W, 25L, grill',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800',
      stock: 20,
      category: 'Électroménager',
    },
    {
      name: 'Mixeur Blender Philips',
      description: 'Blender puissant 800W avec bol en verre',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800',
      stock: 30,
      category: 'Électroménager',
    },

    // ===== Produits de beauté =====
    {
      name: 'Crème Hydratante Nivea 200ml',
      description: 'Crème hydratante visage et corps, 200ml',
      price: 8.99,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
      stock: 80,
      category: 'Produits de beauté',
    },
    {
      name: 'Shampooing L\'Oréal 400ml',
      description: 'Shampooing réparateur cheveux abîmés',
      price: 6.5,
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800',
      stock: 90,
      category: 'Produits de beauté',
    },
    {
      name: 'Parfum Homme Dior Sauvage 100ml',
      description: 'Eau de toilette pour homme, 100ml',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
      stock: 25,
      category: 'Produits de beauté',
    },
    {
      name: 'Rouge à Lèvres MAC',
      description: 'Rouge à lèvres mat longue tenue',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800',
      stock: 50,
      category: 'Produits de beauté',
    },

    // ===== Produits laitiers =====
    {
      name: 'Lait Entier 1L',
      description: 'Lait entier UHT, brique 1L',
      price: 1.5,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
      stock: 200,
      category: 'Produits laitiers',
    },
    {
      name: 'Yaourt Nature x8',
      description: 'Pack de 8 yaourts nature',
      price: 3.8,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
      stock: 120,
      category: 'Produits laitiers',
    },
    {
      name: 'Fromage Gouda 500g',
      description: 'Fromage Gouda en tranches, 500g',
      price: 7.9,
      image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800',
      stock: 60,
      category: 'Produits laitiers',
    },
    {
      name: 'Beurre Doux 250g',
      description: 'Beurre doux plaquette 250g',
      price: 3.5,
      image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800',
      stock: 100,
      category: 'Produits laitiers',
    },

    // ===== Boissons gazeuses =====
    {
      name: 'Coca-Cola 1.5L',
      description: 'Bouteille Coca-Cola 1.5L',
      price: 1.8,
      image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800',
      stock: 300,
      category: 'Boissons gazeuses',
    },
    {
      name: 'Pepsi 1.5L',
      description: 'Bouteille Pepsi 1.5L',
      price: 1.7,
      image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=800',
      stock: 250,
      category: 'Boissons gazeuses',
    },
    {
      name: 'Fanta Orange 1.5L',
      description: 'Bouteille Fanta Orange 1.5L',
      price: 1.6,
      image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=800',
      stock: 200,
      category: 'Boissons gazeuses',
    },
    {
      name: 'Sprite 1.5L',
      description: 'Bouteille Sprite citron 1.5L',
      price: 1.6,
      image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=800',
      stock: 180,
      category: 'Boissons gazeuses',
    },
  ]

  for (const p of products) {
    await prisma.product.create({ data: p })
  }

  console.log(`✅ Seed terminé : ${products.length} produits ajoutés`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())