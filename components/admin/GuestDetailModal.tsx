'use client'

import { useEffect, useRef, useState } from 'react'
import DeleteConfirmationModal from './DeleteConfirmationModal'

interface Pass {
  id: string
  attendee_name: string
  confirmation_status: 'pending' | 'confirmed' | 'declined'
}

interface Guest {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  access_token: string
  notified_whatsapp: boolean
  passes: Pass[]
}

interface GuestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  guest: Guest | null
  onEdit: (guest: Guest) => void
  onDelete: (guestId: string) => void
}

export default function GuestDetailModal({
  isOpen,
  onClose,
  guest,
  onEdit,
  onDelete
}: GuestDetailModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !guest) return null

  const confirmedPasses = guest.passes.filter(p => p.confirmation_status === 'confirmed').length
  const totalPasses = guest.passes.length
  const hasPhone = guest.phone && guest.phone.trim() !== ''
  const hasEmail = guest.email && guest.email.trim() !== ''

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: 'bg-green-50 text-green-700 border-green-100',
      pending: 'bg-amber-50 text-amber-700 border-amber-100',
      declined: 'bg-stone-100 text-stone-500 border-stone-200'
    }
    const labels = {
      confirmed: 'Confirmado',
      pending: 'Pendiente',
      declined: 'Declinado'
    }
    return { class: badges[status as keyof typeof badges], label: labels[status as keyof typeof labels] }
  }

  const mainStatus = guest.passes[0]?.confirmation_status || 'pending'
  const statusBadge = getStatusBadge(mainStatus)

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

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    onDelete(guest.id)
    setShowDeleteModal(false)
    onClose()
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
        className="fixed bottom-0 inset-x-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4"
      >
        <div 
          className="relative flex max-h-[90dvh] md:h-[90vh] w-full md:max-w-md flex-col bg-[#F9F7F2] shadow-2xl overflow-hidden rounded-t-2xl md:rounded-[32px] animate-in slide-in-from-bottom duration-300"
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: `translateY(${currentY}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            overscrollBehavior: 'contain'
          }}
        >
          {/* Handle Bar */}
          <div 
            className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-stone-300 rounded-full z-50 cursor-grab active:cursor-grabbing md:hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {/* Header */}
          <div className="sticky top-0 z-40 bg-[#F9F7F2] border-b border-stone-200/50 px-4 py-3 flex items-center justify-between pt-8 md:pt-3">
            <button 
              onClick={onClose}
              className="flex items-center text-primary group/nav transition-opacity active:opacity-60"
            >
              <span className="material-symbols-outlined text-[32px] -ml-2 transition-transform group-hover/nav:-translate-x-0.5">
                chevron_left
              </span>
            </button>
            <h2 className="text-[17px] font-bold text-stone-900 absolute left-1/2 -translate-x-1/2 w-max">
              Detalles del Invitado
            </h2>
            <div className="w-10"></div>
          </div>

          {/* Scrollable Content */}
          <div 
            ref={contentRef} 
            className="flex-1 overflow-y-auto p-5 pb-32"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Status Badge */}
            <div className="flex flex-col items-center justify-center pt-2 mb-6">
              <div className={`relative flex items-center gap-2 text-white px-6 py-3 rounded-full shadow-lg ring-4 ring-white/50 ${
                mainStatus === 'confirmed' 
                  ? 'bg-green-600 shadow-green-600/25' 
                  : mainStatus === 'pending' 
                  ? 'bg-yellow-500 shadow-yellow-500/25' 
                  : 'bg-stone-400 shadow-stone-400/25'
              }`}>
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {mainStatus === 'confirmed' ? 'check_circle' : mainStatus === 'pending' ? 'schedule' : 'cancel'}
                </span>
                <span className="text-[15px] font-bold uppercase tracking-wider">
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-2 font-medium">Actualizado recientemente</p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-soft border border-stone-200 relative overflow-hidden group/card transition-all hover:shadow-md mb-6">
              <div className="h-2 w-full bg-gradient-to-r from-primary to-primary"></div>
              <div className="p-6 pt-5 flex flex-col gap-6">
                {/* Header Info */}
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-[72px] h-[72px] rounded-2xl bg-stone-100 overflow-hidden shadow-inner flex items-center justify-center">
                      <span className="text-3xl font-display font-bold text-primary">
                        {guest.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-xl p-1.5 shadow-sm border border-stone-200">
                      <span className="material-symbols-outlined text-primary text-[18px] block">person</span>
                    </div>
                  </div>
                  <div className="flex flex-col pt-1 flex-1 min-w-0">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">
                      Invitado Principal
                    </p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-stone-900 leading-tight truncate">
                        {guest.name}
                      </h3>
                    </div>
                    <p className="text-stone-400 text-sm mt-1">
                      {totalPasses} {totalPasses === 1 ? 'pase' : 'pases'}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-stone-100 w-full"></div>

                {/* Contact Info */}
                <div className="flex flex-col gap-3.5">
                  {hasPhone && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-[20px]">call</span>
                        </div>
                        <span className="text-stone-700 font-medium text-[15px] truncate">
                          {guest.phone}
                        </span>
                      </div>
                      <a
                        href={`https://wa.me/${guest.phone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#20bd5a] text-white py-2 pl-3 pr-4 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 shrink-0"
                      >
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                        <span className="text-sm font-bold">WhatsApp</span>
                      </a>
                    </div>
                  )}

                  {hasEmail && (
                    <div className="flex items-center gap-3 group/email cursor-pointer">
                      <div className="w-9 h-9 rounded-lg bg-stone-50 flex items-center justify-center text-stone-400 group-hover/email:text-stone-600 transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[20px]">mail</span>
                      </div>
                      <span className="text-stone-700 font-medium text-[15px] truncate">
                        {guest.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Passes List */}
            <div className="flex flex-col gap-3">
              <div className="flex items-end justify-between px-1 mb-1">
                <h3 className="text-lg font-bold text-stone-900 leading-none">Acompañantes</h3>
                <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-md">
                  {totalPasses} {totalPasses === 1 ? 'Persona' : 'Personas'}
                </span>
              </div>

              {guest.passes.map((pass, index) => {
                const passBadge = getStatusBadge(pass.confirmation_status)
                return (
                  <div 
                    key={pass.id}
                    className="bg-white rounded-xl px-4 py-3 shadow-sm border border-transparent hover:border-stone-200 transition-colors flex items-center justify-between group/comp"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-bold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-900 truncate">
                          {pass.attendee_name}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border mt-1 ${passBadge.class}`}>
                          {passBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="sticky bottom-0 bg-[#F9F7F2] border-t border-stone-200 p-5 flex gap-3">
            <button
              onClick={() => onEdit(guest)}
              className="flex-1 py-3.5 px-6 bg-[#F9F7F2] border-2 border-primary text-primary font-semibold rounded-xl transition-colors active:scale-[0.98] transform flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3.5 px-6 bg-[#F9F7F2] border-2 border-[#a07b8f] text-[#a07b8f] font-semibold rounded-xl transition-colors active:scale-[0.98] transform flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
              Eliminar
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
    </>
  )
}
