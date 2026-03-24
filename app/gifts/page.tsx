import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { cookies } from 'next/headers'
import GiftRegistry from '@/components/gifts/GiftRegistry'
import InstructionsButton from '@/components/gifts/InstructionsButton'

export const revalidate = 0
export const dynamic = 'force-dynamic'

interface GiftsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function GiftsPage({ searchParams }: GiftsPageProps) {
  const resolvedSearchParams = await searchParams
  const token = resolvedSearchParams.token as string | undefined

  const supabase = await createClient()

  let homeUrl = '/'

  // 1. Try to get the homeUrl based on the token in the URL
  if (token) {
    const { data: guest } = await supabase
      .from('guests')
      .select('guest_type')
      .eq('access_token', token)
      .single()
    
    if (guest?.guest_type === 'party') {
      homeUrl = '/party'
    }
  } else {
    // 2. Fallback to cookie if no token in URL
    const cookieStore = await cookies()
    const source = cookieStore.get('wedding_source')?.value
    homeUrl = source === 'party' ? '/party' : '/'
  }

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
      <div className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md px-4 lg:px-8 py-4 flex items-center justify-between border-b border-gray-200/50">
        <Link href={homeUrl} className="flex items-center gap-2 group">
          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#4a4a4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs lg:text-sm uppercase tracking-widest font-semibold text-[#4a4a4a] group-hover:text-[#3d3d3d] transition-colors">Volver</span>
        </Link>
        <InstructionsButton />
      </div>

      {/* Header Section */}
      <header className="px-6 lg:px-12 pt-2 pb-4 text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl font-medium text-[#4c5851] mb-4 leading-tight transition-all duration-300">Mesa de regalos</h1>
        <p className="text-[#666666] text-base lg:text-lg leading-relaxed transition-all duration-300 font-sans">
          Elige un detalle para nuestra nueva vida juntos. Al confirmar tu regalo, recibirás de manera automática "Machi Coins" para canjear por premios en la fiesta.
        </p>
      </header>

      {/* Gift Registry Component */}
      <GiftRegistry initialGifts={gifts || []} />
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Mesa de Regalos - Carlos & Dany',
    description: 'Explora nuestra mesa de regalos y ayúdanos a comenzar nuestra vida juntos',
    robots: 'noindex, nofollow',
  }
}
