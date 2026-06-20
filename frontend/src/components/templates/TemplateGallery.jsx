import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Crown, Sparkles, Star, Heart, ArrowRight } from 'lucide-react'

const TEMPLATES = [
  {
    id: 'modern_pro',
    name: 'Modern Professional',
    description: 'Clean, corporate-friendly with subtle accents',
    color: '#2563eb',
    category: 'professional',
    isPremium: false,
    rating: 4.8,
    reviews: 2341,
    features: ['ATS-Optimized', 'Two-column layout', 'Skills bar'],
  },
  {
    id: 'minimal_pure',
    name: 'Minimal Pure',
    description: 'Whitespace-focused, elegant simplicity',
    color: '#1f2937',
    category: 'minimal',
    isPremium: false,
    rating: 4.6,
    reviews: 1892,
    features: ['Single column', 'Typography-driven', 'Print-perfect'],
  },
  {
    id: 'gradient_flow',
    name: 'Gradient Flow',
    description: 'Bold gradients for creative industries',
    color: '#7c3aed',
    category: 'creative',
    isPremium: true,
    rating: 4.9,
    reviews: 3102,
    features: ['Gradient headers', 'Icon integration', 'Portfolio section'],
  },
  {
    id: 'tech_nexus',
    name: 'Tech Nexus',
    description: 'Dark mode inspired, developer-focused',
    color: '#059669',
    category: 'technical',
    isPremium: true,
    rating: 4.7,
    reviews: 987,
    features: ['Dark theme', 'Code snippet styling', 'GitHub integration'],
  },
  {
    id: 'executive_elite',
    name: 'Executive Elite',
    description: 'Premium feel for C-suite positions',
    color: '#b45309',
    category: 'professional',
    isPremium: true,
    rating: 4.5,
    reviews: 654,
    features: ['Gold accents', 'Board-ready', 'Achievement metrics'],
  },
  {
    id: 'sidebar_pro',
    name: 'Sidebar Pro',
    description: 'Distinct sidebar with contact highlights',
    color: '#dc2626',
    category: 'modern',
    isPremium: false,
    rating: 4.4,
    reviews: 1243,
    features: ['Left sidebar', 'Contact cards', 'Social links'],
  },
  {
    id: 'creative_burst',
    name: 'Creative Burst',
    description: 'For designers, artists, and creatives',
    color: '#db2777',
    category: 'creative',
    isPremium: true,
    rating: 4.8,
    reviews: 2089,
    features: ['Asymmetric layout', 'Color blocks', 'Project showcase'],
  },
  {
    id: 'academic_scholar',
    name: 'Academic Scholar',
    description: 'Publications and research focused',
    color: '#4338ca',
    category: 'academic',
    isPremium: false,
    rating: 4.3,
    reviews: 532,
    features: ['Bibliography style', 'Research sections', 'Conference list'],
  },
  {
    id: 'compact_card',
    name: 'Compact Card',
    description: 'Information-dense, single page',
    color: '#0891b2',
    category: 'minimal',
    isPremium: false,
    rating: 4.5,
    reviews: 1671,
    features: ['Dense layout', 'Timeline view', 'Compact skills'],
  },
  {
    id: 'bold_statement',
    name: 'Bold Statement',
    description: 'Large typography, impact-first',
    color: '#ea580c',
    category: 'creative',
    isPremium: true,
    rating: 4.7,
    reviews: 1105,
    features: ['Oversized headers', 'Impact metrics', 'Visual hierarchy'],
  },
]

function StarRating({ rating, reviews, size = 12 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300 fill-gray-200'
          }
        />
      ))}
      <span className="text-xs text-gray-500 ml-0.5">
        {rating} ({reviews.toLocaleString()})
      </span>
    </div>
  )
}

export default function TemplateGallery() {
  const [filter, setFilter] = useState('all')
  const [favorites, setFavorites] = useState(
    () => JSON.parse(localStorage.getItem('cv_favorites') || '[]')
  )
  const navigate = useNavigate()

  const toggleFavorite = useCallback((e, id) => {
    e.stopPropagation()
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      localStorage.setItem('cv_favorites', JSON.stringify(next))
      return next
    })
  }, [])

  const handleStartBuilding = useCallback((e, id, isPremium) => {
    e.stopPropagation()
    if (isPremium) return
    navigate(`/builder/${id}`)
  }, [navigate])

  const filtered = filter === 'favorites'
    ? TEMPLATES.filter((t) => favorites.includes(t.id))
    : filter === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(
        (t) => t.category === filter || (filter === 'premium' && t.isPremium)
      )

  const FILTERS = ['all', 'professional', 'creative', 'minimal', 'technical', 'academic', 'premium', 'favorites']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 mb-1">Choose a Template</h1>
        <p className="text-gray-500 text-sm">
          Pick a design to start building your resume — free templates included
        </p>
      </div>

      {/* Favorites section */}
      {favorites.length > 0 && filter !== 'favorites' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-amber-800 flex items-center gap-2">
              <Heart size={16} className="fill-amber-500 text-amber-500" />
              Your Favourites ({favorites.length})
            </h2>
            <button
              onClick={() => setFilter('favorites')}
              className="text-xs text-amber-700 font-semibold hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {TEMPLATES.filter((t) => favorites.includes(t.id)).map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-200 rounded-full text-sm font-medium text-gray-800 cursor-pointer hover:border-amber-400 transition-colors"
                onClick={() => navigate(t.isPremium ? '/payments' : `/builder/${t.id}`)}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                {t.name}
                {t.isPremium && <Crown size={11} className="text-amber-500" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'favorites' && (
              <Heart
                size={12}
                className={filter === f ? 'fill-white text-white' : 'text-gray-500'}
              />
            )}
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'favorites' && favorites.length > 0 && (
              <span className={`text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center ${filter === f ? 'bg-white text-gray-900' : 'bg-gray-300 text-gray-700'}`}>
                {favorites.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty favorites */}
      {filter === 'favorites' && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Heart size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No favourites yet</p>
          <p className="text-sm mt-1">Click the heart on any template to save it here</p>
          <button onClick={() => setFilter('all')} className="mt-4 text-blue-600 text-sm font-semibold hover:underline">
            Browse all templates →
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((template, idx) => (
            <motion.div
              key={template.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
              className={`group relative rounded-2xl overflow-hidden border-2 transition-all bg-white hover:shadow-xl hover:-translate-y-0.5 ${
                template.isPremium ? 'border-gray-200 opacity-90' : 'border-gray-200 hover:border-blue-300 cursor-pointer'
              }`}
            >
              {/* Favorite button */}
              <button
                onClick={(e) => toggleFavorite(e, template.id)}
                className="absolute top-3 left-3 z-10 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
                title={favorites.includes(template.id) ? 'Remove from favourites' : 'Add to favourites'}
              >
                <Heart
                  size={14}
                  className={
                    favorites.includes(template.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-400'
                  }
                />
              </button>

              {/* Preview area */}
              <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: template.color }} />
                {/* Mock CV preview */}
                <div className="p-6 space-y-3 pt-8">
                  <div className="h-5 w-1/2 rounded-md" style={{ backgroundColor: template.color }} />
                  <div className="h-3 w-3/4 rounded bg-gray-300" />
                  <div className="h-3 w-2/3 rounded bg-gray-300" />
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                    <div className="h-2 w-1/3 rounded bg-gray-400 opacity-50" />
                    <div className="h-2 w-full rounded bg-gray-200" />
                    <div className="h-2 w-5/6 rounded bg-gray-200" />
                    <div className="h-2 w-4/5 rounded bg-gray-200" />
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200 space-y-1.5">
                    <div className="h-2 w-1/3 rounded bg-gray-400 opacity-50" />
                    <div className="h-2 w-full rounded bg-gray-200" />
                    <div className="h-2 w-3/4 rounded bg-gray-200" />
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="h-2 w-1/3 rounded bg-gray-400 opacity-50 mb-1.5" />
                    <div className="flex gap-1 flex-wrap">
                      {[40, 55, 45, 60, 35].map((w, i) => (
                        <div key={i} className="h-4 rounded-full opacity-30" style={{ width: w, backgroundColor: template.color }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Premium badge */}
                {template.isPremium && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Crown size={11} /> Premium
                  </div>
                )}

                {/* Hover overlay with Start Building CTA */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <button
                    onClick={(e) => handleStartBuilding(e, template.id, template.isPremium)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      template.isPremium
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                        : 'bg-white text-gray-900 hover:bg-blue-50'
                    }`}
                  >
                    {template.isPremium ? (
                      <><Sparkles size={14} /> Upgrade to Use</>
                    ) : (
                      <>Start Building <ArrowRight size={14} /></>
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900 text-sm">{template.name}</h3>
                  {template.isPremium && <Sparkles size={14} className="text-amber-500" />}
                </div>
                <p className="text-xs text-gray-500 mb-2">{template.description}</p>

                {/* Star rating */}
                <StarRating rating={template.rating} reviews={template.reviews} />

                {/* Features */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {template.features.map((f) => (
                    <span key={f} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {f}
                    </span>
                  ))}
                </div>

                {/* CTA button (always visible on mobile) */}
                <button
                  onClick={(e) => handleStartBuilding(e, template.id, template.isPremium)}
                  className={`w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                    template.isPremium
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {template.isPremium ? (
                    <><Crown size={12} /> Upgrade to Use</>
                  ) : (
                    <>Start Building <ArrowRight size={12} /></>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
