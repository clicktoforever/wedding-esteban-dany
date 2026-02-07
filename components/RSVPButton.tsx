'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RSVPButton() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isFooterVisible, setIsFooterVisible] = useState(false)

  useEffect(() => {
    // Capturar el token de la URL cuando carga la página
    const urlToken = searchParams.get('token')
    
    if (urlToken) {
      // Guardar el token en sessionStorage para persistir durante la sesión
      sessionStorage.setItem('wedding_guest_token', urlToken)
      setToken(urlToken)
      
      // Limpiar la URL removiendo el parámetro token para mejor UX
      router.replace('/', { scroll: false })
    } else {
      // Verificar si ya existe un token guardado en la sesión
      const savedToken = sessionStorage.getItem('wedding_guest_token')
      if (savedToken) {
        setToken(savedToken)
      }
    }
    
    setIsLoading(false)
  }, [searchParams, router])

  useEffect(() => {
    // Observar cuando el footer es visible
    const footer = document.querySelector('footer')
    if (!footer) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting)
      },
      {
        threshold: 0.1, // Se activa cuando el 10% del footer es visible
      }
    )

    observer.observe(footer)

    return () => {
      observer.disconnect()
    }
  }, [])

  // Si hay token guardado, usar ese; si no, usar un placeholder
  const confirmUrl = token ? `/confirm/${token}` : '/confirm/tu-codigo'

  return (
    <Link
      href={confirmUrl}
      className={`bg-primary hover:bg-opacity-90 text-white font-bold rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transform transition-all duration-500 hover:scale-105 active:scale-95 ${
        isFooterVisible
          ? 'w-14 h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 p-0'
          : 'py-4 lg:py-5 xl:py-6 px-8 lg:px-10 xl:px-12 gap-2 lg:gap-3'
      }`}
      title={isFooterVisible ? 'Confirmar Asistencia' : undefined}
    >
      <svg className={`transition-all duration-500 ${
        isFooterVisible
          ? 'w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8'
          : 'w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7'
      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className={`text-sm lg:text-base xl:text-lg transition-all duration-500 overflow-hidden whitespace-nowrap ${
        isFooterVisible ? 'w-0 opacity-0' : 'w-auto opacity-100'
      }`}>
        Confirmar Asistencia
      </span>
    </Link>
  )
}
