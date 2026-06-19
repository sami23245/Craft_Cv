import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useBuilderStore } from '../../store/builderStore'
import SortableSection from './SortableSection'

export default function BuilderCanvas() {
  const { sections, reorderSections } = useBuilderStore()
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id)
      const newIndex = sections.findIndex(s => s.id === over.id)
      reorderSections(arrayMove(sections, oldIndex, newIndex))
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-20">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section) => (
            <SortableSection key={section.id} section={section} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}