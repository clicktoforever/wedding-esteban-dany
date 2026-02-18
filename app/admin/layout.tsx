import { ReactNode } from 'react'

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  // El layout solo envuelve, la protección está en cada página
  return <>{children}</>
}
