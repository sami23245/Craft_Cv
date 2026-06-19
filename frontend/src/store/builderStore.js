import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_SECTIONS = [
  { id: 'header', type: 'header', title: 'Personal Info', visible: true, data: {} },
  { id: 'summary', type: 'summary', title: 'Summary', visible: true, data: {} },
  { id: 'experience', type: 'experience', title: 'Experience', visible: true, data: { items: [] } },
  { id: 'education', type: 'education', title: 'Education', visible: true, data: { items: [] } },
  { id: 'skills', type: 'skills', title: 'Skills', visible: true, data: { items: [] } },
]

export const useBuilderStore = create(
  persist(
    (set, get) => ({
      // Resume metadata
      resumeId: null,
      title: 'Untitled Resume',
      template: 'modern_pro',
      type: 'resume',
      
      // Design
      primaryColor: '#2563eb',
      fontFamily: 'Inter',
      spacing: 'normal', // compact, normal, spacious
      
      // Sections (drag-drop order)
      sections: DEFAULT_SECTIONS,
      
      // Actions
      setTitle: (title) => set({ title }),
      setTemplate: (template) => set({ template }),
      setType: (type) => set({ type }),
      setColor: (color) => set({ primaryColor: color }),
      setFont: (font) => set({ fontFamily: font }),
      
      // Section management
      reorderSections: (newOrder) => set({ sections: newOrder }),
      toggleSection: (id) => set((state) => ({
        sections: state.sections.map(s => 
          s.id === id ? { ...s, visible: !s.visible } : s
        )
      })),
      updateSectionData: (id, data) => set((state) => ({
        sections: state.sections.map(s => 
          s.id === id ? { ...s, data: { ...s.data, ...data } } : s
        )
      })),
      addSection: (type) => {
        const id = `${type}_${Date.now()}`
        const newSection = {
          id,
          type,
          title: type.charAt(0).toUpperCase() + type.slice(1),
          visible: true,
          data: type === 'custom' ? { content: '' } : { items: [] }
        }
        set((state) => ({ sections: [...state.sections, newSection] }))
      },
      removeSection: (id) => set((state) => ({
        sections: state.sections.filter(s => s.id !== id)
      })),
      
      // Reset
      reset: () => set({
        title: 'Untitled Resume',
        template: 'modern_pro',
        type: 'resume',
        primaryColor: '#2563eb',
        fontFamily: 'Inter',
        sections: DEFAULT_SECTIONS,
      }),
      
      // Load from API
      loadResume: (data) => set({
        resumeId: data.id,
        title: data.title,
        template: data.template,
        type: data.type,
        primaryColor: data.primary_color,
        fontFamily: data.font_family,
        sections: data.content.sections || DEFAULT_SECTIONS,
      }),
    }),
    { name: 'builder-storage' }
  )
)