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
        <svg style={{ width: 32, height: 32, animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />
  }
  
  return <>{children}</>
}

function AuthAwareLanding() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
        <svg style={{ width: 32, height: 32, animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to="/roadmap" replace />
  }
  
  return <Landing />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CasesProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Nav />
            <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}><svg style={{ width: 32, height: 32, animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg></div>}>
              <Routes>
                <Route path="/" element={<AuthAwareLanding />} />
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
