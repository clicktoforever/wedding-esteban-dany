"use client"

import { PlayCircle } from 'lucide-react'

export default function VerTrailerButton() {
  return (
    <>
      <button
        className="absolute bottom-4 lg:bottom-0 xl:-bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 lg:gap-2 text-primary hover:text-primary/80 transition-all duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer"
        aria-label="Ver Trailer"
        title="Ver Trailer"
      >
        <PlayCircle className="w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 animate-[soft-bounce_2s_infinite]" />
        <span className="text-[10px] lg:text-xs xl:text-sm font-bold tracking-widest uppercase">Ver Trailer</span>
      </button>

      <style jsx>{`
        @keyframes soft-bounce {
          0%, 100% {
            transform: translateY(-15%);
            animation-timing-function: cubic-bezier(0.8,0,1,1);
          }
          50% {
            transform: none;
            animation-timing-function: cubic-bezier(0,0,0.2,1);
          }
        }
      `}</style>
    </>
  )
}
