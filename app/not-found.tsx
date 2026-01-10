import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-pink-50 to-white">
      <div className="text-center px-4">
        <h1 className="text-6xl font-serif text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o el enlace de confirmación es inválido.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
