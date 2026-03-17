'use client'

import { useEffect } from 'react'

export default function HomeTracker({ source }: { source: 'full' | 'party' }) {
  useEffect(() => {
    document.cookie = `wedding_source=${source}; path=/; max-age=2592000`; // 30 days
  }, [source])

  return null
}
