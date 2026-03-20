"use client"

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { PlayCircle, X, Loader2 } from 'lucide-react'

export default function VerTrailerButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Solo renderizar el portal en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Manejo súper estricto del body para evitar bugs de scroll y bordes negros
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setIsLoading(true); 
      
      // Forzar un repintado en Safari iOS para eliminar los bordes negros que quedan
      // tras salir del reproductor nativo FullScreen
      setTimeout(() => {
        window.scrollTo(window.scrollX, window.scrollY);
        window.dispatchEvent(new Event('resize'));
      }, 50);
      
      setTimeout(() => {
        window.scrollTo(window.scrollX, window.scrollY);
      }, 300);
    }
    
    return () => {
      document.body.style.overflow = '';
    }
  }, [isOpen])

  // Escuchar cuando el usuario sale del fullscreen nativo (deslizando abajo en iOS, etc)
  useEffect(() => {
    if (!mounted) return;

    const handleFullscreenChange = () => {
      const doc = document as any;
      const isFullscreen = !!(
        doc.fullscreenElement || 
        doc.webkitFullscreenElement || 
        doc.webkitCurrentFullScreenElement
      );
      
      // Si el navegador avisa que salimos de fullscreen, cerramos TODO el modal
      if (!isFullscreen && isOpen) {
        setIsOpen(false);
        if (videoRef.current) videoRef.current.pause();
      }
    };

    // iOS Safari a veces dispara eventos en el propio elemento de video, no en document
    const videoElement = videoRef.current;
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    if (videoElement) {
      videoElement.addEventListener('webkitendfullscreen', handleFullscreenChange);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      if (videoElement) {
        videoElement.removeEventListener('webkitendfullscreen', handleFullscreenChange);
      }
    }
  }, [isOpen, mounted])

  const handleOpenVideo = () => {
    setIsOpen(true)
    
    // Si el video ya está montado, forzamos play y fullscreen nativo
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      
      const playPromise = videoRef.current.play()
      
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log('Autoplay prevent:', e)
          // Si el autoplay falla, al menos quitamos el estado de carga
          // para que el usuario vea los controles y pueda darle play manual
          setIsLoading(false)
        })
      }
      
      // Intentar abrir envoltorio FullScreen Nativo del sistema para inmersión total (Celulares)
      const elem = videoRef.current as any
      if (elem.webkitEnterFullscreen) { /* iOS Safari (iPhone) - muy importante para Safari móvil */
        elem.webkitEnterFullscreen()
      } else if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err: any) => console.log('No fullscreen support', err))
      } else if (elem.webkitRequestFullscreen) { /* Safari desktop */
        elem.webkitRequestFullscreen()
      }
    }
  }

  const handleCloseVideo = () => {
    setIsOpen(false)
    if (videoRef.current) {
      videoRef.current.pause()
    }
    // Salir de pantalla completa si está activa
    const doc = document as any
    if (doc.exitFullscreen && doc.fullscreenElement) {
      doc.exitFullscreen().catch(() => {})
    } else if (doc.webkitExitFullscreen && doc.webkitFullscreenElement) {
      doc.webkitExitFullscreen()
    }
  }

  const handleVideoCanPlay = () => {
    setIsLoading(false)
  }

  const handleVideoWaiting = () => {
    setIsLoading(true)
  }
  return (
    <>
      <button
        onClick={handleOpenVideo}
        className="absolute bottom-4 lg:bottom-0 xl:-bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 lg:gap-2 text-primary hover:text-primary/80 transition-all duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer"
        aria-label="Ver Trailer"
        title="Ver Trailer"
      >
        <PlayCircle className="w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 animate-[soft-bounce_2s_infinite]" />
        <span className="text-[10px] lg:text-xs xl:text-sm font-bold tracking-widest uppercase">Ver Trailer</span>
      </button>

      {mounted && createPortal(
        <div 
          className={`fixed top-0 left-0 w-[100dvw] h-[100dvh] z-[999999] bg-black bg-opacity-95 flex flex-col justify-center items-center overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}
          onClick={handleCloseVideo}
          style={{ touchAction: 'none' }}
        >
          <button 
            onClick={handleCloseVideo}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[1000000] p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md"
            aria-label="Cerrar video"
          >
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          <div 
            className="relative w-full h-full flex items-center justify-center p-0 m-0"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 z-[10]">
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
                <span className="text-sm tracking-widest uppercase animate-pulse">Cargando trailer...</span>
              </div>
            )}
            
            {/* 
              q_auto: Calidad visual inteligente
              f_auto: Entrega el formato ideal según dispositivo (webm, mp4, etc)
            */}
            <video 
              ref={videoRef}
              className={`w-full h-full object-contain transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              src="https://res.cloudinary.com/dmoyancsh/video/upload/q_auto,f_auto/v1774026358/video-trailer_ngwd58.mp4" 
              controls
              playsInline
              preload="auto"
              onEnded={handleCloseVideo}
              onCanPlay={handleVideoCanPlay}
              onLoadedData={handleVideoCanPlay}
              onPlaying={handleVideoCanPlay}
              onWaiting={handleVideoWaiting}
            />
          </div>
        </div>,
        document.body
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
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
