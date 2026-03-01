'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Intentar iniciar sesión
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      if (!data.session) {
        throw new Error('No se pudo iniciar sesión')
      }

      // Verificar si el usuario es admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', data.session.user.id)
        .single()

      if (adminError || !adminUser) {
        // Si no es admin, cerrar sesión y mostrar error
        await supabase.auth.signOut()
        throw new Error('No tienes permisos de administrador')
      }

      // Si todo está bien, redirigir al admin
      router.push('/admin')
      router.refresh()
    } catch (err) {
      console.error('Error al iniciar sesión:', err)
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row overflow-hidden">
      {/* Estilos personalizados para animaciones */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #F9F7F2; 
        }
        ::-webkit-scrollbar-thumb {
          background: #D3CDE6; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #355E3B; 
        }
      `}</style>

      {/* Left Split: Hero Image (Desktop) / Top Header (Mobile) */}
      <div className="w-full md:w-1/2 h-64 md:h-auto md:min-h-screen relative shrink-0 group overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center md:bg-right transition-transform duration-1000 md:group-hover:scale-105"
          style={{
            backgroundImage: 'url("https://res.cloudinary.com/machiboda/image/upload/f_auto,q_auto/v1772050799/wedding/ajxra8errfxzqfjlpqxm.jpg")'
          }}
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:from-black/40 md:to-transparent mix-blend-multiply"></div>
        {/* Mobile decorative curve at bottom */}
        <div className="absolute -bottom-1 left-0 right-0 h-8 bg-cream-bg rounded-t-[50%] md:hidden scale-x-150"></div>
      </div>

      {/* Right Split: Login Form Area */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 bg-cream-bg relative">
        {/* Content Wrapper */}
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Header Section */}
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="mx-auto w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center bg-white shadow-[0_4px_20px_-4px_rgba(53,94,59,0.1)]">
              <Image
                src="https://res.cloudinary.com/machiboda/image/upload/f_auto,q_auto/v1772050800/wedding/lal95pilyeq3jojweafo.svg"
                alt="Logo D&C"
                width={64}
                height={64}
                className="w-16 h-16 object-contain"
              />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-3xl md:text-4xl text-[#111812] tracking-tight">
                Iniciar Sesión
              </h1>
              <p className="font-body text-neutral-500 text-sm md:text-base tracking-wide">
                Bienvenido al panel de control de tu boda
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email Input Group */}
            <div className="space-y-1.5">
              <label
                className="block text-xs font-bold text-neutral-700 uppercase tracking-wider ml-1"
                htmlFor="email"
              >
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-lavender-border rounded-xl text-neutral-900 placeholder:text-neutral-300 focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 ease-out shadow-sm text-base"
                  id="email"
                  name="email"
                  placeholder="ejemplo@correo.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Input Group */}
            <div className="space-y-1.5">
              <label
                className="block text-xs font-bold text-neutral-700 uppercase tracking-wider ml-1"
                htmlFor="password"
              >
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  className="block w-full pl-11 pr-11 py-3.5 bg-white border border-lavender-border rounded-xl text-neutral-900 placeholder:text-neutral-300 focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 ease-out shadow-sm text-base"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5 text-neutral-400 hover:text-primary transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-neutral-400 hover:text-primary transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end">
              <a
                className="text-sm font-medium text-primary hover:text-[#2a4a2e] transition-colors underline decoration-transparent hover:decoration-current underline-offset-4"
                href="#"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit Button */}
            <button
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-medium rounded-xl text-white bg-primary hover:bg-[#2a4a2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {!isLoading && (
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
              )}

              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Ingresar
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Footer / Help */}
          <div className="pt-6 border-t border-neutral-200/60 text-center">
            <p className="text-xs text-neutral-400 font-body">
              © 2026 Click to forever. Todos los derechos reservados.
            </p>
          </div>
        </div>

        {/* Decorative Elements (Subtle) */}
        <div className="absolute top-10 right-10 opacity-20 pointer-events-none hidden md:block">
          <svg
            className="w-16 h-16 text-primary"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
