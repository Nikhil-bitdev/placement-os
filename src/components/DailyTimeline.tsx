import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Clock, GripVertical, ChevronLeft, ChevronRight,
  Sun, Sunrise, Sunset, Moon, Sparkles,
} from 'lucide-react'
import { usePlannerStore, type PlannerTask, CATEGORY_BADGES } from '../store/plannerStore'
import { toPlannerKey, getToday, isSameDay, toDisplayFull } from '../lib/dateUtils'
import TaskModal, { type TaskFormData } from './TaskModal'
import { toast } from './Toast'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6)
const HOUR_HEIGHT = 56
const SLOT_HEIGHT = 56

function toMinutes(time: string): number {
  if (!time) return -1
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const periodLabels: Record<string, { label: string; icon: typeof Sun; color: string }> = {
  morning: { label: 'Morning', icon: Sunrise, color: 'text-amber-500' },
  afternoon: { label: 'Afternoon', icon: Sun, color: 'text-orange-500' },
  evening: { label: 'Evening', icon: Sunset, color: 'text-rose-500' },
  night: { label: 'Night', icon: Moon, color: 'text-indigo-400' },
}

function getPeriod(hour: number): string {
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 20) return 'evening'
  return 'night'
}

interface DailyTimelineProps {
  date: Date
  onBack?: () => void
}

export default function DailyTimeline({ date, onBack }: DailyTimelineProps) {
  const allTasks = usePlannerStore(s => s.tasks)
  const addTask = usePlannerStore(s => s.addTask)
  const updateTask = usePlannerStore(s => s.updateTask)
  const deleteTask = usePlannerStore(s => s.deleteTask)
  const toggleStatus = usePlannerStore(s => s.toggleStatus)

  const [currentDate, setCurrentDate] = useState(date)
  const dateKey = toPlannerKey(date)
  useEffect(() => { setCurrentDate(date) }, [dateKey])
  const [dragTaskId, setDragTaskId] = useState<string | null>(null)
  const [resizeTaskId, setResizeTaskId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null)
  const [addTime, setAddTime] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const currentDateKey = toPlannerKey(currentDate)

  const currentTasks = useMemo(() => {
    return allTasks.filter(t => t.date === currentDateKey)
  }, [allTasks, currentDateKey])

  const scheduledTasks = useMemo(() => {
    return currentTasks.filter(t => t.startTime).sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
  }, [currentTasks])

  const unscheduledTasks = useMemo(() => {
    return currentTasks.filter(t => !t.startTime)
  }, [currentTasks])

  const getTaskPosition = useCallback((task: PlannerTask) => {
    const startMins = toMinutes(task.startTime)
    const endMins = toMinutes(task.endTime)
    const top = startMins >= 0 ? ((startMins - HOURS[0] * 60) / 60) * HOUR_HEIGHT : 0
    const height = endMins > startMins ? ((endMins - startMins) / 60) * HOUR_HEIGHT : HOUR_HEIGHT
    return { top: Math.max(0, top), height: Math.max(HOUR_HEIGHT / 2, height) }
  }, [])

  const getHourFromY = useCallback((clientY: number): number => {
    if (!timelineRef.current) return HOURS[0]
    const rect = timelineRef.current.getBoundingClientRect()
    const relativeY = clientY - rect.top + timelineRef.current.scrollTop
    const hourIndex = Math.floor(relativeY / HOUR_HEIGHT)
    return Math.max(0, Math.min(hourIndex, HOURS.length - 1))
  }, [])

  const handleDragStart = useCallback((taskId: string) => {
    setDragTaskId(taskId)
  }, [])

  const handleDropOnHour = useCallback((e: React.DragEvent, hour: number) => {
    e.preventDefault()
    if (!dragTaskId) return
    const task = currentTasks.find(t => t.id === dragTaskId)
    if (!task) return

    const newStart = `${String(hour).padStart(2, '0')}:00`
    const duration = task.endTime && toMinutes(task.endTime) > toMinutes(task.startTime)
      ? toMinutes(task.endTime) - toMinutes(task.startTime)
      : 60
    const newEnd = fromMinutes(toMinutes(newStart) + duration)

    updateTask(dragTaskId, { startTime: newStart, endTime: newEnd })
    toast('📅', 'Task moved')
    setDragTaskId(null)
  }, [dragTaskId, currentTasks, updateTask])

  const handleResize = useCallback((e: MouseEvent, task: PlannerTask) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const relativeY = e.clientY - rect.top + timelineRef.current.scrollTop
    const hourIndex = Math.floor(relativeY / HOUR_HEIGHT)
    const clampedHour = Math.max(HOURS[0], Math.min(hourIndex, HOURS[HOURS.length - 1]))
    const startHour = toMinutes(task.startTime) / 60
    if (clampedHour > startHour) {
      const newEnd = `${String(clampedHour).padStart(2, '0')}:00`
      updateTask(task.id, { endTime: newEnd })
    }
  }, [updateTask])

  const handleResizeStart = useCallback((e: React.MouseEvent, task: PlannerTask) => {
    e.stopPropagation()
    e.preventDefault()
    setResizeTaskId(task.id)

    const onMouseMove = (ev: MouseEvent) => handleResize(ev, task)
    const onMouseUp = () => {
      setResizeTaskId(null)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [handleResize])

  const handleEditTask = useCallback((task: PlannerTask) => {
    setEditingTask(task)
    setModalOpen(true)
  }, [])

  const handleAddAtTime = useCallback((hour: number) => {
    const time = `${String(hour).padStart(2, '0')}:00`
    setAddTime(time)
    setEditingTask(null)
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
    setAddTime(null)
  }, [editingTask, updateTask, addTask])

  const handleDuplicate = useCallback((id: string) => {
    const duplicateTask = usePlannerStore.getState().duplicateTask
    duplicateTask(id)
    toast('📋', 'Task duplicated')
  }, [])

  const handleDelete = useCallback((id: string) => {
    deleteTask(id)
    toast('🗑️', 'Task deleted')
    if (editingTask?.id === id) {
      setEditingTask(null)
      setModalOpen(false)
    }
  }, [deleteTask, editingTask])

  const goPrev = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 1)
    setCurrentDate(d)
  }

  const goNext = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 1)
    setCurrentDate(d)
  }

  const goToday = () => setCurrentDate(getToday())

  const isTodayDate = isSameDay(currentDate, getToday())
  const nowHour = new Date().getHours()
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-4 pb-3 border-b border-[#E2E8F0] dark:border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">
                <ChevronLeft size={15} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <button onClick={goPrev} className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">
                <ChevronLeft size={14} />
              </button>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white min-w-[160px] text-center">
                {toDisplayFull(currentDate)}
              </h3>
              <button onClick={goNext} className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isTodayDate && (
              <button
                onClick={goToday}
                className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[#DBEAFE] text-[#2563EB] hover:bg-[#BFDBFE] dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition-colors"
              >
                Today
              </button>
            )}
            {isTodayDate && (
              <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#DBEAFE] text-[#2563EB] dark:bg-blue-500/20 dark:text-blue-400">
                Today
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        {unscheduledTasks.length > 0 && (
          <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-zinc-700/30 space-y-1">
            <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Unscheduled</p>
            {unscheduledTasks.map(t => (
              <div
                key={t.id}
                onClick={() => handleEditTask(t)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F8FAFC] dark:bg-zinc-800/30 border border-[#E2E8F0] dark:border-zinc-700/30 cursor-pointer hover:border-[#93C5FD] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] flex-shrink-0" />
                <span className={`text-xs flex-1 min-w-0 truncate ${t.status === 'done' ? 'line-through text-[#94A3B8]' : 'text-[#334155] dark:text-zinc-300'}`}>
                  {t.title}
                </span>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${CATEGORY_BADGES[t.category] || 'bg-zinc-100'}`}>
                  {t.category}
                </span>
              </div>
            ))}
          </div>
        )}

        <div ref={timelineRef} className="overflow-y-auto max-h-[600px] relative">
          <div className="relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
            {HOURS.map((hour, i) => {
              const isCurrentHour = isTodayDate && hour === nowHour
              const period = getPeriod(hour)
              const isPeriodStart = i === 0 || getPeriod(HOURS[i - 1]) !== period
              const periodInfo = periodLabels[period]
              return (
                <div
                  key={hour}
                  onDragOver={(e) => { e.preventDefault() }}
                  onDrop={(e) => handleDropOnHour(e, hour)}
                  onClick={() => handleAddAtTime(hour)}
                  className={`absolute left-0 right-0 flex items-center border-t border-[#E2E8F0] dark:border-zinc-700/20 cursor-pointer transition-colors ${
                    isCurrentHour ? 'bg-gradient-to-r from-[#DBEAFE]/40 via-[#DBEAFE]/20 to-transparent dark:from-blue-500/20 dark:via-blue-500/10 dark:to-transparent' : 'hover:bg-[#F8FAFC]/50 dark:hover:bg-zinc-800/20'
                  }`}
                  style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                >
                  <div className="w-20 flex-shrink-0 text-center relative">
                    {isPeriodStart && periodInfo && (
                      <div className="absolute left-1/2 -translate-x-1/2 -top-3 flex items-center gap-1 whitespace-nowrap">
                        <periodInfo.icon size={9} className={periodInfo.color} />
                        <span className="text-[8px] font-semibold text-[#94A3B8] uppercase tracking-wider">{periodInfo.label}</span>
                      </div>
                    )}
                    <span className={`text-[10px] font-mono ${isCurrentHour ? 'text-[#2563EB] font-bold' : 'text-[#94A3B8]'}`}>
                      {`${String(hour).padStart(2, '0')}:00`}
                    </span>
                  </div>
                  <div className="flex-1 h-full relative" />
                  {isCurrentHour && (
                    <div className="absolute left-20 top-0 bottom-0 w-0.5 bg-[#2563EB] z-10" />
                  )}
                </div>
              )
            })}

            {scheduledTasks.map(task => {
              const { top, height } = getTaskPosition(task)
              const startHour = toMinutes(task.startTime) / 60
              const hourIndex = startHour - HOURS[0]
              const isResizing = resizeTaskId === task.id
              const isDragging = dragTaskId === task.id

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: isDragging ? 0.5 : 1,
                    scale: isDragging ? 0.98 : 1,
                  }}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  onDragEnd={() => setDragTaskId(null)}
                  onClick={() => handleEditTask(task)}
                  className={`absolute left-20 right-3 rounded-xl border cursor-pointer overflow-hidden group transition-shadow hover:shadow-md ${
                    task.status === 'done'
                      ? 'bg-[#F0FDF4] dark:bg-green-900/10 border-[#BBF7D0] dark:border-green-800/30 opacity-70'
                      : 'bg-white dark:bg-zinc-800 border-[#E2E8F0] dark:border-zinc-700/50 hover:border-[#93C5FD] dark:hover:border-blue-500/40'
                  } ${isResizing ? 'shadow-md ring-1 ring-[#2563EB]' : ''}`}
                  style={{ top, height: Math.max(height, 30) }}
                >
                  <div className="flex items-start gap-2 p-2 h-full">
                    <div
                      onMouseDown={(e) => handleResizeStart(e, task)}
                      className={`absolute bottom-0 left-0 right-0 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 bg-[#2563EB]/20 hover:bg-[#2563EB]/30 transition-opacity rounded-b-xl`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_BADGES[task.category] || ''}`}>
                          {task.category}
                        </span>
                      </div>
                      <p className={`text-[12px] font-medium leading-snug mt-1 ${task.status === 'done' ? 'line-through text-[#94A3B8]' : 'text-[#0F172A] dark:text-zinc-200'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock size={10} className="text-[#94A3B8]" />
                        <span className="text-[10px] text-[#94A3B8] font-mono">
                          {task.startTime}–{task.endTime || ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 mt-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleStatus(task.id) }}
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                          task.status === 'done'
                            ? 'bg-[#22C55E] border-[#22C55E]'
                            : 'border-[#CBD5E1] dark:border-zinc-600 hover:border-[#2563EB]'
                        }`}
                      >
                        {task.status === 'done' && (
                          <svg viewBox="0 0 12 12" className="w-2 h-2 text-white"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {currentTasks.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF] dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center mx-auto mb-3">
              <Plus size={16} className="text-[#2563EB] dark:text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-[#0F172A] dark:text-white mb-1">
              {isTodayDate ? 'Plan your day' : 'No tasks scheduled'}
            </p>
            <p className="text-xs text-[#64748B] mb-4">
              Tap an hour slot or click below to add your first task.
            </p>
            <button
              onClick={() => handleAddAtTime(HOURS[Math.floor(HOURS.length / 2)])}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-medium hover:bg-[#1D4ED8] shadow-sm transition-all"
            >
              <Plus size={12} />
              Start planning
            </button>
          </div>
        )}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); setAddTime(null) }}
        onSave={handleSave}
        onDelete={editingTask ? () => handleDelete(editingTask.id) : undefined}
        onDuplicate={editingTask ? () => { handleDuplicate(editingTask.id); setModalOpen(false); setEditingTask(null) } : undefined}
        task={editingTask || undefined}
        selectedDate={currentDate}
        defaultStartTime={addTime || undefined}
        existingTasks={currentTasks}
      />
    </div>
  )
}
