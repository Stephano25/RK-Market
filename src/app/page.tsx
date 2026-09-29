import Link from 'next/link'

export default function Home() {
  const categories = [
    { name: 'PPN', icon: '🌾', desc: 'Produits de première nécessité' },
    { name: 'Électroménager', icon: '🔌', desc: 'Appareils pour la maison' },
    { name: 'Produits de beauté', icon: '💄', desc: 'Soins et cosmétiques' },
    { name: 'Produits laitiers', icon: '🥛', desc: 'Lait, fromage, yaourt' },
    { name: 'Boissons gazeuses', icon: '🥤', desc: 'Sodas et boissons fraîches' },
  ]

  return (
    <div>
      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold mb-4">Bienvenue sur RK Market 🛒</h1>
          <p className="text-xl mb-8 opacity-90">
            Votre supermarché en ligne — Livraison rapide et paiement sécurisé
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Découvrir nos produits
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Nos catégories</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={`/products?category=${encodeURIComponent(c.name)}`}
              className="bg-white p-6 rounded-xl shadow text-center hover:shadow-xl hover:-translate-y-1 transition"
            >
              <div className="text-5xl mb-3">{c.icon}</div>
              <h3 className="font-bold text-sm">{c.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
        {[
          { icon: '🚚', title: 'Livraison rapide', desc: 'Expédition sous 24h' },
          { icon: '🔒', title: 'Paiement sécurisé', desc: 'Via Stripe' },
          { icon: '💬', title: 'Support 24/7', desc: 'Toujours à votre écoute' },
        ].map((f) => (
          <div key={f.title} className="bg-white p-6 rounded-xl shadow text-center">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-lg">{f.title}</h3>
            <p className="text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}