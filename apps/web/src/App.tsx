import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "./components/layout/AppLayout"
import { useAuth } from "./hooks/useAuth"
import { type ReactNode, lazy, Suspense } from "react"


// Lazy Load Pages to split code chunks
const MaterialRequestsPage = lazy(() => import("./pages/MaterialRequestsPage"))
const DashboardPage = lazy(() => import("./pages/DashboardPage"))
const LoginPage = lazy(() => import("./pages/LoginPage"))
const SetupCompanyPage = lazy(() => import("./pages/SetupCompanyPage"))
const LandingPage = lazy(() => import("./pages/LandingPage"))
const SettingsPage = lazy(() => import("./pages/SettingsPage"))

import { Skeleton } from "@/components/ui/skeleton"

function LoadingScreen() {
  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Skeleton className="h-8 w-32 md:w-48" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid gap-6 md:grid-cols-12">
          <Skeleton className="h-[120px] md:col-span-12 lg:col-span-4" />
          <Skeleton className="h-[120px] md:col-span-12 lg:col-span-4" />
          <Skeleton className="h-[120px] md:col-span-12 lg:col-span-4" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null // AuthProvider handles its own skeleton, but safe to return null here
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function CompanyProtectedRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!profile?.company_id) return <Navigate to="/setup-company" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null

  if (user && profile?.company_id) return <Navigate to="/dashboard" replace />
  if (user && !profile?.company_id) return <Navigate to="/setup-company" replace />

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Full Screen Landing Page */}
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />

          {/* Main App Layout */}
          <Route element={<AppLayout />}>
            <Route path="/material-requests" element={
              <CompanyProtectedRoute>
                <MaterialRequestsPage />
              </CompanyProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <CompanyProtectedRoute>
                <DashboardPage />
              </CompanyProtectedRoute>
            } />
            <Route path="/settings" element={
              <CompanyProtectedRoute>
                <SettingsPage />
              </CompanyProtectedRoute>
            } />
            <Route path="/setup-company" element={
              <ProtectedRoute>
                <SetupCompanyPage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
