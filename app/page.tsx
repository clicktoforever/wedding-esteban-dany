import Image from 'next/image'
import CloudinaryImage from '@/components/CloudinaryImage'
import Link from 'next/link'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import CountdownTimer from '@/components/CountdownTimer'
import RSVPButton from '@/components/RSVPButton'
import AddToCalendarButton from '@/components/AddToCalendarButton'
import { UIProvider } from '@/components/providers/UIProvider'
import { createClient } from '@/lib/supabase/server'

// Lazy load below-the-fold components
const SeasonsGallery = dynamic(() => import('@/components/SeasonsGallery'), {
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-100 rounded-2xl"></div>
})

const EventDetails = dynamic(() => import('@/components/EventDetails'), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#f9f8f4]"></div>
})

export const revalidate = 60

export default async function Page() {
  const supabase = await createClient()

  // Fetch wedding date from configurations
  const { data: weddingDateConfig } = await supabase
    .from('configurations')
    .select('value')
    .eq('key', 'wedding_date')
    .single()

  const weddingDate = weddingDateConfig?.value || '2026-04-11T18:00:00'
  const weddingDateObj = new Date(weddingDate)

  // Format date for display
  const rawDate = weddingDateObj.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Format to e.g. "11 de Abril de 2026"
  const formattedDate = rawDate.split(' ').map((word, index) => {
    if (word.toLowerCase() === 'de' || word.toLowerCase() === 'del') return word.toLowerCase();
    // Capitalize month
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');

  return (
    <div className="bg-background-light text-text-light font-body antialiased transition-colors duration-300">
      <UIProvider>
        <div className="max-w-md lg:max-w-none mx-auto relative min-h-screen lg:shadow-none shadow-2xl overflow-hidden bg-background-light pb-0">
          {/* Hero Section */}
          <header className="relative h-screen lg:max-h-[1000px] flex flex-col items-center justify-center text-center px-6 lg:px-12 xl:px-20">
            <div className="absolute inset-0">
              <CloudinaryImage
                src="wedding/rdrrbnakbb8hnjhmgfi2"
                alt="Romantic couple holding hands in a field"
                fill
                format="webp"
                quality="50"
                sizes="100vw"
                className="object-cover brightness-75"
                preload={true}
                style={{ objectPosition: 'center 5%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background-light"></div>
            </div>

            {/* Logo - Positioned independently */}
            <div className="absolute top-12 lg:top-16 left-1/2 transform -translate-x-1/2 z-10">
              <div className="w-28 h-28 lg:w-34 lg:h-34 xl:w-40 xl:h-40 flex items-center justify-center transition-all duration-300">
                <CloudinaryImage
                  src="wedding/lal95pilyeq3jojweafo"
                  alt="Logo"
                  width={144}
                  height={144}
                  format="auto"
                  className="object-contain brightness-0 invert lg:w-36 lg:h-36 xl:w-44 xl:h-44"
                  preload={true}
                  fetchPriority="high"
                />
              </div>
            </div>

            {/* Content - Names, Date, Countdown */}
            <div className="relative z-10 w-full flex flex-col items-center space-y-6 lg:space-y-8 fade-in-up mt-64 lg:mt-72 pt-24 lg:pt-32 pb-8 lg:pb-16">
              <h1 className="font-serif text-5xl lg:text-6xl xl:text-8xl text-white drop-shadow-lg tracking-wide transition-all duration-300">
                Dany <span className="block text-3xl lg:text-4xl xl:text-6xl italic mt-2 lg:mt-3 xl:mt-4 text-white">&amp;</span> Carlos
              </h1>

              <div className="w-16 lg:w-24 xl:w-32 h-0.5 bg-white rounded-full my-4 lg:my-6 shadow-sm transition-all duration-300"></div>

              <div className="text-white font-light tracking-widest text-sm lg:text-base xl:text-lg drop-shadow-md space-y-1 lg:space-y-2">
                <p>
                  {formattedDate}
                </p>
                <p className="font-bold uppercase">Quito, Ecuador</p>
              </div>

              <CountdownTimer targetDate={weddingDate} />

              <div className="mt-8 lg:mt-12 xl:mt-16 w-full flex justify-center pb-8 lg:pb-12">
                <AddToCalendarButton />
              </div>
            </div>
          </header>

          {/* Gallery Section */}
          <section className="px-8 lg:px-16 xl:px-24 py-16 lg:py-24 xl:py-32 bg-background-light relative">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-background-light/0 to-background-light -mt-24 pointer-events-none"></div>

            <div className="text-center space-y-4 lg:space-y-6 mb-10 lg:mb-16">
              <h2 className="font-display text-4xl lg:text-5xl xl:text-6xl text-gray-800 transition-all duration-300">Nuestra historia</h2>
            </div>

            <SeasonsGallery />
          </section>

          {/* Event Details Section - Redesigned */}
          <EventDetails />

          {/* Gift Registry Section */}
          <section className="px-6 lg:px-16 xl:px-24 py-12 lg:py-20 xl:py-24 pb-20 lg:pb-32">
            <div className="relative bg-[#eaf0eb] rounded-2xl lg:rounded-3xl p-8 lg:p-12 xl:p-16 text-center border border-accent-light/20 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">

              {/* Badge */}
              <div className="absolute top-0 right-0 p-4">
                <span className="inline-block bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] lg:text-xs uppercase tracking-widest font-bold text-primary shadow-sm border border-primary/10">
                  Con Recompensas
                </span>
              </div>

              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm mb-6 mt-4 shadow-sm">
                <svg className="w-8 h-8 lg:w-9 lg:h-9 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>

              <h3 className="font-display text-3xl lg:text-4xl xl:text-5xl text-gray-800 mb-3 lg:mb-4 transition-all duration-300">Mesa de Regalos</h3>
              <p className="text-sm lg:text-base xl:text-lg text-gray-600 mb-8 lg:mb-10 px-4 lg:px-8 xl:px-12 leading-relaxed">
                Ayúdanos a escribir este nuevo capítulo. Tu generosidad suma a nuestra vida y desbloquea recompensas para tu diversión hoy.
              </p>

              <Link
                href="/gifts"
                className="inline-block bg-primary text-white font-medium py-3 lg:py-4 xl:py-5 px-8 lg:px-10 xl:px-12 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all text-sm lg:text-base xl:text-lg hover:-translate-y-1 active:translate-y-0"
              >
                Visitar Mesa de Regalos
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="relative h-96 lg:h-[28rem] xl:h-[32rem] w-full flex items-end justify-center">
            <div className="absolute inset-0 z-0">
              <CloudinaryImage
                src="wedding/mj4i1xwu2pjebjkoqapg"
                alt="Couple landscape photo footer"
                fill
                format="webp"
                quality="50"
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: 'center 40%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/50 z-10"></div>
            </div>

            <div className="relative z-20 flex flex-col items-center pb-16 lg:pb-20 xl:pb-24 text-white">
              <div className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 flex items-center justify-center mb-2 lg:mb-3 transition-all duration-300">
                <CloudinaryImage
                  src="wedding/lal95pilyeq3jojweafo"
                  alt="Logo"
                  width={52}
                  height={52}
                  format="auto"
                  className="object-contain brightness-0 invert lg:w-16 lg:h-16 xl:w-20 xl:h-20"
                />
              </div>
              <p className="text-xs lg:text-sm xl:text-base text-white/80 uppercase tracking-widest font-light">Gracias por acompañarnos</p>
            </div>
          </footer>

          {/* Fixed RSVP Button */}
          <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 xl:bottom-10 xl:right-10 z-50">
            <Suspense fallback={
              <div className="bg-primary text-white font-bold py-4 lg:py-5 xl:py-6 px-8 lg:px-10 xl:px-12 rounded-full shadow-xl flex items-center gap-2 lg:gap-3 text-sm lg:text-base xl:text-lg">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Confirmar Asistencia
              </div>
            }>
              <RSVPButton />
            </Suspense>
          </div>
        </div>
      </UIProvider>
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Carlos & Dany - Boda 11 de Abril 2026',
    description: 'Te invitamos a celebrar nuestra boda el 11 de Abril, 2026 en Quito, Ecuador.',
  }
}
