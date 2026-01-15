import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'
import TransactionsPanel from '@/components/admin/TransactionsPanel'
import LogoutButton from '@/components/admin/LogoutButton'

export const revalidate = 10 // ISR with 10 second revalidation

export default async function AdminPage() {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/admin/login')
  }

  // Verificar si es admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (!adminUser) {
    redirect('/')
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

  if (error) {
    console.error('Error fetching guests:', error)
  }

  // Fetch gifts stats
  const { data: gifts } = await supabase
    .from('gifts')
    .select('*')
    .order('status', { ascending: true })

  // Fetch gift transactions
  const { data: transactions } = await supabase
    .from('gift_transactions')
    .select('*, gifts(*)')
    .order('created_at', { ascending: false })

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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-wedding-rose/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-wedding-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-serif text-wedding-forest tracking-wide">Dashboard Admin</h1>
                <p className="text-sm text-gray-500 tracking-wider">Esteban & Dany</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-wedding-sage/5 via-wedding-rose/5 to-wedding-purple/5 py-16">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <svg className="absolute top-10 left-10 w-32 h-32 text-wedding-rose opacity-5" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 20 L60 40 L80 45 L65 60 L68 80 L50 70 L32 80 L35 60 L20 45 L40 40 Z"/>
          </svg>
          <svg className="absolute bottom-10 right-10 w-40 h-40 text-wedding-purple opacity-5" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="45"/>
          </svg>
        </div>

        <div className="container-custom relative">
          {/* Decorative Divider */}
          <div className="flex items-center justify-center mb-12">
            <div className="h-px bg-wedding-forest/20 w-16"></div>
            <svg className="w-6 h-6 mx-4 text-wedding-rose" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8Z"/>
            </svg>
            <div className="h-px bg-wedding-forest/20 w-16"></div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-wedding-forest mb-4 tracking-wide">
              Estadísticas Generales
            </h2>
            <p className="text-gray-600 tracking-wide">
              Panel de control para gestionar invitados y regalos
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="group bg-white p-8 text-center border-2 border-wedding-sage/10 hover:border-wedding-sage/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-5xl font-serif text-wedding-forest mb-3 group-hover:scale-110 transition-transform">
                {statsData.total_guests}
              </div>
              <div className="text-xs tracking-[0.2em] uppercase text-gray-500 font-medium">
                Invitados
              </div>
            </div>
            
            <div className="group bg-white p-8 text-center border-2 border-wedding-rose/10 hover:border-wedding-rose/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-5xl font-serif text-wedding-rose mb-3 group-hover:scale-110 transition-transform">
                {statsData.total_passes}
              </div>
              <div className="text-xs tracking-[0.2em] uppercase text-gray-500 font-medium">
                Pases Totales
              </div>
            </div>
            
            <div className="group bg-white p-8 text-center border-2 border-wedding-sage/10 hover:border-wedding-sage/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-5xl font-serif text-wedding-sage mb-3 group-hover:scale-110 transition-transform">
                {statsData.confirmed_passes}
              </div>
              <div className="text-xs tracking-[0.2em] uppercase text-gray-500 font-medium">
                Confirmados
              </div>
            </div>
            
            <div className="group bg-white p-8 text-center border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-5xl font-serif text-gray-400 mb-3 group-hover:scale-110 transition-transform">
                {statsData.declined_passes}
              </div>
              <div className="text-xs tracking-[0.2em] uppercase text-gray-500 font-medium">
                Declinados
              </div>
            </div>
            
            <div className="group bg-white p-8 text-center border-2 border-amber-200 hover:border-amber-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-5xl font-serif text-amber-600 mb-3 group-hover:scale-110 transition-transform">
                {statsData.pending_passes}
              </div>
              <div className="text-xs tracking-[0.2em] uppercase text-gray-500 font-medium">
                Pendientes
              </div>
            </div>
            
            <div className="group bg-white p-8 text-center border-2 border-wedding-purple/10 hover:border-wedding-purple/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-5xl font-serif text-wedding-purple mb-3 group-hover:scale-110 transition-transform">
                {statsData.completed_gifts}
              </div>
              <div className="text-xs tracking-[0.2em] uppercase text-gray-500 font-medium">
                Regalos Completados
              </div>
            </div>
            
            <div className="group bg-white p-8 text-center border-2 border-wedding-forest/10 hover:border-wedding-forest/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 col-span-2">
              <div className="text-5xl font-serif text-wedding-forest mb-3 group-hover:scale-110 transition-transform">
                {((statsData.confirmed_passes / statsData.total_passes) * 100 || 0).toFixed(0)}%
              </div>
              <div className="text-xs tracking-[0.2em] uppercase text-gray-500 font-medium">
                Tasa de Confirmación
              </div>
            </div>
          </div>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center mt-16">
            <div className="h-px bg-wedding-forest/20 w-16"></div>
            <svg className="w-6 h-6 mx-4 text-wedding-rose" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8Z"/>
            </svg>
            <div className="h-px bg-wedding-forest/20 w-16"></div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <AdminDashboard
            stats={statsData}
            guests={guests || []}
            gifts={gifts || []}
          />
        </div>
      </section>

      {/* Transactions Section */}
      <section className="py-16 bg-gradient-to-b from-white to-wedding-sage/5">
        <div className="container-custom">
          <TransactionsPanel initialTransactions={transactions || []} />
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Admin Dashboard - Esteban & Dany',
    description: 'Panel administrativo de la boda',
    robots: 'noindex, nofollow',
  }
}
