import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, AlertTriangle, CheckCircle, Zap, Target, Shield } from 'lucide-react'
import api from '../../lib/api'

export default function CVScanner() {
  const [file, setFile] = useState(null)
  const [jobTitle, setJobTitle] = useState('')

  const scanMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/resumes/scan/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data
    }
  })

  const handleUpload = (e) => {
    const selected = e.target.files[0]
    if (selected && (selected.type === 'application/pdf' || selected.type.includes('word'))) {
      setFile(selected)
    }
  }

  const handleScan = () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    if (jobTitle) formData.append('job_title', jobTitle)
    scanMutation.mutate(formData)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI CV Vulnerability Scanner</h1>
        <p className="text-gray-500">Upload your CV and our AI will analyze its strengths, weaknesses, and ATS compatibility</p>
      </div>

      {/* Upload Area */}
      {!scanMutation.data && (
        <div className="space-y-6">
          <div 
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              file ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleUpload}
              className="hidden"
              id="cv-upload"
            />
            <label htmlFor="cv-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Upload size={32} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {file ? file.name : 'Drop your CV here or click to browse'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Supports PDF and DOCX (max 5MB)</p>
                </div>
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Target job title (optional, for better analysis)"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleScan}
              disabled={!file || scanMutation.isPending}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {scanMutation.isPending ? (
                <>Analyzing<span className="animate-pulse">...</span></>
              ) : (
                <><Zap size={18} /> Scan Now</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {scanMutation.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ScoreCard
                icon={<Target size={24} />}
                label="ATS Score"
                score={scanMutation.data.ats_score}
                description="How well your CV passes automated screening"
              />
              <ScoreCard
                icon={<Zap size={24} />}
                label="Impact Score"
                score={scanMutation.data.impact_score}
                description="Strength of your achievements and metrics"
              />
              <ScoreCard
                icon={<Shield size={24} />}
                label="Readability"
                score={scanMutation.data.readability_score}
                description="Clarity and structure for recruiters"
              />
            </div>

            {/* Overall Assessment */}
            <div className="bg-white rounded-2xl border p-6">
              <h3 className="font-bold text-lg mb-2">Overall Assessment</h3>
              <p className="text-gray-600">{scanMutation.data.overall_assessment}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h3 className="font-bold text-green-800 flex items-center gap-2 mb-4">
                  <CheckCircle size={20} /> Strengths
                </h3>
                <ul className="space-y-2">
                  {scanMutation.data.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-green-700">
                      <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                <h3 className="font-bold text-red-800 flex items-center gap-2 mb-4">
                  <AlertTriangle size={20} /> Weaknesses
                </h3>
                <ul className="space-y-2">
                  {scanMutation.data.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-red-700">
                      <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Critical Issues */}
            {scanMutation.data.critical_issues?.length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-4">
                  <AlertTriangle size={20} /> Critical Issues (Fix Immediately)
                </h3>
                <ul className="space-y-2">
                  {scanMutation.data.critical_issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-amber-800 font-medium">
                      <span className="mt-1">⚠️</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-4">
                <Zap size={20} /> AI Suggestions
              </h3>
              <div className="space-y-3">
                {scanMutation.data.suggestions.map((s, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-blue-100">
                    <p className="text-gray-700">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword Optimization */}
            <div className="bg-white rounded-2xl border p-6">
              <h3 className="font-bold text-lg mb-4">Keyword Optimization</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Missing Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {scanMutation.data.keyword_optimization?.missing_keywords?.map((k, i) => (
                      <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Recommended Additions</p>
                  <div className="flex flex-wrap gap-2">
                    {scanMutation.data.keyword_optimization?.recommended_additions?.map((k, i) => (
                      <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                scanMutation.reset()
                setFile(null)
              }}
              className="w-full py-3 border-2 border-gray-200 rounded-xl font-semibold hover:border-gray-300 transition-colors"
            >
              Scan Another CV
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ScoreCard({ icon, label, score, description }) {
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  const getColor = () => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#eab308'
    return '#ef4444'
  }

  return (
    <div className="bg-white rounded-2xl border p-6 text-center">
      <div className="relative w-24 h-24 mx-auto mb-4">
        <svg className="transform -rotate-90 w-24 h-24">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-100"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke={getColor()}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: getColor() }}>
            {score}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mb-1 text-gray-700">
        {icon}
        <span className="font-semibold">{label}</span>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}