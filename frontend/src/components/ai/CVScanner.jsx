import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, AlertTriangle, CheckCircle, Zap, Target, Shield,
  RefreshCw, TrendingUp, BookOpen, Award, Phone, Star, ChevronRight
} from 'lucide-react'

// ─── CV text extraction ───────────────────────────────────────────────────────
async function extractText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const buf = new Uint8Array(e.target.result)
      let text = ''
      for (let i = 0; i < buf.length; i++) {
        const b = buf[i]
        if (b >= 32 && b <= 126) text += String.fromCharCode(b)
        else if (b === 10 || b === 13) text += ' '
      }
      // clean garbage from binary encoding
      text = text.replace(/[^\w\s@.,+\-/()%$#]/g, ' ').replace(/\s{2,}/g, ' ')
      resolve(text)
    }
    reader.readAsArrayBuffer(file)
  })
}

// ─── Analysis engine ──────────────────────────────────────────────────────────
const SECTIONS = [
  { key: 'contact',      label: 'Contact Info',    regex: /\b(email|phone|linkedin|github|address|website)\b|@\w+\.\w+/i },
  { key: 'summary',      label: 'Summary',         regex: /\b(summary|objective|profile|about me|overview)\b/i },
  { key: 'experience',   label: 'Experience',      regex: /\b(experience|employment|work history|career|position|job)\b/i },
  { key: 'education',    label: 'Education',       regex: /\b(education|degree|university|college|school|bachelor|master|phd|diploma)\b/i },
  { key: 'skills',       label: 'Skills',          regex: /\b(skills|technologies|tools|competencies|expertise|proficient|languages)\b/i },
  { key: 'achievements', label: 'Achievements',    regex: /\b(achievement|accomplishment|award|certification|honor|recognition)\b/i },
]

const TECH_KW = [
  'javascript','python','java','react','angular','vue','node','typescript','sql','mysql',
  'postgresql','mongodb','aws','azure','docker','kubernetes','git','html','css','django',
  'flask','spring','graphql','rest','api','machine learning','tensorflow','pytorch',
  'excel','powerpoint','word','figma','sketch','photoshop',
]

const ACTION_KW = [
  'developed','implemented','designed','built','created','managed','led','coordinated',
  'achieved','improved','increased','reduced','delivered','launched','optimized',
  'collaborated','analyzed','researched','presented','trained','mentored','resolved',
]

const SOFT_KW = [
  'leadership','communication','teamwork','problem-solving','analytical',
  'creative','detail-oriented','proactive','adaptable','organized',
]

function analyzeCV(rawText, jobTitle) {
  const t = rawText.toLowerCase()
  const foundSections = SECTIONS.map(s => ({ ...s, found: s.regex.test(rawText) }))
  const sectionRatio = foundSections.filter(s => s.found).length / SECTIONS.length

  const foundTech    = TECH_KW.filter(k => t.includes(k))
  const foundActions = ACTION_KW.filter(k => t.includes(k))
  const foundSoft    = SOFT_KW.filter(k => t.includes(k))
  const missingTech  = TECH_KW.filter(k => !t.includes(k)).slice(0, 8)

  const metricsMatches = rawText.match(/\d+\s*%|\$\s*\d+[km]?|\d+\+?\s*(year|month|people|team|employee|client|user|project)s?/gi) || []
  const wordCount = rawText.split(/\s+/).filter(w => w.length > 2).length
  const hasEmail  = /@[a-z]+\.[a-z]+/i.test(rawText)
  const hasPhone  = /(\+?\d[\d\s\-().]{7,}\d)/.test(rawText)

  // Scores (0–100)
  const atsScore = Math.min(97, Math.round(
    sectionRatio * 35 +
    (Math.min(foundTech.length, 8) / 8) * 25 +
    (Math.min(foundActions.length, 10) / 10) * 20 +
    (hasEmail ? 10 : 0) + (hasPhone ? 5 : 0) +
    (wordCount > 150 ? 5 : 0)
  ))

  const impactScore = Math.min(97, Math.round(
    (Math.min(metricsMatches.length, 5) / 5) * 40 +
    (Math.min(foundActions.length, 10) / 10) * 35 +
    (foundSections.find(s => s.key === 'achievements')?.found ? 25 : 0)
  ))

  const readabilityScore = Math.min(97, Math.round(
    sectionRatio * 40 +
    (wordCount >= 200 && wordCount <= 800 ? 30 : Math.max(0, 30 - Math.abs(wordCount - 450) / 40)) +
    (Math.min(foundActions.length, 5) / 5) * 30
  ))

  const overallScore = Math.round((atsScore + impactScore + readabilityScore) / 3)

  // Strengths
  const strengths = []
  if (foundSections.filter(s => s.found).length >= 4) strengths.push('Good section coverage — clear and organised structure')
  if (foundTech.length >= 5) strengths.push(`Strong technical profile — ${foundTech.length} technology keywords detected`)
  if (metricsMatches.length >= 2) strengths.push(`Quantified achievements detected (${metricsMatches.length} metrics)`)
  if (foundActions.length >= 6) strengths.push('Excellent use of action verbs throughout the CV')
  if (hasEmail && hasPhone) strengths.push('Complete contact information present')
  if (wordCount >= 250 && wordCount <= 700) strengths.push('Optimal CV length — ideal for both ATS and recruiters')
  if (strengths.length === 0) strengths.push('CV uploaded — add more content for a stronger analysis result')

  // Weaknesses
  const weaknesses = []
  if (!foundSections.find(s => s.key === 'summary')?.found)    weaknesses.push('No professional summary — add a 2-3 sentence intro at the top')
  if (!foundSections.find(s => s.key === 'achievements')?.found) weaknesses.push('Missing achievements/certifications section')
  if (metricsMatches.length < 2) weaknesses.push('Few quantified results — add numbers, percentages, and dollar amounts')
  if (foundTech.length < 3)      weaknesses.push('Limited technical keywords — may fail ATS keyword filters')
  if (wordCount < 150)           weaknesses.push('CV appears too short — aim for 300–700 words')
  if (!hasEmail)                 weaknesses.push('No email address detected — add contact details')
  if (weaknesses.length === 0)   weaknesses.push('Excellent coverage — focus on polishing formatting for print/PDF')

  // Recommendations
  const recommendations = [
    metricsMatches.length < 3 && { icon: TrendingUp,  text: 'Add quantifiable results: "Increased revenue by 40%" or "Led a team of 8"', priority: 'high' },
    !foundSections.find(s => s.key === 'summary')?.found && { icon: BookOpen, text: 'Write a 3-sentence professional summary at the top of your CV', priority: 'high' },
    foundTech.length < 5 && { icon: Zap, text: 'Add a dedicated Skills section listing relevant technologies and tools', priority: 'medium' },
    !foundSections.find(s => s.key === 'achievements')?.found && { icon: Award, text: 'Create a Certifications / Awards section to differentiate yourself', priority: 'medium' },
    !hasPhone && { icon: Phone, text: 'Include your phone number in the contact section', priority: 'medium' },
    jobTitle && { icon: Target, text: `Tailor keywords for "${jobTitle}" — match the job description language exactly`, priority: 'high' },
    { icon: FileText, text: 'Use standard fonts (Calibri, Arial, Georgia) for reliable ATS parsing', priority: 'low' },
    { icon: CheckCircle, text: 'Add your LinkedIn URL and GitHub profile to contact information', priority: 'low' },
  ].filter(Boolean).slice(0, 5)

  // Radar dimensions
  const radar = [
    { label: 'ATS',       value: atsScore },
    { label: 'Impact',    value: impactScore },
    { label: 'Keywords',  value: Math.min(97, Math.round((foundTech.length / 10) * 100)) },
    { label: 'Structure', value: Math.round(sectionRatio * 100) },
    { label: 'Clarity',   value: readabilityScore },
  ]

  return {
    overallScore, atsScore, impactScore, readabilityScore,
    sections: foundSections, foundTech, missingTech,
    metricsCount: metricsMatches.length,
    wordCount, strengths, weaknesses, recommendations, radar,
  }
}

// ─── Visual components ────────────────────────────────────────────────────────
function CircleScore({ score, label, color, size = 88 }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const colors = { green: '#22c55e', yellow: '#f59e0b', red: '#ef4444' }
  const strokeColor = score >= 75 ? colors.green : score >= 50 ? colors.yellow : colors.red

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} stroke="#f1f5f9" strokeWidth="7" fill="none" />
          <motion.circle
            cx={size/2} cy={size/2} r={r}
            stroke={strokeColor} strokeWidth="7" fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black" style={{ color: strokeColor }}>{score}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-gray-600">{label}</span>
    </div>
  )
}

function BarChart({ sections }) {
  return (
    <div className="space-y-2.5">
      {sections.map((s, i) => (
        <div key={s.key} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-28 flex-shrink-0">{s.label}</span>
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${s.found ? 'bg-green-500' : 'bg-gray-300'}`}
              initial={{ width: 0 }}
              animate={{ width: s.found ? '100%' : '8%' }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className={`text-xs font-semibold w-16 text-right ${s.found ? 'text-green-600' : 'text-gray-400'}`}>
            {s.found ? 'Found ✓' : 'Missing'}
          </span>
        </div>
      ))}
    </div>
  )
}

function RadarChart({ data }) {
  const cx = 110; const cy = 110; const r = 75; const n = data.length
  const angleFor = (i) => (i / n) * 2 * Math.PI - Math.PI / 2

  const toPoint = (i, scale) => ({
    x: cx + scale * r * Math.cos(angleFor(i)),
    y: cy + scale * r * Math.sin(angleFor(i)),
  })

  const gridPolygon = (scale) =>
    Array.from({ length: n }, (_, i) => toPoint(i, scale))
      .map(p => `${p.x},${p.y}`)
      .join(' ')

  const dataPoints = data
    .map((d, i) => toPoint(i, d.value / 100))
    .map(p => `${p.x},${p.y}`)
    .join(' ')

  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[220px] mx-auto">
      {/* Grid */}
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon key={s} points={gridPolygon(s)} fill="none" stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {/* Axes */}
      {Array.from({ length: n }, (_, i) => {
        const p = toPoint(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />
      })}
      {/* Data polygon */}
      <motion.polygon
        points={dataPoints}
        fill="rgba(59,130,246,0.15)"
        stroke="#3b82f6"
        strokeWidth="2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      {/* Dots */}
      {data.map((d, i) => {
        const p = toPoint(i, d.value / 100)
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
      })}
      {/* Labels */}
      {data.map((d, i) => {
        const lp = toPoint(i, 1.28)
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="#6b7280" fontFamily="system-ui, sans-serif" fontWeight="600">
            {d.label}
          </text>
        )
      })}
      {/* Score labels on dots */}
      {data.map((d, i) => {
        const p = toPoint(i, d.value / 100)
        return (
          <text key={`v${i}`} x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="700" fontFamily="system-ui, sans-serif">
            {d.value}
          </text>
        )
      })}
    </svg>
  )
}

const PRIORITY_STYLES = {
  high:   'bg-red-50 border-red-200 text-red-800',
  medium: 'bg-amber-50 border-amber-200 text-amber-800',
  low:    'bg-blue-50 border-blue-200 text-blue-800',
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CVScanner() {
  const [file, setFile] = useState(null)
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const dropRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    const ok = f.type === 'application/pdf' || f.type.includes('word') || f.name.endsWith('.docx')
    if (!ok) { setError('Please upload a PDF or DOCX file.'); return }
    if (f.size > 6 * 1024 * 1024) { setError('File must be under 6 MB.'); return }
    setFile(f)
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const handleScan = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const text = await extractText(file)
      // Simulate processing time for UX
      await new Promise(r => setTimeout(r, 1200))
      const analysis = analyzeCV(text, jobTitle)
      setResult(analysis)
    } catch {
      setError('Could not read the file. Try a different PDF or DOCX.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setFile(null); setResult(null); setError(''); setJobTitle('') }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header + overall */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <CircleScore score={result.overallScore} label="Overall" size={110} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-black mb-1">CV Analysis Complete</h1>
              <p className="text-blue-300 text-sm mb-3">
                {result.file || file.name} · {result.wordCount} words detected
              </p>
              <div className="flex gap-3 flex-wrap justify-center sm:justify-start">
                {[
                  { label: 'ATS Score', value: result.atsScore },
                  { label: 'Impact', value: result.impactScore },
                  { label: 'Readability', value: result.readabilityScore },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 rounded-xl px-4 py-2 text-center">
                    <div className="text-xl font-black">{value}</div>
                    <div className="text-xs text-blue-300">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={reset}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              <RefreshCw size={15} /> Scan Another
            </button>
          </div>
        </motion.div>

        {/* Scores row + Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Radar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star size={16} className="text-blue-500" /> CV Dimension Radar
            </h2>
            <RadarChart data={result.radar} />
          </motion.div>

          {/* Section completeness */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Section Completeness
            </h2>
            <BarChart sections={result.sections} />
            <p className="text-xs text-gray-400 mt-4">
              {result.sections.filter(s => s.found).length} of {result.sections.length} sections detected
            </p>
          </motion.div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-green-50 rounded-2xl border border-green-200 p-6">
            <h3 className="font-bold text-green-800 flex items-center gap-2 mb-4">
              <CheckCircle size={18} /> Strengths
            </h3>
            <ul className="space-y-2.5">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-green-800">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-red-50 rounded-2xl border border-red-200 p-6">
            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-4">
              <AlertTriangle size={18} /> Weaknesses
            </h3>
            <ul className="space-y-2.5">
              {result.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-red-700">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* AI Recommendations */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap size={16} className="text-blue-500" /> AI Recommendations
          </h2>
          <div className="space-y-3">
            {result.recommendations.map((rec, i) => {
              const Icon = rec.icon
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.07 }}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${PRIORITY_STYLES[rec.priority]}`}
                >
                  <Icon size={16} className="mt-0.5 flex-shrink-0" />
                  <p className="text-sm flex-1">{rec.text}</p>
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full opacity-70 ${
                    rec.priority === 'high' ? 'bg-red-200' : rec.priority === 'medium' ? 'bg-amber-200' : 'bg-blue-200'
                  }`}>{rec.priority}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Keywords */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={16} className="text-purple-500" /> Keyword Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Found ({result.foundTech.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {result.foundTech.map((k) => (
                  <span key={k} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {k}
                  </span>
                ))}
                {result.foundTech.length === 0 && (
                  <span className="text-sm text-gray-400">No technical keywords found</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Consider Adding
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missingTech.map((k) => (
                  <span key={k} className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium border border-dashed border-gray-300">
                    + {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <button onClick={reset}
          className="w-full py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
          <RefreshCw size={16} /> Scan Another CV
        </button>
      </div>
    )
  }

  // ─── Upload screen ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
          <ScanLine size={26} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">AI CV Scanner</h1>
        <p className="text-gray-500 text-sm">
          Upload your CV and get an instant ATS score, visual analysis,<br />and personalised recommendations
        </p>
      </div>

      {/* Drop zone */}
      <div
        ref={dropRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all mb-5 ${
          file
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer'
        }`}
      >
        <input type="file" accept=".pdf,.docx" onChange={(e) => handleFile(e.target.files[0])}
          className="hidden" id="cv-upload" />
        <label htmlFor="cv-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            <div className={`p-4 rounded-2xl transition-colors ${file ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {file ? <FileText size={32} className="text-blue-600" /> : <Upload size={32} className="text-gray-400" />}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {file ? file.name : 'Drop your CV here or click to browse'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {file
                  ? `${(file.size / 1024).toFixed(0)} KB — ready to scan`
                  : 'Supports PDF and DOCX · Max 6 MB'}
              </p>
            </div>
            {file && (
              <button type="button" onClick={(e) => { e.preventDefault(); setFile(null) }}
                className="text-xs text-red-500 hover:text-red-600 font-medium">
                Remove file ×
              </button>
            )}
          </div>
        </label>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Target job title (e.g. Senior Software Engineer)"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        onClick={handleScan}
        disabled={!file || loading}
        className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Analysing your CV...
          </span>
        ) : (
          <><Zap size={18} /> Analyse CV Now</>
        )}
      </button>

      {/* What we check */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Target, label: 'ATS Score' },
          { icon: TrendingUp, label: 'Impact Score' },
          { icon: Shield, label: 'Readability' },
          { icon: Star, label: 'Radar Chart' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl text-center">
            <Icon size={20} className="text-blue-500" />
            <span className="text-xs font-semibold text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScanLine(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <line x1="7" x2="17" y1="12" y2="12"/>
    </svg>
  )
}
