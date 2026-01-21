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
  title: 'Esteban & Dany - 10 de Abril 2025',
  description: 'Te invitamos a celebrar nuestra boda el 10 de Abril, 2025 en Ciudad de México',
  openGraph: {
    title: 'Esteban & Dany - 10 de Abril 2025',
    description: 'Te invitamos a celebrar nuestra boda el 10 de Abril, 2025 en Ciudad de México',
    type: 'website',
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
