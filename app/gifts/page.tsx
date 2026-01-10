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
      <nav className="bg-white border-b border-gray-100">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-serif tracking-wider text-wedding-forest hover:text-wedding-purple transition-colors">
              ESTEBAN & DANY
            </Link>
            <Link href="/admin" className="text-sm tracking-wider uppercase text-gray-600 hover:text-wedding-forest transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-padding bg-gradient-soft">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            {/* Decorative Element */}
            <div className="mb-8">
              <svg className="w-20 h-20 mx-auto text-wedding-rose opacity-30" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 20 L60 40 L80 45 L65 60 L68 80 L50 70 L32 80 L35 60 L20 45 L40 40 Z"/>
              </svg>
            </div>
            
            <h1 className="heading-primary mb-6">
              Mesa de <span className="italic text-wedding-purple">Regalos</span>
            </h1>
            
            <p className="text-body max-w-2xl mx-auto mb-8">
              Tu presencia es nuestro mejor regalo, pero si deseas obsequiarnos algo,
              aquí te compartimos algunas sugerencias para comenzar nuestra vida juntos.
            </p>
            
            <div className="inline-block bg-white border border-wedding-sage px-6 py-3">
              <p className="text-sm tracking-wider uppercase text-wedding-forest">
                Todos los artículos han sido cuidadosamente seleccionados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gifts Registry */}
      <section className="section-padding">
        <div className="container-custom">
          <GiftRegistry initialGifts={gifts || []} />
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 bg-gradient-soft">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-body mb-6">
              Si prefieres hacer un regalo monetario, también será muy apreciado 
              y nos ayudará a comenzar nuestra nueva vida juntos.
            </p>
            <Link href="/" className="btn-secondary inline-block">
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
