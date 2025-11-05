import React from 'react'
import { useAuth } from '../firebase/auth'
import { useRole } from '../hooks/useRole'
import LogIn from '../pages/LogIn'

type AdminRouteProps = { children: React.ReactNode }

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth()
  const { isAdmin, loading } = useRole()

  if (loading) return <div className="text-center mt-10">Chargement...</div>

  if (!user) return <LogIn />

  if (!isAdmin)
    return (
      <div className="text-center mt-10 text-red-600">
        Accès refusé. Réservé aux administrateurs.
      </div>
    )

  return <>{children}</>
}
