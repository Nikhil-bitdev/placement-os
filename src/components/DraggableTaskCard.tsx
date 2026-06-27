import { useState, useRef } from 'react'
import { GripVertical, CheckCircle, Circle, Copy, Trash2, Clock } from 'lucide-react'
import type { PlannerTask, PlannerCategory } from '../store/plannerStore'
import { CATEGORIES, CATEGORY_BADGES, PRIORITY_COLORS, DIFFICULTY_COLORS } from '../store/plannerStore'

const safeCategory = (cat: string) => CATEGORIES.includes(cat as any) ? cat : 'DSA'

interface DraggableTaskCardProps {
  task: PlannerTask
  index: number
  onEdit: (task: PlannerTask) => void
  onToggle: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onDragStart: (id: string, index: number) => void
  onDragEnd: () => void
  compact?: boolean
}

export default function DraggableTaskCard({
  task, index, onEdit, onToggle, onDuplicate, onDelete,
  onDragStart, onDragEnd, compact,
}: DraggableTaskCardProps) {
  const [showActions, setShowActions] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const isDone = task.status === 'done'

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
    onDragStart(task.id, index)
    const el = e.currentTarget as HTMLElement
    el.style.opacity = '0.4'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement
    el.style.opacity = '1'
    onDragEnd()
  }

  const timeDisplay = task.startTime && task.endTime
    ? `${task.startTime}–${task.endTime}`
    : task.startTime
      ? task.startTime
      : null

  const priorityDot = task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-600'

  if (compact) {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => onEdit(task)}
        className={`group flex items-center gap-1.5 px-1.5 py-1 rounded-md cursor-pointer transition-all text-[10px] ${
          isDone
            ? 'bg-[#F0FDF4] dark:bg-green-900/10 opacity-60'
            : 'bg-[#F8FAFC] dark:bg-zinc-800/30 hover:bg-[#F1F5F9] dark:hover:bg-zinc-800/50'
        } border border-[#E2E8F0] dark:border-zinc-700/30`}
      >
        <span className={`w-1 h-1 rounded-full flex-shrink-0 ${priorityDot}`} />
        <span className={`truncate flex-1 ${isDone ? 'line-through text-[#94A3B8]' : 'text-[#334155] dark:text-zinc-300'}`}>
          {task.title}
        </span>
      </div>
    )
  }

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onEdit(task)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`group relative rounded-xl border transition-all cursor-pointer ${
        isDone
          ? 'bg-[#F0FDF4] dark:bg-green-900/10 border-[#BBF7D0] dark:border-green-800/20'
          : 'bg-white dark:bg-zinc-900 border-[#E2E8F0] dark:border-zinc-700/50 hover:border-[#93C5FD] dark:hover:border-blue-500/30 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-2 p-2.5">
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task.id) }}
          className="mt-0.5 flex-shrink-0 text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors"
        >
          {isDone ? (
            <CheckCircle size={14} className="text-[#22C55E]" />
          ) : (
            <Circle size={14} />
          )}
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_BADGES[safeCategory(task.category) as PlannerCategory]}`}>
              {safeCategory(task.category)}
            </span>
            {task.priority !== 'medium' && (
              <span className={`text-[9px] px-1 py-0.5 rounded ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority}
              </span>
            )}
            <span className={`text-[9px] px-1 py-0.5 rounded ${DIFFICULTY_COLORS[task.difficulty] || ''}`}>
              {task.difficulty || 'medium'}
            </span>
          </div>

          <p className={`text-xs font-medium leading-tight ${
            isDone ? 'line-through text-[#94A3B8]' : 'text-[#0F172A] dark:text-white'
          }`}>
            {task.title || `${task.category} task`}
          </p>

          {timeDisplay && (
            <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
              <Clock size={10} />
              {timeDisplay}
            </div>
          )}
        </div>

        <div className={`flex flex-col gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="p-1 cursor-grab active:cursor-grabbing text-[#94A3B8] hover:text-[#64748B] self-center">
            <GripVertical size={14} />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(task.id) }}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#F1F5F9] dark:hover:bg-zinc-800 transition-colors"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
