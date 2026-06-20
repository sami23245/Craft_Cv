import { useBuilderStore } from '../../store/builderStore'

const FONT_MAP = {
  'Inter':        "'Inter', system-ui, -apple-system, sans-serif",
  'Georgia':      "Georgia, 'Times New Roman', serif",
  'Roboto':       "'Roboto', system-ui, sans-serif",
  'Courier New':  "'Courier New', Courier, monospace",
}

function fmtDate(str) {
  if (!str) return ''
  const [y, m] = str.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return m ? `${months[parseInt(m) - 1]} ${y}` : y
}

function SectionHeading({ title, color }) {
  return (
    <div className="mb-2.5">
      <h2 style={{ color }} className="text-[9.5px] font-black uppercase tracking-[0.18em] mb-1">
        {title}
      </h2>
      <div style={{ background: `${color}35` }} className="h-px" />
    </div>
  )
}

export default function ResumePreview({ id }) {
  const { sections, primaryColor, fontFamily } = useBuilderStore()
  const header = sections.find(s => s.type === 'header' && s.visible)?.data || {}
  const font = FONT_MAP[fontFamily] || FONT_MAP['Inter']

  const renderSection = (section) => {
    switch (section.type) {
      case 'header': return null

      case 'summary': {
        if (!section.data.content) return null
        return (
          <div key={section.id}>
            <SectionHeading title={section.title} color={primaryColor} />
            <div
              className="text-[11.5px] text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_b]:font-bold [&_i]:italic [&_u]:underline"
              dangerouslySetInnerHTML={{ __html: section.data.content }}
            />
          </div>
        )
      }

      case 'experience': {
        if (!section.data.items?.length) return null
        return (
          <div key={section.id}>
            <SectionHeading title={section.title} color={primaryColor} />
            <div className="space-y-3">
              {section.data.items.map((item, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-[13px] text-gray-900 leading-tight">{item.role || 'Role'}</p>
                      <p className="text-[11.5px] font-semibold mt-0.5" style={{ color: primaryColor }}>
                        {item.company}{item.location ? ` · ${item.location}` : ''}
                      </p>
                    </div>
                    <div className="text-[10px] text-gray-400 flex-shrink-0 text-right leading-snug whitespace-nowrap mt-0.5">
                      {item.startDate && fmtDate(item.startDate)}
                      {(item.startDate || item.current || item.endDate) && ' – '}
                      {item.current ? 'Present' : fmtDate(item.endDate)}
                    </div>
                  </div>
                  {item.description && (
                    <div
                      className="text-[11px] text-gray-600 mt-1.5 leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_b]:font-bold [&_i]:italic [&_u]:underline"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      }

      case 'education': {
        if (!section.data.items?.length) return null
        return (
          <div key={section.id}>
            <SectionHeading title={section.title} color={primaryColor} />
            <div className="space-y-2.5">
              {section.data.items.map((item, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-[13px] text-gray-900 leading-tight">
                        {[item.degree, item.field].filter(Boolean).join(' in ') || 'Degree'}
                      </p>
                      <p className="text-[11.5px] font-semibold mt-0.5" style={{ color: primaryColor }}>
                        {item.institution}
                      </p>
                      {item.gpa && <p className="text-[10.5px] text-gray-400 mt-0.5">GPA: {item.gpa}</p>}
                    </div>
                    <div className="text-[10px] text-gray-400 flex-shrink-0 text-right leading-snug whitespace-nowrap mt-0.5">
                      {item.startDate && fmtDate(item.startDate)}
                      {(item.startDate || item.current || item.endDate) && ' – '}
                      {item.current ? 'Present' : fmtDate(item.endDate)}
                    </div>
                  </div>
                  {item.description && (
                    <div
                      className="text-[11px] text-gray-600 mt-1 [&_ul]:list-disc [&_ul]:ml-4 [&_b]:font-bold"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      }

      case 'skills': {
        if (!section.data.items?.length) return null
        return (
          <div key={section.id}>
            <SectionHeading title={section.title} color={primaryColor} />
            <div className="flex flex-wrap gap-1.5">
              {section.data.items.map((skill, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-0.5 rounded-full font-medium border"
                  style={{
                    borderColor: `${primaryColor}50`,
                    color: primaryColor,
                    backgroundColor: `${primaryColor}10`,
                  }}
                >
                  {skill.name}
                  {skill.level && skill.level !== 'intermediate' && (
                    <span className="opacity-60 ml-1 font-normal">· {skill.level}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )
      }

      default: {
        if (!section.data.content) return null
        return (
          <div key={section.id}>
            <SectionHeading title={section.title} color={primaryColor} />
            <div
              className="text-[11.5px] text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_b]:font-bold [&_i]:italic"
              dangerouslySetInnerHTML={{ __html: section.data.content }}
            />
          </div>
        )
      }
    }
  }

  return (
    <div
      id={id}
      style={{ fontFamily: font }}
      className="bg-white w-full min-h-[1060px] text-gray-900 select-none"
    >
      {/* Accent bar */}
      <div style={{ height: 5, background: primaryColor }} />

      {/* Header */}
      <div className="px-8 pt-6 pb-4">
        <h1 className="text-[26px] font-black leading-tight tracking-tight text-gray-900">
          {header.firstName || 'Your'}{' '}
          <span style={{ color: primaryColor }}>{header.lastName || 'Name'}</span>
        </h1>
        {header.jobTitle && (
          <p className="text-[13px] font-semibold text-gray-500 mt-1 tracking-wide">{header.jobTitle}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10.5px] text-gray-400">
          {header.email && <span>✉ {header.email}</span>}
          {header.phone && <span>✆ {header.phone}</span>}
          {header.location && <span>📍 {header.location}</span>}
          {header.linkedin && <span>in {header.linkedin}</span>}
          {header.website && <span>🌐 {header.website}</span>}
        </div>
      </div>

      {/* Thin divider */}
      <div style={{ background: `${primaryColor}25` }} className="h-px mx-8 mb-5" />

      {/* Sections */}
      <div className="px-8 pb-8 space-y-4">
        {sections
          .filter(s => s.visible && s.type !== 'header')
          .map(renderSection)}
      </div>
    </div>
  )
}
