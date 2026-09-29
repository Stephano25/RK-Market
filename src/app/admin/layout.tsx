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
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      {/* Le padding-left s'adapte via CSS global */}
      <main className="admin-content p-6 lg:p-8 pt-20 lg:pt-8 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}