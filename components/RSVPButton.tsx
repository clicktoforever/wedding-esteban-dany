'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RSVPButton() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    // Capturar el token de la URL cuando carga la página
    const urlToken = searchParams.get('token')
    
    if (urlToken) {
      // Guardar el token en localStorage
      localStorage.setItem('wedding_token', urlToken)
      setToken(urlToken)
      
      // Limpiar la URL removiendo el parámetro token (opcional)
      router.replace('/', { scroll: false })
    } else {
      // Verificar si ya existe un token guardado
      const savedToken = localStorage.getItem('wedding_token')
      if (savedToken) {
        setToken(savedToken)
      }
    }
  }, [searchParams, router])

  // Si hay token guardado, usar ese; si no, usar un placeholder
  const confirmUrl = token ? `/confirm/${token}` : '/confirm/tu-codigo'

  return (
    <Link href={confirmUrl} className="wedding-btn-primary">
      Confirmar Asistencia
    </Link>
  )
}
