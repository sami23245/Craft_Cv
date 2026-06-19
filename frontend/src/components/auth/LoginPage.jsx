import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  
  const login = useAuthStore((state) => state.login)

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login/', {
          email: formData.email,
          password: formData.password
        })
        login({ access: data.access, refresh: data.refresh }, data.user)
      } else {
        await api.post('/auth/register/', {
          email: formData.email,
          password: formData.password,
          name: formData.name
        })
        // Auto-login after register
        const { data } = await api.post('/auth/login/', {
          email: formData.email,
          password: formData.password
        })
        login({ access: data.access, refresh: data.refresh }, data.user)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed')
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await api.post('/auth/google/', {
        credential: credentialResponse.credential
      })
      login({ access: data.access, refresh: data.refresh }, data.user)
    } catch (err) {
      setError('Google login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CraftCV</h1>
          <p className="text-gray-500 mt-1">Build professional resumes that get you hired</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google Login */}
          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
              theme="filled_black"
              size="large"
              width="100%"
              text={isLogin ? 'signin_with' : 'signup_with'}
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="John Doe"
                    required
                  />
                  <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="you@example.com"
                  required
                />
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 flex items-center justify-center gap-2 group"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}