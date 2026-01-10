'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/browser'
import PassCard from './PassCard'
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
}

export default function GuestConfirmation({ guest, token }: GuestConfirmationProps) {
  const [passes, setPasses] = useState<Pass[]>(guest.passes)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

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
          text: 'Hubo un error al actualizar. Por favor intenta de nuevo.',
        })
        console.error('Error updating pass:', error)
      } else {
        setMessage({
          type: 'success',
          text: 'Confirmación actualizada correctamente',
        })
        
        // Refetch to ensure consistency
        const { data } = await supabase
          .from('passes')
          .select('*')
          .eq('guest_id', guest.id)
        
        if (data) {
          setPasses(data)
        }
      }
    })
  }

  const confirmAll = async () => {
    setMessage(null)

    // Optimistic update
    const updatedPasses = passes.map(pass => ({
      ...pass,
      confirmation_status: 'confirmed' as ConfirmationStatus,
    }))
    setPasses(updatedPasses)

    startTransition(async () => {
      const { error } = await supabase
        .from('passes')
        .update({ confirmation_status: 'confirmed' })
        .eq('guest_id', guest.id)

      if (error) {
        // Rollback on error
        setPasses(guest.passes)
        setMessage({
          type: 'error',
          text: 'Hubo un error al confirmar todos. Por favor intenta de nuevo.',
        })
        console.error('Error confirming all:', error)
      } else {
        setMessage({
          type: 'success',
          text: '¡Todos los pases confirmados correctamente!',
        })
        
        // Refetch to ensure consistency
        const { data } = await supabase
          .from('passes')
          .select('*')
          .eq('guest_id', guest.id)
        
        if (data) {
          setPasses(data)
        }
      }
    })
  }

  const allConfirmed = passes.every(pass => pass.confirmation_status === 'confirmed')
  const allDeclined = passes.every(pass => pass.confirmation_status === 'declined')

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-6 border ${
            message.type === 'success'
              ? 'bg-wedding-sage/10 text-wedding-forest border-wedding-sage'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
          role="alert"
        >
          <p className="text-center font-medium">{message.text}</p>
        </div>
      )}

      <div className="space-y-4">
        {passes.map(pass => (
          <PassCard
            key={pass.id}
            pass={pass}
            onUpdate={updatePass}
            disabled={isPending}
          />
        ))}
      </div>

      {!allConfirmed && !allDeclined && (
        <button
          onClick={confirmAll}
          disabled={isPending}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Confirmando...' : 'Confirmar Todos'}
        </button>
      )}

      {allConfirmed && (
        <div className="bg-wedding-beige border-2 border-wedding-sage p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-serif text-wedding-forest mb-2">
            ¡Gracias por Confirmar!
          </h3>
          <p className="text-gray-600">
            Nos emociona mucho compartir este día especial contigo
          </p>
        </div>
      )}

      {allDeclined && (
        <div className="bg-gray-50 border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-serif text-gray-700 mb-2">
            Lamentamos que no puedas asistir
          </h3>
          <p className="text-gray-600">
            ¡Te extrañaremos en nuestro día especial!
          </p>
        </div>
      )}

      <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-100">
        <p>Puedes cambiar tu confirmación las veces que necesites hasta la fecha límite</p>
      </div>
    </div>
  )
}
