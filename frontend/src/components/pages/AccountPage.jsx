import { User, Mail, Shield, Camera } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function AccountPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Account Settings</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Avatar */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-black text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
              <Camera size={13} className="text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${user?.is_premium ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
              {user?.is_premium ? 'Premium' : 'Free Plan'}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <Mail size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Email</p>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <Shield size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Auth Provider</p>
              <p className="text-gray-900 font-medium capitalize">{user?.auth_provider || 'email'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <User size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Account Status</p>
              <p className="text-green-600 font-medium">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
