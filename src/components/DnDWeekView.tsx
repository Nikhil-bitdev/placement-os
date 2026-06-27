import { useState, useMemo, useCallback, useRef } from 'react'
import { Plus } from 'lucide-react'
import { usePlannerStore, type PlannerTask } from '../store/plannerStore'
import { getWeekDates, getToday, toPlannerKey, isSameDay } from '../lib/dateUtils'
import DraggableTaskCard from './DraggableTaskCard'
import TaskModal, { type TaskFormData } from './TaskModal'
import { toast } from './Toast'

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface DnDWeekViewProps {
  currentDate: Date
  selectedDate: Date
  setSelectedDate: (d: Date) => void
  filters: readonly string[]
}

export default function DnDWeekView({ currentDate, selectedDate, setSelectedDate, filters }: DnDWeekViewProps) {
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])
  const tasks = usePlannerStore(s => s.tasks)
  const addTask = usePlannerStore(s => s.addTask)
  const updateTask = usePlannerStore(s => s.updateTask)
  const deleteTask = usePlannerStore(s => s.deleteTask)
  const duplicateTask = usePlannerStore(s => s.duplicateTask)
  const toggleStatus = usePlannerStore(s => s.toggleStatus)
  const reorderTasks = usePlannerStore(s => s.reorderTasks)
  const moveTaskToDate = usePlannerStore(s => s.moveTaskToDate)

  const [dragOverDate, setDragOverDate] = useState<string | null>(null)
  const [dragSourceId, setDragSourceId] = useState<string | null>(null)
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null)
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [addDate, setAddDate] = useState<string | null>(null)
  const columnRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const filterCategory = useCallback((cat: string) => {
    if (filters.length === 0) return true
    const map: Record<string, string> = {
      DSA: 'DSA',
      'Full Stack': 'Full Stack',
      'Core Subjects': 'Core Subjects',
      Projects: 'Projects',
      Revision: 'Revision',
      Contest: 'Contest',
      Interview: 'Interview',
      Resume: 'Resume',
      LeetCode: 'DSA',
    }
    const mapped = map[cat]
    return filters.includes(mapped as any) || filters.includes(cat as any)
  }, [filters])

  const taskMap = useMemo(() => {
    const map = new Map<string, PlannerTask[]>()
    for (const d of weekDates) {
      const key = toPlannerKey(d)
      const dateTasks = tasks
        .filter(t => t.date === key && filterCategory(t.category))
        .sort((a, b) => a.order - b.order)
      map.set(key, dateTasks)
    }
    return map
  }, [weekDates, tasks, filterCategory])

  const handleDragStart = useCallback((id: string, index: number) => {
    setDragSourceId(id)
    setDragSourceIndex(index)
  }, [])

  const handleDropOnDay = useCallback((e: React.DragEvent, dateKey: string) => {
    e.preventDefault()
    if (!dragSourceId) return
    const sourceTask = tasks.find(t => t.id === dragSourceId)
    if (!sourceTask) return

    const el = columnRefs.current.get(dateKey)
    let dropIndex = 0
    if (el) {
      const cards = el.querySelectorAll('[draggable]')
      const rect = el.getBoundingClientRect()
      const relativeY = e.clientY - rect.top
      for (const card of cards) {
        const cardRect = card.getBoundingClientRect()
        if (relativeY > (cardRect.top - rect.top + cardRect.height / 2)) dropIndex++
      }
    }

    if (sourceTask.date === dateKey) {
      if (dragSourceIndex !== null && dragSourceIndex !== dropIndex) {
        reorderTasks(dateKey, dragSourceIndex, dropIndex)
      }
    } else {
      moveTaskToDate(dragSourceId, dateKey)
      toast('📅', 'Task moved to new date')
    }
    setDragOverDate(null)
    setDragSourceId(null)
    setDragSourceIndex(null)
  }, [dragSourceId, tasks, moveTaskToDate, reorderTasks, dragSourceIndex])

  const handleDragEnd = useCallback(() => {
    setDragOverDate(null)
    setDragSourceId(null)
    setDragSourceIndex(null)
  }, [])

  const handleAddTask = useCallback((dateKey: string) => {
    setAddDate(dateKey)
    setModalOpen(true)
  }, [])

  const handleEditTask = useCallback((task: PlannerTask) => {
    setEditingTask(task)
    setModalOpen(true)
  }, [])

  const handleSave = useCallback((data: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, { ...data })
      toast('✅', 'Task updated')
    } else {
      addTask({ ...data, order: 0, status: 'pending' })
      toast('✅', 'Task created')
    }
    setEditingTask(null)
    setAddDate(null)
  }, [editingTask, updateTask, addTask])

  const handleDuplicate = useCallback((id: string) => {
    duplicateTask(id)
    toast('📋', 'Task duplicated')
  }, [duplicateTask])

  const handleDelete = useCallback((id: string) => {
    deleteTask(id)
    toast('🗑️', 'Task deleted')
    if (editingTask?.id === id) {
      setEditingTask(null)
      setModalOpen(false)
    }
  }, [deleteTask, editingTask])

  const isToday = (d: Date) => isSameDay(d, getToday())
  const isSelected = (d: Date) => isSameDay(d, selectedDate)

  return (
    <>
      <div className="card p-4 overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 min-w-[600px]">
          {weekDates.map((d, i) => {
            const dateKey = toPlannerKey(d)
            const dateTasks = taskMap.get(dateKey) || []
            const isDragOver = dragOverDate === dateKey

            return (
              <div key={i} className="space-y-1">
                <button
                  onClick={() => setSelectedDate(d)}
                  className={`w-full text-center py-1.5 rounded-lg text-xs font-mono transition-all ${
                    isSelected(d) ? 'bg-[#DBEAFE] text-[#2563EB] ring-1 ring-[#93C5FD] dark:bg-blue-500/20 dark:text-blue-400 dark:ring-blue-500/50' :
                    isToday(d) ? 'text-[#2563EB] dark:text-blue-400' : 'text-[#64748B]'
                  }`}
                >
                  <div>{d.getDate()}</div>
                  <div className="text-[10px] text-[#64748B]">{dayHeaders[d.getDay()]}</div>
                </button>

                <div
                  ref={(el) => { if (el) columnRefs.current.set(dateKey, el) }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverDate(dateKey) }}
                  onDragLeave={() => setDragOverDate(null)}
                  onDrop={(e) => handleDropOnDay(e, dateKey)}
                  className={`space-y-1 min-h-[200px] rounded-lg p-1 transition-colors ${
                    isDragOver ? 'bg-[#DBEAFE]/30 dark:bg-blue-500/10 ring-1 ring-[#93C5FD]/50' : ''
                  }`}
                >
                  {dateTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-[100px] text-[10px] text-[#94A3B8]">
                      {isDragOver ? 'Drop here' : 'No tasks'}
                    </div>
                  ) : (
                    dateTasks.map((t, idx) => (
                      <DraggableTaskCard
                        key={t.id}
                        task={t}
                        index={idx}
                        onEdit={handleEditTask}
                        onToggle={toggleStatus}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    ))
                  )}
                </div>

                <button
                  onClick={() => handleAddTask(dateKey)}
                  className="w-full flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#F1F5F9] dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <Plus size={10} />
                  Add task
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); setAddDate(null) }}
        onSave={handleSave}
        onDelete={editingTask ? () => handleDelete(editingTask.id) : undefined}
        onDuplicate={editingTask ? () => { handleDuplicate(editingTask.id); setModalOpen(false); setEditingTask(null) } : undefined}
        task={editingTask || undefined}
        selectedDate={addDate ? (() => { const [d, m, y] = addDate.split('-').map(Number); return new Date(y, m - 1, d) })() : undefined}
        existingTasks={tasks.filter(t => t.date === (addDate || editingTask?.date || ''))}
      />
    </>
  )
}
