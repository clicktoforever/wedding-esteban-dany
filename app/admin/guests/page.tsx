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

  // Fetch wedding date from configurations
  const { data: weddingDateConfig } = await supabase
    .from('configurations')
    .select('value')
    .eq('key', 'wedding_date')
    .single()

  // Fetch confirmation deadline from configurations
  const { data: deadlineConfig } = await supabase
    .from('configurations')
    .select('value')
    .eq('key', 'confirmation_deadline')
    .single()

  const weddingDateStr = weddingDateConfig?.value || '2026-04-11T18:00:00'
  const deadlineStr = deadlineConfig?.value || '2026-03-25T23:59:59'

  if (error) {
    console.error('Error fetching guests:', error)
  }

  return <GuestsListClient initialGuests={guests || []} weddingDate={weddingDateStr} confirmationDeadline={deadlineStr} />
}

export async function generateMetadata() {
  return {
    title: 'Lista de Invitados - Admin',
    description: 'Gestión de invitados',
    robots: 'noindex, nofollow',
  }
}
