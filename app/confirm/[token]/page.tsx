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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-serif tracking-[0.15em] text-wedding-forest hover:text-wedding-purple transition-colors">
              ESTEBAN <span className="text-wedding-rose">&</span> DANY
            </Link>
            <Link href="/gifts" className="flex items-center space-x-2 text-sm tracking-[0.15em] uppercase text-gray-600 hover:text-wedding-forest transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span>Regalos</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-wedding-sage/5 via-white to-wedding-rose/5 py-20">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-20 left-10 w-40 h-40 text-wedding-sage opacity-5" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 20 L60 40 L80 45 L65 60 L68 80 L50 70 L32 80 L35 60 L20 45 L40 40 Z"/>
          </svg>
          <svg className="absolute bottom-20 right-10 w-48 h-48 text-wedding-rose opacity-5" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="45"/>
          </svg>
        </div>

        <div className="container-custom relative">
          <div className="max-w-4xl mx-auto">
            {/* Decorative Divider */}
            <div className="flex items-center justify-center mb-12">
              <div className="h-px bg-wedding-forest/20 w-20"></div>
              <svg className="w-8 h-8 mx-6 text-wedding-rose" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="2"/>
                <circle cx="50" cy="50" r="6"/>
              </svg>
              <div className="h-px bg-wedding-forest/20 w-20"></div>
            </div>
            
            {/* Title Section */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-serif text-wedding-forest mb-8 tracking-wide">
                Confirmación de <span className="italic text-wedding-purple">Asistencia</span>
              </h1>
              
              <p className="text-3xl md:text-4xl text-gray-700 mb-6 font-light">
                ¡Hola, <span className="font-serif font-normal text-wedding-forest">{guestWithPasses.name}</span>!
              </p>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed tracking-wide">
                Nos encantaría contar con tu presencia en nuestro día especial. 
                Por favor confirma la asistencia de tus invitados a continuación.
              </p>
            </div>

            {/* Confirmation Component */}
            <div className="bg-white shadow-xl p-8 md:p-12 border border-wedding-sage/10">
              <GuestConfirmation 
                guest={guestWithPasses}
                token={token}
              />
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center my-16">
              <div className="h-px bg-wedding-forest/20 w-16"></div>
              <svg className="w-6 h-6 mx-4 text-wedding-rose" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8Z"/>
              </svg>
              <div className="h-px bg-wedding-forest/20 w-16"></div>
            </div>

            {/* Additional Info */}
            <div className="bg-white shadow-xl p-8 md:p-12 border border-wedding-sage/10">
              <div className="grid md:grid-cols-2 gap-12 text-center">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-wedding-rose/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-wedding-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm tracking-[0.2em] uppercase text-wedding-sage font-medium">Fecha & Hora</h3>
                  <p className="text-3xl font-serif text-wedding-forest">11 de Abril, 2026</p>
                  <p className="text-gray-600 text-lg">6:00 PM</p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-wedding-purple/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-wedding-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm tracking-[0.2em] uppercase text-wedding-sage font-medium">Ubicación</h3>
                  <p className="text-3xl font-serif text-wedding-forest">Por confirmar</p>
                  <p className="text-gray-600 text-lg">Los detalles se enviarán próximamente</p>
                </div>
              </div>
              
              <div className="mt-12 pt-12 border-t border-gray-100 text-center space-y-6">
                <div className="w-16 h-16 bg-wedding-rose/10 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-wedding-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <p className="text-xl text-gray-700 font-serif">¿Deseas obsequiarnos algo?</p>
                <Link href="/gifts" className="inline-block bg-wedding-forest text-white px-10 py-4 tracking-[0.2em] uppercase text-sm hover:bg-wedding-purple transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
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
