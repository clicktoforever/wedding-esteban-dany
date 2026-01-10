import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
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

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-serif tracking-wider text-wedding-forest hover:text-wedding-purple transition-colors">
              ESTEBAN & DANY
            </Link>
            <Link href="/gifts" className="text-sm tracking-wider uppercase text-gray-600 hover:text-wedding-forest transition-colors">
              Mesa de Regalos
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Decorative Element */}
            <div className="text-center mb-12">
              <svg className="w-20 h-20 mx-auto text-wedding-sage opacity-30 mb-8" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1"/>
                <path d="M50 20 L50 80 M20 50 L80 50"/>
                <circle cx="50" cy="50" r="5"/>
              </svg>
              
              <h1 className="heading-primary mb-6">
                Confirmación de <span className="italic text-wedding-purple">Asistencia</span>
              </h1>
              
              <p className="text-2xl md:text-3xl text-gray-700 mb-4">
                ¡Hola, <span className="font-serif text-wedding-forest">{guestWithPasses.name}</span>!
              </p>
              <p className="text-body max-w-xl mx-auto">
                Nos encantaría contar con tu presencia en nuestro día especial. 
                Por favor confirma la asistencia de tus invitados a continuación.
              </p>
            </div>

            {/* Confirmation Component */}
            <GuestConfirmation 
              guest={guestWithPasses}
              token={token}
            />

            {/* Additional Info */}
            <div className="mt-16 bg-white shadow-sm p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 text-center md:text-left">
                <div>
                  <h3 className="text-sm tracking-wider uppercase text-wedding-sage mb-3">Fecha & Hora</h3>
                  <p className="text-2xl font-serif text-wedding-forest mb-2">15 de Junio, 2026</p>
                  <p className="text-gray-600">6:00 PM</p>
                </div>
                <div>
                  <h3 className="text-sm tracking-wider uppercase text-wedding-sage mb-3">Ubicación</h3>
                  <p className="text-2xl font-serif text-wedding-forest mb-2">Por confirmar</p>
                  <p className="text-gray-600">Los detalles se enviarán próximamente</p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                <p className="text-gray-600 mb-4">¿Deseas obsequiarnos algo?</p>
                <Link href="/gifts" className="btn-secondary inline-block">
                  Ver Mesa de Regalos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params
  return {
    title: 'Confirma tu Asistencia - Esteban & Dany',
    description: 'Confirma tu asistencia a nuestra boda el 15 de Junio, 2026',
    robots: 'noindex, nofollow',
  }
}
