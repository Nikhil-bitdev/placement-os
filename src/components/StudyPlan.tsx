import { useState, useMemo } from 'react'
import { Sparkles, CheckCircle, Square, Code2, BookOpen, TrendingUp, Clock, ListChecks } from 'lucide-react'
import { useDSAStore } from '../store/dsaStore'
import { useRoadmapStore } from '../store/roadmapStore'
import { useCoreSubjectsStore } from '../store/coreSubjectsStore'
import { usePlannerStore } from '../store/plannerStore'
import allSections from '../data/dsa'
import roadmapTechs from '../data/roadmap'
import type { PlannerCategory } from '../store/plannerStore'

function getTodayStr(): string {
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

interface Suggestion {
  id: string
  category: PlannerCategory
  title: string
  description: string
}

const categoryColors: Record<PlannerCategory, string> = {
  DSA: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  'Full Stack': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'Core Subjects': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Projects: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  Revision: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  Contest: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  Interview: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  Resume: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
}

export default function StudyPlan() {
  const today = getTodayStr()
  const dsaProgress = useDSAStore(s => s.progress)
  const { getProgress } = useRoadmapStore()
  const techProgress = useRoadmapStore(s => s.techProgress)
  const subjects = useCoreSubjectsStore(s => s.subjects)
  const addTask = usePlannerStore(s => s.addTask)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  const suggestions = useMemo(() => {
    const result: Suggestion[] = []

    const problemMap: Record<string, { name: string; section: string }> = {}
    const unsolved = { easy: [] as string[], medium: [] as string[], hard: [] as string[] }

    for (const section of allSections) {
      for (const problem of section.problems) {
        problemMap[problem.id] = { name: problem.name, section: section.title }
        const p = dsaProgress[problem.id]
        if (!p?.solved) {
          unsolved[problem.difficulty].push(problem.id)
        }
      }
    }

    const pick = (arr: string[], n: number) => arr.slice(0, Math.min(arr.length, n))

    for (const id of pick(unsolved.easy, 2)) {
      const p = problemMap[id]
      if (!p) continue
      result.push({ id: `dsa-easy-${id}`, category: 'DSA', title: p.name, description: `${p.section} · Easy` })
    }

    for (const id of pick(unsolved.medium, 2)) {
      const p = problemMap[id]
      if (!p) continue
      result.push({ id: `dsa-medium-${id}`, category: 'DSA', title: p.name, description: `${p.section} · Medium` })
    }

    for (const id of pick(unsolved.hard, 1)) {
      const p = problemMap[id]
      if (!p) continue
      result.push({ id: `dsa-hard-${id}`, category: 'DSA', title: p.name, description: `${p.section} · Hard` })
    }

    const nextTech = roadmapTechs
      .filter(t => !t.isCheckpoint && getProgress(t.id).status === 'learning')
      .sort((a, b) => a.order - b.order)[0]

    if (nextTech) {
      result.push({
        id: `dev-${nextTech.id}`,
        category: 'Full Stack',
        title: `Work on ${nextTech.name}`,
        description: `1 hour · ${getProgress(nextTech.id).hoursSpent}h logged so far`,
      })
    }

    const pendingTopics: { subject: string; topic: string; freq: string }[] = []
    for (const sub of subjects) {
      for (const topic of sub.topics) {
        if (topic.status === 'learning' || topic.status === 'reviewing') {
          pendingTopics.push({ subject: sub.name, topic: topic.name, freq: topic.interviewFrequency })
        }
      }
    }
    pendingTopics.sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 }
      return (rank[a.freq as keyof typeof rank] || 2) - (rank[b.freq as keyof typeof rank] || 2)
    })

    if (pendingTopics.length > 0) {
      const top = pendingTopics[0]
      result.push({
        id: `cs-${top.subject}-${top.topic}`,
        category: 'Core Subjects',
        title: `Review ${top.topic}`,
        description: `${top.subject} · ${top.freq} frequency`,
      })
    }

    return result
  }, [dsaProgress, techProgress, subjects, getProgress])

  const allChecked = suggestions.every(s => checked.has(s.id))
  const pendingCount = suggestions.filter(s => checked.has(s.id) && !addedIds.has(s.id)).length

  const toggle = (id: string) => {
    if (addedIds.has(id)) return
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    const available = suggestions.filter(s => !addedIds.has(s.id))
    const allAvailableChecked = available.every(s => checked.has(s.id))
    if (allAvailableChecked) {
      setChecked(new Set(Array.from(checked).filter(id => addedIds.has(id))))
    } else {
      const next = new Set(checked)
      for (const s of available) next.add(s.id)
      setChecked(next)
    }
  }

  const handleCreatePlan = () => {
    for (const s of suggestions) {
      if (!checked.has(s.id) || addedIds.has(s.id)) continue
      addTask({
        date: today,
        category: s.category,
        title: s.title,
        startTime: '',
        endTime: '',
        status: 'pending',
        priority: 'medium',
        difficulty: 'medium',
        notes: `Auto-generated: ${s.title}`,
        order: 0,
      })
    }
    setAddedIds(prev => {
      const next = new Set(prev)
      for (const id of checked) next.add(id)
      return next
    })
  }

  if (suggestions.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-[#2563EB]" />
          <h2 className="section-title">Study Plan</h2>
        </div>
        <div className="text-center py-6">
          <CheckCircle size={28} className="mx-auto text-[#22C55E] mb-2" />
          <p className="text-sm text-[#64748B]">You're all set for today! No pending suggestions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-[#2563EB]" />
        <h2 className="section-title">Study Plan</h2>
        {addedIds.size > 0 && (
          <span className="text-[10px] text-[#22C55E] ml-auto">{addedIds.size} tasks added</span>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 pb-1">
          <button onClick={toggleAll} className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#334155] dark:hover:text-slate-300 transition-colors">
            {allChecked ? <CheckCircle size={12} /> : <Square size={12} />}
            {allChecked ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        {suggestions.map((s) => {
          const added = addedIds.has(s.id)
          return (
            <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              added
                ? 'bg-[#F0FDF4] dark:bg-green-900/10 border-[#BBF7D0] dark:border-green-800/30'
                : 'bg-[#F8FAFC] dark:bg-zinc-800/30 border-[#E2E8F0] dark:border-zinc-700/50'
            }`}>
              <button onClick={() => toggle(s.id)} className="flex-shrink-0" disabled={added}>
                {added ? (
                  <CheckCircle size={16} className="text-[#22C55E]" />
                ) : checked.has(s.id) ? (
                  <CheckCircle size={16} className="text-[#2563EB]" />
                ) : (
                  <Square size={16} className="text-[#94A3B8]" />
                )}
              </button>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[s.category]}`}>
                {s.category}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${added ? 'text-[#16A34A]' : 'text-[#334155] dark:text-slate-200'}`}>
                  {s.title}
                </p>
                <p className="text-[11px] text-[#64748B]">{s.description}</p>
              </div>
              {added && <span className="text-[10px] font-medium text-[#16A34A]">Added</span>}
            </div>
          )
        })}
      </div>
      {pendingCount > 0 && (
        <button
          onClick={handleCreatePlan}
          className="w-full mt-4 flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
        >
          <ListChecks size={14} />
          Add to Planner ({pendingCount} tasks)
        </button>
      )}
      {addedIds.size > 0 && pendingCount === 0 && (
        <p className="text-center text-xs text-[#64748B] mt-4">All tasks added to today's plan ✓</p>
      )}
    </div>
  )
}
