import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import GiftRegistry from '@/components/gifts/GiftRegistry'

export const revalidate = 10 // ISR with 10 second revalidation

export default async function GiftsPage() {
  const supabase = await createClient()

  const { data: gifts, error } = await supabase
    .from('gifts')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching gifts:', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Error al cargar los regalos</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-serif tracking-[0.15em] text-wedding-forest hover:text-wedding-purple transition-colors">
              ESTEBAN <span className="text-wedding-rose">&</span> DANY
            </Link>
            <Link href="/admin" className="flex items-center space-x-2 text-sm tracking-[0.15em] uppercase text-gray-600 hover:text-wedding-forest transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-wedding-rose/5 via-white to-wedding-purple/5 py-24">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-20 right-20 w-56 h-56 text-wedding-rose opacity-5" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 20 L60 40 L80 45 L65 60 L68 80 L50 70 L32 80 L35 60 L20 45 L40 40 Z"/>
          </svg>
          <svg className="absolute bottom-20 left-20 w-64 h-64 text-wedding-sage opacity-5" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="45"/>
          </svg>
          <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 text-wedding-purple opacity-5" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 L65 35 L90 40 L70 60 L75 85 L50 72 L25 85 L30 60 L10 40 L35 35 Z"/>
          </svg>
        </div>

        <div className="container-custom relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Decorative Divider */}
            <div className="flex items-center justify-center mb-12">
              <div className="h-px bg-wedding-forest/20 w-20"></div>
              <div className="mx-6 w-16 h-16 bg-wedding-rose/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-wedding-rose" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50 20 L60 40 L80 45 L65 60 L68 80 L50 70 L32 80 L35 60 L20 45 L40 40 Z"/>
                </svg>
              </div>
              <div className="h-px bg-wedding-forest/20 w-20"></div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-serif text-wedding-forest mb-8 tracking-wide">
              Mesa de <span className="italic text-wedding-purple">Regalos</span>
            </h1>
            
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed tracking-wide font-light">
              Tu presencia es nuestro mejor regalo, pero si deseas obsequiarnos algo,
              aquí te compartimos algunas sugerencias para comenzar nuestra vida juntos.
            </p>
            
            <div className="inline-block bg-white border-2 border-wedding-sage/20 px-8 py-4 shadow-lg">
              <p className="text-sm tracking-[0.2em] uppercase text-wedding-forest font-medium">
                Todos los artículos han sido cuidadosamente seleccionados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="container-custom py-8">
        <div className="flex items-center justify-center">
          <div className="h-px bg-wedding-forest/20 w-16"></div>
          <svg className="w-6 h-6 mx-4 text-wedding-rose" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8Z"/>
          </svg>
          <div className="h-px bg-wedding-forest/20 w-16"></div>
        </div>
      </div>

      {/* Gifts Registry */}
      <section className="py-16">
        <div className="container-custom">
          <GiftRegistry initialGifts={gifts || []} />
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="container-custom py-8">
        <div className="flex items-center justify-center">
          <div className="h-px bg-wedding-forest/20 w-16"></div>
          <svg className="w-6 h-6 mx-4 text-wedding-rose" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8Z"/>
          </svg>
          <div className="h-px bg-wedding-forest/20 w-16"></div>
        </div>
      </div>

      {/* Footer Note */}
      <section className="relative py-20 bg-gradient-to-br from-wedding-sage/5 via-white to-wedding-rose/5">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-10 left-10 w-40 h-40 text-wedding-purple opacity-5" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="45"/>
          </svg>
          <svg className="absolute bottom-10 right-10 w-48 h-48 text-wedding-rose opacity-5" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 L65 35 L90 40 L70 60 L75 85 L50 72 L25 85 L30 60 L10 40 L35 35 Z"/>
          </svg>
        </div>

        <div className="container-custom relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Icon */}
            <div className="w-20 h-20 bg-wedding-rose/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-wedding-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h3 className="text-3xl font-serif text-wedding-forest tracking-wide">
                Otra forma de regalarnos
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed tracking-wide max-w-2xl mx-auto">
                Si prefieres hacer un regalo monetario, también será muy apreciado 
                y nos ayudará a comenzar nuestra nueva vida juntos.
              </p>
            </div>

            {/* Action Button */}
            <Link href="/" className="inline-block bg-wedding-forest text-white px-10 py-4 tracking-[0.2em] uppercase text-sm hover:bg-wedding-purple transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              Volver al Inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Mesa de Regalos - Esteban & Dany',
    description: 'Explora nuestra mesa de regalos y ayúdanos a comenzar nuestra vida juntos',
    robots: 'noindex, nofollow',
  }
}
