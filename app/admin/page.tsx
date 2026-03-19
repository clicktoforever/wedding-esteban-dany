import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/admin/BottomNav'
import WeddingCountdown from '@/components/admin/WeddingCountdown'
import AdminHeader from '@/components/admin/AdminHeader'
import type { Database } from '@/lib/database.types'

export const revalidate = 10 // ISR with 10 second revalidation

export default async function AdminPage() {
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
    redirect('/admin/login')
  }

  // Fetch stats using the helper function
  const { data: stats } = await supabase.rpc('get_wedding_stats')

  // Fetch all guests with their passes
  const { data: guests, error } = await supabase
    .from('guests')
    .select(`
      *,
      passes (*)
    `)
    .order('name', { ascending: true })

  type GuestWithPasses = Database['public']['Tables']['guests']['Row'] & {
    passes: Database['public']['Tables']['passes']['Row'][]
    notified_whatsapp: boolean
  }

  if (error) {
    console.error('Error fetching guests:', error)
  }

  // Fetch gifts stats
  const { data: gifts } = await supabase
    .from('gifts')
    .select('*')
    .order('status', { ascending: true })

  // Fetch gift transactions - count pending receipts
  const { data: transactions } = await supabase
    .from('gift_transactions')
    .select('*, gifts(*)')
    .order('created_at', { ascending: false })

  type TransactionWithGift = Database['public']['Tables']['gift_transactions']['Row'] & {
    gifts: Database['public']['Tables']['gifts']['Row'] | null
  }

  // Fetch wedding date from configurations
  const { data: weddingDateConfig } = await supabase
    .from('configurations')
    .select('value')
    .eq('key', 'wedding_date')
    .single()

  const weddingDate = weddingDateConfig?.value || '2026-04-11T18:00:00'

  const statsData = stats?.[0] || {
    total_guests: 0,
    total_passes: 0,
    confirmed_passes: 0,
    declined_passes: 0,
    pending_passes: 0,
    total_gifts: 0,
    completed_gifts: 0,
    total_contributions: 0,
    approved_contributions: 0,
  }

  // Calculate pending receipts (transactions in manual review)
  const pendingReceipts = (transactions as TransactionWithGift[])?.filter(
    t => t.status === 'MANUAL_REVIEW'
  ).length || 0

  // Calculate guests not notified via WhatsApp
  const guestsNotNotified = (guests as GuestWithPasses[])?.filter(
    g => !g.notified_whatsapp
  ).length || 0

  // Calculate total money raised in USD
  const totalUSD = (transactions as TransactionWithGift[])
    ?.filter(t => t.status === 'APPROVED')
    .reduce((sum, t) => sum + (t.amount || 0), 0) || 0

  // Calculate total in MXN (assuming 1:20 rate)
  const totalMXN = totalUSD * 20

  // Confirmation percentage
  const confirmationPercentage = statsData.total_passes > 0
    ? Math.round((statsData.confirmed_passes / statsData.total_passes) * 100)
    : 0

  return (
    <div className="bg-[#F9F7F2] text-text-main-light font-sans transition-colors duration-300 antialiased pb-24">
      {/* Header with Settings */}
      <AdminHeader />

      {/* Main Content */}
      <main className="pt-24 px-6 pb-24 max-w-md mx-auto md:max-w-4xl">
        {/* Countdown Section */}
        <WeddingCountdown targetDate={weddingDate} />

        {/* Acciones Urgentes */}
        <section className="space-y-3 mb-8">
          <h2 className="font-display text-lg font-bold text-text-main-light px-1">
            Acciones Urgentes
          </h2>
          <div className="bg-primary/5 p-1 rounded-2xl border border-primary/10">
            <div className="space-y-3 p-2">
              {/* Comprobantes por Revisar */}
              <Link href="/admin/transactions" className="block w-full bg-surface-light p-4 rounded-xl shadow-sm border border-stone-100 flex items-center justify-between transition-colors duration-300 group active:scale-[0.99] transform">
                <div className="flex items-center space-x-4">
                  <div className="bg-highlight-lavender/30 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-stone-700">
                    <span className="material-symbols-outlined text-xl">fact_check</span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-semibold text-text-main-light block">
                      Comprobantes por Revisar
                    </span>
                    <span className="text-xs text-text-muted-light block mt-0.5">
                      Validar pagos recientes
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-highlight-lavender text-stone-800 text-sm font-bold px-3 py-1.5 rounded-full flex items-center justify-center gap-1.5 min-w-[32px]">
                    {pendingReceipts}
                    <span className="material-icons-round text-stone-500 text-base">
                      schedule
                    </span>
                  </span>
                  <span className="material-icons-round text-stone-300 group-hover:text-primary transition-colors text-lg">
                    chevron_right
                  </span>
                </div>
              </Link>

              {/* Invitados sin Enviar */}
              <Link
                href="/admin/guests?filter=not-sent"
                className="block w-full bg-surface-light p-4 rounded-xl shadow-sm border border-stone-100 flex items-center justify-between transition-colors duration-300 group active:scale-[0.99] transform"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-highlight-lavender/30 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-stone-700">
                    <span className="material-symbols-outlined text-xl">send</span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-semibold text-text-main-light block">
                      Invitados sin Enviar
                    </span>
                    <span className="text-xs text-text-muted-light block mt-0.5">
                      Enviar invitaciones digitales
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-highlight-lavender text-stone-800 text-sm font-bold px-3 py-1.5 rounded-full flex items-center justify-center gap-1.5 min-w-[32px]">
                    {guestsNotNotified}
                    <span className="material-icons-round text-stone-500 text-base">
                      schedule
                    </span>
                  </span>
                  <span className="material-icons-round text-stone-300 group-hover:text-primary transition-colors text-lg">
                    chevron_right
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Resumen General */}
        <section className="space-y-4 mb-8">
          <h2 className="font-display text-lg font-bold text-text-main-light px-1 mb-2">
            Resumen General
          </h2>

          {/* Total Recaudado USD */}
          <div className="bg-surface-light p-4 rounded-xl shadow-card border border-stone-100 flex items-center space-x-4 transition-colors duration-300">
            <div className="bg-stone-100 h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="font-display text-2xl text-stone-600">$</span>
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-text-muted-light block mb-1">
                Total Recaudado (USD)
              </span>
              <span className="text-3xl font-display font-bold text-primary block">
                ${totalUSD.toFixed(2)}
              </span>
              <span className="text-xs text-text-muted-light mt-1 block">
                Equivalente MXN: ${totalMXN.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Total en MXN */}
          <div className="bg-surface-light p-4 rounded-xl shadow-card border border-stone-100 flex items-center space-x-4 transition-colors duration-300">
            <div className="bg-red-50 h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-icons-round text-red-300">currency_exchange</span>
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-text-muted-light block mb-1">
                Total en MXN (1:20)
              </span>
              <span className="text-3xl font-display font-bold text-primary block">
                ${totalMXN.toLocaleString()}
              </span>
              <span className="text-xs text-text-muted-light mt-1 block">
                USD base: ${totalUSD.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Confirmación de asistencia */}
          <div className="bg-surface-light p-4 rounded-xl shadow-card border border-stone-100 flex items-center space-x-4 transition-colors duration-300">
            <div className="relative h-16 w-16 flex-shrink-0">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-stone-200"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="text-primary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${confirmationPercentage}, 100`}
                  strokeLinecap="round"
                  strokeWidth="4"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-stone-700">
                  {confirmationPercentage}%
                </span>
              </div>
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-text-muted-light block mb-1">
                Confirmación de asistencia
              </span>
              <span className="text-base font-semibold text-text-main-light block">
                {statsData.confirmed_passes} confirmados de {statsData.total_passes}
              </span>
              <span className="text-xs text-text-muted-light block">
                Total invitados: {statsData.total_guests}
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Admin Dashboard - Carlos & Dany',
    description: 'Panel administrativo de la boda',
    robots: 'noindex, nofollow',
  }
}
