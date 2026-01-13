'use client'

import { useState, useEffect, FormEvent } from 'react'
import Script from 'next/script'
import Head from 'next/head'
import { formatCurrency } from '@/lib/payphone'

interface ContributionModalProps {
  gift: {
    id: string
    name: string
    total_amount: number
    collected_amount: number
    status: string
    price?: number | null
  }
  isOpen: boolean
  onClose: () => void
}

export default function ContributionModal({ gift, isOpen, onClose }: ContributionModalProps) {
  const [donorName, setDonorName] = useState('')
  const [amount, setAmount] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentWidget, setShowPaymentWidget] = useState(false)
  const [paymentConfig, setPaymentConfig] = useState<any>(null)
  const [payphoneScriptLoaded, setPayphoneScriptLoaded] = useState(false)

  // Initialize PayPhone widget when script loads and config is ready
  useEffect(() => {
    if (payphoneScriptLoaded && paymentConfig && showPaymentWidget) {
      console.log('Initializing PayPhone widget with config:', paymentConfig)
      
      if (typeof window !== 'undefined' && (window as any).PPaymentButtonBox) {
        try {
          new (window as any).PPaymentButtonBox(paymentConfig).render('pp-button')
          console.log('PayPhone widget rendered successfully')
        } catch (error) {
          console.error('Error rendering PayPhone widget:', error)
          setError('Error al cargar el widget de pago')
        }
      } else {
        console.error('PPaymentButtonBox not available')
        setError('Error: Widget de pago no disponible')
      }
    }
  }, [payphoneScriptLoaded, paymentConfig, showPaymentWidget])

  // Use total_amount if available, fallback to price
  const giftTotal = gift.total_amount || gift.price || 0
  const giftCollected = gift.collected_amount || 0
  const remainingAmount = giftTotal - giftCollected
  const progressPercentage = giftTotal > 0 ? (giftCollected / giftTotal) * 100 : 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const contributionAmount = parseFloat(amount)

    // Validation
    if (!donorName.trim()) {
      setError('Por favor ingresa tu nombre')
      return
    }

    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      setError('Por favor ingresa un monto válido')
      return
    }

    if (contributionAmount > remainingAmount) {
      setError(`El monto excede el saldo disponible: ${formatCurrency(remainingAmount)}`)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/gifts/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          giftId: gift.id,
          donorName: donorName.trim(),
          amount: contributionAmount,
          donorEmail: donorEmail.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la contribución')
      }

      // Show PayPhone payment widget
      if (data.paymentConfig) {
        console.log('Payment config received:', data.paymentConfig)
        setPaymentConfig(data.paymentConfig)
        setShowPaymentWidget(true)
        setIsSubmitting(false)
      } else {
        throw new Error('No se recibió configuración de pago')
      }
    } catch (err) {
      console.error('Contribution error:', err)
      setError(err instanceof Error ? err.message : 'Error al procesar la contribución')
      setIsSubmitting(false)
    }
  }

  const handleAmountClick = (percentage: number) => {
    const calculatedAmount = (remainingAmount * percentage).toFixed(2)
    setAmount(calculatedAmount)
  }

  if (!isOpen) return null

  return (
    <>
      {/* PayPhone CSS */}
      <link 
        rel="stylesheet" 
        href="https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css"
      />
      
      {/* PayPhone JS */}
      <Script
        src="https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js"
        type="module"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('PayPhone script loaded')
          setPayphoneScriptLoaded(true)
        }}
        onError={(e) => {
          console.error('Error loading PayPhone script:', e)
          setError('Error al cargar el sistema de pagos')
        }}
      />
      <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={showPaymentWidget ? undefined : onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-2xl bg-white shadow-2xl transform transition-all max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-wedding-rose/10 to-wedding-purple/10 px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-serif text-wedding-forest mb-2 tracking-wide">
                  Contribuir a este Regalo
                </h3>
                <p className="text-sm sm:text-base text-wedding-purple font-medium">{gift.name}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                disabled={isSubmitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress Section */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Progreso del Regalo</span>
              <span className="text-xs sm:text-sm font-bold text-wedding-forest">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-wedding-sage to-wedding-forest h-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <span className="text-xs sm:text-sm text-gray-600">
                Recaudado: <strong className="text-wedding-forest">{formatCurrency(giftCollected)}</strong>
              </span>
              <span className="text-xs sm:text-sm text-gray-600">
                Meta: <strong className="text-wedding-purple">{formatCurrency(giftTotal)}</strong>
              </span>
            </div>
            <div className="mt-3 text-center">
              <p className="text-base sm:text-lg font-semibold text-wedding-rose">
                Restante: {formatCurrency(remainingAmount)}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 sm:px-4 sm:py-3 flex items-start gap-2 sm:gap-3 text-sm">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-xs sm:text-sm">{error}</p>
              </div>
            )}

            {/* Donor Name */}
            <div>
              <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">
                Tu Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="donorName"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:border-wedding-purple focus:ring-2 focus:ring-wedding-purple/20 outline-none transition-all"
                placeholder="Ej: María García"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Donor Email */}
            <div>
              <label htmlFor="donorEmail" className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">
                Tu Correo Electrónico <span className="text-gray-400 text-xs">(Opcional)</span>
              </label>
              <input
                type="email"
                id="donorEmail"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:border-wedding-purple focus:ring-2 focus:ring-wedding-purple/20 outline-none transition-all"
                placeholder="tu@correo.com"
                disabled={isSubmitting}
              />
            </div>

            {/* Amount Input */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">
                Monto a Contribuir (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:border-wedding-purple focus:ring-2 focus:ring-wedding-purple/20 outline-none transition-all text-lg font-semibold"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  max={remainingAmount}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Monto máximo: {formatCurrency(remainingAmount)}
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3 tracking-wide">Montos Sugeridos:</p>
              <div className="grid grid-cols-4 gap-2">
                {[0.25, 0.5, 0.75, 1.0].map((percentage) => {
                  const suggestedAmount = remainingAmount * percentage
                  return (
                    <button
                      key={percentage}
                      type="button"
                      onClick={() => handleAmountClick(percentage)}
                      className="px-3 py-2 text-sm font-medium border border-gray-300 hover:border-wedding-purple hover:bg-wedding-purple/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {percentage === 1 ? 'Todo' : `${(percentage * 100).toFixed(0)}%`}
                      <br />
                      <span className="text-xs text-gray-600">{formatCurrency(suggestedAmount)}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium tracking-wide uppercase text-sm hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-wedding-forest text-white font-medium tracking-wide uppercase text-sm hover:bg-wedding-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    Continuar al Pago
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Security Note */}
            <div className="bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-3 mt-4">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Pago Seguro con PayPhone</p>
                <p className="text-xs">Serás redirigido a la plataforma segura de PayPhone para completar tu pago.</p>
              </div>
            </div>

            {/* PayPhone Widget Container */}
            {showPaymentWidget && (
              <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="relative w-full max-w-4xl bg-white shadow-2xl my-8">
                  {/* Close button for widget */}
                  <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2 bg-black/50 rounded-full"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <div className="p-4 sm:p-8">
                    <h4 className="text-xl sm:text-2xl font-semibold text-wedding-forest mb-6 text-center">
                      Completa tu Pago
                    </h4>
                    <div 
                      id="pp-button" 
                      className="w-full min-h-[500px] sm:min-h-[600px] flex items-center justify-center"
                      style={{
                        position: 'relative',
                        zIndex: 70
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      </div>
    </>
  )
}
