'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function TokenTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (urlToken) {
      sessionStorage.setItem('wedding_guest_token', urlToken)
    }
  }, [searchParams])

  return null
}
