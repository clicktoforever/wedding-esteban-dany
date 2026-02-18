import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function RSVPClosedPage() {
  const supabase = await createClient()

  // Fetch deadline date from configurations
  const { data: deadlineConfig } = await supabase
    .from('configurations')
    .select('value')
    .eq('key', 'confirmation_deadline')
    .single()

  const deadlineDate = deadlineConfig?.value ? new Date(deadlineConfig.value) : new Date('2026-03-10T23:59:59')

  // Format date for display
  const formattedDeadline = deadlineDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // WhatsApp message
  const whatsappNumber = '593968508240'
  const whatsappMessage = encodeURIComponent('Hola! Quiero confirmar mi asistencia pero el período de confirmaciones ya cerró. ¿Podrían ayudarme por favor? Gracias.')
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <div className="bg-[#fbf8f0] text-gray-800 font-sans min-h-screen flex flex-col items-center relative" style={{ backgroundImage: 'radial-gradient(#E6E6FA 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}>

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto px-8 flex-1 flex flex-col justify-center items-center z-10 pb-12">
        {/* Icon */}
        <div className="mb-8 relative">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full text-[#4a5951]/80 stroke-current" fill="none" strokeWidth="0.8" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <path d="M22 6l-10 7L2 6"></path>
            </svg>
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fbf8f0] rounded-full p-1 border border-[#9E7BB5]/10 shadow-sm">
              <svg className="w-8 h-8 text-[#9E7BB5]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center mb-10 space-y-4">
          <h2 className="font-display text-4xl lg:text-5xl text-gray-900">
            Confirmaciones<br />Cerradas
          </h2>
          <p className="text-gray-600 font-light leading-relaxed text-base lg:text-lg">
            Estamos finalizando los últimos detalles con mucha ilusión. ¡Gracias por ser parte de este momento tan especial para nosotros!
          </p>
        </div>

        {/* Deadline Box */}
        <div className="w-full bg-white/80 backdrop-blur-sm border border-[#9E7BB5]/20 rounded-2xl p-6 text-center shadow-sm mb-12">
          <p className="text-[#4a5951] font-display font-medium text-lg mb-1">Cierre de RSVP</p>
          <p className="text-gray-500 text-sm font-light">
            El periodo para confirmar asistencia<br />terminó el <span className="font-semibold text-gray-700 capitalize">{formattedDeadline}</span>
          </p>
        </div>

        {/* WhatsApp Button */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full group bg-[#4a5951] hover:bg-[#3d4a43] text-white font-sans font-bold py-4 px-6 rounded-2xl shadow-lg shadow-[#4a5951]/20 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span className="text-base lg:text-lg">Enviar mensaje a los novios</span>
        </a>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#4a5951]/60">¿Necesitas ayuda urgente?</p>
        </div>

        {/* Back to Home Link */}
        <div className="mt-8">
          <Link href="/" className="text-sm text-[#4a5951] hover:text-[#9E7BB5] transition-colors underline">
            Volver al inicio
          </Link>
        </div>
      </main>

      {/* Decorative Blurs */}
      <div className="fixed top-20 right-0 -mr-20 w-64 h-64 bg-[#9E7BB5]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="fixed bottom-20 left-0 -ml-20 w-80 h-80 bg-[#4a5951]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
    </div>
  )
}

export function generateMetadata() {
  return {
    title: 'Confirmaciones Cerradas - Carlos & Dany',
    description: 'El periodo de confirmación de asistencia ha finalizado',
    robots: 'noindex, nofollow',
  }
}
