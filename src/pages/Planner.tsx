import { useState } from 'react'
import { usePlannerStore, type PlannerCategory, type PlannerTask } from '../store/plannerStore'
import Pomodoro from '../components/Pomodoro'

const categories: PlannerCategory[] = [
  'DSA', 'Development', 'Core Subjects', 'Revision',
  'Projects', 'Mock Interview', 'Aptitude', 'Behavioral',
]

const categoryColors: Record<PlannerCategory, string> = {
  'DSA': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  'Development': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'Core Subjects': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  'Revision': 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  'Projects': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  'Mock Interview': 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  'Aptitude': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  'Behavioral': 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-400',
  medium: 'bg-orange-400',
  high: 'bg-red-500',
}

const today = () => {
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

const parseDate = (ddmmyyyy: string) => {
  const [d, m, y] = ddmmyyyy.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const formatDate = (date: Date) => {
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
}

export default function Planner() {
  const { tasks, addTask, deleteTask, toggleStatus, updateTask } = usePlannerStore()
  const [selectedDate, setSelectedDate] = useState(today())
  const [showNotes, setShowNotes] = useState<Record<string, boolean>>({})

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
      startTime: newStart,
      endTime: newEnd,
      status: 'pending',
      priority: newPriority,
      notes: newNotes,
    })
    setNewNotes('')
  }

  const dayTasks = tasks
    .filter((t) => t.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const toggleNotes = (id: string) => {
    setShowNotes((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="glass rounded-2xl p-4 flex items-center justify-between">
        <button
          onClick={goToPrevDay}
          aria-label="Previous day"
          className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-gray-700 text-stone-700 dark:text-gray-300 text-sm hover:bg-stone-300 dark:hover:bg-gray-600 transition-colors"
        >
          ← Prev
        </button>
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-stone-900 dark:text-gray-100">
            {selectedDate}
          </span>
          {selectedDate !== today() && (
            <button
              onClick={goToToday}
              className="px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
            >
              Today
            </button>
          )}
        </div>
        <button
          onClick={goToNextDay}
          aria-label="Next day"
          className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-gray-700 text-stone-700 dark:text-gray-300 text-sm hover:bg-stone-300 dark:hover:bg-gray-600 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Quick Add Form */}
      <div role="form" aria-label="Quick add task" className="glass rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-gray-100 mb-3">
          Quick Add Task
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-400">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as PlannerCategory)}
              className="px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-stone-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-400">Start</label>
            <input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-stone-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-400">End</label>
            <input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-stone-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-400">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-stone-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-400">Notes</label>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Optional notes"
              className="px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-stone-200 dark:border-gray-700 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleAddTask}
            className="px-4 py-1.5 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600 transition-colors"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Task List */}
      {dayTasks.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-stone-400">No tasks scheduled for {selectedDate}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleStatus(task.id)}
              onDelete={() => deleteTask(task.id)}
              showNotes={!!showNotes[task.id]}
              onToggleNotes={() => toggleNotes(task.id)}
            />
          ))}
        </div>
      )}

      <Pomodoro />
    </div>
  )
}

function TaskCard({
  task,
  onToggle,
  onDelete,
  showNotes,
  onToggleNotes,
}: {
  task: PlannerTask
  onToggle: () => void
  onDelete: () => void
  showNotes: boolean
  onToggleNotes: () => void
}) {
  return (
    <div className="glass rounded-2xl p-4 flex items-start gap-3">
      {/* Status checkbox */}
      <input
        type="checkbox"
        checked={task.status === 'done'}
        onChange={onToggle}
        className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-500 focus:ring-indigo-500"
      />

      {/* Category badge */}
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[task.category]}`}>
        {task.category}
      </span>

      {/* Time range */}
      <span className="text-sm text-stone-500 dark:text-gray-400 min-w-[80px]">
        {task.startTime} – {task.endTime}
      </span>

      {/* Priority dot */}
      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${priorityColors[task.priority]}`} />

      {/* Notes toggle */}
      {task.notes && (
        <button
          onClick={onToggleNotes}
          className="text-xs text-indigo-500 hover:text-indigo-600 transition-colors"
        >
          {showNotes ? 'Hide notes' : 'Notes'}
        </button>
      )}

      {/* Expanded notes */}
      {showNotes && task.notes && (
        <p className="text-sm text-stone-600 dark:text-gray-400 mt-2 w-full">
          {task.notes}
        </p>
      )}

      {/* Actions */}
      <div className="ml-auto flex gap-2">
        <button
          onClick={() => {
            const btn = document.querySelector('[data-pomodoro-toggle]') as HTMLButtonElement
            btn?.click()
          }}
          className="text-xs px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
        >
          Pomodoro
        </button>
        <button
          onClick={onDelete}
          className="text-xs px-2 py-1 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
