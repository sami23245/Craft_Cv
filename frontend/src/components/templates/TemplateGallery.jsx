import { motion } from 'framer-motion'
import { useBuilderStore } from '../../store/builderStore'
import { Check, Crown, Sparkles } from 'lucide-react'

const TEMPLATES = [
  {
    id: 'modern_pro',
    name: 'Modern Professional',
    description: 'Clean, corporate-friendly with subtle accents',
    color: '#2563eb',
    preview: '/templates/modern_pro.png',
    category: 'professional',
    isPremium: false,
    features: ['ATS-Optimized', 'Two-column layout', 'Skills bar']
  },
  {
    id: 'minimal_pure',
    name: 'Minimal Pure',
    description: 'Whitespace-focused, elegant simplicity',
    color: '#1f2937',
    preview: '/templates/minimal_pure.png',
    category: 'minimal',
    isPremium: false,
    features: ['Single column', 'Typography-driven', 'Print-perfect']
  },
  {
    id: 'gradient_flow',
    name: 'Gradient Flow',
    description: 'Bold gradients for creative industries',
    color: '#7c3aed',
    preview: '/templates/gradient_flow.png',
    category: 'creative',
    isPremium: true,
    features: ['Gradient headers', 'Icon integration', 'Portfolio section']
  },
  {
    id: 'tech_nexus',
    name: 'Tech Nexus',
    description: 'Dark mode inspired, developer-focused',
    color: '#059669',
    preview: '/templates/tech_nexus.png',
    category: 'technical',
    isPremium: true,
    features: ['Dark theme', 'Code snippet styling', 'GitHub integration']
  },
  {
    id: 'executive_elite',
    name: 'Executive Elite',
    description: 'Premium feel for C-suite positions',
    color: '#b45309',
    preview: '/templates/executive_elite.png',
    category: 'professional',
    isPremium: true,
    features: ['Gold accents', 'Board-ready', 'Achievement metrics']
  },
  {
    id: 'sidebar_pro',
    name: 'Sidebar Pro',
    description: 'Distinct sidebar with contact highlights',
    color: '#dc2626',
    preview: '/templates/sidebar_pro.png',
    category: 'modern',
    isPremium: false,
    features: ['Left sidebar', 'Contact cards', 'Social links']
  },
  {
    id: 'creative_burst',
    name: 'Creative Burst',
    description: 'For designers, artists, and creatives',
    color: '#db2777',
    preview: '/templates/creative_burst.png',
    category: 'creative',
    isPremium: true,
    features: ['Asymmetric layout', 'Color blocks', 'Project showcase']
  },
  {
    id: 'academic_scholar',
    name: 'Academic Scholar',
    description: 'Publications and research focused',
    color: '#4338ca',
    preview: '/templates/academic_scholar.png',
    category: 'academic',
    isPremium: false,
    features: ['Bibliography style', 'Research sections', 'Conference list']
  },
  {
    id: 'compact_card',
    name: 'Compact Card',
    description: 'Information-dense, single page',
    color: '#0891b2',
    preview: '/templates/compact_card.png',
    category: 'minimal',
    isPremium: false,
    features: ['Dense layout', 'Timeline view', 'Compact skills']
  },
  {
    id: 'bold_statement',
    name: 'Bold Statement',
    description: 'Large typography, impact-first',
    color: '#ea580c',
    preview: '/templates/bold_statement.png',
    category: 'creative',
    isPremium: true,
    features: ['Oversized headers', 'Impact metrics', 'Visual hierarchy']
  }
]

export default function TemplateGallery({ onSelect, selectedId }) {
  const [filter, setFilter] = useState('all')
  
  const filtered = filter === 'all' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === filter || (filter === 'premium' && t.isPremium))

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'professional', 'creative', 'minimal', 'technical', 'premium'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((template, idx) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => !template.isPremium && onSelect(template.id)}
            className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
              selectedId === template.id 
                ? 'border-blue-500 ring-4 ring-blue-100' 
                : 'border-gray-200 hover:border-gray-300'
            } ${template.isPremium ? 'opacity-75' : ''}`}
          >
            {/* Preview Image */}
            <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-10"
                style={{ backgroundColor: template.color }}
              />
              {/* Mock preview content */}
              <div className="p-6 space-y-3">
                <div className="h-4 w-1/2 rounded" style={{ backgroundColor: template.color }} />
                <div className="h-3 w-3/4 rounded bg-gray-300" />
                <div className="h-3 w-2/3 rounded bg-gray-300" />
                <div className="mt-4 space-y-2">
                  <div className="h-2 w-full rounded bg-gray-200" />
                  <div className="h-2 w-5/6 rounded bg-gray-200" />
                  <div className="h-2 w-4/5 rounded bg-gray-200" />
                </div>
              </div>
              
              {/* Premium badge */}
              {template.isPremium && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Crown size={12} /> Premium
                </div>
              )}
              
              {/* Selected check */}
              {selectedId === template.id && (
                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                  <div className="bg-blue-500 text-white p-3 rounded-full">
                    <Check size={24} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900">{template.name}</h3>
                {template.isPremium && <Sparkles size={16} className="text-amber-500" />}
              </div>
              <p className="text-sm text-gray-500 mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-1">
                {template.features.map(f => (
                  <span key={f} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}