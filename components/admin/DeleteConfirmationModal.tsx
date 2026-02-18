'use client'

import { useEffect } from 'react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción es permanente y no se puede deshacer. Los datos relacionados se perderán.',
  confirmText = 'Sí, Eliminar',
  cancelText = 'Cancelar'
}: DeleteConfirmationModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div 
          className="bg-[#F9F7F2] rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
          style={{ overscrollBehavior: 'contain' }}
        >
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#a07b8f]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-[#a07b8f]">warning</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-stone-900 mb-4">
          {title}
        </h2>

        {/* Message */}
        <p className="text-center text-stone-600 text-sm leading-relaxed mb-8">
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 px-6 bg-[#a07b8f] hover:bg-[#8f6a7e] text-white font-semibold rounded-2xl transition-colors active:scale-[0.98] transform"
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 bg-transparent text-stone-600 font-semibold rounded-2xl hover:bg-stone-100 transition-colors active:scale-[0.98] transform"
          >
            {cancelText}
          </button>
        </div>
        </div>
      </div>
    </>
  )
}
