import type { Metadata } from 'next'
import { Inter, Playfair_Display, Noto_Serif, Noto_Sans } from 'next/font/google'
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

const notoSerif = Noto_Serif({ 
  subsets: ['latin'],
  variable: '--font-noto-serif',
  display: 'swap',
})

const notoSans = Noto_Sans({ 
  subsets: ['latin'],
  variable: '--font-noto-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Esteban & Dany - 11 de Abril 2026',
    template: '%s | Esteban & Dany',
  },
  description: 'Hemos reservado un pase para ti. ¡Toca para abrir!',
  icons: {
    icon: 'https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa8f6be604e914db985ee8198b13a85e4',
    shortcut: 'https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa8f6be604e914db985ee8198b13a85e4',
    apple: 'https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa8f6be604e914db985ee8198b13a85e4',
  },
  openGraph: {
    title: 'Esteban & Dany - 11 de Abril 2026',
    description: 'Hemos reservado un pase para ti. ¡Toca para abrir!',
    type: 'website',
    locale: 'es_MX',
    siteName: 'Boda Esteban & Dany',
    images: [
      {
        url: 'https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa71fead96e4e444199285c4212f659d8',
        width: 1200,
        height: 630,
        alt: 'Esteban & Dany - Boda 11 de Abril 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Esteban & Dany - 11 de Abril 2026',
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
    <html lang="es" className={`${inter.variable} ${playfair.variable} ${notoSerif.variable} ${notoSans.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
