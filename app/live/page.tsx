import CloudinaryImage from '@/components/CloudinaryImage'
import Link from 'next/link'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import CountdownTimer from '@/components/CountdownTimer'
import VerTrailerButton from '@/components/VerTrailerButton'
import LiveEventDetails from '@/components/LiveEventDetails'
import { UIProvider } from '@/components/providers/UIProvider'
import { createClient } from '@/lib/supabase/server'
import HomeTracker from '@/components/HomeTracker'

// Lazy load below-the-fold components
const SeasonsGallery = dynamic(() => import('@/components/SeasonsGallery'), {
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-100 rounded-2xl"></div>
})

export const revalidate = 60

export default async function Page() {
  const supabase = await createClient()

  // Fetch wedding date from configurations
  const { data: configs } = await supabase
    .from('configurations')
    .select('key, value')
    .in('key', ['wedding_date', 'youtube_stream_url'])

  const weddingDateConfig = configs?.find((c: any) => c.key === 'wedding_date')
  const youtubeStreamConfig = configs?.find((c: any) => c.key === 'youtube_stream_url')

  const weddingDate = weddingDateConfig?.value || '2026-04-11T18:00:00'
  const youtubeStreamUrl = youtubeStreamConfig?.value || '#'
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
      <HomeTracker source="full" />
      <UIProvider>
        <div className="max-w-md lg:max-w-none mx-auto relative min-h-screen lg:shadow-none shadow-2xl overflow-hidden bg-background-light pb-0">
          {/* Hero Section */}
          <header className="relative h-screen lg:max-h-[1000px] flex flex-col items-center justify-center text-center px-6 lg:px-12 xl:px-20">
            <div className="absolute inset-0">
              <CloudinaryImage
                src="wedding/ifbxphz3g9qsmtrsknrk"
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
                <p className="font-bold uppercase">La gala en casa</p>
              </div>

              <CountdownTimer targetDate={weddingDate} />

              <div className="mt-8 lg:mt-12 xl:mt-16 w-full flex justify-center pb-8 lg:pb-12">
                <VerTrailerButton />
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

          {/* Event Details Section - Live Version */}
          <LiveEventDetails youtubeStreamUrl={youtubeStreamUrl} />

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
