import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import GuestConfirmation from '@/components/confirmation/GuestConfirmation'
import type { Database } from '@/lib/database.types'

type Guest = Database['public']['Tables']['guests']['Row']
type Pass = Database['public']['Tables']['passes']['Row']

interface GuestWithPasses extends Guest {
  passes: Pass[]
}

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function ConfirmPage(props: PageProps) {
  const params = await props.params
  const { token } = params
  
  const supabase = await createClient()

  // Fetch confirmation deadline from configurations
  const { data: deadlineConfig } = await supabase
    .from('configurations')
    .select('value')
    .eq('key', 'confirmation_deadline')
    .single()

  // Check if deadline has passed (server-side validation)
  if (deadlineConfig?.value) {
    const deadline = new Date(deadlineConfig.value)
    
    // Get current time in Ecuador timezone (GMT-5)
    const now = new Date()
    const ecuadorTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Guayaquil' }))
    
    if (ecuadorTime > deadline) {
      // Deadline has passed, redirect to closed page
      redirect('/confirm/closed')
    }
  }

  // Fetch guest by token with their passes
  const { data: guest, error } = await supabase
    .from('guests')
    .select(`
      *,
      passes (*)
    `)
    .eq('access_token', token)
    .single()

  if (error || !guest) {
    notFound()
  }

  const guestWithPasses = guest as unknown as GuestWithPasses

  // Get deadline date for display
  const deadlineDate = deadlineConfig?.value ? new Date(deadlineConfig.value) : null

  return (
    <div className="bg-background-light text-gray-800 font-body min-h-screen relative pb-32" style={{ backgroundImage: 'radial-gradient(#E6E6FA 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background-light/90 backdrop-blur-md border-b border-gray-100 px-6 lg:px-12 xl:px-20 py-4 flex justify-between items-center max-w-md lg:max-w-none mx-auto">
        <Link href="/" className="text-gray-500 hover:text-primary transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="text-center">
          <h1 className="font-display font-semibold text-xl tracking-wide text-primary">D &amp; E</h1>
        </div>
        <div className="w-6"></div>
      </nav>

      {/* Main Content */}
      <main className="max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto px-6 lg:px-12 xl:px-20 pt-6">
        <GuestConfirmation 
          guest={guestWithPasses}
          token={token}
          deadline={deadlineDate}
        />
      </main>

      {/* Decorative Blurs */}
      <div className="fixed top-20 right-0 -mr-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="fixed bottom-20 left-0 -ml-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
    </div>
  )
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params
  return {
    title: 'Confirma tu Asistencia - Esteban & Dany',
    description: 'Confirma tu asistencia a nuestra boda el 11 de Abril, 2026',
    robots: 'noindex, nofollow',
  }
}
