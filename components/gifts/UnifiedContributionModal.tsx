'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'
import Image from 'next/image'
import Script from 'next/script'
import { formatCurrency } from '@/lib/payphone'
import { getDisplayAmount, convertToUsd } from '@/lib/currency'
import type { Database } from '@/lib/database.types'

type Gift = Database['public']['Tables']['gifts']['Row']

interface BankAccount {
  country: 'EC' | 'MX'
  bankName: string
  accountName: string
  accountNumber: string
  accountType?: string
  identificationNumber?: string
  currency: 'USD' | 'MXN'
  instructions: string
}

interface UnifiedContributionModalProps {
  gift: Gift
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type Step = 'amount' | 'transfer-details' | 'validating' | 'success' | 'review' | 'error'
type Currency = 'USD' | 'MXN'
type PaymentMethod = 'card' | 'transfer'

export default function UnifiedContributionModal({ 
  gift, 
  isOpen, 
  onClose,
  onSuccess 
}: UnifiedContributionModalProps) {
  // Currency & Payment Method
  const [currency, setCurrency] = useState<Currency>('USD')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  
  // Form State
  const [donorName, setDonorName] = useState('')
  const [amount, setAmount] = useState('50') // Changed from '50.00' to '50'
  const [message, setMessage] = useState('')
  
  // Transfer State
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  
  // UI State
  const [step, setStep] = useState<Step>('amount')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationProgress, setValidationProgress] = useState(0)
  const [validationMessage, setValidationMessage] = useState('')
  const [transactionId, setTransactionId] = useState<string | null>(null)
  
  // Payphone State
  const [payphoneScriptLoaded, setPayphoneScriptLoaded] = useState(false)
  const [paymentConfig, setPaymentConfig] = useState<any>(null)
  const [showPayphoneWidget, setShowPayphoneWidget] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  
  // Drag state for swipe to dismiss
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [dragCurrentY, setDragCurrentY] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Amounts - handle potential null values
  const totalAmount = gift.total_amount ?? 0
  const collectedAmount = gift.collected_amount ?? 0
  const remainingUSD = totalAmount - collectedAmount
  const progressPercentage = totalAmount > 0 
    ? (collectedAmount / totalAmount) * 100 
    : 0

  // Calculate remaining amount in selected currency
  const getRemainingInCurrency = () => {
    const country = currency === 'USD' ? 'EC' : 'MX'
    return getDisplayAmount(remainingUSD, country)
  }

  // Quick amount buttons based on currency
  const quickAmounts = currency === 'USD' 
    ? [20, 50, 100, 200] 
    : [500, 1000, 2000, 5000] // No decimal values for MXN

  // Currency symbol
  const currencySymbol = currency === 'USD' ? '$' : '$' // Adjust if needed
  const currencyLabel = currency === 'USD' ? 'USD' : 'MXN'

  // Fetch bank account when switching to transfer
  useEffect(() => {
    if (paymentMethod === 'transfer' && isOpen) {
      const country = currency === 'USD' ? 'EC' : 'MX'
      fetchBankAccount(country)
    }
  }, [paymentMethod, currency, isOpen])

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('amount')
      setError(null)
    } else {
      // Reset form after close animation
      setTimeout(() => {
        setDonorName('')
        setAmount('50')
        setMessage('')
        setReceiptFile(null)
        setReceiptPreview(null)
        setStep('amount')
        setError(null)
        setShowPayphoneWidget(false)
        setPaymentConfig(null)
      }, 300)
    }
  }, [isOpen])

  // Initialize PayPhone widget
  useEffect(() => {
    if (payphoneScriptLoaded && paymentConfig && showPayphoneWidget) {
      const timer = setTimeout(() => {
        const container = document.getElementById('pp-button')
        if (typeof window !== 'undefined' && (window as any).PPaymentButtonBox) {
          try {
            if (container) container.innerHTML = ''
            new (window as any).PPaymentButtonBox(paymentConfig).render('pp-button')
          } catch (error) {
            console.error('Error rendering PayPhone widget:', error)
            setError('Error al cargar el widget de pago')
          }
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [payphoneScriptLoaded, paymentConfig, showPayphoneWidget])

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Prevent scroll on iOS Safari
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'auto'
    }
    return () => { 
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'auto'
    }
  }, [isOpen])

  // Reset scroll position when changing steps
  useEffect(() => {
    if (step === 'transfer-details' || step === 'success' || step === 'review' || step === 'error') {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        // Scroll modal content to top
        const modalContent = document.querySelector('.modal-transfer-content')
        if (modalContent) {
          modalContent.scrollTop = 0
        }
        
        // Also scroll the modal container itself to top
        if (modalRef.current) {
          const scrollableParent = modalRef.current.parentElement
          if (scrollableParent) {
            scrollableParent.scrollTop = 0
          }
        }
      }, 50)
    }
  }, [step])

  const fetchBankAccount = async (country: 'EC' | 'MX') => {
    try {
      const response = await fetch(`/api/gifts/bank-accounts?country=${country}`)
      const data = await response.json()
      if (data.success) {
        setBankAccount(data.account)
      }
    } catch (error) {
      console.error('Error fetching bank account:', error)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar 5MB')
      return
    }

    setReceiptFile(file)
    setError(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const copyToClipboard = async (text: string) => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers or iOS Safari
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          document.execCommand('copy')
          textArea.remove()
        } catch (err) {
          console.error('Fallback: Failed to copy', err)
          textArea.remove()
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handlePayphonePayment = async () => {
    const contributionAmount = parseFloat(amount)
    
    if (!donorName.trim()) {
      setError('Por favor ingresa tu nombre')
      return
    }

    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      setError('Por favor ingresa un monto válido')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/gifts/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: gift.id,
          donorName: donorName.trim(),
          amount: contributionAmount,
          message: message.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la contribución')
      }

      if (data.paymentConfig) {
        setPaymentConfig(data.paymentConfig)
        setShowPayphoneWidget(true)
      } else {
        throw new Error('No se recibió configuración de pago')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTransferSubmit = async () => {
    if (!donorName.trim()) {
      setError('Por favor ingresa tu nombre')
      return
    }

    const contributionAmount = parseFloat(amount)
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      setError('Por favor ingresa un monto válido')
      return
    }

    if (!receiptFile) {
      setError('Por favor sube el comprobante de transferencia')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setStep('validating')
    
    // Start validation animation - 20 seconds max to reach 99%
    const messages = [
      'Subiendo comprobante seguro...',
      'Leyendo detalles del banco...',
      'Verificando monto...',
      'Procesando con IA...'
    ]
    
    let progress = 0
    let messageIndex = 0
    let messageTimer = 0
    
    // Progress interval: increment every 200ms, reach 99% in ~20 seconds (100 increments)
    const interval = setInterval(() => {
      progress += 1
      setValidationProgress(Math.min(progress, 99))
      
      // Change message every 3 seconds (3000ms / 200ms = 15 increments)
      messageTimer += 1
      if (messageTimer >= 15) {
        messageTimer = 0
        messageIndex = (messageIndex + 1) % messages.length // Loop through messages
        setValidationMessage(messages[messageIndex])
      }
    }, 200)

    try {
      const country = currency === 'USD' ? 'EC' : 'MX'
      const amountInUSD = convertToUsd(contributionAmount, country)
      
      const formData = new FormData()
      formData.append('giftId', gift.id)
      formData.append('donorName', donorName.trim())
      formData.append('amount', amountInUSD.toString())
      formData.append('displayAmount', contributionAmount.toString())
      formData.append('displayCurrency', currencyLabel)
      formData.append('country', country)
      formData.append('receipt', receiptFile)
      if (message.trim()) {
        formData.append('message', message.trim())
      }

      const response = await fetch('/api/gifts/transfer', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      clearInterval(interval)
      setValidationProgress(100)

      if (data.success) {
        setTransactionId(data.transactionId)
        
        // Small delay for UX before redirecting
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Redirect to confirmation page with all details
        const giftImageUrl = gift.image_url || ''
        const status = data.status === 'approved' ? 'approved' : 
                       data.status === 'rejected' ? 'error' : 'review'
        
        const confirmUrl = new URL('/confirm-payment', window.location.origin)
        confirmUrl.searchParams.set('type', 'transfer')
        confirmUrl.searchParams.set('status', status)
        confirmUrl.searchParams.set('transactionId', data.transactionId)
        confirmUrl.searchParams.set('donorName', donorName)
        confirmUrl.searchParams.set('amount', `${currencySymbol}${amount}`)
        confirmUrl.searchParams.set('currency', currencyLabel)
        confirmUrl.searchParams.set('giftName', gift.name)
        if (giftImageUrl) {
          confirmUrl.searchParams.set('giftImage', giftImageUrl)
        }
        
        window.location.href = confirmUrl.toString()
      } else {
        // Error case - redirect to error page
        const giftImageUrl = gift.image_url || ''
        const confirmUrl = new URL('/confirm-payment', window.location.origin)
        confirmUrl.searchParams.set('type', 'transfer')
        confirmUrl.searchParams.set('status', 'error')
        confirmUrl.searchParams.set('donorName', donorName)
        confirmUrl.searchParams.set('amount', `${currencySymbol}${amount}`)
        confirmUrl.searchParams.set('currency', currencyLabel)
        confirmUrl.searchParams.set('giftName', gift.name)
        if (giftImageUrl) {
          confirmUrl.searchParams.set('giftImage', giftImageUrl)
        }
        
        window.location.href = confirmUrl.toString()
      }
    } catch (error) {
      clearInterval(interval)
      console.error('Error:', error)
      
      // Error case - redirect to error page
      const giftImageUrl = gift.image_url || ''
      const confirmUrl = new URL('/confirm-payment', window.location.origin)
      confirmUrl.searchParams.set('type', 'transfer')
      confirmUrl.searchParams.set('status', 'error')
      confirmUrl.searchParams.set('donorName', donorName)
      confirmUrl.searchParams.set('amount', `${currencySymbol}${amount}`)
      confirmUrl.searchParams.set('currency', currencyLabel)
      confirmUrl.searchParams.set('giftName', gift.name)
      if (giftImageUrl) {
        confirmUrl.searchParams.set('giftImage', giftImageUrl)
      }
      
      window.location.href = confirmUrl.toString()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProceed = () => {
    if (paymentMethod === 'card') {
      handlePayphonePayment()
    } else {
      setStep('transfer-details')
    }
  }

  // Drag handlers for swipe to dismiss
  const handleDragStart = (clientY: number) => {
    setDragStartY(clientY)
    setIsDragging(true)
  }

  const handleDragMove = (clientY: number) => {
    if (dragStartY === null) return
    
    const diff = clientY - dragStartY
    // Only allow dragging down
    if (diff > 0) {
      setDragCurrentY(clientY)
      if (modalRef.current) {
        modalRef.current.style.transform = `translateY(${diff}px)`
      }
    }
  }

  const handleDragEnd = () => {
    if (dragStartY === null || dragCurrentY === null) {
      setIsDragging(false)
      setDragStartY(null)
      setDragCurrentY(null)
      return
    }

    const diff = dragCurrentY - dragStartY
    
    // Reset modal position
    if (modalRef.current) {
      modalRef.current.style.transform = ''
    }

    // If dragged down more than 180px, close the modal
    if (diff > 180) {
      onClose()
    }

    setIsDragging(false)
    setDragStartY(null)
    setDragCurrentY(null)
  }

  if (!isOpen) return null

  return (
    <>
      {/* PayPhone Scripts */}
      <link 
        rel="stylesheet" 
        href="https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css"
      />
      <Script
        src="https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js"
        type="module"
        strategy="afterInteractive"
        onLoad={() => setPayphoneScriptLoaded(true)}
      />

      {/* Modal Backdrop */}
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 overflow-y-auto">
        <div 
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-md"
          onClick={!isSubmitting ? onClose : undefined}
        />

        {/* Modal Container */}
        <div 
          ref={modalRef}
          className="relative z-10 w-full max-w-[430px] min-h-[calc(100vh-6rem)] bg-background-light rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300"
          style={{ transition: isDragging ? 'none' : 'transform 0.5s ease-in-out' }}
        >
          
          {/* Handle Bar */}
          <div 
            className="flex flex-col items-center pt-4 pb-2 shrink-0 cursor-grab active:cursor-grabbing"
            onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
            onTouchEnd={handleDragEnd}
            onMouseDown={(e) => handleDragStart(e.clientY)}
            onMouseMove={(e) => isDragging && handleDragMove(e.clientY)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <div className="h-1.5 w-16 rounded-full bg-gray-300" />
          </div>

          {/* STEP: Amount Selection */}
          {step === 'amount' && !showPayphoneWidget && (
            <>
              {/* Header with Gift Preview */}
              <div className="px-6 pt-6 pb-2 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Regalo Seleccionado
                  </span>
                  <button 
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f3ef] text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Gift Card Preview */}
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-primary/5 flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    {gift.image_url ? (
                      <Image 
                        src={gift.image_url} 
                        alt={gift.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center flex-1 pr-2">
                    <h3 className="font-serif text-lg font-bold text-primary leading-tight mb-2">
                      {gift.name}
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-bold text-primary/60">
                          Meta: {progressPercentage.toFixed(0)}% alcanzado
                        </span>
                        <span className="text-[13px] font-bold text-primary-light">
                          Faltan: {currency === 'USD' 
                            ? `${formatCurrency(remainingUSD)} USD`
                            : `$${Math.round(getRemainingInCurrency().amount)} MXN`
                          }
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#f5f3ef] rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
                {/* Currency Toggle Switch */}
                <div className="mt-6 mb-8">
                  <div className="relative flex h-14 w-full items-center justify-center rounded-full bg-[#f5f3ef] p-1.5">
                    {/* Sliding Background */}
                    <div 
                      className={`absolute h-[calc(100%-12px)] w-[calc(50%-6px)] bg-primary rounded-full shadow-lg transition-all duration-500 ease-out ${
                        currency === 'USD' ? 'left-1.5' : 'left-[calc(50%+6px)]'
                      }`}
                    />
                    
                    <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-full px-4 text-[15px] font-semibold transition-all duration-300 z-10">
                      <span className={`truncate transition-colors duration-300 ${
                        currency === 'USD' ? 'text-white' : 'text-gray-400'
                      }`}>Ecuador ($ USD)</span>
                      <input 
                        type="radio" 
                        name="currency" 
                        value="USD" 
                        checked={currency === 'USD'}
                        onChange={() => {
                          setCurrency('USD')
                          setPaymentMethod('card')
                          setAmount('50')
                        }}
                        className="hidden"
                      />
                    </label>
                    
                    <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-full px-4 text-[15px] font-semibold transition-all duration-300 z-10">
                      <span className={`truncate transition-colors duration-300 ${
                        currency === 'MXN' ? 'text-white' : 'text-gray-400'
                      }`}>México ($ MXN)</span>
                      <input 
                        type="radio" 
                        name="currency" 
                        value="MXN" 
                        checked={currency === 'MXN'}
                        onChange={() => {
                          setCurrency('MXN')
                          setPaymentMethod('transfer')
                          setAmount('1000')
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>



                {/* Amount Input */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group mb-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9.]*"
                      value={`${currencySymbol} ${amount}`}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '')
                        setAmount(val)
                      }}
                      className="w-full bg-transparent border-none text-center text-primary focus:ring-0 p-0 leading-none font-bold"
                      style={{ fontSize: '56px', letterSpacing: '-0.02em' }}
                    />
                    <div className="h-[3px] w-32 bg-primary/20 mx-auto mt-2 rounded-full" />
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="flex gap-3 mt-8 mb-2 overflow-x-auto w-full justify-center no-scrollbar py-2">
                    {quickAmounts.map((quickAmount) => (
                      <button
                        key={quickAmount}
                        onClick={() => setAmount(quickAmount.toString())}
                        className={`flex h-12 shrink-0 items-center justify-center rounded-full px-7 font-semibold text-[16px] transition-all ${
                          parseFloat(amount) === quickAmount
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-primary/50'
                        }`}
                      >
                        {currencySymbol}{quickAmount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method Section */}
                <div className="mb-6">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300 mb-4">
                    Método de Pago
                  </h4>

                  {/* Payphone Option - Only for USD */}
                  {currency === 'USD' && (
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all mb-3 ${
                        paymentMethod === 'card'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        paymentMethod === 'card' ? 'bg-primary/10' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-primary' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-1.5 mb-1">
                          <h5 className="font-bold text-[17px] text-gray-900">Payphone</h5>
                          <h5 className="font-normal text-[17px] text-gray-900">(Tarjeta)</h5>
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600 px-2.5 py-1 rounded ml-auto">
                            Instantáneo
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">Visa, Mastercard, Amex</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'card' ? 'border-primary' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'card' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </button>
                  )}

                  {/* Transfer Option */}
                  <button
                    onClick={() => setPaymentMethod('transfer')}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'transfer' ? 'bg-primary/10' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-6 h-6 ${paymentMethod === 'transfer' ? 'text-primary' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h5 className="font-bold text-[17px] text-gray-900 mb-1">
                        {currency === 'USD' ? 'Transferencia Ecuador' : 'Transferencia México'}
                      </h5>
                      <p className="text-sm text-gray-400">
                        {currency === 'USD' 
                          ? 'Banco Pichincha, Guayaquil, Produbanco' 
                          : 'SPEI - Cualquier banco'}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'transfer' ? 'border-primary' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'transfer' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Donor Name Input */}
                <div className="mb-6">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300 mb-3 block">
                    Tu Nombre
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="¿Cómo te llamas?"
                    className="w-full h-14 px-4 rounded-2xl border-2 border-gray-100 bg-white text-gray-800 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-[15px]"
                  />
                </div>

                {/* Message for Couple */}
                <div className="mb-6">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300 mb-3 block">
                    Mensaje para Esteban y Dany
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe un mensaje especial para los novios..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-white text-gray-800 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-[15px]"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}
              </div>

              {/* Fixed Bottom Button */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light via-background-light to-transparent pt-12">
                <button
                  onClick={handleProceed}
                  disabled={isSubmitting || !amount || !donorName.trim()}
                  className="w-full h-16 bg-primary hover:bg-[#3d4a43] active:scale-[0.98] transition-all text-white font-bold rounded-2xl text-[17px] shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>
                    Regalar {currencySymbol}{amount} vía {paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}
                    </span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
                  Al continuar, aceptas que esta contribución es final y se procesará<br/>de forma segura.
                </p>
              </div>
            </>
          )}

          {/* STEP: Payphone Widget */}
          {step === 'amount' && showPayphoneWidget && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setShowPayphoneWidget(false)}
                  className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Volver</span>
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div id="pp-button" className="payphone-container w-full min-h-[500px]" />
            </div>
          )}

          {/* STEP: Transfer Details */}
          {step === 'transfer-details' && (
            <>
              {/* Header */}
              <div className="sticky top-0 z-10 bg-background-light/95 backdrop-blur-sm px-6 py-4 flex items-center justify-between border-b border-stone-200/50">
                <button 
                  onClick={() => setStep('amount')}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-primary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="font-serif text-lg font-bold text-gray-900 tracking-tight">
                  Detalles de Transferencia
                </h1>
                <div className="w-10" />
              </div>

              <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32 no-scrollbar modal-transfer-content">
                {/* Wedding Monogram */}
                <div className="mb-8 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-serif text-2xl font-bold mb-3 shadow-lg">
                    E&D
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Boda Esteban & Dany</p>
                </div>

                {/* Bank Details Card */}
                {bankAccount && (
                  <section className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-stone-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-primary/5 p-3 rounded-xl">
                        <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-gray-900 leading-tight">
                          {bankAccount.bankName}
                        </h3>
                        <p className="text-gray-500 text-sm">{bankAccount.accountType || 'Cuenta de Ahorros'}</p>
                      </div>
                    </div>

                    <div className="h-px w-full bg-stone-100 mb-6" />

                    <div className="space-y-6">
                      {/* Account Number */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                          Número de cuenta
                        </label>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-gray-900 font-mono tracking-tight">
                            {bankAccount.accountNumber}
                          </p>
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              copyToClipboard(bankAccount.accountNumber)
                            }}
                            type="button"
                            className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span className="text-xs font-medium">Copiar</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Beneficiary Name */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                          Beneficiario
                        </label>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-gray-900">
                            {bankAccount.accountName}
                          </p>
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              copyToClipboard(bankAccount.accountName)
                            }}
                            type="button"
                            className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span className="text-xs font-medium">Copiar</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* ID Number */}
                      {bankAccount.identificationNumber && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                            C.I. / RUC
                          </label>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-medium text-gray-900 font-mono tracking-tight">
                              {bankAccount.identificationNumber}
                            </p>
                            <button 
                              onClick={(e) => {
                                e.preventDefault()
                                copyToClipboard(bankAccount.identificationNumber!)
                              }}
                              type="button"
                              className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <span className="text-xs font-medium">Copiar</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Upload Receipt Section */}
                <section>
                  <h4 className="font-serif text-lg font-bold text-gray-900 mb-4">
                    Adjuntar Comprobante
                  </h4>
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      receiptPreview 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-primary/50 bg-white'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {receiptPreview ? (
                      <div className="space-y-4">
                        <div className="relative w-full h-48 rounded-xl overflow-hidden">
                          <Image
                            src={receiptPreview}
                            alt="Comprobante"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <p className="text-sm text-primary font-medium">
                          Toca para cambiar la imagen
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <p className="font-semibold text-gray-900">Sube tu comprobante</p>
                        <p className="text-sm text-gray-500">Foto o captura de pantalla</p>
                      </>
                    )}
                  </div>
                </section>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}
              </div>

              {/* Fixed Bottom Button */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light via-background-light to-transparent pt-12">
                <button
                  onClick={handleTransferSubmit}
                  disabled={isSubmitting || !receiptFile}
                  className="w-full h-14 bg-primary hover:bg-[#3d4a43] active:scale-[0.98] transition-all text-white font-bold rounded-xl text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Enviar Comprobante</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Verificaremos tu pago automáticamente.
                </p>
              </div>
            </>
          )}

          {/* STEP: Validating with AI */}
          {step === 'validating' && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-sm flex flex-col items-center text-center">
                <h4 className="text-[13px] uppercase font-bold tracking-[0.15em] text-[#996678] mb-8">
                  Validación IA Activa
                </h4>

                {/* Animated Heart with Heartbeat */}
                <div className="relative flex items-center justify-center py-10 w-full">
                  <div className="absolute w-32 h-32 rounded-full bg-[#d3c3db]/20 animate-pulse" />
                  <div className="relative z-10 w-24 h-24 bg-[#d3c3db]/30 rounded-full flex items-center justify-center overflow-hidden">
                    <svg className="w-14 h-14 text-[#d3c3db] animate-[heartbeat_1.5s_ease-in-out_infinite]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-gray-900 text-2xl font-bold leading-tight pb-3">
                  Verificando comprobante
                </h3>
                <p className="text-gray-500 text-lg pb-8">
                  {validationMessage || 'Leyendo la imagen con IA...'}
                </p>

                {/* Progress Bar */}
                <div className="w-full px-4">
                  <div className="h-2 w-full bg-[#d3c3db]/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#d3c3db] rounded-full transition-all duration-300" 
                      style={{ width: `${validationProgress}%` }}
                    />
                  </div>
                  <div className="mt-3 text-[13px] text-[#996678] font-bold text-center uppercase tracking-widest">
                    {validationProgress}% Procesado
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
