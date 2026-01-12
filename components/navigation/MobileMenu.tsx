'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    // Prevenir scroll cuando el menú está abierto
    if (!isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }

  const closeMenu = () => {
    setIsOpen(false)
    document.body.style.overflow = 'unset'
  }

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="lg:hidden relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span
          className={`block w-6 h-0.5 bg-neutral-text transition-all duration-300 ${
            isOpen ? 'rotate-45 translate-y-2' : ''
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-neutral-text transition-all duration-300 ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-neutral-text transition-all duration-300 ${
            isOpen ? '-rotate-45 -translate-y-2' : ''
          }`}
        />
      </button>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 z-40' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
      />

      {/* Mobile Menu Panel - Dropdown */}
      <div
        className={`fixed top-[74px] right-6 w-64 bg-white rounded-lg shadow-xl transition-all duration-300 origin-top-right z-50 lg:hidden ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col py-4">
          <Link
            href="/"
            className="px-6 py-3 text-base font-montaga text-neutral-text hover:bg-neutral-bg/50 transition-colors"
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link
            href="#our-story"
            className="px-6 py-3 text-base font-montaga text-neutral-text hover:bg-neutral-bg/50 transition-colors"
            onClick={closeMenu}
          >
            Nuestra Historia
          </Link>
          <Link
            href="#venue"
            className="px-6 py-3 text-base font-montaga text-neutral-text hover:bg-neutral-bg/50 transition-colors"
            onClick={closeMenu}
          >
            Lugar
          </Link>
          <Link
            href="#itinerary"
            className="px-6 py-3 text-base font-montaga text-neutral-text hover:bg-neutral-bg/50 transition-colors"
            onClick={closeMenu}
          >
            Itinerario
          </Link>
          <Link
            href="/gifts"
            className="px-6 py-3 text-base font-montaga text-neutral-text hover:bg-neutral-bg/50 transition-colors"
            onClick={closeMenu}
          >
            Regalos
          </Link>
          <Link
            href="#rsvp"
            className="px-6 py-3 text-base font-montaga text-neutral-text hover:bg-neutral-bg/50 transition-colors"
            onClick={closeMenu}
          >
            RSVP
          </Link>
        </nav>
      </div>
    </>
  )
}
