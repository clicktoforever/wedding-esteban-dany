'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Database } from '@/lib/database.types'
import Image from 'next/image'

type Transaction = Database['public']['Tables']['gift_transactions']['Row'] & {
  gift?: {
    name: string
    image_url: string | null
  }
}

interface TransactionDetailModalProps {
  transaction: Transaction
  onClose: () => void
  onUpdate: () => void
}

export default function TransactionDetailModal({
  transaction,
  onClose,
  onUpdate,
}: TransactionDetailModalProps) {
  const [editedAmount, setEditedAmount] = useState(transaction.amount.toString())
  const [showImageZoom, setShowImageZoom] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const supabase = createClient()
  const isPending = transaction.status === 'PENDING' || transaction.status === 'MANUAL_REVIEW'
  const isApproved = transaction.status === 'APPROVED'
  const isRejected = transaction.status === 'REJECTED'
  const isTransfer = transaction.payment_method === 'transfer_ec' || transaction.payment_method === 'transfer_mx'
  const showValidationErrors = (transaction.status === 'MANUAL_REVIEW' || isRejected) && transaction.validation_errors

  // Block background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  async function handleApprove() {
    if (processing) return
    setProcessing(true)

    try {
      const amount = parseFloat(editedAmount)
      if (isNaN(amount) || amount <= 0) {
        alert('Por favor ingrese un monto válido')
        return
      }

      // Update transaction status and amount (the database trigger `update_gift_collected_amount` handles the gift sum automatically)
      const { error: updateError } = await supabase
        .from('gift_transactions')
        .update({
          status: 'APPROVED',
          amount: amount,
          approved_at: new Date().toISOString(),
        })
        .eq('id', transaction.id)

      if (updateError) throw updateError

      // Enviar email de aprobación
      try {
        const emailResponse = await fetch('/api/gifts/send-approval-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId: transaction.id,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Error sending approval email');
        } else {
          console.log('Approval email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending approval email:', emailError);
        // No bloqueamos si falla el email
      }

      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error approving transaction:', error)
      alert('Error al aprobar la transacción')
    } finally {
      setProcessing(false)
    }
  }

  async function handleReject() {
    if (processing) return
    if (!confirm('¿Está seguro de rechazar esta transacción?')) return

    setProcessing(true)

    try {
      const { error } = await supabase
        .from('gift_transactions')
        .update({ status: 'REJECTED' })
        .eq('id', transaction.id)

      if (error) throw error

      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error rejecting transaction:', error)
      alert('Error al rechazar la transacción')
    } finally {
      setProcessing(false)
    }
  }

  async function handleDelete() {
    if (processing) return
    setProcessing(true)

    try {
      // Usar la función RPC para eliminar la transacción y hacer el cleanup (wallet_transactions, gifts, store_users)
      const { error } = await supabase.rpc('delete_gift_transaction', {
        p_transaction_id: transaction.id
      })

      if (error) throw error

      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Error al eliminar la transacción')
    } finally {
      setProcessing(false)
    }
  }

  function getCountryLabel(country: string | null, paymentMethod: string | null) {
    if (paymentMethod === 'payphone') return 'Ecuador (USD)'
    if (country === 'MX') return 'México (MXN)'
    if (country === 'EC') return 'Ecuador (USD)'
    return 'Ecuador (USD)'
  }

  function getPaymentMethodLabel(paymentMethod: string | null) {
    switch (paymentMethod) {
      case 'payphone':
        return 'PayPhone'
      case 'transfer_ec':
        return 'Transferencia'
      case 'transfer_mx':
        return 'Transferencia México'
      default:
        return paymentMethod
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-[60] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full bg-[#fbf8f0] rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] max-h-[90dvh] flex flex-col">
          {/* Header */}
          <div className="flex items-center bg-[#fbf8f0] px-4 py-5 justify-between shrink-0 rounded-t-[2rem]">
            <h2 className="text-[#131514] text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
              {isPending ? 'Detalle de Pago en Revisión' : 'Detalle de Pago Procesado'}
            </h2>
            <div className="flex items-center gap-2">
              {isApproved && (
                <div className="flex items-center justify-center rounded-full px-2 py-0.5 bg-[#4a5951]/10 text-[#4a5951] text-[10px] font-bold uppercase tracking-wider">
                  Aprobada
                </div>
              )}
              <button
                className="text-[#131514] flex items-center justify-center"
                onClick={onClose}
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Receipt Image */}
            {isTransfer && transaction.receipt_url && (
              <div className="px-4 py-2">
                <div
                  className="relative group cursor-pointer w-full max-w-[200px] mx-auto"
                  onClick={() => setShowImageZoom(true)}
                >
                  <div className="w-full bg-[#807d7c]/10 rounded-xl aspect-[3/4] border border-[#807d7c]/10 shadow-sm overflow-hidden">
                    <Image
                      src={transaction.receipt_url}
                      alt="Comprobante de transferencia"
                      width={200}
                      height={267}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <div className="bg-white/90 px-3 py-2 rounded-full text-[10px] font-bold text-[#131514] flex items-center gap-1 shadow-lg">
                      <span className="material-symbols-outlined text-sm">fullscreen</span>
                      VER
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Details */}
            <div className="px-4 space-y-4 pb-6">
              {/* Guest Name */}
              <div className="flex flex-col">
                <p className="text-[#807d7c] text-[10px] font-bold uppercase tracking-widest leading-normal pb-1.5 px-1">
                  Invitado
                </p>
                <div className={`flex w-full min-w-0 rounded-xl text-[#131514] border ${
                  isPending ? 'border-[#807d7c]/20 bg-[#807d7c]/5' : 'border-[#807d7c]/10 bg-[#807d7c]/5'
                } h-14 items-center px-4 font-semibold text-base`}>
                  {transaction.donor_name}
                </div>
              </div>

              {/* Country and Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <p className="text-[#807d7c] text-[10px] font-bold uppercase tracking-widest leading-normal pb-1.5 px-1">
                    País / Moneda
                  </p>
                  <div className="flex w-full min-w-0 rounded-xl text-[#131514] border border-[#807d7c]/10 bg-[#807d7c]/5 h-12 items-center px-4 text-sm font-medium">
                    {getCountryLabel(transaction.country, transaction.payment_method)}
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-[#807d7c] text-[10px] font-bold uppercase tracking-widest leading-normal pb-1.5 px-1">
                    Método de Pago
                  </p>
                  <div className="flex w-full min-w-0 rounded-xl text-[#131514] border border-[#807d7c]/10 bg-[#807d7c]/5 h-12 items-center px-4 text-sm font-medium">
                    {getPaymentMethodLabel(transaction.payment_method)}
                  </div>
                </div>
              </div>

              {/* Gift */}
              <div className="flex flex-col">
                <p className="text-[#807d7c] text-[10px] font-bold uppercase tracking-widest leading-normal pb-1.5 px-1">
                  Regalo
                </p>
                <div className="flex w-full min-w-0 rounded-xl text-[#131514] border border-[#807d7c]/10 bg-[#807d7c]/5 h-14 items-center px-4 font-semibold text-base">
                  <span className="material-symbols-outlined text-[#4a5951] mr-2">card_giftcard</span>
                  {transaction.gift?.name || 'Sin regalo'}
                </div>
              </div>

              {/* Amount */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center pb-1.5 px-1">
                  <p className={`text-[10px] font-bold uppercase tracking-widest leading-normal ${
                    isPending ? 'text-[#4a5951]' : 'text-[#807d7c]'
                  }`}>
                    Monto Aportado ($)
                  </p>
                  {isPending && (
                    <span className="material-symbols-outlined text-[#4a5951] text-sm">edit</span>
                  )}
                </div>
                {isPending ? (
                  <input
                    className="flex w-full min-w-0 rounded-xl text-[#131514] focus:outline-0 focus:ring-2 focus:ring-[#4a5951]/20 border-2 border-[#4a5951]/30 bg-white h-14 placeholder:text-[#807d7c] px-4 text-xl font-bold leading-normal"
                    type="number"
                    step="0.01"
                    value={editedAmount}
                    onChange={(e) => setEditedAmount(e.target.value)}
                  />
                ) : (
                  <div className="text-[#131514] px-1 text-xl font-extrabold leading-normal">
                    ${transaction.amount.toFixed(2)}{' '}
                    <span className="text-[#807d7c] text-sm font-medium ml-1">
                      {transaction.country === 'MX' ? 'MXN' : 'USD'}
                    </span>
                  </div>
                )}
              </div>

              {/* Message */}
              {transaction.message && (
                <div className="flex flex-col">
                  <p className="text-[#807d7c] text-[10px] font-bold uppercase tracking-widest leading-normal pb-1.5 px-1">
                    {isPending ? 'Mensaje del Invitado' : 'Mensaje'}
                  </p>
                  <div className="flex w-full min-w-0 rounded-xl text-[#131514] border border-[#807d7c]/10 bg-[#807d7c]/5 p-4 font-normal italic text-sm leading-relaxed">
                    &ldquo;{transaction.message}&rdquo;
                  </div>
                </div>
              )}

              {/* Validation Errors */}
              {showValidationErrors && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 pb-1.5 px-1">
                    <span className="material-symbols-outlined text-[#996678] text-sm">error</span>
                    <p className="text-[#996678] text-[10px] font-bold uppercase tracking-widest leading-normal">
                      Errores de Validación
                    </p>
                  </div>
                  <div className="flex flex-col w-full rounded-xl border-2 border-[#996678]/20 bg-[#996678]/5 p-4 divide-y divide-[#996678]/30">
                    {typeof transaction.validation_errors === 'string' ? (
                      <p className="text-[#996678] text-sm font-medium leading-relaxed">
                        {transaction.validation_errors}
                      </p>
                    ) : transaction.validation_errors && typeof transaction.validation_errors === 'object' ? (
                      Object.values(transaction.validation_errors as Record<string, any>).map((value, index) => (
                        <p key={index} className={`text-[#996678] text-sm font-medium leading-relaxed ${index > 0 ? 'pt-2' : ''} ${index < Object.values(transaction.validation_errors as Record<string, any>).length - 1 ? 'pb-2' : ''}`}>
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </p>
                      ))
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Bottom Actions */}
          {isPending && isTransfer ? (
            <div className="bg-[#fbf8f0]/95 backdrop-blur-md border-t border-[#807d7c]/5 p-3 pb-4 space-y-2 shrink-0 rounded-b-[2rem]">
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-[#4a5951] text-white gap-2 text-sm font-bold leading-normal tracking-wide shadow-lg shadow-[#4a5951]/20 active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  {processing ? 'Procesando...' : 'Aprobar Transacción'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 border-2 border-[#996678] text-[#996678] gap-2 text-sm font-bold leading-normal tracking-wide bg-transparent active:bg-[#996678]/5 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xl">block</span>
                  Rechazar
                </button>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={processing}
                className="flex w-full items-center justify-center gap-1.5 py-1.5 text-[#996678]/80 hover:text-[#996678] text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Eliminar Transacción
              </button>
            </div>
          ) : (
            <div className="bg-[#fbf8f0]/95 backdrop-blur-md p-3 pb-4 shrink-0 rounded-b-[2rem]">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={processing}
                className="flex w-full items-center justify-center gap-1.5 py-1.5 text-[#996678]/80 hover:text-[#996678] text-xs font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Eliminar Transacción
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {showImageZoom && transaction.receipt_url && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImageZoom(false)}
        >
          <button
            onClick={() => setShowImageZoom(false)}
            className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-2 backdrop-blur-sm"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="max-w-4xl max-h-[90vh] overflow-auto">
            <Image
              src={transaction.receipt_url}
              alt="Comprobante de transferencia ampliado"
              width={1200}
              height={900}
              className="w-full h-auto"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#996678]/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#996678] text-3xl">warning</span>
              </div>
              <h3 className="text-[#131514] text-lg font-bold mb-2">
                ¿Eliminar transacción?
              </h3>
              <p className="text-[#807d7c] text-sm mb-6">
                Esta acción no se puede deshacer. La transacción será eliminada permanentemente.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-[#807d7c]/20 text-[#131514] font-bold text-sm hover:bg-[#807d7c]/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={processing}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#996678] text-white font-bold text-sm hover:bg-[#996678]/90 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
