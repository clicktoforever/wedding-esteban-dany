'use client'

interface PaymentMethodModalProps {
  gift: {
    id: string
    name: string
    total_amount: number
    collected_amount: number
  }
  isOpen: boolean
  onClose: () => void
  onSelectMethod: (method: 'card' | 'transfer_ec' | 'transfer_mx') => void
}

export default function PaymentMethodModal({ 
  gift, 
  isOpen, 
  onClose, 
  onSelectMethod 
}: PaymentMethodModalProps) {
  if (!isOpen) return null

  const remainingAmount = gift.total_amount - gift.collected_amount

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-method-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-wedding-purple/10 to-wedding-rose/10 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 
              id="payment-method-title"
              className="text-2xl font-serif text-wedding-forest"
            >
              Selecciona Método de Pago
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            <p className="font-medium text-gray-800">{gift.name}</p>
            <p>Monto disponible: <span className="font-semibold text-wedding-forest">${remainingAmount.toFixed(2)}</span></p>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="p-6 space-y-3">
          {/* Tarjeta de Crédito/Débito */}
          <button
            onClick={() => onSelectMethod('card')}
            className="w-full flex items-center space-x-4 p-5 bg-white border-2 border-gray-200 rounded-xl 
                     hover:border-wedding-purple hover:bg-wedding-purple/5 transition-all duration-200 
                     focus:outline-none focus:ring-4 focus:ring-wedding-purple/30 group"
          >
            <div className="flex-shrink-0 w-14 h-14 bg-wedding-purple/10 rounded-full flex items-center justify-center 
                          group-hover:bg-wedding-purple/20 transition-colors">
              <svg className="w-7 h-7 text-wedding-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 text-lg">Tarjeta de Crédito/Débito</h3>
              <p className="text-sm text-gray-600">Pago seguro con Payphone</p>
            </div>
            <svg className="w-6 h-6 text-gray-400 group-hover:text-wedding-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Transferencia Ecuador */}
          <button
            onClick={() => onSelectMethod('transfer_ec')}
            className="w-full flex items-center space-x-4 p-5 bg-white border-2 border-gray-200 rounded-xl 
                     hover:border-wedding-rose hover:bg-wedding-rose/5 transition-all duration-200 
                     focus:outline-none focus:ring-4 focus:ring-wedding-rose/30 group"
          >
            <div className="flex-shrink-0 w-14 h-14 bg-wedding-rose/10 rounded-full flex items-center justify-center 
                          group-hover:bg-wedding-rose/20 transition-colors">
              <svg className="w-7 h-7 text-wedding-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 text-lg">Transferencia Ecuatoriana</h3>
              <p className="text-sm text-gray-600">Banco Pichincha - Validación con IA</p>
            </div>
            <svg className="w-6 h-6 text-gray-400 group-hover:text-wedding-rose transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Transferencia México */}
          <button
            onClick={() => onSelectMethod('transfer_mx')}
            className="w-full flex items-center space-x-4 p-5 bg-white border-2 border-gray-200 rounded-xl 
                     hover:border-wedding-sage hover:bg-wedding-sage/5 transition-all duration-200 
                     focus:outline-none focus:ring-4 focus:ring-wedding-sage/30 group"
          >
            <div className="flex-shrink-0 w-14 h-14 bg-wedding-sage/10 rounded-full flex items-center justify-center 
                          group-hover:bg-wedding-sage/20 transition-colors">
              <svg className="w-7 h-7 text-wedding-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 text-lg">Transferencia Mexicana</h3>
              <p className="text-sm text-gray-600">BBVA México - Validación con IA</p>
            </div>
            <svg className="w-6 h-6 text-gray-400 group-hover:text-wedding-sage transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Nota informativa */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-gray-600">
                Las transferencias son validadas automáticamente con inteligencia artificial. 
                Recibirás confirmación en minutos.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 
                     font-medium hover:bg-gray-50 transition-colors focus:outline-none 
                     focus:ring-4 focus:ring-gray-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
