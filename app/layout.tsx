import type { Metadata } from 'next'
import { Inter, Playfair_Display, Cormorant_Garamond, Montserrat, Great_Vibes } from 'next/font/google'
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
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-great-vibes',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Carlos & Dany - 11 de Abril 2026',
    template: '%s | Carlos & Dany',
  },
  description: 'Hemos reservado un pase para ti. ¡Toca para abrir!',
  icons: {
    icon: 'https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa8f6be604e914db985ee8198b13a85e4',
    shortcut: 'https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa8f6be604e914db985ee8198b13a85e4',
    apple: 'https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa8f6be604e914db985ee8198b13a85e4',
  },
  openGraph: {
    title: 'Carlos & Dany - 11 de Abril 2026',
    description: 'Hemos reservado un pase para ti. ¡Toca para abrir!',
    type: 'website',
    locale: 'es_MX',
    siteName: 'Boda Carlos & Dany',
    images: [
      {
        url: 'https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa71fead96e4e444199285c4212f659d8',
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
    images: ['https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa71fead96e4e444199285c4212f659d8'],
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
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
