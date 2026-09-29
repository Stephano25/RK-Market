import { redirect } from 'next/navigation'
import { getCurrentUser } from './auth'

export async function requireAdmin() {
  const user = getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    redirect('/login?redirect=/admin')
  }
  return user
}

export async function requireAdminApi() {
  const user = getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return null
  }
  return user
}