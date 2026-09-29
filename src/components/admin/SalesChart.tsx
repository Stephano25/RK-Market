'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { formatAr } from '@/lib/format'

export default function SalesChart({
  data,
}: {
  data: { date: string; total: number }[]
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value: number) => formatAr(value)} />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#16a34a"
          strokeWidth={3}
          dot={{ r: 4, fill: '#16a34a' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}