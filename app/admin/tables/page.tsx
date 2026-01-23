'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import Link from 'next/link'
import NewTableModal from '@/components/admin/tables/NewTableModal'
import BottomNav from '@/components/admin/BottomNav'

interface Table {
  id: string
  name: string
  capacity: number
  occupancy: number
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [unassignedCount, setUnassignedCount] = useState(0)
  const [totalConfirmed, setTotalConfirmed] = useState(0)
  const [showNewModal, setShowNewModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      const supabase = createClient()

      // Get all tables with occupancy count
      const { data: tablesData, error: tablesError } = await (supabase
        .from('tables') as any)
        .select('*')
        .order('created_at', { ascending: true })

      if (tablesError) throw tablesError

      // Get occupancy for each table
      const tablesWithOccupancy = await Promise.all(
        (tablesData || []).map(async (table: any) => {
          const { count } = await supabase
            .from('guests')
            .select('*', { count: 'exact', head: true })
            .eq('table_id', table.id)

          return {
            ...table,
            occupancy: count || 0
          }
        })
      )

      setTables(tablesWithOccupancy)

      // Get unassigned confirmed guests count
      const { count: unassignedConfirmed } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true })
        .is('table_id', null)

      // Get total confirmed through passes
      const { data: confirmedPasses } = await supabase
        .from('passes')
        .select('guest_id')
        .eq('confirmation_status', 'confirmed')

      const uniqueConfirmedGuests = new Set((confirmedPasses as any)?.map((p: any) => p.guest_id) || [])
      
      setUnassignedCount(unassignedConfirmed || 0)
      setTotalConfirmed(uniqueConfirmedGuests.size)
    } catch (error) {
      console.error('Error loading tables:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalAssigned = tables.reduce((sum, table) => sum + table.occupancy, 0)
  const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0)

  return (
    <div className="min-h-screen bg-[#fbf8f0] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#fbf8f0]/95 backdrop-blur-sm px-5 pt-14 pb-4 border-b border-[#ece8de]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#131514]">Distribución de Mesas</h1>
          <p className="text-xs text-[#6b7566] font-medium mt-0.5">
            Recepción Boda • {totalConfirmed} Invitados
          </p>
        </div>
      </header>

      {/* Stats Card */}
      <div className="px-5 py-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#ece8de]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-[#6b7566] tracking-wider">Total Asignados</p>
              <p className="text-2xl font-bold text-[#495a51] mt-1">{totalAssigned}/{totalCapacity}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase font-bold text-[#6b7566] tracking-wider">Sin Asignar</p>
              <p className="text-2xl font-bold text-[#996678] mt-1">{unassignedCount}</p>
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#495a51] transition-all duration-500"
              style={{ width: `${totalCapacity > 0 ? (totalAssigned / totalCapacity) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <main className="px-5 pb-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border-2 border-gray-100 animate-pulse">
                <div className="h-16 w-16 rounded-full bg-gray-100 mx-auto mb-4" />
                <div className="h-4 bg-gray-100 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tables.map((table) => {
              const isFull = table.occupancy >= table.capacity
              const percentage = (table.occupancy / table.capacity) * 100
              
              return (
                <Link
                  key={table.id}
                  href={`/admin/tables/${table.id}`}
                  className={`group relative flex flex-col bg-white rounded-lg p-4 border-2 shadow-sm transition-all active:scale-[0.98] ${
                    isFull ? 'border-[#996678]' : 'border-[#d3c3db]'
                  }`}
                >
                  {isFull && (
                    <div className="absolute top-3 right-3">
                      <span className="flex h-2 w-2 rounded-full bg-[#996678]" />
                    </div>
                  )}
                  
                  <div className="mb-4 flex items-center justify-center">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                      isFull ? 'bg-[#996678]/10 text-[#996678]' : 
                      table.occupancy > 0 ? 'bg-[#d3c3db]/10 text-[#495a51]' : 
                      'bg-gray-50 text-gray-400'
                    }`}>
                      <span className="material-symbols-outlined !text-[32px]">
                        table_restaurant
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-base font-bold text-[#131514] leading-tight">
                      {table.name}
                    </h3>
                    <p className="text-xs text-[#6b7566] mb-3 font-medium">
                      {table.occupancy === 0 ? 'Disponible' : 
                       isFull ? '(Completa)' : '(En uso)'}
                    </p>
                    
                    <div className="flex items-center gap-2 w-full justify-center">
                      <div className="relative h-5 w-5">
                        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="5"
                          />
                          <path
                            className={isFull ? 'text-[#996678]' : 'text-[#495a51]'}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeDasharray={`${percentage}, 100`}
                            strokeLinecap="round"
                            strokeWidth="5"
                          />
                        </svg>
                      </div>
                      <span className={`text-sm font-bold ${
                        isFull ? 'text-[#996678]' : 
                        table.occupancy > 0 ? 'text-[#495a51]' : 
                        'text-[#6b7566]'
                      }`}>
                        {table.occupancy}/{table.capacity}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowNewModal(true)}
        className="fixed bottom-24 right-6 z-30 w-14 h-14 rounded-full bg-[#495a51] text-white shadow-lg hover:bg-[#3d4b43] active:scale-95 transition-all flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

      {/* New Table Modal */}
      <NewTableModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={loadTables}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
