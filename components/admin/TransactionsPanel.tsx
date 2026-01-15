'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/browser'
import { formatCurrency } from '@/lib/payphone'
import type { Database } from '@/lib/database.types'

type Transaction = Database['public']['Tables']['gift_transactions']['Row']
type Gift = Database['public']['Tables']['gifts']['Row']

interface TransactionWithGift extends Transaction {
  gifts: Gift | null
}

type StatusFilter = 'all' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW'

interface TransactionsPanelProps {
  readonly initialTransactions?: TransactionWithGift[]
}

export default function TransactionsPanel({ initialTransactions = [] }: TransactionsPanelProps) {
  const [transactions, setTransactions] = useState<TransactionWithGift[]>(initialTransactions)
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithGift[]>(initialTransactions)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (initialTransactions.length === 0) {
      fetchTransactions()
    }
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, statusFilter])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('gift_transactions')
        .select('*, gifts(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setMessage({ type: 'error', text: 'Error al cargar las transacciones' })
    } finally {
      setIsLoading(false)
    }
  }

  const filterTransactions = () => {
    if (statusFilter === 'all') {
      setFilteredTransactions(transactions)
    } else {
      setFilteredTransactions(transactions.filter(t => t.status === statusFilter))
    }
  }

  const handleApprove = async (transactionId: string) => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const { error } = await supabase
        .from('gift_transactions')
        // @ts-expect-error - Supabase generated types issue with status enum
        .update({ status: 'APPROVED' })
        .eq('id', transactionId)

      if (error) throw error

      setTransactions(prev =>
        prev.map(t => t.id === transactionId ? { ...t, status: 'APPROVED' as any } : t)
      )
      setMessage({ type: 'success', text: 'Transacción aprobada correctamente' })
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error approving transaction:', error)
      setMessage({ type: 'error', text: 'Error al aprobar la transacción' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (transactionId: string) => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const { error } = await supabase
        .from('gift_transactions')
        // @ts-expect-error - Supabase generated types issue with status enum
        .update({ status: 'REJECTED' })
        .eq('id', transactionId)

      if (error) throw error

      setTransactions(prev =>
        prev.map(t => t.id === transactionId ? { ...t, status: 'REJECTED' as any } : t)
      )
      setMessage({ type: 'success', text: 'Transacción rechazada' })
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error rejecting transaction:', error)
      setMessage({ type: 'error', text: 'Error al rechazar la transacción' })
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = (transactionId: string) => {
    setTransactionToDelete(transactionId)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (!transactionToDelete) return

    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('gift_transactions')
        .delete()
        .eq('id', transactionToDelete)

      if (error) throw error

      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete))
      setMessage({ type: 'success', text: 'Transacción eliminada correctamente' })
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error deleting transaction:', error)
      setMessage({ type: 'error', text: 'Error al eliminar la transacción' })
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
      setTransactionToDelete(null)
    }
  }

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
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      transfer_ec: '🏦 Transferencia EC',
      transfer_mx: '🏦 Transferencia MX',
      payphone: '💳 PayPhone'
    }
    return labels[method as keyof typeof labels] || method
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-serif text-wedding-forest">
            Transacciones de Regalos
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona las contribuciones y transferencias bancarias
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Filtrar:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wedding-purple text-sm"
          >
            <option value="all">Todas</option>
            <option value="PROCESSING">Procesando</option>
            <option value="MANUAL_REVIEW">Revisión Manual</option>
            <option value="APPROVED">Aprobadas</option>
            <option value="REJECTED">Rechazadas</option>
          </select>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-wedding-purple border-t-transparent"></div>
          <p className="text-gray-600 mt-2">Cargando...</p>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donante
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regalo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  País
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No hay transacciones para mostrar
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {transaction.donor_name || 'Anónimo'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {transaction.gifts?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatCurrency(transaction.amount, transaction.country)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {transaction.country === 'MX' ? '🇲🇽 México' : '🇪🇨 Ecuador'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {getPaymentMethodLabel(transaction.payment_method)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {transaction.receipt_url && (
                          <button
                            onClick={() => setSelectedImage(transaction.receipt_url)}
                            className="text-wedding-purple hover:text-wedding-purple/80 font-medium"
                            title="Ver comprobante"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                        
                        {transaction.status === 'MANUAL_REVIEW' && (
                          <>
                            <button
                              onClick={() => handleApprove(transaction.id)}
                              disabled={isLoading}
                              className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                              title="Aprobar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleReject(transaction.id)}
                              disabled={isLoading}
                              className="text-amber-600 hover:text-amber-800 font-medium disabled:opacity-50"
                              title="Rechazar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => confirmDelete(transaction.id)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            No hay transacciones para mostrar
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {transaction.donor_name || 'Anónimo'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {transaction.gifts?.name || 'N/A'}
                  </p>
                </div>
                {getStatusBadge(transaction.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Monto:</span>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(transaction.amount, transaction.country)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">País:</span>
                  <p className="font-medium text-gray-900">
                    {transaction.country === 'MX' ? '🇲🇽 México' : '🇪🇨 Ecuador'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Método:</span>
                  <p className="font-medium text-gray-900">
                    {getPaymentMethodLabel(transaction.payment_method)}
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                {formatDate(transaction.created_at)}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                {transaction.receipt_url && (
                  <button
                    onClick={() => setSelectedImage(transaction.receipt_url)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-wedding-purple bg-wedding-purple/10 rounded-md hover:bg-wedding-purple/20"
                  >
                    Ver Comprobante
                  </button>
                )}

                {transaction.status === 'MANUAL_REVIEW' && (
                  <>
                    <button
                      onClick={() => handleApprove(transaction.id)}
                      disabled={isLoading}
                      className="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 disabled:opacity-50"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleReject(transaction.id)}
                      disabled={isLoading}
                      className="px-3 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </>
                )}

                <button
                  onClick={() => confirmDelete(transaction.id)}
                  disabled={isLoading}
                  className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Modal */}
      {mounted && selectedImage && createPortal(
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={selectedImage} 
              alt="Comprobante de pago" 
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {mounted && showDeleteConfirm && createPortal(
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">
              ¿Eliminar transacción?
            </h3>
            <p className="text-gray-600">
              Esta acción no se puede deshacer. La transacción será eliminada permanentemente.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
