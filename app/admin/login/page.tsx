'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen bg-gradient-to-br from-wedding-sage/5 via-wedding-rose/5 to-wedding-purple/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 104 104" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-wedding-forest"
            >
              <path d="M67.5519 62.5593C67.5529 62.5525 67.5533 62.5515 67.552 62.5587L67.5519 62.5593Z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M31.686 35.5772C32.8083 35.7544 33.8118 36.2135 34.6872 36.9488C35.4963 37.6285 35.9465 38.5294 36.0588 39.607H36.6575L37.1533 33.8218C34.2917 32.8975 31.9293 32.4481 30.0521 32.4481C25.0539 32.4481 20.6582 34.3659 16.8434 38.2432C13.0596 42.0895 11.186 46.5035 11.186 51.5064C11.186 55.4655 12.5575 59.0059 15.3248 62.1468C18.1239 65.2876 21.2657 66.8152 24.7643 66.8152C27.6531 66.8152 30.3501 66.1329 32.8639 64.7674C34.793 63.7195 37.0144 61.9514 39.1105 59.8595L39.8236 59.1478L40.0436 60.1311C40.4118 61.7774 41.292 63.1606 42.7096 64.2908C44.6668 65.8258 47.3368 66.623 50.7781 66.623C54.2172 66.623 57.1386 65.8423 59.567 64.3054L59.5696 64.3037C60.7618 63.5586 61.7402 62.4958 62.5009 61.0962C63.2545 59.7095 63.67 58.0821 63.7318 56.1992L63.7561 55.4561L64.4615 55.6912C64.5742 55.7288 64.764 55.7589 65.0553 55.7589C66.3447 55.7589 67.6217 55.2377 68.896 54.1213L70.4891 52.7294L69.7795 54.7369L66.3107 63.7873L66.3085 63.7927C65.9373 64.7039 65.4747 65.4247 64.8915 65.8913L64.8824 65.8986L64.873 65.9054C64.248 66.3638 63.3325 66.5416 62.2376 66.5416H62.1192V66.7783H70.4318V66.5416H70.2174C69.0795 66.5416 68.2491 66.497 67.8121 66.3778C67.5832 66.3154 67.3502 66.2116 67.1692 66.0306C66.9738 65.8352 66.8746 65.5845 66.8746 65.3139C66.8746 64.9294 67.0139 64.3578 67.2361 63.659C67.3474 63.2933 67.4298 63.0146 67.484 62.8209C67.5113 62.7233 67.5303 62.6515 67.542 62.603C67.5443 62.5936 67.5461 62.5857 67.5476 62.5793V62.5181L70.8953 53.8952H83.7707L87.1801 62.8198L87.1839 62.8311C87.3449 63.3141 87.4675 63.6979 87.5503 63.9797C87.5917 64.1201 87.6247 64.2407 87.6479 64.3382C87.6666 64.4165 87.6931 64.5347 87.6931 64.6409C87.6931 65.2625 87.4336 65.7836 86.9074 66.1184C86.4238 66.4261 85.7693 66.5416 85.0233 66.5416H84.0397V66.7783H95.2365V66.5416H94.0606C93.2663 66.5416 92.5697 66.3421 92.0514 65.867L92.0336 65.8507L92.0173 65.833C91.613 65.3919 91.2327 64.7769 90.8683 64.015L90.8586 63.9946L79.2754 33.6712C79.2676 33.6834 79.2597 33.6957 79.2517 33.7081C79.1548 33.8579 79.0151 34.0564 78.8367 34.2996L78.8313 34.307L78.8256 34.3143C78.463 34.7757 78.0684 35.236 77.6422 35.695L77.6352 35.7025L77.628 35.7098C77.4119 35.9258 77.2174 36.104 77.0475 36.2361C76.9778 36.2903 76.8962 36.3499 76.8066 36.4024L72.0029 48.9358L71.9852 48.9683C71.7974 49.3124 71.6335 49.6351 71.4794 49.9405L71.4376 50.0235C71.3 50.2963 71.1675 50.559 71.0355 50.802C70.7456 51.3355 70.4307 51.8267 69.986 52.2134C69.1361 52.9524 68.0888 53.311 66.882 53.311C66.6281 53.311 66.2712 53.2559 65.8439 53.1672C65.4047 53.076 64.8527 52.9409 64.1905 52.7632L64.1871 52.7623C62.9344 52.4178 61.8807 52.2534 61.0173 52.2534C58.3601 52.2534 55.8501 54.2159 53.5514 58.5618L53.8446 58.6455C54.678 57.3279 55.4932 56.3306 56.2963 55.6882C57.2134 54.9545 58.352 54.6052 59.6713 54.6052C60.6276 54.6052 61.4254 54.7177 62.0035 54.9968C62.3001 55.14 62.5583 55.3364 62.7416 55.6018C62.928 55.8717 63.0141 56.1804 63.0141 56.5058C63.0141 59.3242 62.1007 61.4871 60.1883 62.8682C58.3401 64.2031 55.99 64.848 53.1817 64.848C50.3561 64.848 48.0725 64.0811 46.4045 62.4826C44.7638 60.9102 43.9262 59.0216 43.9262 56.8423C43.9262 55.3241 44.2304 53.9261 44.8473 52.6579L44.8518 52.6486L44.8567 52.6395C45.1454 52.0981 45.538 51.6015 46.0262 51.1481C46.5157 50.6913 46.9501 50.3227 47.3273 50.0484L47.3364 50.0417L47.3458 50.0354C47.7762 49.7485 48.3437 49.4762 49.0317 49.2136C49.6986 48.928 50.2542 48.7145 50.6929 48.5784C51.1277 48.4122 51.7283 48.2181 52.4875 47.9965C53.0403 47.8122 53.4821 47.6621 53.8142 47.5459L53.8761 46.844C51.0478 46.6897 48.7602 46.0741 47.0594 44.9509L47.0554 44.9482C45.268 43.7452 44.3107 42.1766 44.3107 40.2578C44.3107 38.3749 44.8985 36.8737 46.151 35.8607C47.381 34.8658 49.1635 34.4153 51.4031 34.4153C54.0332 34.4153 56.0953 34.7856 57.5176 35.5933C58.8299 36.3385 59.5755 37.4463 59.7195 38.8698L60.2319 38.9019L60.7187 34.1965C59.0342 33.1778 56.6839 32.6404 53.6143 32.6404C50.4165 32.6404 47.6813 33.4765 45.3831 35.1307C43.1565 36.7562 42.0551 38.9284 42.0551 41.6999C42.0551 43.352 42.609 44.7324 43.7193 45.8744C44.8472 46.9706 46.4332 47.5917 48.5429 47.6835L52.0002 47.8761L48.6076 48.7851C46.3556 49.1503 44.3243 50.184 42.5072 51.9088L42.5036 51.9122C42.0421 52.3424 41.6408 52.8022 41.2996 53.2926L40.1494 55.7808C39.9931 56.3669 39.8969 56.9847 39.8604 57.6348L39.8495 57.83L39.7185 57.9752C38.0371 59.8398 36.0034 61.5452 34.1576 62.524C31.9916 63.6727 29.9784 64.2712 28.1293 64.2712C25.187 64.2712 22.1576 63.087 19.0513 60.7981L19.0475 60.7953C17.4226 59.5766 16.0892 57.8483 15.0341 55.6392C13.9677 53.4065 13.4417 50.8711 13.4417 48.0453C13.4417 44.109 14.8861 40.9623 17.7864 38.669C20.6464 36.4076 24.0062 35.2806 27.8408 35.2806C29.3623 35.2806 30.6471 35.3771 31.686 35.5772ZM71.2365 52.9855H83.3259L77.3366 37.1251L71.2365 52.9855Z" fill="currentColor"/>
              <circle cx="52" cy="52" r="51.3067" stroke="currentColor" strokeWidth="1.38667"/>
            </svg>
          </div>
          <h1 className="text-3xl font-serif text-wedding-forest mb-2">
            Panel Administrativo
          </h1>
          <p className="text-gray-600 tracking-wide">
            Esteban & Dany
          </p>
        </div>

        {/* Formulario de login */}
        <div className="bg-white shadow-2xl border-2 border-wedding-sage/20 p-8">
          {/* Decorative divider */}
          <div className="flex items-center justify-center mb-6">
            <div className="h-px bg-wedding-forest/20 w-12"></div>
            <svg className="w-4 h-4 mx-3 text-wedding-rose" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8Z"/>
            </svg>
            <div className="h-px bg-wedding-forest/20 w-12"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 tracking-wider uppercase">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:border-wedding-forest focus:ring-2 focus:ring-wedding-forest/20 outline-none transition-all"
                placeholder="admin@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 tracking-wider uppercase">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:border-wedding-forest focus:ring-2 focus:ring-wedding-forest/20 outline-none transition-all"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-wedding-forest text-white tracking-wider uppercase text-sm font-medium hover:bg-wedding-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          {/* Decorative divider */}
          <div className="flex items-center justify-center mt-6">
            <div className="h-px bg-wedding-forest/20 w-12"></div>
            <svg className="w-4 h-4 mx-3 text-wedding-rose" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8Z"/>
            </svg>
            <div className="h-px bg-wedding-forest/20 w-12"></div>
          </div>
        </div>

        {/* Link de vuelta */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-gray-600 hover:text-wedding-forest transition-colors tracking-wider">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  )
}
