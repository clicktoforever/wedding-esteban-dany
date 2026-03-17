'use client'

import Link from 'next/link'

export default function SuccessContent({ homeUrl }: { homeUrl: string }) {

  return (
    <div className="bg-background-light text-primary font-body min-h-screen flex flex-col overflow-hidden relative">
      {/* Confetti Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
        <div className="confetti-piece c-1"></div>
        <div className="confetti-piece c-2"></div>
        <div className="confetti-piece c-3"></div>
        <div className="confetti-piece c-4"></div>
        <div className="confetti-piece c-5"></div>
        <div className="confetti-piece c-6"></div>
        <div className="confetti-piece c-7"></div>
        <div className="confetti-piece c-8"></div>
        <div className="confetti-piece c-9"></div>
        <div className="confetti-piece c-10"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-grow w-full max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto px-6 lg:px-12 xl:px-20 py-8 lg:py-12 text-center">
        {/* Icon Section */}
        <div className="relative mb-8 lg:mb-12 animate-scale-in group">
          {/* Decorative Glow */}
          <div className="absolute inset-0 rounded-full bg-accent-light/20 blur-xl transform scale-150 animate-pulse-slow"></div>

          {/* Outer Gold Ring */}
          <div className="relative flex items-center justify-center w-28 h-28 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-full border-[3px] lg:border-4 border-accent-light bg-white shadow-xl shadow-accent-light/10 transition-all duration-300">
            {/* Inner Green Check */}
            <svg className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 text-primary transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[10deg]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Decorative Sparkles */}
          <svg className="absolute -top-2 -right-2 w-5 h-5 lg:w-6 lg:h-6 text-accent-light animate-bounce" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg className="absolute bottom-0 -left-4 w-4 h-4 lg:w-5 lg:h-5 text-accent-light/60 animate-bounce delay-100" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>

        {/* Headline Block */}
        <div className="space-y-4 lg:space-y-6 mb-10 lg:mb-12 animate-fade-in-up delay-200">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-primary leading-tight transition-all duration-300">
            ¡Qué emoción!<br />
            <span className="italic text-accent-light">Ya tienes tu pase.</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 font-medium leading-relaxed max-w-[320px] lg:max-w-md xl:max-w-lg mx-auto transition-all duration-300">
            Nos hace muy felices saber que nos acompañarás en este día tan especial.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center justify-center gap-4 lg:gap-6 mb-8 lg:mb-10 opacity-60 animate-fade-in-up delay-300">
          <div className="h-[1px] w-12 lg:w-16 xl:w-20 bg-gradient-to-r from-transparent to-accent-light"></div>
          <svg className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-accent-light" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <div className="h-[1px] w-12 lg:w-16 xl:w-20 bg-gradient-to-l from-transparent to-accent-light"></div>
        </div>

        {/* Action Block */}
        <div className="w-full space-y-6 lg:space-y-8 animate-fade-in-up delay-500">
          {/* Bridge Text */}
          <h2 className="font-display text-xl lg:text-2xl xl:text-3xl font-medium text-primary leading-snug px-4 transition-all duration-300">
            ¿Te gustaría ver cómo ayudarnos a empezar nuestra vida juntos?
          </h2>

          {/* Primary Button */}
          <Link
            href="/gifts"
            className="group relative w-full overflow-hidden rounded-xl bg-primary text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 block"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="relative flex items-center justify-center gap-2 py-3 px-6 lg:px-8">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span className="font-bold text-base lg:text-lg tracking-wide">Ir a la Mesa de Regalos</span>
            </div>
          </Link>

          {/* Secondary Link */}
          <Link
            href={homeUrl}
            className="text-gray-500 hover:text-primary font-semibold text-sm lg:text-base transition-colors py-2 border-b border-transparent hover:border-primary/30 inline-block"
          >
            Volver al Inicio
          </Link>
        </div>
      </main>


      <style jsx>{`
        .confetti-piece {
          position: absolute;
          top: -20px;
          width: 10px;
          height: 20px;
          border-radius: 4px;
          z-index: 0;
          opacity: 0;
        }
        
        .c-1 { left: 10%; background-color: #967bb6; animation: fall 4s linear infinite; animation-delay: 0s; }
        .c-2 { left: 20%; background-color: #355E3B; width: 12px; height: 12px; border-radius: 50%; animation: fall 3s linear infinite; animation-delay: 1.5s; }
        .c-3 { left: 35%; background-color: #E6E6FA; animation: fall 4s linear infinite; animation-delay: 0.5s; }
        .c-4 { left: 50%; background-color: #967bb6; animation: fall 2.5s linear infinite; animation-delay: 2s; }
        .c-5 { left: 65%; background-color: #355E3B; animation: fall 3s linear infinite; animation-delay: 1s; }
        .c-6 { left: 80%; background-color: #967bb6; width: 15px; height: 15px; border-radius: 50%; animation: fall 2.5s linear infinite; animation-delay: 2.5s; }
        .c-7 { left: 90%; background-color: #E6E6FA; animation: fall 4s linear infinite; animation-delay: 0.2s; }
        .c-8 { left: 15%; background-color: #967bb6; animation: fall 3s linear infinite; animation-delay: 3s; }
        .c-9 { left: 45%; background-color: #967bb6; width: 8px; height: 25px; animation: fall 3s linear infinite; animation-delay: 1.2s; }
        .c-10 { left: 70%; background-color: #355E3B; animation: fall 4s linear infinite; animation-delay: 0.8s; }
        
        @keyframes fall {
          0% { transform: translateY(-20vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
        }
        
        .animate-scale-in {
          animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .delay-100 {
          animation-delay: 100ms;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
        
        .delay-500 {
          animation-delay: 500ms;
        }
        
        @keyframes scaleIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fadeInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  )
}
