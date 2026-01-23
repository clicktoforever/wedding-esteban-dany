'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import SwipeableListItem from './SwipeableListItem'
import type { Database } from '@/lib/database.types'

interface Pass {
  id: string
  attendee_name: string
  confirmation_status: 'pending' | 'confirmed' | 'declined'
}

interface Guest {
  id: string
  name: string
  email?: string | null
  access_token: string
  phone?: string | null
  passes: Pass[]
}

interface EditGuestModalProps {
  isOpen: boolean
  onClose: () => void
  guest: Guest | null
  onSuccess: () => void
  onDelete: (guestId: string) => void
}

export default function EditGuestModal({
  isOpen,
  onClose,
  guest,
  onSuccess,
  onDelete
}: EditGuestModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [countryCode, setCountryCode] = useState('+')
  const [passToDelete, setPassToDelete] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    passes: [] as Pass[]
  })

  useEffect(() => {
    if (isOpen && guest) {
      document.body.style.overflow = 'hidden'
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
      
      // Extract country code from phone
      let extractedCode = '+';
      let phoneNumber = guest.phone || '';
      
      if (phoneNumber.startsWith('+593')) {
        extractedCode = '+593';
        phoneNumber = phoneNumber.substring(4);
      } else if (phoneNumber.startsWith('+52')) {
        extractedCode = '+52';
        phoneNumber = phoneNumber.substring(3);
      } else if (phoneNumber.startsWith('+57')) {
        extractedCode = '+57';
        phoneNumber = phoneNumber.substring(3);
      } else if (phoneNumber.startsWith('+')) {
        const match = phoneNumber.match(/^\+(\d+)/);
        if (match) {
          extractedCode = '+' + match[1];
          phoneNumber = phoneNumber.substring(match[0].length);
        }
      }
      
      setCountryCode(extractedCode);
      setFormData({
        name: guest.name,
        phone: phoneNumber,
        email: guest.email || '',
        passes: [...guest.passes]
      })
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, guest])

  if (!isOpen || !guest) return null

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

  const updatePassName = (passId: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      passes: prev.passes.map(pass => 
        pass.id === passId ? { ...pass, attendee_name: name } : pass
      )
    }))
  }

  const updatePassStatus = (passId: string, status: 'pending' | 'confirmed' | 'declined') => {
    setFormData(prev => ({
      ...prev,
      passes: prev.passes.map(pass => 
        pass.id === passId ? { ...pass, confirmation_status: status } : pass
      )
    }))
  }

  const handleDeletePass = async (passId: string) => {
    try {
      const supabase: any = createClient()
      const { error } = await supabase
        .from('passes')
        .delete()
        .eq('id', passId)
      
      if (error) throw error
      
      // Update local state
      setFormData(prev => ({
        ...prev,
        passes: prev.passes.filter(p => p.id !== passId)
      }))
      
      setPassToDelete(null)
      onSuccess()
    } catch (error) {
      console.error('Error deleting pass:', error)
      alert('Error al eliminar el pase')
    }
  }

  const confirmDeletePass = () => {
    if (passToDelete) {
      handleDeletePass(passToDelete)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase: any = createClient()

      // Update guest
      const phoneNumber = formData.phone ? `${countryCode}${formData.phone}` : null
      const { error: guestError} = await supabase
        .from('guests')
        .update({
          name: formData.name,
          phone: phoneNumber,
          email: formData.email || null
        })
        .eq('id', guest.id)

      if (guestError) throw guestError

      // Update passes
      for (const pass of formData.passes) {
        const { error: passError } = await supabase
          .from('passes')
          .update({
            attendee_name: pass.attendee_name,
            confirmation_status: pass.confirmation_status
          })
          .eq('id', pass.id)

        if (passError) throw passError
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating guest:', error)
      alert('Error al actualizar el invitado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    onDelete(guest.id)
    setShowDeleteModal(false)
    onClose()
  }

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-emerald-600',
      pending: 'bg-amber-600',
      declined: 'bg-stone-400'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

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
          {/* Handle Bar */}
          <div 
            className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-stone-300 rounded-full z-50 cursor-grab active:cursor-grabbing md:hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {/* Header */}
          <div className="sticky top-0 z-40 bg-[#F9F7F2] border-b border-stone-200/50 px-6 pt-8 pb-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Editar Invitado
              </h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-stone-100 rounded-full text-stone-500 hover:text-stone-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto no-scrollbar p-6 pt-2 pb-32">
            <form onSubmit={handleSubmit}>
              {/* Guest Info */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                  Información del Titular
                </h3>
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-xs font-semibold text-stone-500 mb-1.5 ml-1">
                      Nombre Completo
                    </label>
                    <input
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow font-medium text-[15px]"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-semibold text-stone-500 mb-1.5 ml-1">
                      Teléfono
                    </label>
                    <div className="relative rounded-xl shadow-soft ring-1 ring-inset ring-stone-200 bg-white flex overflow-hidden">
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
                        className="block flex-1 border-0 py-3 pl-3 text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-base sm:leading-6 bg-white"
                        type="tel"
                        placeholder="98 726 215"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-xs font-semibold text-stone-500 mb-1.5 ml-1">
                      Email
                    </label>
                    <input
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 font-medium text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-stone-200 mb-8"></div>

              {/* Passes Management */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      confirmation_number
                    </span>
                    Gestión de Pases
                  </h3>
                  <span className="text-xs font-bold bg-stone-200 text-stone-600 px-2.5 py-1 rounded-md">
                    Total: {formData.passes.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {formData.passes.map((pass, index) => {
                    const isMainPass = index === 0;
                    
                    return (
                      <SwipeableListItem
                        key={pass.id}
                        onDelete={() => setPassToDelete(pass.id)}
                        disabled={isMainPass}
                      >
                        <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                                {isMainPass ? 'Titular' : `Acompañante ${index}`}
                              </label>
                              <input
                                type="text"
                                value={pass.attendee_name}
                                onChange={(e) => updatePassName(pass.id, e.target.value)}
                                className="w-full bg-transparent border-0 p-0 text-sm font-bold text-stone-900 focus:outline-none focus:ring-0"
                              />
                            </div>
                            <select
                              value={pass.confirmation_status}
                              onChange={(e) => updatePassStatus(pass.id, e.target.value as any)}
                              className="w-full text-xs font-semibold bg-stone-50 border-0 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="confirmed">Confirmado</option>
                              <option value="pending">Pendiente</option>
                              <option value="declined">Declinado</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(pass.confirmation_status)}`}></div>
                            {!isMainPass && (
                              <button
                                type="button"
                                onClick={() => setPassToDelete(pass.id)}
                                className="hidden md:flex w-8 h-8 rounded-full bg-red-50 items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </SwipeableListItem>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>

          {/* Bottom Actions */}
          <div className="sticky bottom-0 bg-[#F9F7F2] border-t border-stone-200 p-5 flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-colors active:scale-[0.98] transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Guardar Cambios
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="w-full py-3 text-[#a07b8f] font-semibold hover:text-[#8f6a7e] transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">delete</span>
              Eliminar Invitado y Pases
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="¿Estás seguro?"
        message={`Esta acción eliminará permanentemente a ${guest.name} y todos sus pases. Los datos no se pueden recuperar.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
      />

      <DeleteConfirmationModal
        isOpen={!!passToDelete}
        onClose={() => setPassToDelete(null)}
        onConfirm={confirmDeletePass}
        title="¿Eliminar pase?"
        message="Esta acción eliminará permanentemente este pase. El dato no se puede recuperar."
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
      />
    </>
  )
}
