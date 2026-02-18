import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GuestsListClient from './GuestsListClient'

export const revalidate = 0 // Always fetch fresh data

export default async function GuestsPage() {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/admin/login')
  }

  // Verificar si es admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!adminUser) {
    redirect('/')
  }

  // Fetch all guests with their passes
  const { data: guests, error } = await supabase
    .from('guests')
    .select(`
      *,
      passes (*)
    `)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching guests:', error)
  }

  return <GuestsListClient initialGuests={guests || []} />
}

export async function generateMetadata() {
  return {
    title: 'Lista de Invitados - Admin',
    description: 'Gestión de invitados',
    robots: 'noindex, nofollow',
  }
}
