'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

export default function AdminHeader() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  const [deadlineDate, setDeadlineDate] = useState('2026-03-11')
  const [deadlineTime, setDeadlineTime] = useState('23:59')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  const handleSaveDeadline = async () => {
    try {
      const deadline = new Date(`${deadlineDate}T${deadlineTime}`)
      console.log(`Nueva fecha límite guardada: ${deadline.toISOString()}`)
      alert(`Fecha límite actualizada a ${deadlineDate} a las ${deadlineTime}`)
      setIsDateModalOpen(false)
      setIsSettingsOpen(false)
    } catch (error) {
      console.error('Error al guardar fecha límite:', error)
      alert('Error al guardar la fecha límite. Intenta de nuevo.')
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
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsDateModalOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-stone-200">
            <div className="p-6">
              <h3 className="font-display text-xl font-bold text-stone-900 text-center mb-1">Nueva Fecha Límite</h3>
              <p className="text-xs text-center text-stone-600 mb-6">Selecciona el límite para confirmar asistencia</p>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider ml-1">Fecha</label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-sans focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-500 tracking-wider ml-1">Hora</label>
                  <input
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-sans focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow text-stone-900"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col space-y-3">
                <button
                  onClick={handleSaveDeadline}
                  className="w-full bg-stone-700 hover:bg-stone-800 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-stone-700/20 transition-all active:scale-[0.98]"
                  type="button"
                >
                  Guardar Fecha
                </button>
                <button
                  onClick={() => setIsDateModalOpen(false)}
                  className="w-full text-stone-600 hover:text-stone-800 text-sm font-medium py-2 transition-colors"
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
