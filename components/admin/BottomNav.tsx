'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/admin',
      icon: 'home',
      label: 'Inicio',
      match: '/admin'
    },
    {
      href: '/admin/guests',
      icon: 'group',
      label: 'Invitados',
      match: '/admin/guests'
    },
    {
      href: '/admin/tables',
      icon: 'table_restaurant',
      label: 'Mesas',
      match: '/admin/tables'
    },
    {
      href: '/admin/gifts',
      icon: 'featured_seasonal_and_gifts',
      label: 'Regalos',
      match: '/admin/gifts'
    },
    {
      href: '/admin/transactions',
      icon: 'receipt_long',
      label: 'Transacciones',
      match: '/admin/transactions'
    }
  ]

  const isActive = (match: string) => {
    if (match === '/admin') {
      return pathname === '/admin'
    }
    return pathname?.startsWith(match)
  }

  return (
    <nav className="fixed bottom-0 w-full bg-[#F9F7F2] border-t border-stone-200 pb-safe pt-2 transition-colors duration-300 z-50">
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const active = isActive(item.match)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full ${
                active
                  ? 'text-primary'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-tight mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
