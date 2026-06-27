import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Tag, Calendar, Flag, BarChart3 } from 'lucide-react'
import {
  type PlannerTask, type PlannerCategory, type TaskPriority, type TaskDifficulty,
  CATEGORIES, CATEGORY_BADGES, PRIORITY_COLORS, DIFFICULTY_COLORS,
} from '../store/plannerStore'
import { toPlannerKey, getToday } from '../lib/dateUtils'

interface TaskModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: TaskFormData) => void
  onDelete?: () => void
  onDuplicate?: () => void
  task?: PlannerTask
  selectedDate?: Date
  defaultStartTime?: string
  existingTasks?: PlannerTask[]
}

export interface TaskFormData {
  title: string
  category: PlannerCategory
  date: string
  startTime: string
  endTime: string
  priority: TaskPriority
  difficulty: TaskDifficulty
  notes: string
}

const defaultForm: TaskFormData = {
  title: '',
  category: 'DSA',
  date: toPlannerKey(getToday()),
  startTime: '',
  endTime: '',
  priority: 'medium',
  difficulty: 'medium',
  notes: '',
}

const timeOptions = [
  '', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
]

export default function TaskModal({ open, onClose, onSave, onDelete, onDuplicate, task, selectedDate, defaultStartTime, existingTasks }: TaskModalProps) {
  const [form, setForm] = useState<TaskFormData>(defaultForm)
  const [showCategory, setShowCategory] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setErrors({})
      if (task) {
        setForm({
          title: task.title,
          category: task.category,
          date: task.date,
          startTime: task.startTime,
          endTime: task.endTime,
          priority: task.priority,
          difficulty: task.difficulty,
          notes: task.notes,
        })
      } else {
        setForm({
          ...defaultForm,
          date: selectedDate ? toPlannerKey(selectedDate) : toPlannerKey(getToday()),
          startTime: defaultStartTime || '',
        })
      }
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }, [open, task, selectedDate, defaultStartTime])

  const update = (partial: Partial<TaskFormData>) => {
    setForm(prev => ({ ...prev, ...partial }))
    setErrors({})
  }

  const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.date) errs.date = 'Date is required'
    if (form.startTime && !form.endTime) errs.endTime = 'End time is required when start is set'
    if (!form.startTime && form.endTime) errs.startTime = 'Start time is required when end is set'
    if (form.startTime && form.endTime) {
      if (form.startTime >= form.endTime) {
        errs.endTime = 'End time must be after start time'
      } else if (existingTasks) {
        const newStart = toMins(form.startTime)
        const newEnd = toMins(form.endTime)
        for (const t of existingTasks) {
          if (!t.startTime || !t.endTime) continue
          if (task && t.id === task.id) continue
          const tStart = toMins(t.startTime)
          const tEnd = toMins(t.endTime)
          if (newStart < tEnd && tStart < newEnd) {
            errs.endTime = `Time overlaps with "${t.title}" (${t.startTime}-${t.endTime})`
            break
          }
        }
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(form)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-zinc-700/50 overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] dark:border-zinc-700/50">
              <h2 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                {task ? 'Edit Task' : 'New Task'}
              </h2>
              <div className="flex items-center gap-1">
                {task && onDuplicate && (
                  <button
                    onClick={onDuplicate}
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors text-xs"
                    title="Duplicate"
                  >
                    Copy
                  </button>
                )}
                {task && onDelete && (
                  <button
                    onClick={onDelete}
                    className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-red-500/20 transition-colors text-xs"
                    title="Delete"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <input
                  ref={titleRef}
                  value={form.title}
                  onChange={e => update({ title: e.target.value })}
                  placeholder="Task title..."
                  className={`w-full bg-transparent text-sm font-medium text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none ${errors.title ? 'text-[#EF4444]' : ''}`}
                />
                {errors.title && <p className="text-[10px] text-[#EF4444] mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-[10px] font-medium text-[#64748B] uppercase tracking-wider">
                    <Tag size={10} /> Category
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowCategory(!showCategory)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-zinc-800/50 border border-[#E2E8F0] dark:border-zinc-700/50 text-xs text-[#334155] dark:text-zinc-300 hover:border-[#93C5FD] transition-colors"
                    >
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${CATEGORY_BADGES[form.category]}`}>
                        {form.category}
                      </span>
                    </button>
                    {showCategory && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowCategory(false)} />
                        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-[#E2E8F0] dark:border-zinc-700/50 shadow-lg z-20 py-1 max-h-48 overflow-y-auto">
                          {CATEGORIES.map(c => (
                            <button
                              key={c}
                              onClick={() => { update({ category: c }); setShowCategory(false) }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#334155] dark:text-zinc-300 hover:bg-[#F1F5F9] dark:hover:bg-zinc-800 transition-colors"
                            >
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${CATEGORY_BADGES[c]}`}>{c}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-[10px] font-medium text-[#64748B] uppercase tracking-wider">
                    <Calendar size={10} /> Date
                  </label>
                  <input
                    type="date"
                    value={form.date.split('-').reverse().join('-')}
                    onChange={e => {
                      const [y, m, d] = e.target.value.split('-')
                      update({ date: `${d}-${m}-${y}` })
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-zinc-800/50 border border-[#E2E8F0] dark:border-zinc-700/50 text-xs text-[#334155] dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#93C5FD]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-[10px] font-medium text-[#64748B] uppercase tracking-wider">
                    <Clock size={10} /> Start
                  </label>
                  <select
                    value={form.startTime}
                    onChange={e => update({ startTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-zinc-800/50 border border-[#E2E8F0] dark:border-zinc-700/50 text-xs text-[#334155] dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#93C5FD]"
                  >
                    {timeOptions.map(t => (
                      <option key={t} value={t}>{t || '--:--'}</option>
                    ))}
                  </select>
                  {errors.startTime && <p className="text-[10px] text-[#EF4444]">{errors.startTime}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-[10px] font-medium text-[#64748B] uppercase tracking-wider">
                    <Clock size={10} /> End
                  </label>
                  <select
                    value={form.endTime}
                    onChange={e => update({ endTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-zinc-800/50 border border-[#E2E8F0] dark:border-zinc-700/50 text-xs text-[#334155] dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#93C5FD]"
                  >
                    {timeOptions.map(t => (
                      <option key={t} value={t}>{t || '--:--'}</option>
                    ))}
                  </select>
                  {errors.endTime && <p className="text-[10px] text-[#EF4444]">{errors.endTime}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-[10px] font-medium text-[#64748B] uppercase tracking-wider">
                    <Flag size={10} /> Priority
                  </label>
                  <div className="flex gap-1">
                    {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                      <button
                        key={p}
                        onClick={() => update({ priority: p })}
                        className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all capitalize ${
                          form.priority === p
                            ? PRIORITY_COLORS[p] + ' ring-1 ring-current'
                            : 'text-[#64748B] bg-[#F8FAFC] dark:bg-zinc-800/50 border border-[#E2E8F0] dark:border-zinc-700/50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-[10px] font-medium text-[#64748B] uppercase tracking-wider">
                    <BarChart3 size={10} /> Difficulty
                  </label>
                  <div className="flex gap-1">
                    {(['easy', 'medium', 'hard'] as TaskDifficulty[]).map(d => (
                      <button
                        key={d}
                        onClick={() => update({ difficulty: d })}
                        className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all capitalize ${
                          form.difficulty === d
                            ? DIFFICULTY_COLORS[d] + ' ring-1 ring-current'
                            : 'text-[#64748B] bg-[#F8FAFC] dark:bg-zinc-800/50 border border-[#E2E8F0] dark:border-zinc-700/50'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#E2E8F0] dark:border-zinc-700/50 bg-[#F8FAFC] dark:bg-zinc-800/30">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
              >
                {task ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
