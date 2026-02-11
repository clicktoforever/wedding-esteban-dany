import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import CountdownTimer from '@/components/CountdownTimer'
import RSVPButton from '@/components/RSVPButton'
import AddToCalendarButton from '@/components/AddToCalendarButton'
import GalleryLightbox from '@/components/GalleryLightbox'
import EventDetails from '@/components/EventDetails'
import { UIProvider } from '@/components/providers/UIProvider'
import { createClient } from '@/lib/supabase/server'

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
  const formattedDate = weddingDateObj.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="bg-background-light text-text-light font-body antialiased transition-colors duration-300">
      <UIProvider>
        <div className="max-w-md lg:max-w-none mx-auto relative min-h-screen lg:shadow-none shadow-2xl overflow-hidden bg-background-light pb-0">
          {/* Hero Section */}
          <header className="relative h-screen lg:max-h-[1000px] flex flex-col items-center justify-center text-center px-6 lg:px-12 xl:px-20">
            <div className="absolute inset-0">
              <Image
                src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fb2c477eaaeee4caab9ba5d05b1f51906"
                alt="Romantic couple holding hands in a field"
                fill
                className="object-cover brightness-75"
                priority
                style={{ objectPosition: 'center 5%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background-light"></div>
            </div>

            {/* Logo Circle - Positioned independently */}
            <div className="absolute top-12 lg:top-16 left-1/2 transform -translate-x-1/2 z-10">
              <div className="w-24 h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300">
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa8f6be604e914db985ee8198b13a85e4"
                  alt="Logo"
                  width={72}
                  height={72}
                  className="object-contain lg:w-24 lg:h-24 xl:w-28 xl:h-28"
                />
              </div>
            </div>

            {/* Content - Names, Date, Countdown */}
            <div className="relative z-10 w-full flex flex-col items-center space-y-6 lg:space-y-8 fade-in-up mt-56 lg:mt-64">
              <h1 className="font-serif text-5xl lg:text-6xl xl:text-8xl text-white drop-shadow-lg tracking-wide transition-all duration-300">
                Carlos <span className="block text-3xl lg:text-4xl xl:text-6xl italic mt-2 lg:mt-3 xl:mt-4 text-secondary">&amp;</span> Dany
              </h1>

              <div className="w-16 lg:w-24 xl:w-32 h-0.5 bg-secondary rounded-full my-4 lg:my-6 shadow-sm transition-all duration-300"></div>

              <div className="text-white font-light tracking-widest uppercase text-sm lg:text-base xl:text-lg drop-shadow-md space-y-1 lg:space-y-2">
                <p className="capitalize">{formattedDate}</p>
                <p className="font-bold">Quito, Ecuador</p>
              </div>

              <CountdownTimer targetDate={weddingDate} />
            </div>

            <AddToCalendarButton />
          </header>

          {/* Gallery Section */}
          <section className="px-8 lg:px-16 xl:px-24 py-16 lg:py-24 xl:py-32 bg-background-light relative">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-background-light/0 to-background-light -mt-24 pointer-events-none"></div>

            <div className="text-center space-y-4 lg:space-y-6 mb-10 lg:mb-16">
              <span className="text-primary text-xs lg:text-sm xl:text-base font-bold tracking-[0.2em] uppercase">Nuestra Galería</span>
              <h2 className="font-display text-4xl lg:text-5xl xl:text-6xl text-gray-800 transition-all duration-300">Momentos Juntos</h2>
            </div>

            <GalleryLightbox
              images={[
                {
                  src: 'https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F4d0783ada0a44302b4305c1f52e1ea8f',
                  alt: 'Carlos y Dany - Momento especial',
                  width: 800,
                  height: 400
                },
                {
                  src: 'https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F195ab2d14d414911a0f5e1d2ab1ca811',
                  alt: 'Carlos y Dany - Retrato',
                  width: 400,
                  height: 320
                },
                {
                  src: 'https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F449e5d83e6864bea9046d6a2ed9a99df',
                  alt: 'Carlos y Dany - Detalles',
                  width: 400,
                  height: 320
                }
              ]}
            />
          </section>

          {/* Event Details Section - Redesigned */}
          <EventDetails />

          {/* Gift Registry Section */}
          <section className="px-6 lg:px-16 xl:px-24 py-12 lg:py-20 xl:py-24 pb-20 lg:pb-32">
            <div className="bg-gradient-to-br from-accent-light/20 to-secondary/30 rounded-2xl lg:rounded-3xl p-8 lg:p-12 xl:p-16 text-center border border-accent-light/20 hover:shadow-lg transition-all duration-300">
              <svg className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 mx-auto text-accent-light mb-4 lg:mb-6 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <h3 className="font-display text-2xl lg:text-3xl xl:text-4xl text-gray-800 mb-3 lg:mb-4 transition-all duration-300">Mesa de Regalos</h3>
              <p className="text-sm lg:text-base xl:text-lg text-gray-600 mb-6 lg:mb-8 px-4 lg:px-8 xl:px-12">
                Su presencia es nuestro mayor regalo, pero si desean tener un detalle con nosotros, pueden visitar nuestras opciones sugeridas.
              </p>
              <Link
                href="/gifts"
                className="inline-block bg-white text-primary font-bold py-3 lg:py-4 xl:py-5 px-8 lg:px-10 xl:px-12 rounded-full shadow-sm hover:shadow-xl transition-all text-sm lg:text-base xl:text-lg border border-primary/10 w-full hover:scale-[1.02] active:scale-95"
              >
                Visitar Mesa de Regalos
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="relative h-96 lg:h-[28rem] xl:h-[32rem] w-full flex items-end justify-center">
            <div className="absolute inset-0 z-0">
              <Image
                src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F817ed4cfe46441ee902e78a55ce23445"
                alt="Couple landscape photo footer"
                fill
                className="object-cover"
                style={{ objectPosition: 'center 40%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/50 z-10"></div>
            </div>

            <div className="relative z-20 flex flex-col items-center pb-16 lg:pb-20 xl:pb-24 text-white">
              <div className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 border border-white/20 rounded-full flex items-center justify-center mb-2 lg:mb-3 backdrop-blur-sm bg-white/5 transition-all duration-300 shadow-lg">
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa8f6be604e914db985ee8198b13a85e4"
                  alt="Logo"
                  width={52}
                  height={52}
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
