import * as XLSX from 'xlsx'

export function exportReportToExcel(report: any, period: string) {
  const wb = XLSX.utils.book_new()

  // Onglet 1 : Résumé
  const summaryData = [
    ['RK MARKET - RAPPORT'],
    ['Période', period],
    ['Du', new Date(report.start).toLocaleDateString('fr-FR')],
    ['Au', new Date(report.end).toLocaleDateString('fr-FR')],
    [],
    ['MÉTRIQUES'],
    ["Chiffre d'affaires (Ar)", report.total],
    ['Nombre de commandes', report.ordersCount],
    ['Produits vendus', report.itemsCount],
    ['Panier moyen (Ar)', report.averageOrder],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
  ws1['!cols'] = [{ wch: 30 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Résumé')

  // Onglet 2 : Ventes par catégorie
  const catData = [
    ['Catégorie', 'Quantité', 'Total (Ar)'],
    ...report.byCategory.map((c: any) => [c.category, c.count, c.total]),
    [],
    ['TOTAL', report.itemsCount, report.total],
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(catData)
  ws2['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Par catégorie')

  // Onglet 3 : Commandes
  const ordersData = [
    ['N° commande', 'Client', 'Date', 'Paiement', 'Total (Ar)'],
    ...report.orders.map((o: any) => [
      o.id,
      o.userName,
      new Date(o.createdAt).toLocaleString('fr-FR'),
      o.paymentMethod,
      o.total,
    ]),
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(ordersData)
  ws3['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 22 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, ws3, 'Commandes')

  const filename = `rk-market-rapport-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, filename)
}

export function printReport(report: any, period: string) {
  const periodLabel: Record<string, string> = {
    day: 'Journalier',
    week: 'Hebdomadaire',
    month: 'Mensuel',
    semester: 'Semestriel',
    year: 'Annuel',
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rapport RK Market - ${periodLabel[period]}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; padding: 40px; color: #111; }
        .header { background: #16a34a; color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
        .header h1 { font-size: 28px; margin-bottom: 6px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .metric { background: #f9fafb; padding: 16px; border-radius: 8px; }
        .metric .label { font-size: 11px; color: #6b7280; text-transform: uppercase; margin-bottom: 6px; }
        .metric .value { font-size: 20px; font-weight: bold; }
        .metric .value.green { color: #16a34a; }
        h2 { font-size: 18px; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #16a34a; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #f3f4f6; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .text-right { text-align: right; }
        tfoot td { font-weight: bold; background: #f9fafb; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🛒 RK MARKET</h1>
        <p>Rapport ${periodLabel[period]} — Du ${new Date(report.start).toLocaleDateString('fr-FR')} au ${new Date(report.end).toLocaleDateString('fr-FR')}</p>
      </div>
      <div class="metrics">
        <div class="metric"><div class="label">Chiffre d'affaires</div><div class="value green">${report.total.toLocaleString('fr-FR')} Ar</div></div>
        <div class="metric"><div class="label">Commandes</div><div class="value">${report.ordersCount}</div></div>
        <div class="metric"><div class="label">Produits vendus</div><div class="value">${report.itemsCount}</div></div>
        <div class="metric"><div class="label">Panier moyen</div><div class="value">${report.averageOrder.toLocaleString('fr-FR')} Ar</div></div>
      </div>
      <h2>Ventes par catégorie</h2>
      <table>
        <thead><tr><th>Catégorie</th><th class="text-right">Quantité</th><th class="text-right">Total</th></tr></thead>
        <tbody>
          ${report.byCategory.map((c: any) => `<tr><td>${c.category}</td><td class="text-right">${c.count}</td><td class="text-right">${c.total.toLocaleString('fr-FR')} Ar</td></tr>`).join('')}
        </tbody>
        <tfoot><tr><td>Total</td><td class="text-right">${report.itemsCount}</td><td class="text-right">${report.total.toLocaleString('fr-FR')} Ar</td></tr></tfoot>
      </table>
      <h2>Détail des commandes (${report.orders.length})</h2>
      <table>
        <thead><tr><th>N° commande</th><th>Client</th><th>Date</th><th>Paiement</th><th class="text-right">Total</th></tr></thead>
        <tbody>
          ${report.orders.map((o: any) => `<tr><td style="font-family: monospace; font-size: 11px;">${o.id.slice(0, 12)}...</td><td>${o.userName}</td><td>${new Date(o.createdAt).toLocaleDateString('fr-FR')}</td><td>${o.paymentMethod}</td><td class="text-right">${o.total.toLocaleString('fr-FR')} Ar</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="footer">Document généré automatiquement par RK Market — ${new Date().toLocaleString('fr-FR')}</div>
      <script>window.onload = () => { setTimeout(() => window.print(), 300); }</script>
    </body>
    </html>
  `

  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
  }
}