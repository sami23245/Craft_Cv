import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
  Download, Save, Eye, Plus, ChevronDown, Palette, Type,
  X, CheckCircle, Loader, Layout, LayoutTemplate
} from 'lucide-react'
import { useBuilderStore } from '../../store/builderStore'
import SortableSection from './SortableSection'
import ResumePreview from './ResumePreview'

const COLORS = [
  '#2563eb','#7c3aed','#059669','#dc2626',
  '#b45309','#0891b2','#db2777','#1f2937',
]

const FONTS = ['Inter', 'Georgia', 'Roboto', 'Courier New']

const ADD_TYPES = [
  { type: 'experience', label: 'Work Experience' },
  { type: 'education',  label: 'Education' },
  { type: 'skills',     label: 'Skills' },
  { type: 'custom',     label: 'Custom Section' },
]

export default function BuilderCanvas() {
  const {
    sections, reorderSections, title, setTitle,
    primaryColor, setColor, fontFamily, setFont, addSection,
  } = useBuilderStore()

  const [activeTab,      setActiveTab]      = useState('edit')
  const [showPreview,    setShowPreview]    = useState(false)
  const [showAddMenu,    setShowAddMenu]    = useState(false)
  const [saved,          setSaved]          = useState(false)
  const [downloading,    setDownloading]    = useState(false)
  const [showColorPick,  setShowColorPick]  = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      const oldIdx = sections.findIndex(s => s.id === active.id)
      const newIdx = sections.findIndex(s => s.id === over.id)
      reorderSections(arrayMove(sections, oldIdx, newIdx))
    }
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const el = document.getElementById('resume-pdf-target')
      if (!el) return
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgH  = (canvas.height * pageW) / canvas.width
      // Handle multi-page
      let y = 0
      while (y < imgH) {
        if (y > 0) pdf.addPage()
        pdf.addImage(
          canvas.toDataURL('image/png'), 'PNG',
          0, -(y), pageW, imgH
        )
        y += pageH
      }
      pdf.save(`${title || 'resume'}.pdf`)
    } catch (e) {
      console.error('PDF error:', e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* ─── Toolbar ─── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 flex-wrap shadow-sm">

        {/* Editable title */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="font-bold text-gray-900 text-sm bg-transparent border-none outline-none hover:bg-gray-100 focus:bg-gray-100 px-2 py-1 rounded-lg min-w-[100px] max-w-[200px] transition-colors"
        />

        <div className="w-px h-5 bg-gray-200" />

        {/* Color picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPick(p => !p)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-sm text-gray-600 transition-colors"
          >
            <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ background: primaryColor }} />
            <Palette size={14} />
          </button>
          <AnimatePresence>
            {showColorPick && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className="absolute top-full left-0 mt-2 p-2.5 bg-white border border-gray-200 rounded-xl shadow-xl z-30 grid grid-cols-4 gap-2"
              >
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setShowColorPick(false) }}
                    className={`w-7 h-7 rounded-full border-[2.5px] transition-transform hover:scale-110 ${primaryColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                    style={{ background: c }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Font */}
        <div className="flex items-center gap-1.5">
          <Type size={14} className="text-gray-400" />
          <select
            value={fontFamily}
            onChange={e => setFont(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
          >
            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* Mobile tab toggle */}
        <div className="lg:hidden flex bg-gray-100 rounded-lg p-0.5 ml-auto">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'edit' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
          >
            <Layout size={12} /> Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'preview' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
          >
            <LayoutTemplate size={12} /> Preview
          </button>
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <Eye size={15} /> Preview
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
              saved ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {saved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save</>}
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-60 shadow-sm shadow-blue-200"
          >
            {downloading
              ? <><Loader size={15} className="animate-spin" /> Generating...</>
              : <><Download size={15} /> Download PDF</>
            }
          </button>
        </div>

        {/* Mobile save + download */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`p-2 rounded-xl transition-all ${saved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
          >
            {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="p-2 rounded-xl bg-blue-600 text-white disabled:opacity-60"
          >
            {downloading ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
          </button>
        </div>
      </div>

      {/* ─── Body: two-panel layout ─── */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* Left: Editor */}
        <div className={`flex-1 overflow-y-auto p-4 lg:p-5 max-w-full lg:max-w-[540px] xl:max-w-[600px] ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3 pb-6">
                {sections.map(section => (
                  <SortableSection key={section.id} section={section} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add Section */}
          <div className="relative pb-10">
            <button
              onClick={() => setShowAddMenu(p => !p)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Add Section
              <ChevronDown size={14} className={`transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden"
                >
                  {ADD_TYPES.map(({ type, label }) => (
                    <button
                      key={type}
                      onClick={() => { addSection(type); setShowAddMenu(false) }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-0"
                    >
                      <Plus size={13} className="text-gray-400" /> {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className={`flex-1 bg-gray-100 overflow-y-auto border-l border-gray-200 ${activeTab === 'edit' ? 'hidden lg:block' : ''}`}>
          <div className="p-4 lg:p-6">
            <div className="text-center mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
                <Eye size={11} /> Live Preview
              </span>
            </div>
            <div className="max-w-[560px] mx-auto shadow-2xl rounded-sm overflow-hidden">
              <ResumePreview />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Off-screen PDF target (always in DOM, full A4 width) ─── */}
      <div
        style={{
          position: 'fixed', left: '-9999px', top: 0,
          width: '794px', background: 'white', zIndex: -1,
          pointerEvents: 'none',
        }}
        aria-hidden
      >
        <ResumePreview id="resume-pdf-target" />
      </div>

      {/* ─── Fullscreen Preview Modal ─── */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-6 overflow-y-auto"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-[680px] shadow-2xl rounded-2xl overflow-hidden my-4"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-gray-400" />
                  <span className="font-bold text-gray-900 text-sm">Resume Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {downloading
                      ? <><Loader size={13} className="animate-spin" /> Generating...</>
                      : <><Download size={13} /> Download PDF</>
                    }
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              {/* Preview content */}
              <ResumePreview />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
