'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import MoneyDisplay from './MoneyDisplay'
import type { Database } from '@/lib/database.types'

type Transaction = Database['public']['Tables']['gift_transactions']['Row']
type Gift = Database['public']['Tables']['gifts']['Row']

interface TransactionWithGift extends Transaction {
  gifts: Gift | null
}

interface TransactionDetailSheetProps {
  transaction: TransactionWithGift | null
  isOpen: boolean
  onClose: () => void
  onApprove: (transactionId: string, newAmount?: number) => void
  onReject: (transactionId: string) => void
  onDelete: (transactionId: string) => void
  isLoading: boolean
}

export default function TransactionDetailSheet({
  transaction,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDelete,
  isLoading
}: TransactionDetailSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [editingAmount, setEditingAmount] = useState<string>('')
  const [isEditingAmount, setIsEditingAmount] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && transaction) {
      setEditingAmount(transaction.amount.toString())
      setIsEditingAmount(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, transaction])

  if (!isOpen || !transaction || !mounted) return null

  const getStatusBadge = (status: string) => {
    const badges = {
      PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      MANUAL_REVIEW: 'bg-amber-100 text-amber-800 border-amber-200'
    }

    const labels = {
      PROCESSING: 'Procesando',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
      MANUAL_REVIEW: 'Revisión Manual'
    }

    return (
      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCurrency = (): 'USD' | 'MXN' => {
    return transaction.payment_method === 'transfer_mx' ? 'MXN' : 'USD'
  }

  const handleSaveAmount = () => {
    const newAmount = parseFloat(editingAmount)
    if (!isNaN(newAmount) && newAmount > 0) {
      onApprove(transaction.id, newAmount)
      setIsEditingAmount(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="relative bg-white w-full rounded-t-2xl md:rounded-xl shadow-2xl max-h-[90vh] flex flex-col md:my-8 animate-in slide-in-from-bottom md:slide-in-from-bottom-0 duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white rounded-t-2xl md:rounded-t-none">
          <div className="flex-1">
            <h2 className="text-2xl font-serif text-wedding-forest">
              Detalle de Transacción
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {formatDate(transaction.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Estado */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Estado</span>
            {getStatusBadge(transaction.status)}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Donante</label>
              <p className="text-base font-medium text-slate-900 mt-1">
                {transaction.donor_name || 'Anónimo'}
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Regalo</label>
              <p className="text-base font-medium text-slate-900 mt-1">
                {transaction.gifts?.name || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-600">País</label>
              <p className="text-base font-medium text-slate-900 mt-1">
                {transaction.country === 'MX' ? '🇲🇽 México' : '🇪🇨 Ecuador'}
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Método</label>
              <p className="text-base font-medium text-slate-900 mt-1">
                {transaction.payment_method === 'transfer_mx' ? '🏦 Transferencia MX' : 
                 transaction.payment_method === 'transfer_ec' ? '🏦 Transferencia EC' : 
                 '💳 PayPhone'}
              </p>
            </div>
          </div>

          {/* Monto */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <label className="text-sm text-slate-600 block mb-2">Monto</label>
            {isEditingAmount && transaction.status === 'MANUAL_REVIEW' ? (
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  step="0.01"
                  value={editingAmount}
                  onChange={(e) => setEditingAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-purple"
                  placeholder="Monto en USD"
                />
                <button
                  onClick={handleSaveAmount}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setIsEditingAmount(false)}
                  className="px-4 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <MoneyDisplay amount={transaction.amount} currency={getCurrency()} />
                {transaction.status === 'MANUAL_REVIEW' && (
                  <button
                    onClick={() => setIsEditingAmount(true)}
                    className="ml-4 px-3 py-1 text-sm bg-wedding-purple/10 text-wedding-purple rounded-lg hover:bg-wedding-purple/20 transition-colors"
                  >
                    Editar Monto
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mensaje */}
          {transaction.message && (
            <div>
              <label className="text-sm text-slate-600 block mb-2">Mensaje</label>
              <p className="text-base text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                {transaction.message}
              </p>
            </div>
          )}

          {/* Comprobante */}
          {transaction.receipt_url && (
            <div>
              <label className="text-sm text-slate-600 block mb-2">Comprobante</label>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <img 
                  src={transaction.receipt_url} 
                  alt="Comprobante" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex-shrink-0 p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex flex-wrap gap-3">
            {transaction.status === 'MANUAL_REVIEW' && !isEditingAmount && (
              <>
                <button
                  onClick={() => onApprove(transaction.id)}
                  disabled={isLoading}
                  className="flex-1 min-w-[120px] px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Aprobar
                </button>
                <button
                  onClick={() => onReject(transaction.id)}
                  disabled={isLoading}
                  className="flex-1 min-w-[120px] px-4 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Rechazar
                </button>
              </>
            )}
            <button
              onClick={() => onDelete(transaction.id)}
              disabled={isLoading}
              className="flex-1 min-w-[120px] px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
