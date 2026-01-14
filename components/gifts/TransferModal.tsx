'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'

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

interface TransferModalProps {
  gift: {
    id: string
    name: string
    total_amount: number
    collected_amount: number
  }
  country: 'EC' | 'MX'
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function TransferModal({ 
  gift, 
  country, 
  isOpen, 
  onClose,
  onSuccess 
}: TransferModalProps) {
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [donorName, setDonorName] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const remainingAmount = gift.total_amount - gift.collected_amount

  // Cargar datos bancarios
  useEffect(() => {
    if (isOpen) {
      fetchBankAccount()
    }
  }, [isOpen, country])

  const fetchBankAccount = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gifts/bank-accounts?country=${country}`)
      const data = await response.json()
      
      if (data.success) {
        setBankAccount(data.account)
      }
    } catch (error) {
      console.error('Error fetching bank account:', error)
      setError('Error al cargar datos bancarios')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar 5MB')
      return
    }

    setReceiptFile(file)
    setError(null)

    // Generar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (!donorName.trim()) {
      setError('Por favor ingresa tu nombre')
      return
    }

    const contributionAmount = Number.parseFloat(amount)
    if (Number.isNaN(contributionAmount) || contributionAmount <= 0) {
      setError('Por favor ingresa un monto válido')
      return
    }

    if (contributionAmount > remainingAmount) {
      setError(`El monto excede el saldo disponible: $${remainingAmount.toFixed(2)}`)
      return
    }

    if (!receiptFile) {
      setError('Por favor sube el comprobante de transferencia')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('giftId', gift.id)
      formData.append('donorName', donorName.trim())
      formData.append('amount', contributionAmount.toString())
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

      if (data.success) {
        setSuccess(true)
        setTransactionId(data.transactionId)
        
        // Esperar 2 segundos antes de cerrar
        setTimeout(() => {
          onSuccess?.()
          handleClose()
        }, 3000)
      } else {
        setError(data.error || 'Error al procesar la transferencia')
      }
    } catch (error) {
      console.error('Error submitting transfer:', error)
      setError('Error al enviar el comprobante. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setDonorName('')
      setAmount('')
      setMessage('')
      setReceiptFile(null)
      setReceiptPreview(null)
      setError(null)
      setSuccess(false)
      setTransactionId(null)
      onClose()
    }
  }

  if (!isOpen) return null

  const countryName = country === 'EC' ? 'Ecuador' : 'México'
  const colorClass = country === 'EC' ? 'wedding-rose' : 'wedding-sage'

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-br from-${colorClass}/10 to-${colorClass}/5 p-6 border-b border-gray-100`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif text-wedding-forest">
                Transferencia {countryName === 'Ecuador' ? 'Ecuatoriana' : 'Mexicana'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{gift.name}</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-6 bg-green-50 border-b border-green-100">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900">¡Comprobante Enviado!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Tu comprobante está siendo validado automáticamente. Te notificaremos del resultado en breve.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-wedding-purple border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-3">Cargando datos bancarios...</p>
            </div>
          ) : bankAccount ? (
            <>
              {/* Datos Bancarios */}
              <div className={`bg-${colorClass}/5 border border-${colorClass}/20 rounded-xl p-5`}>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-wedding-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Datos para Transferencia
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Banco:</span>
                    <span className="font-semibold text-gray-900">{bankAccount.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Titular:</span>
                    <span className="font-semibold text-gray-900">{bankAccount.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{country === 'EC' ? 'Cuenta' : 'CLABE'}:</span>
                    <span className="font-mono font-bold text-lg text-wedding-forest">{bankAccount.accountNumber}</span>
                  </div>
                  {bankAccount.accountType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-semibold text-gray-900">{bankAccount.accountType}</span>
                    </div>
                  )}
                  {bankAccount.identificationNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cédula:</span>
                      <span className="font-mono text-gray-900">{bankAccount.identificationNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Moneda:</span>
                    <span className="font-semibold text-gray-900">{bankAccount.currency}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 italic">
                    {bankAccount.instructions}
                  </p>
                </div>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label htmlFor="donorName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tu Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="donorName"
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Nombre completo"
                    disabled={isSubmitting || success}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-wedding-purple 
                             focus:ring-4 focus:ring-wedding-purple/20 outline-none transition-all disabled:bg-gray-100"
                    required
                  />
                </div>

                {/* Monto */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                    Monto ({bankAccount.currency}) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={remainingAmount}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      disabled={isSubmitting || success}
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-wedding-purple 
                               focus:ring-4 focus:ring-wedding-purple/20 outline-none transition-all disabled:bg-gray-100"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Disponible: ${remainingAmount.toFixed(2)}
                  </p>
                </div>

                {/* Mensaje */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mensaje (Opcional)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe un mensaje especial..."
                    rows={3}
                    disabled={isSubmitting || success}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-wedding-purple 
                             focus:ring-4 focus:ring-wedding-purple/20 outline-none transition-all resize-none disabled:bg-gray-100"
                  />
                </div>

                {/* Subir Comprobante */}
                <div>
                  <label htmlFor="receipt" className="block text-sm font-semibold text-gray-700 mb-2">
                    Comprobante de Transferencia <span className="text-red-500">*</span>
                  </label>
                  
                  {!receiptPreview ? (
                    <label 
                      htmlFor="receipt"
                      className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center 
                               hover:border-wedding-purple hover:bg-wedding-purple/5 transition-all cursor-pointer"
                    >
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-700 font-medium">Haz clic para subir imagen</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG (máx. 5MB)</p>
                      <input
                        id="receipt"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isSubmitting || success}
                        className="hidden"
                        required
                      />
                    </label>
                  ) : (
                    <div className="relative border-2 border-gray-300 rounded-xl overflow-hidden">
                      <img 
                        src={receiptPreview} 
                        alt="Vista previa del comprobante" 
                        className="w-full h-64 object-contain bg-gray-50"
                      />
                      {!success && (
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptFile(null)
                            setReceiptPreview(null)
                          }}
                          disabled={isSubmitting}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full 
                                   hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Botones */}
                {!success && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 
                               font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !receiptFile}
                      className={`flex-1 px-6 py-3 bg-gradient-to-r from-${colorClass} to-wedding-purple text-white 
                               rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 
                               transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                               focus:outline-none focus:ring-4 focus:ring-${colorClass}/30`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </span>
                      ) : (
                        'Enviar para Validación'
                      )}
                    </button>
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-600">Error al cargar datos bancarios</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
