import Link from 'next/link'
import WeddingCountdown from '@/components/builder/WeddingCountdown'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

export default async function Page() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-8 text-sm tracking-wider uppercase">
              <Link href="/" className="text-gray-600 hover:text-wedding-forest transition-colors">Inicio</Link>
              <Link href="/gifts" className="text-gray-600 hover:text-wedding-forest transition-colors">Regalos</Link>
            </div>
            <h1 className="text-2xl font-serif tracking-wider text-wedding-forest">
              ESTEBAN & DANY
            </h1>
            <Link href="/admin" className="text-sm tracking-wider uppercase text-gray-600 hover:text-wedding-forest transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Decorative Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white z-10"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #4D5D53 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto text-wedding-sage opacity-40" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 10 Q30 30 30 50 Q30 70 50 90 Q70 70 70 50 Q70 30 50 10" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-wedding-forest mb-8 tracking-tight">
            CONVIRTIENDO TUS SUEÑOS<br />
            <span className="text-wedding-purple italic">DE BODA EN REALIDAD</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Cuidando cada detalle para dar forma a tu día perfecto de boda.
          </p>
          
          <Link href="/gifts" className="btn-primary inline-block">
            Comenzar
          </Link>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24">
            <path d="M0,0 C300,80 600,80 900,40 L1200,20 L1200,120 L0,120 Z" fill="white"></path>
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <svg className="w-16 h-16 mx-auto text-wedding-sage opacity-30" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="30" r="20"/>
                <path d="M30 50 Q50 70 70 50 M20 70 Q50 90 80 70"/>
              </svg>
            </div>
            
            <h2 className="heading-secondary mb-8">
              SOMOS <span className="italic text-wedding-purple">APASIONADOS</span> POR CREAR<br />
              LAS MEJORES BODAS, CON AÑOS DE <span className="italic">EXPERIENCIA</span><br />
              Y UN <span className="italic text-wedding-purple">PORTAFOLIO</span> DE INCONTABLES TRABAJOS.
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 mt-16 text-left">
              <div className="text-body">
                <p className="mb-4">
                  Aquí entendemos que tu día de boda es un capítulo en tu historia de amor, 
                  y estamos aquí para asegurar que sea una obra maestra. Con años de experiencia 
                  en la orquestación de bodas de ensueño, hemos ganado una reputación por crear 
                  amor inolvidable.
                </p>
              </div>
              <div className="text-body">
                <p className="mb-4">
                  Nuestro viaje está tejido con pasión por el amor, diseño y planificación meticulosa. 
                  No somos simples planificadores de eventos casuales, somos curadores profesionales 
                  de memorias dedicados a hacer que tu día especial sea un reflejo de tu historia de amor única.
                </p>
                <p className="mt-8 font-serif text-2xl text-wedding-forest italic">
                  Con amor,
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="section-padding bg-gradient-soft">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="heading-secondary mb-4">
              PARA TU <span className="italic text-wedding-purple">DÍA DE ENSUEÑO</span>
            </h2>
          </div>
          <WeddingCountdown 
            targetDate="2026-06-15T18:00:00"
            title="Faltan"
          />
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <p className="text-sm tracking-widest uppercase text-wedding-sage mb-4">GALERÍA</p>
            <h2 className="heading-secondary">
              ÚLTIMAS <span className="italic">BODAS</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Large Image Left */}
            <div className="relative h-96 md:h-[600px] bg-wedding-beige/20 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-sm tracking-wider mb-2">Gerald Johnson & Erica Steward</p>
                <p className="text-xs opacity-80">( 2023 )</p>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-8">
              <div className="relative h-44 bg-wedding-rose/20 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="relative h-80 bg-wedding-lavender/20 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-padding bg-gradient-soft">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-body mb-8">
              Mantente al tanto de las últimas tendencias, consejos y ofertas exclusivas. 
              Suscríbete a nuestro boletín y sé el primero en conocer sobre los próximos 
              eventos de DREAMDAY y promociones.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Ingresa tu email..." 
                className="w-full px-6 py-3 border border-gray-300 focus:outline-none focus:border-wedding-forest transition-colors"
              />
              <button className="btn-primary w-full sm:w-auto whitespace-nowrap">
                Suscribirse
              </button>
            </div>
            
            <div className="mt-16">
              <svg className="w-48 h-24 mx-auto text-wedding-sage opacity-20" viewBox="0 0 200 100" fill="currentColor">
                <path d="M20 50 Q40 30 60 50 T100 50 T140 50 T180 50" stroke="currentColor" strokeWidth="1" fill="none"/>
                <circle cx="40" cy="40" r="8"/>
                <circle cx="100" cy="35" r="10"/>
                <circle cx="160" cy="45" r="7"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-serif text-wedding-forest mb-4">
                DÉJANOS SER <span className="italic text-wedding-purple">QUIENES HAGAN REALIDAD</span><br />
                TU CEREMONIA DE BODA DE ENSUEÑO.
              </h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
              <div>
                <h4 className="text-sm tracking-wider uppercase text-wedding-forest mb-4 font-semibold">Acerca de</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/about" className="hover:text-wedding-forest transition-colors">Sobre Nosotros</Link></li>
                  <li><Link href="/story" className="hover:text-wedding-forest transition-colors">Nuestra Historia</Link></li>
                  <li><Link href="/testimonials" className="hover:text-wedding-forest transition-colors">Testimonios</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm tracking-wider uppercase text-wedding-forest mb-4 font-semibold">Servicios</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/venue" className="hover:text-wedding-forest transition-colors">Lugar</Link></li>
                  <li><Link href="/catering" className="hover:text-wedding-forest transition-colors">Catering</Link></li>
                  <li><Link href="/gifts" className="hover:text-wedding-forest transition-colors">Mesa de Regalos</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm tracking-wider uppercase text-wedding-forest mb-4 font-semibold">Contacto</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Teléfono: +52 XXX XXX XXXX</li>
                  <li>Email: hola@estebanydany.com</li>
                  <li>Ubicación: Ciudad de México</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                © 2026. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Esteban & Dany - Boda 15 Junio 2026',
    description: 'Te invitamos a celebrar nuestra boda el 15 de Junio, 2026. Convirtiendo nuestros sueños en realidad.',
  }
}
