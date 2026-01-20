import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import GiftRegistry from '@/components/gifts/GiftRegistry'

export const revalidate = 0
export const dynamic = 'force-dynamic'

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
    <div className="min-h-screen bg-background-light">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md px-4 lg:px-8 py-4 flex items-center justify-between border-b border-primary/5">
        <Link href="/" className="flex items-center gap-2 group">
          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs lg:text-sm uppercase tracking-widest font-semibold text-primary/60 group-hover:text-primary transition-colors">Volver</span>
        </Link>
        <div className="w-10 h-10 rounded-full border border-primary/10 flex items-center justify-center bg-white">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Header Section */}
      <header className="px-6 lg:px-12 pt-10 pb-4 text-center max-w-2xl mx-auto">
        <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-4 leading-tight transition-all duration-300">Nuestra Mesa de Regalos</h1>
        <p className="text-gray-600 text-base lg:text-lg leading-relaxed transition-all duration-300">
          Acompáñanos a crear recuerdos inolvidables. Tu presencia es nuestro mayor regalo, pero si deseas tener un detalle, aquí algunas experiencias de nuestra luna de miel.
        </p>
      </header>

      {/* Gift Registry Component */}
      <GiftRegistry initialGifts={gifts || []} />
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
