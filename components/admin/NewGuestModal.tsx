'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/browser'

interface NewGuestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function NewGuestModal({
  isOpen,
  onClose,
  onSuccess
}: NewGuestModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [countryCode, setCountryCode] = useState('+593')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    passes: [{ name: '', isMain: true }]
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
      // Reset form
      setCountryCode('+593')
      setFormData({
        name: '',
        phone: '',
        email: '',
        passes: [{ name: '', isMain: true }]
      })
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const updatePassName = useCallback((index: number, name: string) => {
    setFormData(prev => ({
      ...prev,
      passes: prev.passes.map((pass, i) =>
        i === index ? { ...pass, name } : pass
      )
    }))
  }, [])

  // Auto-fill first pass name with guest name
  useEffect(() => {
    if (formData.name) {
      updatePassName(0, formData.name)
    }
  }, [formData.name, updatePassName])

  if (!isOpen) return null

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const diff = e.touches[0].clientY - startY
    if (diff > 0) {
      setCurrentY(diff)
    }
  }

  const handleTouchEnd = () => {
    if (currentY > 100) {
      onClose()
    }
    setCurrentY(0)
    setIsDragging(false)
  }

  const addPass = () => {
    setFormData(prev => ({
      ...prev,
      passes: [...prev.passes, { name: '', isMain: false }]
    }))
  }

  const removePass = (index: number) => {
    if (index === 0) return // Can't remove main pass
    setFormData(prev => ({
      ...prev,
      passes: prev.passes.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Create guest
      const phoneNumber = formData.phone ? `${countryCode}${formData.phone}` : null
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .insert({
          name: formData.name,
          phone: phoneNumber,
          email: formData.email || null
        } as any)
        .select()
        .single()

      if (guestError) throw guestError
      if (!guest) throw new Error('No guest data returned')

      // Create passes
      const passesData = formData.passes
        .filter(pass => pass.name.trim() !== '')
        .map(pass => ({
          guest_id: (guest as any).id,
          attendee_name: pass.name,
          confirmation_status: 'pending' as const
        }))

      if (passesData.length > 0) {
        const { error: passesError } = await supabase
          .from('passes')
          .insert(passesData as any)

        if (passesError) throw passesError
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating guest:', error)
      alert('Error al crear el invitado')
    } finally {
      setIsLoading(false)
    }
  }

  const totalPasses = formData.passes.filter(p => p.name.trim() !== '').length

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="fixed bottom-0 inset-x-0 md:inset-0 z-50 flex md:items-center md:justify-center"
        style={{
          transform: `translateY(${currentY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        <div
          className="relative flex max-h-[90dvh] md:h-[90vh] w-full md:max-w-md flex-col bg-[#F9F7F2] shadow-2xl overflow-hidden rounded-t-2xl md:rounded-2xl animate-in slide-in-from-bottom md:fade-in duration-300"
          onClick={(e) => e.stopPropagation()}
          style={{ overscrollBehavior: 'contain' }}
        >

          {/* Header */}
          <header className="flex items-center justify-between px-6 py-5 bg-[#F9F7F2] sticky top-0 z-20 border-b border-stone-200/50 pt-8 md:pt-5">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="group flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-stone-100 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-stone-500 group-hover:text-primary transition-colors">
                  close
                </span>
              </button>
              <h1 className="font-display text-2xl font-bold text-primary tracking-tight">
                Nuevo Invitado
              </h1>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-lavender/30 rounded-full border border-accent-lavender/40">
              <span className="material-symbols-outlined text-[16px] text-primary/80">
                confirmation_number
              </span>
              <p className="text-xs font-bold text-primary tracking-wide uppercase">
                Total Pases: {totalPasses}
              </p>
            </div>
          </header>

          {/* Scrollable Content */}
          <main ref={contentRef} className="flex-1 overflow-y-auto px-6 py-6 pb-32">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info Section */}
              <section className="space-y-6">
                {/* Name Input */}
                <div className="group">
                  <label className="block text-sm font-semibold text-primary mb-2 pl-1" htmlFor="name">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <input
                      className="block w-full rounded-xl border-0 py-4 pl-4 pr-10 text-stone-900 shadow-soft ring-1 ring-inset ring-stone-200 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-base sm:leading-6 bg-white transition-all duration-200"
                      id="name"
                      name="name"
                      placeholder="Ej. Danielita Briones"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="material-symbols-outlined text-stone-400">person</span>
                    </div>
                  </div>
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2 pl-1" htmlFor="phone">
                    Teléfono
                  </label>
                  <div className="relative mt-2 rounded-xl shadow-soft ring-1 ring-inset ring-stone-200 bg-white flex overflow-hidden">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="flex items-center gap-1 pl-4 pr-2 border-r border-stone-200 bg-stone-50 text-stone-700 text-sm font-medium focus:ring-2 focus:ring-inset focus:ring-primary cursor-pointer"
                    >
                      <option value="+593">🇪🇨 +593</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+">🌍 +</option>
                    </select>
                    <input
                      className="block flex-1 border-0 py-4 pl-3 text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-base sm:leading-6 bg-white"
                      id="phone"
                      name="phone"
                      placeholder="98 726 215"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2 pl-1" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      className="block w-full rounded-xl border-0 py-4 pl-4 pr-10 text-stone-900 shadow-soft ring-1 ring-inset ring-stone-200 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-base sm:leading-6 bg-white transition-all duration-200"
                      id="email"
                      name="email"
                      placeholder="correo@ejemplo.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="material-symbols-outlined text-stone-400">mail</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="my-8 border-t border-stone-200/60"></div>

              {/* Pass Management Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-primary">
                    Asignación de Boletos
                  </h2>
                </div>

                {/* Passes List */}
                <div className="space-y-3">
                  {formData.passes.map((pass, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-2xl bg-white border-2 border-accent-lavender shadow-soft transition-all duration-300 transform hover:scale-[1.01]"
                    >
                      {index === 0 && (
                        <div className="absolute top-0 right-0 rounded-bl-xl bg-accent-lavender px-3 py-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Titular</p>
                        </div>
                      )}

                      <div className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-primary font-bold shrink-0">
                          {index === 0 ? (
                            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              person
                            </span>
                          ) : (
                            <span className="text-lg">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] uppercase font-bold text-stone-400 mb-1">
                            PASE #{index + 1}
                          </p>
                          <input
                            type="text"
                            placeholder={index === 0 ? "Se asigna automáticamente" : "Nombre del acompañante"}
                            value={pass.name}
                            onChange={(e) => updatePassName(index, e.target.value)}
                            className="w-full bg-transparent border-0 p-0 text-base font-bold text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-0"
                            disabled={index === 0}
                          />
                          <p className={`text-xs flex items-center gap-1 mt-1 ${index === 0 ? 'text-emerald-600' : 'text-yellow-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-emerald-600' : 'bg-yellow-500'}`}></span>
                            {index === 0 ? 'Asignado automáticamente' : 'Pendiente'}
                          </p>
                        </div>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removePass(index)}
                            className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Pass Button */}
                <button
                  type="button"
                  onClick={addPass}
                  className="mt-4 w-full py-4 border-2 border-dashed border-stone-300 rounded-2xl text-stone-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Agregar Acompañante
                </button>
              </section>
            </form>
          </main>

          {/* Bottom Actions */}
          <div className="sticky bottom-0 bg-[#F9F7F2] border-t border-stone-200 p-5 flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !formData.name}
              className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-colors active:scale-[0.98] transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Guardar Invitado
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 text-stone-600 font-semibold hover:text-stone-900 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
