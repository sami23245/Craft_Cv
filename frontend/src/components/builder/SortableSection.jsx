import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useBuilderStore } from '../../store/builderStore'

export default function SortableSection({ section }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { toggleSection, removeSection, updateSectionData } = useBuilderStore()
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const renderSectionContent = () => {
    switch (section.type) {
      case 'header':
        return <HeaderEditor data={section.data} onChange={(d) => updateSectionData(section.id, d)} />
      case 'summary':
        return <SummaryEditor data={section.data} onChange={(d) => updateSectionData(section.id, d)} />
      case 'experience':
        return <ExperienceEditor data={section.data} onChange={(d) => updateSectionData(section.id, d)} />
      case 'education':
        return <EducationEditor data={section.data} onChange={(d) => updateSectionData(section.id, d)} />
      case 'skills':
        return <SkillsEditor data={section.data} onChange={(d) => updateSectionData(section.id, d)} />
      default:
        return <div className="text-gray-500">Custom section editor</div>
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border-2 transition-all ${
        isDragging ? 'border-blue-400 shadow-xl' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical size={20} />
          </button>
          <span className="font-semibold text-gray-800">{section.title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSection(section.id)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"
            title={section.visible ? 'Hide' : 'Show'}
          >
            {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={() => removeSection(section.id)}
            className="p-1.5 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Section Content */}
      {isExpanded && section.visible && (
        <div className="p-4 border-t border-gray-100">
          {renderSectionContent()}
        </div>
      )}
    </div>
  )
}

// Sub-components for each section type
function HeaderEditor({ data, onChange }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="First Name"
          value={data.firstName || ''}
          onChange={(e) => onChange({ firstName: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={data.lastName || ''}
          onChange={(e) => onChange({ lastName: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <input
        type="text"
        placeholder="Professional Title"
        value={data.title || ''}
        onChange={(e) => onChange({ title: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="email"
          placeholder="Email"
          value={data.email || ''}
          onChange={(e) => onChange({ email: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={data.phone || ''}
          onChange={(e) => onChange({ phone: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
    </div>
  )
}

function SummaryEditor({ data, onChange }) {
  return (
    <textarea
      placeholder="Write a compelling professional summary..."
      value={data.content || ''}
      onChange={(e) => onChange({ content: e.target.value })}
      rows={4}
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
    />
  )
}

function ExperienceEditor({ data, onChange }) {
  const addItem = () => {
    const items = [...(data.items || []), {
      id: Date.now(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }]
    onChange({ items })
  }

  return (
    <div className="space-y-4">
      {(data.items || []).map((item, idx) => (
        <div key={item.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
          <input
            placeholder="Company"
            value={item.company}
            onChange={(e) => {
              const items = [...data.items]
              items[idx].company = e.target.value
              onChange({ items })
            }}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            placeholder="Role / Position"
            value={item.role}
            onChange={(e) => {
              const items = [...data.items]
              items[idx].role = e.target.value
              onChange({ items })
            }}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="flex gap-2">
            <input
              type="month"
              value={item.startDate}
              onChange={(e) => {
                const items = [...data.items]
                items[idx].startDate = e.target.value
                onChange({ items })
              }}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="month"
              value={item.endDate}
              disabled={item.current}
              onChange={(e) => {
                const items = [...data.items]
                items[idx].endDate = e.target.value
                onChange({ items })
              }}
              className="px-3 py-2 border rounded-lg"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.current}
                onChange={(e) => {
                  const items = [...data.items]
                  items[idx].current = e.target.checked
                  if (e.target.checked) items[idx].endDate = ''
                  onChange({ items })
                }}
              />
              Current
            </label>
          </div>
          <textarea
            placeholder="Describe your achievements (use metrics!)"
            value={item.description}
            onChange={(e) => {
              const items = [...data.items]
              items[idx].description = e.target.value
              onChange({ items })
            }}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg resize-none"
          />
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        + Add Experience
      </button>
    </div>
  )
}

function EducationEditor({ data, onChange }) {
  // Similar structure to ExperienceEditor
  return <div className="text-gray-500">Education editor (similar to experience)</div>
}

function SkillsEditor({ data, onChange }) {
  const [newSkill, setNewSkill] = useState('')
  
  const addSkill = () => {
    if (!newSkill.trim()) return
    const items = [...(data.items || []), { name: newSkill, level: 'intermediate' }]
    onChange({ items })
    setNewSkill('')
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
          placeholder="Add a skill..."
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={addSkill}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(data.items || []).map((skill, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
          >
            {skill.name}
            <select
              value={skill.level}
              onChange={(e) => {
                const items = [...data.items]
                items[idx].level = e.target.value
                onChange({ items })
              }}
              className="bg-transparent text-xs border-none outline-none cursor-pointer"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <button
              onClick={() => {
                const items = data.items.filter((_, i) => i !== idx)
                onChange({ items })
              }}
              className="hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}