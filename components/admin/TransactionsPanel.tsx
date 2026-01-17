'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import MoneyDisplay from './MoneyDisplay'
import TransactionDetailSheet from './TransactionDetailSheet'
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
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithGift | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredTransactions(transactions)
    } else {
      setFilteredTransactions(transactions.filter(t => t.status === statusFilter))
    }
  }, [statusFilter, transactions])

  const fetchTransactions = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('gift_transactions')
      .select(`
        *,
        gifts (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      return
    }

    setTransactions(data as TransactionWithGift[])
  }

  const handleApprove = async (transactionId: string, newAmount?: number) => {
    setIsLoading(true)
    const supabase = createClient()
    
    try {
      type UpdateData = Database['public']['Tables']['gift_transactions']['Update']
      const updateData: UpdateData = { 
        status: 'APPROVED',
        ...(newAmount !== undefined && { amount: newAmount })
      }

      const { error } = await supabase
        .from('gift_transactions')
        // @ts-ignore - Supabase types inference issue
        .update(updateData)
        .eq('id', transactionId)

      if (error) throw error

      setMessage({ type: 'success', text: 'Transacción aprobada exitosamente' })
      await fetchTransactions()
      setSelectedTransaction(null)
    } catch (error) {
      console.error('Error approving transaction:', error)
      setMessage({ type: 'error', text: 'Error al aprobar la transacción' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (transactionId: string) => {
    setIsLoading(true)
    const supabase = createClient()
    
    try {
      type UpdateData = Database['public']['Tables']['gift_transactions']['Update']
      const updateData: UpdateData = { status: 'REJECTED' }

      const { error } = await supabase
        .from('gift_transactions')
        // @ts-ignore - Supabase types inference issue
        .update(updateData)
        .eq('id', transactionId)

      if (error) throw error

      setMessage({ type: 'success', text: 'Transacción rechazada' })
      await fetchTransactions()
      setSelectedTransaction(null)
    } catch (error) {
      console.error('Error rejecting transaction:', error)
      setMessage({ type: 'error', text: 'Error al rechazar la transacción' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (transactionId: string) => {
    setIsLoading(true)
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('gift_transactions')
        .delete()
        .eq('id', transactionId)

      if (error) throw error

      setMessage({ type: 'success', text: 'Transacción eliminada' })
      await fetchTransactions()
      setSelectedTransaction(null)
    } catch (error) {
      console.error('Error deleting transaction:', error)
      setMessage({ type: 'error', text: 'Error al eliminar la transacción' })
    } finally {
      setIsLoading(false)
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
      MANUAL_REVIEW: 'Revisión'
    }

    return (
      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getCurrency = (transaction: TransactionWithGift): 'USD' | 'MXN' => {
    return transaction.payment_method === 'transfer_mx' ? 'MXN' : 'USD'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-wedding-forest">Transacciones</h2>
          <p className="text-sm text-slate-600 mt-1">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transacción' : 'transacciones'}
          </p>
        </div>
        
        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-purple bg-white"
        >
          <option value="all">Todas</option>
          <option value="PROCESSING">Procesando</option>
          <option value="MANUAL_REVIEW">Revisión Manual</option>
          <option value="APPROVED">Aprobadas</option>
          <option value="REJECTED">Rechazadas</option>
        </select>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{message.text}</p>
            <button onClick={() => setMessage(null)} className="text-current hover:opacity-70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>No hay transacciones</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <button
              key={transaction.id}
              onClick={() => setSelectedTransaction(transaction)}
              className="w-full bg-white border border-slate-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 mb-1">
                    {transaction.donor_name || 'Anónimo'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {transaction.gifts?.name || 'N/A'}
                  </p>
                </div>
                {getStatusBadge(transaction.status)}
              </div>
              
              <div className="flex items-center justify-between">
                <MoneyDisplay 
                  amount={transaction.amount} 
                  currency={getCurrency(transaction)}
                  className="text-base"
                />
                <span className="text-xs text-slate-500">
                  {formatDate(transaction.created_at)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Desktop View - Minimal Table */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Donante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Regalo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p>No hay transacciones</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    onClick={() => setSelectedTransaction(transaction)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {transaction.donor_name || 'Anónimo'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {transaction.gifts?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <MoneyDisplay 
                        amount={transaction.amount} 
                        currency={getCurrency(transaction)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {transaction.payment_method === 'transfer_mx' ? '🏦 Transfer MX' : 
                       transaction.payment_method === 'transfer_ec' ? '🏦 Transfer EC' : 
                       '💳 PayPhone'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(transaction.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Sheet */}
      {mounted && (
        <TransactionDetailSheet
          transaction={selectedTransaction}
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
