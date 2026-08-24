import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { ThemeProvider } from './context/ThemeContext'
import { CasesProvider } from './context/CasesContext'
import Nav from './components/Nav'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import AuthConfirm from './pages/AuthConfirm'
import OnboardingRole from './pages/OnboardingRole'
import OnboardingTimeline from './pages/OnboardingTimeline'
import Hub from './pages/Hub'
import CaseSolution from './pages/CaseSolution'
import CaseInterview from './pages/CaseInterview'
import Feedback from './pages/Feedback'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import History from './pages/History'
import Roadmap from './pages/Roadmap'
import { useLocation, Navigate } from 'react-router-dom'
import { useEffect, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'

function ScrollToTop() {
  const { pathname } = useLocation()
  
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto'
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    document.documentElement.style.scrollBehavior = ''
  }, [pathname])
  
  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
        Loading...
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />
  }
  
  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CasesProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Nav />
            <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/confirm" element={<AuthConfirm />} />
                <Route path="/onboarding/role" element={<ProtectedRoute><OnboardingRole /></ProtectedRoute>} />
                <Route path="/onboarding/weeks" element={<ProtectedRoute><OnboardingTimeline /></ProtectedRoute>} />
                <Route path="/hub" element={<ProtectedRoute><Hub /></ProtectedRoute>} />
                <Route path="/case/:id" element={<ProtectedRoute><CaseSolution /></ProtectedRoute>} />
                <Route path="/case/:id/practice" element={<ProtectedRoute><CaseInterview /></ProtectedRoute>} />
                <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CasesProvider>
      </AuthProvider>
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  )
}
