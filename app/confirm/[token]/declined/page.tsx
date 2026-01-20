'use client'

import Link from 'next/link'

export default function DeclinedPage() {
  return (
    <div className="bg-background-light text-primary font-display antialiased min-h-screen flex flex-col items-center justify-between">
      {/* Header / Close Button */}
      <div className="w-full flex items-center justify-end p-6 pb-2">
        <Link
          href="/"
          className="group flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-transparent hover:bg-black/5 transition-colors duration-300"
        >
          <svg className="w-7 h-7 lg:w-8 lg:h-8 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md lg:max-w-2xl xl:max-w-4xl px-8 lg:px-12 xl:px-20 flex flex-col items-center justify-center text-center -mt-12 transition-all duration-300">
        {/* Pulsing Heart Icon */}
        <div className="relative w-24 h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 mb-8 lg:mb-12 flex items-center justify-center transition-all duration-300">
          {/* Outer subtle glow/pulse */}
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse-slow"></div>
          {/* The Heart Icon */}
          <svg className="w-20 h-20 lg:w-28 lg:h-28 xl:w-32 xl:h-32 text-accent animate-pulse-slow relative z-10 transition-all duration-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-primary text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-medium leading-tight mb-6 lg:mb-8 tracking-tight transition-all duration-300">
          Te extrañaremos...
        </h1>

        {/* Body Text */}
        <div className="relative mb-12 lg:mb-16">
          {/* Decorative vertical line top */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[1px] h-3 lg:h-4 bg-accent/40"></div>
          <p className="font-body text-gray-600 text-lg lg:text-xl xl:text-2xl font-light leading-relaxed max-w-[320px] lg:max-w-md xl:max-w-lg mx-auto transition-all duration-300">
            Entendemos perfectamente. Aunque no puedas estar físicamente, sabemos que nos acompañas de corazón.
          </p>
          {/* Decorative vertical line bottom */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[1px] h-3 lg:h-4 bg-accent/40"></div>
        </div>
      </main>

      {/* Footer Action Area */}
      <footer className="w-full max-w-md lg:max-w-2xl xl:max-w-4xl px-8 lg:px-12 xl:px-20 pb-12 lg:pb-16 flex flex-col items-center transition-all duration-300">
        {/* Pivot Text */}
        <p className="font-display italic text-gray-500 text-sm lg:text-base xl:text-lg mb-4 lg:mb-6 text-center transition-all duration-300">
          Si deseas hacernos llegar tu cariño a la distancia...
        </p>

        {/* Secondary Button (Outlined) */}
        <Link
          href="/gifts"
          className="w-full bg-transparent border border-accent hover:bg-accent/10 active:scale-[0.98] transition-all duration-300 rounded-lg h-14 lg:h-16 xl:h-18 flex items-center justify-center gap-3 group"
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span className="font-body font-medium text-primary text-base lg:text-lg tracking-wide">
            Enviar un detalle a los Novios
          </span>
        </Link>

        {/* Spacing */}
        <div className="h-6 lg:h-8"></div>
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
