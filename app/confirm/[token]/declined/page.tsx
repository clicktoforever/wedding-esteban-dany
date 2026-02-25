'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function DeclinedPage() {
  return (
    <div className="bg-background-light text-primary font-display antialiased min-h-screen flex flex-col">
      {/* Header / Close Button */}
      <div className="fixed top-0 right-0 z-50 p-6">
        <Link
          href="/"
          className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/40 transition-colors duration-300"
        >
          <svg className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>

      {/* Hero Image Section */}
      <div className="relative w-full h-[45vh] overflow-hidden">
        <div
          className="w-full h-full relative"
          style={{
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
          }}
        >
          <Image
            alt="Pareja"
            src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F790a0c4639d04587bf521569bd5ac12a"
            fill
            className="object-cover scale-105 brightness-110 contrast-[0.95]"
            priority
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent"></div>
        </div>

        {/* Heart Icon positioned on bottom border */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse-slow"></div>
            <svg className="w-10 h-10 text-primary relative z-10 transition-all duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-md mx-auto px-8 flex flex-col items-center text-center -mt-4 relative z-10">
        <h1 className="text-primary text-4xl lg:text-5xl font-display font-medium leading-tight mb-4 tracking-tight">
          Te extrañaremos...
        </h1>

        <div className="relative mb-6">
          <p className="font-body text-gray-600 text-base font-light leading-relaxed max-w-[280px] sm:max-w-[300px] mx-auto italic">
            Entendemos perfectamente. Aunque no puedas estar físicamente, sabemos que nos acompañas de corazón.
          </p>
        </div>
      </main>

      {/* Footer Action Area */}
      <footer className="w-full max-w-md mx-auto px-8 pb-10 flex flex-col items-center mt-2">
        <div className="w-12 h-[1px] bg-accent/40 mb-4"></div>



        <Link
          href="/gifts"
          className="w-full bg-white/50 border border-accent backdrop-blur-sm hover:bg-accent/10 active:scale-[0.98] transition-all duration-300 rounded-xl h-14 flex items-center justify-center gap-3 group"
        >
          <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span className="font-body font-medium text-primary text-base tracking-wide">
            Enviar un detalle a los Novios
          </span>
        </Link>
        <div className="h-4"></div>
      </footer>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}
