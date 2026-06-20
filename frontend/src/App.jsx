import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useAuthStore } from './store/authStore'
import LoginPage from './components/auth/LoginPage'
import AppLayout from './components/layout/AppLayout'
import BuilderCanvas from './components/builder/BuilderCanvas'
import TemplateGallery from './components/templates/TemplateGallery'
import CVScanner from './components/ai/CVScanner'
import AccountPage from './components/pages/AccountPage'
import PaymentsPage from './components/pages/PaymentsPage'

const queryClient = new QueryClient()
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder'

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/templates" element={<PrivateRoute><TemplateGallery /></PrivateRoute>} />
        <Route path="/builder/:id?" element={<PrivateRoute><BuilderCanvas /></PrivateRoute>} />
        <Route path="/scan" element={<PrivateRoute><CVScanner /></PrivateRoute>} />
        <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
        <Route path="/payments" element={<PrivateRoute><PaymentsPage /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/templates" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}
