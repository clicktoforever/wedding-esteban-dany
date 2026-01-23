'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'

export default function AdminHeader() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  const [isWeddingDateModalOpen, setIsWeddingDateModalOpen] = useState(false)
  const [deadlineDate, setDeadlineDate] = useState('2026-03-10')
  const [deadlineHour, setDeadlineHour] = useState('23')
  const [deadlineMinute, setDeadlineMinute] = useState('59')
  const [weddingDate, setWeddingDate] = useState('2026-04-11')
  const [weddingHour, setWeddingHour] = useState('18')
  const [weddingMinute, setWeddingMinute] = useState('00')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDeadline, setIsLoadingDeadline] = useState(true)
  const [isLoadingWeddingDate, setIsLoadingWeddingDate] = useState(true)

  // Cargar la fecha límite actual de la base de datos
  useEffect(() => {
    loadDeadline()
    loadWeddingDate()
  }, [])

  const loadDeadline = async () => {
    try {
      setIsLoadingDeadline(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('configurations')
        .select('value')
        .eq('key', 'confirmation_deadline')
        .single()

      if (error) {
        console.error('Error al cargar fecha límite:', error)
        return
      }

      if (data?.value) {
        const deadline = new Date(data.value)
        const date = deadline.toISOString().split('T')[0]
        const hours = deadline.getHours().toString().padStart(2, '0')
        const minutes = deadline.getMinutes().toString().padStart(2, '0')
        setDeadlineDate(date)
        setDeadlineHour(hours)
        setDeadlineMinute(minutes)
      }
    } catch (error) {
      console.error('Error al cargar fecha límite:', error)
    } finally {
      setIsLoadingDeadline(false)
    }
  }

  const loadWeddingDate = async () => {
    try {
      setIsLoadingWeddingDate(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('configurations')
        .select('value')
        .eq('key', 'wedding_date')
        .single()

      if (error) {
        console.error('Error al cargar fecha de boda:', error)
        return
      }

      if (data?.value) {
        const wedding = new Date(data.value)
        const date = wedding.toISOString().split('T')[0]
        const hours = wedding.getHours().toString().padStart(2, '0')
        const minutes = wedding.getMinutes().toString().padStart(2, '0')
        setWeddingDate(date)
        setWeddingHour(hours)
        setWeddingMinute(minutes)
      }
    } catch (error) {
      console.error('Error al cargar fecha de boda:', error)
    } finally {
      setIsLoadingWeddingDate(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  const handleSaveDeadline = async () => {
    setIsLoading(true)
    try {
      const deadline = new Date(`${deadlineDate}T${deadlineHour}:${deadlineMinute}:00`)
      const supabase = createClient()

      // Actualizar en la base de datos
      const { error } = await supabase
        .from('configurations')
        .update({ 
          value: deadline.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('key', 'confirmation_deadline')

      if (error) {
        throw error
      }

      alert(`✅ Fecha límite actualizada a ${deadlineDate} a las ${deadlineHour}:${deadlineMinute}`)
      setIsDateModalOpen(false)
      setIsSettingsOpen(false)
    } catch (error) {
      console.error('Error al guardar fecha límite:', error)
      alert('❌ Error al guardar la fecha límite. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveWeddingDate = async () => {
    setIsLoading(true)
    try {
      const wedding = new Date(`${weddingDate}T${weddingHour}:${weddingMinute}:00`)
      const supabase = createClient()

      // Actualizar en la base de datos
      const { error } = await supabase
        .from('configurations')
        .update({ 
          value: wedding.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('key', 'wedding_date')

      if (error) {
        throw error
      }

      alert(`✅ Fecha de boda actualizada a ${weddingDate} a las ${weddingHour}:${weddingMinute}`)
      setIsWeddingDateModalOpen(false)
      setIsSettingsOpen(false)
      
      // Recargar la página para mostrar la nueva fecha
      window.location.reload()
    } catch (error) {
      console.error('Error al guardar fecha de boda:', error)
      alert('❌ Error al guardar la fecha de boda. Intenta de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-[#F9F7F2] border-b border-stone-200 transition-colors duration-300">
        <div className="px-6 py-4 flex justify-between items-center max-w-md mx-auto md:max-w-4xl">
          <div className="flex flex-col">
            <h1 className="font-display text-2xl font-bold text-primary tracking-tight">
              Dashboard Admin
            </h1>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-widest mt-0.5">
              Esteban & Dany
            </p>
          </div>
          <div className="flex items-center space-x-2 relative">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-full hover:bg-stone-100 transition-colors"
              type="button"
            >
              <span className="material-icons-round text-stone-600">settings</span>
            </button>

            {/* Dropdown Menu */}
            {isSettingsOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-stone-200 z-[100] overflow-hidden">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDateModalOpen(true)
                      setIsSettingsOpen(false)
                    }}
                    className="w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-stone-50 transition-colors group"
                    type="button"
                  >
                    <span className="material-icons-round text-stone-500 text-lg group-hover:text-stone-700 transition-colors">calendar_month</span>
                    <span className="text-sm font-medium text-stone-700">Cambiar Fecha Límite</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsWeddingDateModalOpen(true)
                      setIsSettingsOpen(false)
                    }}
                    className="w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-stone-50 transition-colors group"
                    type="button"
                  >
                    <span className="material-icons-round text-stone-500 text-lg group-hover:text-stone-700 transition-colors">event</span>
                    <span className="text-sm font-medium text-stone-700">Cambiar Fecha Evento</span>
                  </button>
                  <div className="h-px bg-stone-100 mx-4"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-red-50 transition-colors group"
                    type="button"
                  >
                    <span className="material-icons-round text-red-500 text-lg">logout</span>
                    <span className="text-sm font-medium text-red-600">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Date Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => !isLoading && setIsDateModalOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-stone-200">
            <div className="p-6">
              <h3 className="font-display text-xl font-bold text-stone-900 text-center mb-1">Nueva Fecha Límite</h3>
              <p className="text-xs text-center text-stone-600 mb-6">Selecciona el límite para confirmar asistencia</p>
              
              {isLoadingDeadline ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider ml-1">Fecha</label>
                      <input
                        type="date"
                        value={deadlineDate}
                        onChange={(e) => setDeadlineDate(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-sans focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider ml-1">Hora</label>
                      <div className="flex items-center space-x-3">
                        {/* Hour Picker */}
                        <div className="flex-1">
                          <select
                            value={deadlineHour}
                            onChange={(e) => setDeadlineHour(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-sans focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                          >
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0')
                              return (
                                <option key={hour} value={hour}>
                                  {hour}
                                </option>
                              )
                            })}
                          </select>
                          <p className="text-[10px] text-stone-500 mt-1 ml-1">Hora</p>
                        </div>

                        <span className="text-2xl text-stone-400 mb-5">:</span>

                        {/* Minute Picker */}
                        <div className="flex-1">
                          <select
                            value={deadlineMinute}
                            onChange={(e) => setDeadlineMinute(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-sans focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                          >
                            {Array.from({ length: 60 }, (_, i) => {
                              const minute = i.toString().padStart(2, '0')
                              return (
                                <option key={minute} value={minute}>
                                  {minute}
                                </option>
                              )
                            })}
                          </select>
                          <p className="text-[10px] text-stone-500 mt-1 ml-1">Minutos</p>
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-stone-100 rounded-xl p-3 border border-stone-200">
                      <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider mb-1">Vista Previa</p>
                      <p className="text-sm font-medium text-stone-700">
                        {new Date(`${deadlineDate}T${deadlineHour}:${deadlineMinute}`).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} a las {deadlineHour}:{deadlineMinute}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col space-y-3">
                    <button
                      onClick={handleSaveDeadline}
                      disabled={isLoading}
                      className="w-full bg-stone-700 hover:bg-stone-800 disabled:bg-stone-400 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl shadow-lg shadow-stone-700/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                      type="button"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <span>Guardar Fecha</span>
                      )}
                    </button>
                    <button
                      onClick={() => setIsDateModalOpen(false)}
                      disabled={isLoading}
                      className="w-full text-stone-600 hover:text-stone-800 disabled:text-stone-400 disabled:cursor-not-allowed text-sm font-medium py-2 transition-colors"
                      type="button"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wedding Date Modal */}
      {isWeddingDateModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => !isLoading && setIsWeddingDateModalOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-stone-200">
            <div className="p-6">
              <h3 className="font-display text-xl font-bold text-stone-900 text-center mb-1">Fecha del Evento</h3>
              <p className="text-xs text-center text-stone-600 mb-6">Cambia la fecha y hora de la boda</p>
              
              {isLoadingWeddingDate ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider ml-1">Fecha</label>
                      <input
                        type="date"
                        value={weddingDate}
                        onChange={(e) => setWeddingDate(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-sans focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider ml-1">Hora</label>
                      <div className="flex items-center space-x-3">
                        {/* Hour Picker */}
                        <div className="flex-1">
                          <select
                            value={weddingHour}
                            onChange={(e) => setWeddingHour(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-sans focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                          >
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0')
                              return (
                                <option key={hour} value={hour}>
                                  {hour}
                                </option>
                              )
                            })}
                          </select>
                          <p className="text-[10px] text-stone-500 mt-1 ml-1">Hora</p>
                        </div>

                        <span className="text-2xl text-stone-400 mb-5">:</span>

                        {/* Minute Picker */}
                        <div className="flex-1">
                          <select
                            value={weddingMinute}
                            onChange={(e) => setWeddingMinute(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-sans focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                          >
                            {Array.from({ length: 60 }, (_, i) => {
                              const minute = i.toString().padStart(2, '0')
                              return (
                                <option key={minute} value={minute}>
                                  {minute}
                                </option>
                              )
                            })}
                          </select>
                          <p className="text-[10px] text-stone-500 mt-1 ml-1">Minutos</p>
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-stone-100 rounded-xl p-3 border border-stone-200">
                      <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider mb-1">Vista Previa</p>
                      <p className="text-sm font-medium text-stone-700">
                        {new Date(`${weddingDate}T${weddingHour}:${weddingMinute}`).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} a las {weddingHour}:{weddingMinute}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col space-y-3">
                    <button
                      onClick={handleSaveWeddingDate}
                      disabled={isLoading}
                      className="w-full bg-stone-700 hover:bg-stone-800 disabled:bg-stone-400 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl shadow-lg shadow-stone-700/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                      type="button"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <span>Guardar Fecha</span>
                      )}
                    </button>
                    <button
                      onClick={() => setIsWeddingDateModalOpen(false)}
                      disabled={isLoading}
                      className="w-full text-stone-600 hover:text-stone-800 disabled:text-stone-400 disabled:cursor-not-allowed text-sm font-medium py-2 transition-colors"
                      type="button"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
