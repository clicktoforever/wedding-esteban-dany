'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/browser'
import Image from 'next/image'
import BottomNav from '@/components/admin/BottomNav'
import TransactionDetailSheet from '@/components/admin/transactions/TransactionDetailSheet'

interface Transaction {
  id: string
  gift_id: string
  donor_name: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW'
  payment_method: 'payphone' | 'transfer_ec' | 'transfer_mx'
  country: 'EC' | 'MX' | null
  receipt_url: string | null
  message: string | null
  created_at: string
  gift?: {
    name: string
    image_url: string | null
  }
}

type FilterTab = 'all' | 'pending' | 'manual_review' | 'approved' | 'rejected'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [activeTab, setActiveTab] = useState<FilterTab>('manual_review')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gift_transactions')
        .select(`
          *,
          gift:gifts(name, image_url)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const filterTransactions = useCallback(() => {
    let filtered = [...transactions]

    // Filter by tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(t => t.status === 'PENDING')
    } else if (activeTab === 'manual_review') {
      filtered = filtered.filter(t => t.status === 'MANUAL_REVIEW')
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(t => t.status === 'APPROVED')
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(t => t.status === 'REJECTED')
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.donor_name.toLowerCase().includes(query) ||
        t.gift?.name.toLowerCase().includes(query)
      )
    }

    setFilteredTransactions(filtered)
  }, [transactions, activeTab, searchQuery])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    filterTransactions()
  }, [filterTransactions])

  function getStatusColor(status: Transaction['status']) {
    switch (status) {
      case 'APPROVED':
        return 'bg-[#4a5951]/10 text-[#4a5951] border-[#4a5951]/20'
      case 'PENDING':
        return 'bg-[#807d7c]/10 text-[#807d7c] border-[#807d7c]/20'
      case 'MANUAL_REVIEW':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20'
      case 'REJECTED':
        return 'bg-[#996678]/10 text-[#996678] border-[#996678]/20'
      default:
        return 'bg-[#807d7c]/10 text-[#807d7c] border-[#807d7c]/20'
    }
  }

  function getStatusText(status: Transaction['status']) {
    switch (status) {
      case 'APPROVED':
        return 'APROBADA'
      case 'PENDING':
        return 'PENDIENTE'
      case 'MANUAL_REVIEW':
        return 'EN REVISIÓN'
      case 'REJECTED':
        return 'RECHAZADA'
      default:
        return status
    }
  }

  function getPaymentIcon(paymentMethod: Transaction['payment_method']) {
    switch (paymentMethod) {
      case 'payphone':
        return 'credit_card'
      case 'transfer_ec':
      case 'transfer_mx':
        return 'account_balance'
      default:
        return 'payments'
    }
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) return 'Hace menos de 1 hora'
    if (diffInHours < 24) return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
    if (diffInDays < 7) return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  const manualReviewCount = transactions.filter(t => t.status === 'MANUAL_REVIEW').length

  return (
    <div className="min-h-screen bg-[#fbf8f0] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#fbf8f0]/80 backdrop-blur-md">
        <div className="flex items-center p-4 pb-2 justify-center">
          <h2 className="text-[#131514] text-xl font-extrabold leading-tight tracking-tight text-center">
            Historial de Pagos
          </h2>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3">
          <label className="flex flex-col min-w-40 h-14 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm overflow-hidden group">
              <div className="text-[#807d7c]/60 flex border-none bg-white items-center justify-center pl-4 rounded-l-xl transition-colors group-focus-within:text-[#4a5951]">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#131514] focus:outline-0 focus:ring-0 border-none bg-white h-full placeholder:text-[#807d7c] px-4 rounded-l-none border-l-0 pl-2 text-base font-medium leading-normal"
                placeholder="Buscar por nombre de invitado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </label>
        </div>

        {/* Filter Tabs */}
        <div className="flex px-4 py-3">
          <div className="flex h-12 items-center rounded-xl bg-[#4a5951]/5 p-1.5 gap-1 overflow-x-auto">
            <label className={`flex cursor-pointer h-full items-center justify-center rounded-lg px-3 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'all' 
                ? 'bg-white shadow-sm text-[#4a5951]' 
                : 'text-[#807d7c]'
            }`}>
              <span>Todas</span>
              <input
                type="radio"
                name="filter"
                value="all"
                checked={activeTab === 'all'}
                onChange={() => setActiveTab('all')}
                className="invisible w-0"
              />
            </label>
            <label className={`flex cursor-pointer h-full items-center justify-center rounded-lg px-3 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'approved' 
                ? 'bg-white shadow-sm text-[#4a5951]' 
                : 'text-[#807d7c]'
            }`}>
              <span>Aprobadas</span>
              <input
                type="radio"
                name="filter"
                value="approved"
                checked={activeTab === 'approved'}
                onChange={() => setActiveTab('approved')}
                className="invisible w-0"
              />
            </label>
            <label className={`relative flex cursor-pointer h-full items-center justify-center rounded-lg px-3 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'manual_review' 
                ? 'bg-white shadow-sm text-[#4a5951]' 
                : 'text-[#807d7c]'
            }`}>
              <span>Revisión Manual</span>
              {manualReviewCount > 0 && (
                <span className="ml-1.5 size-2 bg-[#d3c3db] rounded-full ring-2 ring-white"></span>
              )}
              <input
                type="radio"
                name="filter"
                value="manual_review"
                checked={activeTab === 'manual_review'}
                onChange={() => setActiveTab('manual_review')}
                className="invisible w-0"
              />
            </label>
            <label className={`flex cursor-pointer h-full items-center justify-center rounded-lg px-3 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'pending' 
                ? 'bg-white shadow-sm text-[#4a5951]' 
                : 'text-[#807d7c]'
            }`}>
              <span>Pendiente</span>
              <input
                type="radio"
                name="filter"
                value="pending"
                checked={activeTab === 'pending'}
                onChange={() => setActiveTab('pending')}
                className="invisible w-0"
              />
            </label>
            <label className={`flex cursor-pointer h-full items-center justify-center rounded-lg px-3 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'rejected' 
                ? 'bg-white shadow-sm text-[#4a5951]' 
                : 'text-[#807d7c]'
            }`}>
              <span>Rechazada</span>
              <input
                type="radio"
                name="filter"
                value="rejected"
                checked={activeTab === 'rejected'}
                onChange={() => setActiveTab('rejected')}
                className="invisible w-0"
              />
            </label>
          </div>
        </div>
      </header>

      {/* Transaction List */}
      <main className="px-4 pb-32 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#807d7c] text-center">
              <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
              <p className="mt-2 text-sm">Cargando transacciones...</p>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbols-outlined text-6xl text-[#807d7c]/30">receipt_long</span>
            <p className="mt-4 text-[#807d7c] font-medium">
              {searchQuery ? 'No se encontraron transacciones' : 'No hay transacciones'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              onClick={() => setSelectedTransaction(transaction)}
              className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm justify-between border border-white/50 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className={`text-[#4a5951] flex items-center justify-center rounded-xl ${
                  transaction.status === 'REJECTED' ? 'bg-[#996678]/10 text-[#996678]' : 'bg-[#4a5951]/10'
                } shrink-0 size-12`}>
                  <span className="material-symbols-outlined">
                    {transaction.status === 'REJECTED' ? 'error_outline' : getPaymentIcon(transaction.payment_method)}
                  </span>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#131514] text-base font-bold leading-tight">
                    {transaction.donor_name}
                  </p>
                  <p className="text-[#807d7c] text-xs font-semibold uppercase tracking-wider">
                    {transaction.gift?.name || 'Sin regalo'}
                  </p>
                  <p className="text-[#807d7c]/60 text-[10px] font-medium mt-0.5">
                    {formatTimeAgo(transaction.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`font-extrabold text-base ${
                  transaction.status === 'REJECTED' ? 'text-[#996678]' : 
                  transaction.status === 'APPROVED' ? 'text-[#4a5951]' : 'text-[#4a5951]'
                }`}>
                  {transaction.status === 'REJECTED' ? '' : '+'}${transaction.amount.toFixed(2)}
                </span>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(transaction.status)}`}>
                  {getStatusText(transaction.status)}
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailSheet
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onUpdate={fetchTransactions}
        />
      )}
    </div>
  )
}
