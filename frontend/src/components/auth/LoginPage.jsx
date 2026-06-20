import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle, Info } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [errorDetail, setErrorDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setError('')
    setErrorDetail(null)
    setSuccessMsg('')
    setLoading(true)

    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login/', {
          email: formData.email,
          password: formData.password,
        })
        login({ access: data.access, refresh: data.refresh }, data.user)
        navigate('/templates', { replace: true })
      } else {
        const { data } = await api.post('/auth/register/', {
          email: formData.email,
          password: formData.password,
          name: formData.name,
        })
        login({ access: data.access, refresh: data.refresh }, data.user)
        setSuccessMsg('Account created! Redirecting...')
        setTimeout(() => navigate('/templates', { replace: true }), 800)
      }
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail

      if (!err.response) {
        setError('Cannot reach server')
        setErrorDetail('Make sure the backend is running: .\\venv\\Scripts\\python.exe manage.py runserver')
      } else if (status === 404) {
        setError('API endpoint not found (404)')
        setErrorDetail(`URL not registered: ${err.config?.url}`)
      } else if (status === 401) {
        setError(detail || 'Invalid email or password')
      } else if (status === 400) {
        const data = err.response?.data
        const msg = detail || (typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Please check your input')
        setError(msg)
      } else {
        setError(detail || `Server error (${status})`)
        setErrorDetail(JSON.stringify(err.response?.data, null, 2))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setErrorDetail(null)
    setLoading(true)
    try {
      const { data } = await api.post('/auth/google/', {
        credential: credentialResponse.credential,
      })
      login({ access: data.access, refresh: data.refresh }, data.user)
      navigate('/templates', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Google login failed')
      setErrorDetail(`Status: ${err.response?.status}`)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setErrorDetail('')
    setSuccessMsg('')
    setFormData({ email: '', password: '', name: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-2xl font-black text-white">C</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">CraftCV</h1>
          <p className="text-blue-300 mt-1 text-sm">Build resumes that get you hired</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Success message */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm font-medium"
              >
                <CheckCircle size={16} /> {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm"
              >
                <p className="text-red-700 font-semibold">{error}</p>
                {errorDetail && <p className="text-red-400 mt-1 text-xs font-mono whitespace-pre-wrap">{errorDetail}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Login */}
          <div className="mb-5">
            {GOOGLE_CLIENT_ID ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed')}
                theme="filled_black"
                size="large"
                width="100%"
                text={isLogin ? 'signin_with' : 'signup_with'}
              />
            ) : (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <span>
                  Google Sign-In requires a{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code>{' '}
                  in <code className="font-mono bg-amber-100 px-1 rounded">frontend/.env</code>.
                  Use email/password below to sign in.
                </span>
              </div>
            )}
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400 uppercase tracking-wider">or with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                    <User className="absolute left-3 top-3.5 text-gray-400" size={17} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                  required
                />
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={17} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                />
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={17} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2 group transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Please wait...
                </span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={switchMode} className="font-semibold text-blue-600 hover:text-blue-700">
              {isLogin ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
