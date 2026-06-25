import { useState } from 'react'
import { usePlannerStore, type PlannerCategory, type PlannerTask } from '../store/plannerStore'
import Pomodoro from '../components/Pomodoro'

const categories: PlannerCategory[] = [
  'DSA', 'Development', 'Core Subjects', 'Revision',
  'Projects', 'Mock Interview', 'Aptitude', 'Behavioral',
]

const categoryColors: Record<PlannerCategory, string> = {
  'DSA': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  'Development': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'Core Subjects': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  'Revision': 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  'Projects': 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  'Mock Interview': 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  'Aptitude': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  'Behavioral': 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
}

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
      <div className="card-premium p-4 flex items-center justify-between">
        <button
          onClick={goToPrevDay}
          aria-label="Previous day"
          className="px-3 py-1.5 rounded-lg bg-zinc-800/50 text-zinc-300 text-sm hover:bg-zinc-700/50 transition-colors"
        >
          ← Prev
        </button>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-white">{fmt(parseDate(selectedDate))}</p>
            <p className="text-xs text-zinc-500 font-mono">{selectedDate}</p>
          </div>
          {selectedDate !== today() && (
            <button
              onClick={goToToday}
              className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors"
            >
              Today
            </button>
          )}
        </div>
        <button
          onClick={goToNextDay}
          aria-label="Next day"
          className="px-3 py-1.5 rounded-lg bg-zinc-800/50 text-zinc-300 text-sm hover:bg-zinc-700/50 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Quick Add Form */}
      <div role="form" aria-label="Quick add task" className="card-premium p-4">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-gray-100 mb-3">
          Quick Add Task
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as PlannerCategory)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">Start</label>
            <input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">End</label>
            <input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">Notes</label>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Optional notes"
              className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleAddTask}
            className="px-4 py-1.5 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Task List */}
      {dayTasks.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <p className="text-zinc-400">No tasks scheduled for {fmt(parseDate(selectedDate))}</p>
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
    <div className="card-premium p-4 flex items-start gap-3">
      {/* Status checkbox */}
      <input
        type="checkbox"
        checked={task.status === 'done'}
        onChange={onToggle}
        className="mt-1 w-4 h-4 rounded border-zinc-600 text-blue-500 focus:ring-blue-500"
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
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
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
          onClick={onDelete}
          className="text-xs px-2 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
