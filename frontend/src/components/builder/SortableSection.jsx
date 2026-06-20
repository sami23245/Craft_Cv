import { useState, useRef, useEffect, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Eye, EyeOff, Trash2, ChevronDown, ChevronUp,
  Bold, Italic, Underline, List, ListOrdered, Type, Plus, X, MapPin
} from 'lucide-react'
import { useBuilderStore } from '../../store/builderStore'

// ─── Rich text editor with formatting toolbar ─────────────────────────────────
function FormatBtn({ onMouseDown, title, children, active }) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      title={title}
      className={`p-1.5 rounded-md transition-colors text-gray-500 ${active ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200 hover:text-gray-800'}`}
    >
      {children}
    </button>
  )
}

function RichTextEditor({ value, onChange, placeholder, minRows = 3 }) {
  const divRef = useRef(null)
  const didInit = useRef(false)

  // Set HTML only on mount (avoids cursor jump on every keystroke)
  useEffect(() => {
    if (divRef.current && !didInit.current) {
      divRef.current.innerHTML = value || ''
      didInit.current = true
    }
  }, []) // eslint-disable-line

  const exec = useCallback((cmd, val = null) => {
    document.execCommand(cmd, false, val)
    divRef.current?.focus()
    if (divRef.current) onChange(divRef.current.innerHTML)
  }, [onChange])

  const handleInput = () => {
    if (divRef.current) onChange(divRef.current.innerHTML)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        <FormatBtn title="Bold (Ctrl+B)" onMouseDown={e => { e.preventDefault(); exec('bold') }}>
          <Bold size={13} />
        </FormatBtn>
        <FormatBtn title="Italic (Ctrl+I)" onMouseDown={e => { e.preventDefault(); exec('italic') }}>
          <Italic size={13} />
        </FormatBtn>
        <FormatBtn title="Underline (Ctrl+U)" onMouseDown={e => { e.preventDefault(); exec('underline') }}>
          <Underline size={13} />
        </FormatBtn>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <FormatBtn title="Bullet List" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList') }}>
          <List size={13} />
        </FormatBtn>
        <FormatBtn title="Numbered List" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList') }}>
          <ListOrdered size={13} />
        </FormatBtn>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <FormatBtn title="Clear Formatting" onMouseDown={e => { e.preventDefault(); exec('removeFormat') }}>
          <Type size={13} />
        </FormatBtn>
      </div>

      {/* Editable area */}
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className="px-3 py-2.5 outline-none text-sm text-gray-800 leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:my-1 [&_b]:font-bold [&_i]:italic [&_u]:underline empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
        style={{ minHeight: `${minRows * 26}px` }}
      />
    </div>
  )
}

// ─── Field helpers ────────────────────────────────────────────────────────────
function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      {label && <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>}
      {children}
    </div>
  )
}

const INPUT = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"

// ─── Section editors ──────────────────────────────────────────────────────────
function HeaderEditor({ data, onChange }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name">
          <input type="text" placeholder="John" value={data.firstName || ''}
            onChange={e => onChange({ firstName: e.target.value })} className={INPUT} />
        </Field>
        <Field label="Last Name">
          <input type="text" placeholder="Doe" value={data.lastName || ''}
            onChange={e => onChange({ lastName: e.target.value })} className={INPUT} />
        </Field>
      </div>
      <Field label="Professional Title">
        <input type="text" placeholder="Senior Software Engineer" value={data.jobTitle || ''}
          onChange={e => onChange({ jobTitle: e.target.value })} className={INPUT} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email">
          <input type="email" placeholder="john@email.com" value={data.email || ''}
            onChange={e => onChange({ email: e.target.value })} className={INPUT} />
        </Field>
        <Field label="Phone">
          <input type="tel" placeholder="+1 555 000 0000" value={data.phone || ''}
            onChange={e => onChange({ phone: e.target.value })} className={INPUT} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Location">
          <input type="text" placeholder="New York, NY" value={data.location || ''}
            onChange={e => onChange({ location: e.target.value })} className={INPUT} />
        </Field>
        <Field label="LinkedIn">
          <input type="text" placeholder="linkedin.com/in/johndoe" value={data.linkedin || ''}
            onChange={e => onChange({ linkedin: e.target.value })} className={INPUT} />
        </Field>
      </div>
      <Field label="Website / Portfolio (optional)">
        <input type="text" placeholder="johndoe.dev" value={data.website || ''}
          onChange={e => onChange({ website: e.target.value })} className={INPUT} />
      </Field>
    </div>
  )
}

function SummaryEditor({ data, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">Use <strong>bold</strong>, <em>italic</em>, or bullet lists to highlight key points.</p>
      <RichTextEditor
        value={data.content || ''}
        onChange={content => onChange({ content })}
        placeholder="Write a compelling professional summary — 2 to 4 sentences that showcase your top skills and career goals..."
        minRows={4}
      />
    </div>
  )
}

function ExperienceEditor({ data, onChange }) {
  const updateItem = (idx, field, val) => {
    const items = data.items.map((it, i) => i === idx ? { ...it, [field]: val } : it)
    onChange({ items })
  }
  const removeItem = (idx) => onChange({ items: data.items.filter((_, i) => i !== idx) })
  const addItem = () => onChange({
    items: [...(data.items || []), { id: Date.now(), company: '', role: '', startDate: '', endDate: '', current: false, location: '', description: '' }]
  })

  return (
    <div className="space-y-4">
      {(data.items || []).map((item, idx) => (
        <div key={item.id || idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {item.company || `Experience ${idx + 1}`}
            </span>
            <button onClick={() => removeItem(idx)}
              className="p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company">
              <input placeholder="Acme Corp" value={item.company}
                onChange={e => updateItem(idx, 'company', e.target.value)} className={INPUT} />
            </Field>
            <Field label="Role / Position">
              <input placeholder="Software Engineer" value={item.role}
                onChange={e => updateItem(idx, 'role', e.target.value)} className={INPUT} />
            </Field>
          </div>
          <Field label="Location (optional)">
            <input placeholder="San Francisco, CA" value={item.location || ''}
              onChange={e => updateItem(idx, 'location', e.target.value)} className={INPUT} />
          </Field>
          <div className="flex items-end gap-3 flex-wrap">
            <Field label="Start Date">
              <input type="month" value={item.startDate}
                onChange={e => updateItem(idx, 'startDate', e.target.value)} className={INPUT} />
            </Field>
            <Field label="End Date">
              <input type="month" value={item.endDate} disabled={item.current}
                onChange={e => updateItem(idx, 'endDate', e.target.value)}
                className={`${INPUT} disabled:opacity-40 disabled:cursor-not-allowed`} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-0.5 cursor-pointer">
              <input type="checkbox" checked={item.current}
                onChange={e => { updateItem(idx, 'current', e.target.checked); if (e.target.checked) updateItem(idx, 'endDate', '') }}
                className="w-4 h-4 rounded accent-blue-600" />
              Present
            </label>
          </div>
          <Field label="Description & Achievements">
            <RichTextEditor
              value={item.description}
              onChange={v => updateItem(idx, 'description', v)}
              placeholder="• Led a team of 5 engineers to deliver X, resulting in Y% improvement&#10;• Built and deployed... (use bullets for impact)"
              minRows={3}
            />
          </Field>
        </div>
      ))}
      <button onClick={addItem}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
        <Plus size={14} /> Add Experience
      </button>
    </div>
  )
}

function EducationEditor({ data, onChange }) {
  const updateItem = (idx, field, val) => {
    const items = data.items.map((it, i) => i === idx ? { ...it, [field]: val } : it)
    onChange({ items })
  }
  const removeItem = (idx) => onChange({ items: data.items.filter((_, i) => i !== idx) })
  const addItem = () => onChange({
    items: [...(data.items || []), { id: Date.now(), institution: '', degree: '', field: '', startDate: '', endDate: '', current: false, gpa: '', description: '' }]
  })

  return (
    <div className="space-y-4">
      {(data.items || []).map((item, idx) => (
        <div key={item.id || idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {item.institution || `Education ${idx + 1}`}
            </span>
            <button onClick={() => removeItem(idx)}
              className="p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors">
              <X size={14} />
            </button>
          </div>
          <Field label="Institution">
            <input placeholder="MIT, Harvard, etc." value={item.institution}
              onChange={e => updateItem(idx, 'institution', e.target.value)} className={INPUT} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Degree">
              <input placeholder="Bachelor of Science" value={item.degree}
                onChange={e => updateItem(idx, 'degree', e.target.value)} className={INPUT} />
            </Field>
            <Field label="Field of Study">
              <input placeholder="Computer Science" value={item.field}
                onChange={e => updateItem(idx, 'field', e.target.value)} className={INPUT} />
            </Field>
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <Field label="Start Date">
              <input type="month" value={item.startDate}
                onChange={e => updateItem(idx, 'startDate', e.target.value)} className={INPUT} />
            </Field>
            <Field label="End Date / Expected">
              <input type="month" value={item.endDate} disabled={item.current}
                onChange={e => updateItem(idx, 'endDate', e.target.value)}
                className={`${INPUT} disabled:opacity-40 disabled:cursor-not-allowed`} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-0.5 cursor-pointer">
              <input type="checkbox" checked={item.current}
                onChange={e => { updateItem(idx, 'current', e.target.checked); if (e.target.checked) updateItem(idx, 'endDate', '') }}
                className="w-4 h-4 rounded accent-blue-600" />
              In Progress
            </label>
          </div>
          <Field label="GPA (optional)">
            <input placeholder="3.9 / 4.0" value={item.gpa || ''}
              onChange={e => updateItem(idx, 'gpa', e.target.value)} className={`${INPUT} w-32`} />
          </Field>
          <Field label="Additional Notes (optional)">
            <RichTextEditor
              value={item.description || ''}
              onChange={v => updateItem(idx, 'description', v)}
              placeholder="Relevant coursework, thesis, honors, clubs..."
              minRows={2}
            />
          </Field>
        </div>
      ))}
      <button onClick={addItem}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
        <Plus size={14} /> Add Education
      </button>
    </div>
  )
}

function SkillsEditor({ data, onChange }) {
  const [newSkill, setNewSkill] = useState('')

  const addSkill = () => {
    const trimmed = newSkill.trim()
    if (!trimmed) return
    onChange({ items: [...(data.items || []), { name: trimmed, level: 'intermediate' }] })
    setNewSkill('')
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addSkill()}
          placeholder="Add a skill and press Enter..."
          className={INPUT}
        />
        <button onClick={addSkill}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors flex-shrink-0">
          <Plus size={14} />
        </button>
      </div>
      {(data.items || []).length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
          {(data.items || []).map((skill, idx) => (
            <span key={idx}
              className="inline-flex items-center gap-2 pl-3 pr-1 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-sm shadow-sm">
              <span className="font-medium">{skill.name}</span>
              <select
                value={skill.level}
                onChange={e => {
                  const items = [...data.items]
                  items[idx] = { ...items[idx], level: e.target.value }
                  onChange({ items })
                }}
                className="text-xs text-gray-400 bg-transparent border-none outline-none cursor-pointer pr-1"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                onClick={() => onChange({ items: data.items.filter((_, i) => i !== idx) })}
                className="w-5 h-5 rounded-full hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function CustomEditor({ data, onChange }) {
  return (
    <RichTextEditor
      value={data.content || ''}
      onChange={content => onChange({ content })}
      placeholder="Type your content here. Use bold, italic, or bullet lists..."
      minRows={3}
    />
  )
}

// ─── Sortable section wrapper ─────────────────────────────────────────────────
export default function SortableSection({ section }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { toggleSection, removeSection, updateSectionData } = useBuilderStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const renderContent = () => {
    const props = { data: section.data, onChange: d => updateSectionData(section.id, d) }
    switch (section.type) {
      case 'header':     return <HeaderEditor     {...props} />
      case 'summary':    return <SummaryEditor    {...props} />
      case 'experience': return <ExperienceEditor {...props} />
      case 'education':  return <EducationEditor  {...props} />
      case 'skills':     return <SkillsEditor     {...props} />
      default:           return <CustomEditor     {...props} />
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border-2 transition-all ${
        isDragging ? 'border-blue-400 shadow-xl' : 'border-gray-200 hover:border-gray-300'
      } ${!section.visible ? 'opacity-60' : ''}`}
    >
      {/* Section header row */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-t-xl border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors touch-none"
            title="Drag to reorder"
          >
            <GripVertical size={18} />
          </button>
          <span className="font-semibold text-gray-800 text-sm">{section.title}</span>
          {!section.visible && (
            <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Hidden
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => toggleSection(section.id)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
            title={section.visible ? 'Hide from resume' : 'Show in resume'}>
            {section.visible ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          <button onClick={() => setIsExpanded(e => !e)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors">
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          {section.type !== 'header' && (
            <button onClick={() => removeSection(section.id)}
              className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
              title="Remove section">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {renderContent()}
        </div>
      )}
    </div>
  )
}
