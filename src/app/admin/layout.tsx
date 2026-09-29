import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Admin - RK Market',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = getCurrentUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  if (user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden p-6 lg:p-8 lg:ml-64">
        {children}
      </main>
    </div>
  )
}