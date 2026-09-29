'use client'

import { exportReportToExcel, printReport } from '@/lib/excel'

export default function ReportButtons({
  report,
  period,
}: {
  report: any
  period: string
}) {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => exportReportToExcel(report, period)}
        className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
      >
        📥 Télécharger Excel
      </button>
      <button
        onClick={() => printReport(report, period)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium"
      >
        🖨️ Imprimer
      </button>
    </div>
  )
}