'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/browser'
import type { Database } from '@/lib/database.types'

type Guest = Database['public']['Tables']['guests']['Row']
type Pass = Database['public']['Tables']['passes']['Row']
type ConfirmationStatus = Database['public']['Enums']['confirmation_status']

interface GuestWithPasses extends Guest {
  passes: Pass[]
}

interface GuestConfirmationProps {
  guest: GuestWithPasses
  token: string
  deadline: Date | null
}

export default function GuestConfirmation({ guest, token, deadline }: GuestConfirmationProps) {
  const [passes, setPasses] = useState<Pass[]>(guest.passes)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  const confirmedCount = passes.filter(p => p.confirmation_status === 'confirmed').length
  const totalCount = passes.length

  const updatePass = async (passId: string, status: ConfirmationStatus) => {
    setMessage(null)

    // Optimistic update
    setPasses(prev =>
      prev.map(pass =>
        pass.id === passId ? { ...pass, confirmation_status: status } : pass
      )
    )

    startTransition(async () => {
      const { error } = await supabase
        .from('passes')
        .update({ confirmation_status: status })
        .eq('id', passId)
        .eq('guest_id', guest.id)

      if (error) {
        // Rollback on error
        setPasses(guest.passes)
        setMessage({
          type: 'error',
          text: 'Error al actualizar. Por favor intenta de nuevo.',
        })
      } else {
        setMessage({
          type: 'success',
          text: 'Confirmación actualizada correctamente',
        })
        setTimeout(() => setMessage(null), 3000)
      }
    })
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Format deadline date
  const formattedDeadline = deadline ? deadline.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Guayaquil'
  }) : null

  return (
    <>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tu Grupo</span>
          <span className="text-sm font-bold text-primary">{confirmedCount} de {totalCount} confirmados</span>
        </div>
        <div className="h-2 w-full bg-accent/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${(confirmedCount / totalCount) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-display text-4xl lg:text-5xl xl:text-6xl text-gray-900 mb-2 transition-all duration-300">
          ¡Hola, <span className="text-primary italic">{guest.name.split(' ')[0]}</span>!
        </h2>
        <p className="text-gray-600 font-light leading-relaxed text-base lg:text-lg">
          Estamos muy felices de celebrar con ustedes. Por favor confirma quiénes podrán acompañarnos.
        </p>
        {formattedDeadline && (
          <div className="mt-4 inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-2">
            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              Plazo máximo: <span className="text-secondary capitalize font-semibold">{formattedDeadline}</span>
            </p>
          </div>
        )}
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-2xl ${message.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-600'} transition-all duration-300`}>
          <p className="text-sm font-medium text-center">{message.text}</p>
        </div>
      )}

      {/* Guest Cards */}
      <div className="space-y-6 mb-8">
        {passes.map((pass) => {
          const isConfirmed = pass.confirmation_status === 'confirmed'
          const isDeclined = pass.confirmation_status === 'declined'
          const isPending = pass.confirmation_status === 'pending'

          return (
            <div 
              key={pass.id} 
              className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group transition-all duration-300 ${isPending ? 'opacity-80 hover:opacity-100' : ''}`}
            >
              {/* Left Accent Bar for confirmed */}
              {isConfirmed && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary/30"></div>
              )}

              {/* Header */}
              <div className={`flex items-center justify-between mb-4 ${isConfirmed ? 'pl-3' : ''}`}>
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-display font-bold text-lg transition-all duration-300 ${
                    isConfirmed 
                      ? 'bg-primary/10 text-primary' 
                      : isDeclined 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-accent/50 text-secondary'
                  }`}>
                    {getInitials(pass.attendee_name || 'Invitado')}
                  </div>
                  {/* Name */}
                  <h3 className="font-display text-xl lg:text-2xl text-gray-900 transition-all duration-300">
                    {pass.attendee_name || 'Invitado'}
                  </h3>
                </div>
                {/* Check Icon */}
                {isConfirmed && (
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {/* Buttons */}
              <div className={`flex gap-3 ${isConfirmed ? 'pl-3' : ''}`}>
                <button
                  onClick={() => updatePass(pass.id, 'confirmed')}
                  disabled={isPending && isConfirmed}
                  className={`flex-1 py-3 lg:py-4 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-sm lg:text-base transition-all duration-300 ${
                    isConfirmed
                      ? 'bg-primary text-white shadow-md transform scale-[1.02]'
                      : 'border border-gray-300 text-gray-500 bg-transparent hover:border-primary hover:text-primary'
                  } ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
                >
                  {isConfirmed && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span>Asistiré</span>
                </button>
                <button
                  onClick={() => updatePass(pass.id, 'declined')}
                  disabled={isPending && isDeclined}
                  className={`flex-1 py-3 lg:py-4 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-sm lg:text-base transition-all duration-300 ${
                    isDeclined
                      ? 'border-2 border-gray-400 text-gray-700 bg-gray-50'
                      : 'border border-gray-300 text-gray-500 bg-transparent hover:bg-gray-50'
                  } ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
                >
                  {isDeclined && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span>No Asistiré</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light via-background-light to-transparent pointer-events-none flex justify-center pb-8 pt-12 z-40">
        <div className="w-full max-w-md lg:max-w-2xl xl:max-w-4xl px-6 lg:px-12 xl:px-20">
          <button 
            onClick={() => {
              // Check if all passes are declined
              const allDeclined = passes.every(
                pass => pass.confirmation_status === 'declined'
              )

              if (allDeclined) {
                // Redirect to declined page
                window.location.href = `/confirm/${token}/declined`
                return
              }

              // Validate that at least one pass is confirmed
              const hasConfirmed = passes.some(
                pass => pass.confirmation_status === 'confirmed'
              )

              if (!hasConfirmed) {
                setMessage({
                  type: 'error',
                  text: 'Debes confirmar al menos una asistencia antes de continuar.',
                })
                return
              }

              // Redirect to success page
              window.location.href = `/confirm/${token}/success`
            }}
            disabled={isPending}
            className="pointer-events-auto w-full bg-primary hover:bg-[#2C4F32] text-white font-body font-bold py-4 lg:py-5 px-6 lg:px-8 rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2 text-base lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isPending ? 'Guardando...' : 'Guardar Cambios'}</span>
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
