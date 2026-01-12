'use client'

import type { Database } from '@/lib/database.types'

type Pass = Database['public']['Tables']['passes']['Row']
type ConfirmationStatus = Database['public']['Enums']['confirmation_status']

interface PassCardProps {
  pass: Pass
  onUpdate: (passId: string, status: ConfirmationStatus) => Promise<void>
  disabled: boolean
}

export default function PassCard({ pass, onUpdate, disabled }: PassCardProps) {
  const statusConfig = {
    pending: {
      label: 'Pendiente',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
    },
    confirmed: {
      label: 'Confirmado',
      bgColor: 'bg-wedding-sage/10',
      textColor: 'text-wedding-forest',
      borderColor: 'border-wedding-sage',
    },
    declined: {
      label: 'No asistirá',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-200',
    },
  }

  const config = statusConfig[pass.confirmation_status]

  return (
    <div className={`bg-white border ${config.borderColor} p-6 transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-serif text-wedding-forest mb-2">
            {pass.attendee_name}
          </h3>
          <span className={`inline-block px-4 py-1 text-xs tracking-wider uppercase ${config.bgColor} ${config.textColor} font-medium`}>
            {config.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={() => onUpdate(pass.id, 'confirmed')}
          disabled={disabled || pass.confirmation_status === 'confirmed'}
          className={`py-2 px-3 text-xs tracking-wider uppercase font-medium transition-all duration-300 flex items-center justify-start gap-2 ${
            pass.confirmation_status === 'confirmed'
              ? 'bg-wedding-forest text-white'
              : 'bg-white border-2 border-gray-300 text-gray-500 hover:border-wedding-forest hover:text-wedding-forest'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="text-base">✓</span>
          <span>Asistiré</span>
        </button>
        <button
          onClick={() => onUpdate(pass.id, 'declined')}
          disabled={disabled || pass.confirmation_status === 'declined'}
          className={`py-2 px-3 text-xs tracking-wider uppercase font-medium transition-all duration-300 flex items-center justify-start gap-2 ${
            pass.confirmation_status === 'declined'
              ? 'bg-gray-400 text-white'
              : 'bg-white border-2 border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="text-base">✗</span>
          <span>No asistiré</span>
        </button>
      </div>

      {pass.dietary_restrictions && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-wedding-forest">Restricciones dietéticas:</span> {pass.dietary_restrictions}
          </p>
        </div>
      )}
      
      {pass.notes && (
        <div className="mt-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-wedding-forest">Notas:</span> {pass.notes}
          </p>
        </div>
      )}
    </div>
  )
}
