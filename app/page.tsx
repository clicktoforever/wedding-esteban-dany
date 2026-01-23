import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import CountdownTimer from '@/components/CountdownTimer'
import RSVPButton from '@/components/RSVPButton'
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
            style={{ objectPosition: 'center 30%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background-light"></div>
        </div>

          <div className="relative z-10 w-full flex flex-col items-center space-y-6 lg:space-y-8 fade-in-up">
            <div className="w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg mb-4 transition-all duration-300">
            <Image
              src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa8f6be604e914db985ee8198b13a85e4"
              alt="Logo"
              width={64}
              height={64}
              className="object-contain lg:w-20 lg:h-20 xl:w-24 xl:h-24"
            />
          </div>

            <h1 className="font-display text-5xl lg:text-6xl xl:text-8xl text-white drop-shadow-lg tracking-wide transition-all duration-300">
              Esteban <span className="block text-3xl lg:text-4xl xl:text-6xl italic mt-2 lg:mt-3 xl:mt-4 text-secondary">&amp;</span> Dany
            </h1>

            <div className="w-16 lg:w-24 xl:w-32 h-0.5 bg-secondary rounded-full my-4 lg:my-6 shadow-sm transition-all duration-300"></div>

            <div className="text-white font-light tracking-widest uppercase text-sm lg:text-base xl:text-lg drop-shadow-md space-y-1 lg:space-y-2">
              <p className="capitalize">{formattedDate}</p>
              <p className="font-bold">Quito, Ecuador</p>
            </div>

            <CountdownTimer targetDate={weddingDate} />
          </div>

          <div className="absolute bottom-8 lg:bottom-12 left-1/2 transform -translate-x-1/2 z-10 text-primary">
            <svg className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </header>

        {/* Gallery Section */}
        <section className="px-8 lg:px-16 xl:px-24 py-16 lg:py-24 xl:py-32 bg-background-light relative">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-background-light/0 to-background-light -mt-24 pointer-events-none"></div>
          
          <div className="text-center space-y-4 lg:space-y-6 mb-10 lg:mb-16">
            <span className="text-primary text-xs lg:text-sm xl:text-base font-bold tracking-[0.2em] uppercase">Nuestra Galería</span>
            <h2 className="font-display text-4xl lg:text-5xl xl:text-6xl text-gray-800 transition-all duration-300">Momentos Juntos</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5 xl:gap-6 mb-8 lg:mx-auto lg:max-w-6xl">
            <div className="col-span-2 lg:col-span-4 h-64 lg:h-80 xl:h-96 rounded-xl lg:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              <Image
                src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F4d0783ada0a44302b4305c1f52e1ea8f"
                alt="Couple wide shot"
                width={800}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-40 lg:h-56 xl:h-64 lg:col-span-2 rounded-xl lg:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
              <Image
                src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F195ab2d14d414911a0f5e1d2ab1ca811"
                alt="Couple portrait"
                width={400}
                height={320}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="h-40 lg:h-56 xl:h-64 lg:col-span-2 rounded-xl lg:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
              <Image
                src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F449e5d83e6864bea9046d6a2ed9a99df"
                alt="Couple details"
                width={400}
                height={320}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </section>

        {/* Event Details Section */}
        <section className="px-6 lg:px-16 xl:px-24 py-12 lg:py-20 xl:py-24 bg-secondary/10 rounded-t-[40px] lg:rounded-t-[60px] border-t border-secondary/20 relative">
          <div className="text-center mb-6 lg:mb-10">
            <svg className="w-8 h-8 lg:w-12 lg:h-12 xl:w-14 xl:h-14 mx-auto text-primary mb-2 lg:mb-4 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl text-gray-800 mb-6 lg:mb-10 transition-all duration-300">Detalles del Evento</h2>
            
            <div className="bg-white p-8 lg:p-12 xl:p-16 rounded-2xl lg:rounded-3xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300">
              <h3 className="font-display text-2xl lg:text-3xl xl:text-4xl text-primary mb-2 lg:mb-3 transition-all duration-300">Hacienda de Capelo</h3>
              <p className="text-gray-600 text-base lg:text-lg xl:text-xl mb-6 lg:mb-8">Quito, Ecuador</p>

              <a 
                href="https://share.google/rG5IgDFHQyzZgs1Q4"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-primary text-white font-bold py-3 lg:py-4 xl:py-5 px-6 lg:px-8 xl:px-10 rounded-lg lg:rounded-xl shadow-md hover:bg-opacity-90 hover:shadow-lg transition-all text-sm lg:text-base xl:text-lg w-full mb-8 lg:mb-10 hover:scale-[1.02] active:scale-95"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Ver Ubicación en Google Maps
              </a>

              <div className="border-t border-gray-100 pt-6 lg:pt-8 xl:pt-10">
                <div className="flex flex-col items-center">
                  <svg className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-accent-light mb-3 lg:mb-4 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs lg:text-sm xl:text-base uppercase tracking-widest text-gray-500 mb-1 lg:mb-2">Código de Vestimenta</span>
                  <span className="font-display text-xl lg:text-2xl xl:text-3xl text-gray-800 transition-all duration-300">Formal</span>
                </div>
              </div>
            </div>
          </div>
        </section>

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
        <footer className="relative h-96 lg:h-[28rem] xl:h-[32rem] w-full flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F817ed4cfe46441ee902e78a55ce23445"
              alt="Couple landscape photo footer"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60 z-10"></div>
          </div>

          <div className="relative z-20 flex flex-col items-center justify-center text-white">
            <div className="w-24 h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 border border-white/30 rounded-full flex items-center justify-center mb-4 lg:mb-6 backdrop-blur-sm bg-white/10 transition-all duration-300">
              <Image
                src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa8f6be604e914db985ee8198b13a85e4"
                alt="Logo"
                width={56}
                height={56}
                className="object-contain brightness-0 invert lg:w-20 lg:h-20 xl:w-24 xl:h-24"
              />
            </div>
            <p className="font-display text-2xl lg:text-3xl xl:text-4xl tracking-widest transition-all duration-300">E &amp; D</p>
            <p className="text-xs lg:text-sm xl:text-base mt-2 lg:mt-3 text-white/70 uppercase tracking-widest">Gracias por acompañarnos</p>
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
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Esteban & Dany - Boda 11 de Abril 2026',
    description: 'Te invitamos a celebrar nuestra boda el 11 de Abril, 2026 en Quito, Ecuador.',
  }
}
