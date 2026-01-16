interface MoneyDisplayProps {
  amount: number // Siempre en USD
  currency: 'USD' | 'MXN'
  className?: string
}

export default function MoneyDisplay({ amount, currency, className = '' }: MoneyDisplayProps) {
  const formatCurrency = (value: number, curr: 'USD' | 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  if (currency === 'MXN') {
    const mxnAmount = amount * 20 // Tasa fija
    return (
      <div className={`text-right ${className}`}>
        <div className="font-semibold text-gray-900">
          {formatCurrency(mxnAmount, 'MXN')}
        </div>
        <div className="text-xs text-gray-500">
          {formatCurrency(amount, 'USD')}
        </div>
      </div>
    )
  }

  return (
    <div className={`font-semibold text-gray-900 ${className}`}>
      {formatCurrency(amount, 'USD')}
    </div>
  )
}
