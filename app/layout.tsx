import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
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
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
