import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminDashboard from '@/components/admin/AdminDashboard'

export const revalidate = 10 // ISR with 10 second revalidation

export default async function AdminPage() {
  const supabase = await createClient()

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
    .order('is_purchased', { ascending: false })

  const statsData = stats?.[0] || {
    total_guests: 0,
    total_passes: 0,
    confirmed_passes: 0,
    declined_passes: 0,
    pending_passes: 0,
    total_gifts: 0,
    purchased_gifts: 0,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif text-wedding-forest">Dashboard Admin</h1>
              <p className="text-sm text-gray-500">Esteban & Dany</p>
            </div>
            <Link href="/" className="text-sm tracking-wider uppercase text-gray-600 hover:text-wedding-forest transition-colors">
              ← Volver al Inicio
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Stats Section */}
      <section className="bg-gradient-soft py-12">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 text-center border border-wedding-sage/20">
              <div className="text-4xl font-serif text-wedding-forest mb-2">
                {statsData.total_guests}
              </div>
              <div className="text-xs tracking-widest uppercase text-gray-500">
                Invitados
              </div>
            </div>
            
            <div className="bg-white p-6 text-center border border-wedding-sage/20">
              <div className="text-4xl font-serif text-wedding-forest mb-2">
                {statsData.total_passes}
              </div>
              <div className="text-xs tracking-widest uppercase text-gray-500">
                Pases Totales
              </div>
            </div>
            
            <div className="bg-white p-6 text-center border border-wedding-sage/20">
              <div className="text-4xl font-serif text-wedding-sage mb-2">
                {statsData.confirmed_passes}
              </div>
              <div className="text-xs tracking-widest uppercase text-gray-500">
                Confirmados
              </div>
            </div>
            
            <div className="bg-white p-6 text-center border border-wedding-sage/20">
              <div className="text-4xl font-serif text-gray-400 mb-2">
                {statsData.declined_passes}
              </div>
              <div className="text-xs tracking-widest uppercase text-gray-500">
                Declinados
              </div>
            </div>
            
            <div className="bg-white p-6 text-center border border-wedding-sage/20">
              <div className="text-4xl font-serif text-amber-600 mb-2">
                {statsData.pending_passes}
              </div>
              <div className="text-xs tracking-widest uppercase text-gray-500">
                Pendientes
              </div>
            </div>
            
            <div className="bg-white p-6 text-center border border-wedding-sage/20">
              <div className="text-4xl font-serif text-wedding-purple mb-2">
                {statsData.purchased_gifts}
              </div>
              <div className="text-xs tracking-widest uppercase text-gray-500">
                Regalos
              </div>
            </div>
            
            <div className="bg-white p-6 text-center border border-wedding-sage/20 col-span-2">
              <div className="text-4xl font-serif text-wedding-forest mb-2">
                {((statsData.confirmed_passes / statsData.total_passes) * 100 || 0).toFixed(0)}%
              </div>
              <div className="text-xs tracking-widest uppercase text-gray-500">
                Tasa de Confirmación
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-12">
        <div className="container-custom">
          <AdminDashboard
            stats={statsData}
            guests={guests || []}
            gifts={gifts || []}
          />
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
