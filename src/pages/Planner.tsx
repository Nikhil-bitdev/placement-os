import { useState } from 'react'
import { usePlannerStore, type PlannerCategory, type PlannerTask } from '../store/plannerStore'
import Pomodoro from '../components/Pomodoro'
import StudyPlan from '../components/StudyPlan'

import { CATEGORIES, CATEGORY_COLORS } from '../store/plannerStore'
const categories = CATEGORIES
const categoryColors = CATEGORY_COLORS

const priorityColors: Record<string, string> = {
  low: 'bg-gray-400',
  medium: 'bg-orange-400',
  high: 'bg-red-500',
}

const fmt = (d: Date) => {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const storeKey = (d: Date) => {
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

const today = () => {
  const d = new Date()
  return storeKey(d)
}

const parseDate = (ddmmyyyy: string) => {
  const [d, m, y] = ddmmyyyy.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const formatDate = (date: Date) => {
  return storeKey(date)
}

export default function Planner() {
  const { tasks, addTask, deleteTask, toggleStatus, updateTask } = usePlannerStore()
  const [selectedDate, setSelectedDate] = useState(today())


  // Form state
  const [newCategory, setNewCategory] = useState<PlannerCategory>('DSA')
  const [newStart, setNewStart] = useState('09:00')
  const [newEnd, setNewEnd] = useState('10:00')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [newNotes, setNewNotes] = useState('')

  const goToPrevDay = () => {
    const d = parseDate(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(formatDate(d))
  }

  const goToNextDay = () => {
    const d = parseDate(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(formatDate(d))
  }

  const goToToday = () => setSelectedDate(today())

  const handleAddTask = () => {
    addTask({
      date: selectedDate,
      category: newCategory,
      title: newNotes || `${newCategory} task`,
      startTime: newStart,
      endTime: newEnd,
      status: 'pending',
      priority: newPriority,
      difficulty: 'medium',
      notes: newNotes,
      order: 0,
    })
    setNewNotes('')
  }

  const dayTasks = tasks
    .filter((t) => t.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="card p-4 flex items-center justify-between">
        <button
          onClick={goToPrevDay}
          aria-label="Previous day"
          className="px-3 py-1.5 rounded-[10px] text-[#64748B] text-sm hover:bg-[#F1F5F9] dark:text-zinc-300 dark:hover:bg-zinc-700/50 transition-colors"
        >
          ← Prev
        </button>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-[#0F172A] dark:text-white">{fmt(parseDate(selectedDate))}</p>
            <p className="text-xs text-[#64748B] font-mono">{selectedDate}</p>
          </div>
          {selectedDate !== today() && (
            <button
              onClick={goToToday}
              className="px-3 py-1 rounded-[10px] bg-[#DBEAFE] text-[#2563EB] text-sm hover:bg-[#BFDBFE] dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition-colors"
            >
              Today
            </button>
          )}
        </div>
        <button
          onClick={goToNextDay}
          aria-label="Next day"
          className="px-3 py-1.5 rounded-[10px] text-[#64748B] text-sm hover:bg-[#F1F5F9] dark:text-zinc-300 dark:hover:bg-zinc-700/50 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Quick Add Form */}
      <div role="form" aria-label="Quick add task" className="card p-4">
        <h3 className="text-sm font-semibold text-[#0F172A] dark:text-gray-100 mb-3">
          Quick Add Task
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as PlannerCategory)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] dark:bg-zinc-800/50 dark:border-zinc-700 rounded-[10px] px-3 py-1.5 text-sm"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Start</label>
            <input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">End</label>
            <input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="bg-[#F8FAFC] border border-[#E2E8F0] dark:bg-zinc-800/50 dark:border-zinc-700 rounded-[10px] px-3 py-1.5 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#64748B]">Notes</label>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Optional notes"
              className="w-40"
            />
          </div>
          <button
            onClick={handleAddTask}
            className="btn-primary"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Task List */}
      {dayTasks.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[#64748B]">No tasks scheduled for {fmt(parseDate(selectedDate))}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleStatus(task.id)}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Pomodoro />
        <StudyPlan />
      </div>
    </div>
  )
}

function TaskCard({
  task,
  onToggle,
  onDelete,
}: {
  task: PlannerTask
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div className="card p-4 flex items-start gap-3">
      {/* Status checkbox */}
      <input
        type="checkbox"
        checked={task.status === 'done'}
        onChange={onToggle}
        className="mt-1 w-4 h-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#93C5FD]"
      />

      {/* Category badge */}
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[task.category]}`}>
        {task.category}
      </span>

      {/* Time range or notes */}
      {task.startTime || task.endTime ? (
        <span className="text-sm text-[#64748B] min-w-[80px]">
          {task.startTime} – {task.endTime}
        </span>
      ) : task.notes ? (
        <p className="text-sm text-[#334155] dark:text-slate-200 font-medium truncate">
          {task.notes.replace(/^Auto-generated: /, '')}
        </p>
      ) : null}

      {/* Priority dot */}
      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${priorityColors[task.priority]}`} />

      {/* Actions */}
      <div className="ml-auto flex gap-2">
        <button
          onClick={onDelete}
          className="text-xs px-2 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
