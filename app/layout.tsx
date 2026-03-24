import type { Metadata } from 'next'
import { Inter, Playfair_Display, Cormorant_Garamond, Montserrat, Great_Vibes } from 'next/font/google'
import { Suspense } from 'react'
import TokenTracker from '@/components/TokenTracker'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  preload: true,
})

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-great-vibes',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'Carlos & Dany - 11 de Abril 2026',
    template: '%s | Carlos & Dany',
  },
  description: 'Hemos reservado un pase para ti. ¡Toca para abrir!',
  icons: {
    icon: 'https://res.cloudinary.com/machiboda/image/upload/f_auto,q_auto/v1772050800/wedding/lal95pilyeq3jojweafo.svg',
    shortcut: 'https://res.cloudinary.com/machiboda/image/upload/f_auto,q_auto/v1772050800/wedding/lal95pilyeq3jojweafo.svg',
    apple: 'https://res.cloudinary.com/machiboda/image/upload/f_auto,q_auto/v1772050800/wedding/lal95pilyeq3jojweafo.svg',
  },
  openGraph: {
    title: 'Carlos & Dany - 11 de Abril 2026',
    description: 'Hemos reservado un pase para ti. ¡Toca para abrir!',
    type: 'website',
    locale: 'es_MX',
    siteName: 'Boda Carlos & Dany',
    images: [
      {
        url: 'https://res.cloudinary.com/machiboda/image/upload/f_auto,q_auto/v1772050804/wedding/axg2cu0euiev46enb3yr.jpg',
        width: 1200,
        height: 630,
        alt: 'Carlos & Dany - Boda 11 de Abril 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carlos & Dany - 11 de Abril 2026',
    description: 'Hemos reservado un pase para ti. ¡Toca para abrir!',
    images: ['https://res.cloudinary.com/machiboda/image/upload/f_auto,q_auto/v1772050804/wedding/axg2cu0euiev46enb3yr.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${montserrat.variable} ${greatVibes.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round&display=block" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <TokenTracker />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
