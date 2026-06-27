import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Clock, TrendingUp, Award, ChevronDown, ChevronRight, Search,
  Bookmark, CheckCircle, Target, Heart, Circle, Play, ExternalLink, Sparkles,
  BarChart3, ArrowLeft, FileText, HelpCircle, RefreshCw, Zap, Lightbulb,
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area,
} from 'recharts'
import { useCoreSubjectsStore, type Topic, type CoreSubjectProgress, type InterviewQuestion } from '../store/coreSubjectsStore'
import { subjectOrder } from '../data/coreSubjects'

const difficultyColors: Record<string, string> = {
  easy: 'text-emerald-400 bg-emerald-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  hard: 'text-red-400 bg-red-500/10',
}

const statusColors: Record<string, string> = {
  'not-started': 'text-zinc-500 bg-zinc-800/50',
  learning: 'text-blue-400 bg-blue-500/10',
  reviewing: 'text-amber-400 bg-amber-500/10',
  mastered: 'text-emerald-400 bg-emerald-500/10',
}

const chartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700/50 rounded-xl px-3 py-2 text-xs shadow-xl">
        <p className="text-zinc-400 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-mono">{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

const companyBadgeColors: Record<string, string> = {
  Google: 'text-emerald-400 bg-emerald-500/10',
  Amazon: 'text-amber-400 bg-amber-500/10',
  Microsoft: 'text-blue-400 bg-blue-500/10',
  Meta: 'text-indigo-400 bg-indigo-500/10',
  Atlassian: 'text-purple-400 bg-purple-500/10',
  Walmart: 'text-sky-400 bg-sky-500/10',
}

function getCompanyBadge(company: string) {
  const color = companyBadgeColors[company] || 'text-zinc-300 bg-zinc-800/50'
  const emoji: Record<string, string> = {
    Google: '🟢',
    Amazon: '🟡',
    Microsoft: '🔵',
    Meta: '🟣',
    Atlassian: '🟠',
    Walmart: '🔷',
  }
  return { color, emoji: emoji[company] || '' }
}

function FrequencyBadge({ frequency, companies }: { frequency: string; companies?: string[] }) {
  if (frequency === 'high') {
    return <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-red-500/10 text-red-400 flex items-center gap-1"><Zap size={10} /> High Frequency</span>
  }
  if (frequency === 'medium') {
    return <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-500/10 text-amber-400 flex items-center gap-1">⭐ Frequently Asked</span>
  }
  return <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-zinc-800/50 text-zinc-500">Low Frequency</span>
}

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof BookOpen; label: string; value: string; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} className="text-blue-500" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      </div>
      <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">{value}</p>
      {sub && <p className="text-[10px] text-zinc-400 mt-0.5">{sub}</p>}
    </motion.div>
  )
}

function ProgressRing({ pct, size = 48, strokeWidth = 3, color }: { pct: number; size?: number; strokeWidth?: number; color?: string }) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - pct / 100)
  const stroke = color || (pct >= 80 ? '#16A34A' : pct >= 50 ? '#2563EB' : pct >= 20 ? '#D97706' : '#DC2626')
  return (
    <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-[#E2E8F0] dark:stroke-zinc-700" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
    </svg>
  )
}

function InterviewQuestionCard({
  question, subjectId, topicId,
}: {
  question: InterviewQuestion
  subjectId: string; topicId: string
}) {
  const store = useCoreSubjectsStore()
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/20">
      <button onClick={() => store.toggleQuestionPracticed(subjectId, topicId, question.id)} className="mt-0.5">
        <CheckCircle size={14} className={question.practiced ? 'text-emerald-400' : 'text-zinc-600'} />
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-xs ${question.practiced ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>{question.question}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${difficultyColors[question.difficulty]}`}>{question.difficulty}</span>
          {question.companies.slice(0, 3).map(c => {
            const badge = getCompanyBadge(c)
            return (
              <span key={c} className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${badge.color}`}>
                {badge.emoji} {c}
              </span>
            )
          })}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => store.toggleQuestionFavorite(subjectId, topicId, question.id)}>
          <Heart size={12} className={question.favorited ? 'text-red-400' : 'text-zinc-600 hover:text-zinc-400'} />
        </button>
        <button onClick={() => store.updateQuestionRevisionStatus(
          subjectId, topicId, question.id,
          question.revisionStatus === 'new' ? 'learning' : question.revisionStatus === 'learning' ? 'reviewing' : question.revisionStatus === 'reviewing' ? 'mastered' : 'new'
        )} className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${statusColors[question.revisionStatus]}`}>
          {question.revisionStatus}
        </button>
      </div>
    </div>
  )
}

function TopicCard({ topic, subjectId }: { topic: Topic; subjectId: string }) {
  const store = useCoreSubjectsStore()
  const [expanded, setExpanded] = useState(false)
  const pct = topic.status === 'mastered' ? 100 : topic.status === 'reviewing' ? 75 : topic.status === 'learning' ? 40 : 0

  return (
    <motion.div layout className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors text-left">
        <div className="relative w-8 h-8 flex-shrink-0">
          <ProgressRing pct={pct} size={32} strokeWidth={2.5} color={topic.status === 'mastered' ? '#16A34A' : '#2563EB'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{topic.name}</p>
            {topic.bookmarked && <Bookmark size={10} className="text-blue-400 fill-blue-400" />}
            <FrequencyBadge frequency={topic.interviewFrequency} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[topic.status]}`}>{topic.status.replace('-', ' ')}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${difficultyColors[topic.difficulty]}`}>{topic.difficulty}</span>
            <span className="text-[10px] text-zinc-500">{topic.estimatedTime}min</span>
            {topic.revisionCount > 0 && <span className="text-[10px] text-amber-400">Rev x{topic.revisionCount}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 ml-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <Circle key={i} size={5} className={i <= topic.confidence ? 'text-blue-400 fill-blue-400' : 'text-zinc-600'} />
            ))}
          </div>
          <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-3">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => store.updateTopicStatus(subjectId, topic.id, topic.status === 'not-started' ? 'learning' : topic.status === 'learning' ? 'reviewing' : topic.status === 'reviewing' ? 'mastered' : 'learning')}
                  className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-colors">
                  {topic.status === 'not-started' ? 'Start Learning' : topic.status === 'learning' ? 'Mark Reviewing' : topic.status === 'reviewing' ? 'Mark Mastered' : 'Re-learn'}
                </button>
                <button onClick={() => store.incrementTopicRevision(subjectId, topic.id)}
                  className="px-3 py-1 rounded-lg bg-zinc-800/50 text-zinc-400 text-xs hover:bg-zinc-700/50 transition-colors">
                  Revision ({topic.revisionCount})
                </button>
                <button onClick={() => store.toggleTopicBookmark(subjectId, topic.id)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors ${topic.bookmarked ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'}`}>
                  {topic.bookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-500 mr-1">Conf:</span>
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} onClick={() => store.updateTopicConfidence(subjectId, topic.id, i as 1|2|3|4|5)}
                      className={`w-5 h-5 rounded-full text-[9px] font-mono transition-all ${i <= topic.confidence ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800/50 text-zinc-600'}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {topic.interviewQuestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-300 mb-2">Interview Questions ({topic.interviewQuestions.length})</p>
                  <div className="space-y-1.5">
                    {topic.interviewQuestions.map(qq => (
                      <InterviewQuestionCard key={qq.id} question={qq} subjectId={subjectId} topicId={topic.id} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-zinc-300 mb-1.5">Notes</p>
                <textarea
                  value={topic.notes}
                  onChange={e => store.updateTopicNotes(subjectId, topic.id, e.target.value)}
                  placeholder="Add your notes..."
                  className="w-full h-16 px-3 py-2 rounded-lg bg-zinc-800/30 border border-zinc-700/50 text-xs text-zinc-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-600"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SubjectCard({ subject, onSelect }: { subject: CoreSubjectProgress; onSelect: () => void }) {
  const totalTopics = subject.topics.length
  const mastered = subject.topics.filter(t => t.status === 'mastered').length
  const inProgress = subject.topics.filter(t => t.status === 'learning' || t.status === 'reviewing').length
  const pct = totalTopics > 0 ? Math.round((mastered / totalTopics) * 100) : 0
  const revisionDue = subject.topics.filter(t => t.revisionCount > 0 && t.status !== 'mastered').length
  const totalTime = subject.topics.reduce((s, t) => s + t.estimatedTime, 0)

  return (
    <motion.button
      layout
      onClick={onSelect}
      className="relative w-full text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] p-5 hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="relative w-14 h-14 flex-shrink-0">
          <ProgressRing pct={pct} size={56} strokeWidth={3.5} color={subject.color} />
          <div className="absolute inset-0 flex items-center justify-center text-xl">{subject.icon}</div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-mono font-semibold ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-blue-400' : pct >= 20 ? 'text-amber-400' : 'text-red-400'}`}>
            {pct}%
          </span>
        </div>
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1">{subject.name}</h3>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-500 mb-3">
        <span>{mastered}/{totalTopics} topics</span>
        {inProgress > 0 && <span>{inProgress} in progress</span>}
        <span>{totalTime}min total</span>
        {revisionDue > 0 && <span className="text-amber-400">{revisionDue} need revision</span>}
      </div>
      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: subject.color }} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <Clock size={11} />
          <span>{subject.hoursStudied}h studied</span>
        </div>
        <div className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Continue Learning →
        </div>
      </div>
    </motion.button>
  )
}

function SubjectDetail({
  subject,
  activeTab,
  onTabChange,
  onBack,
  search,
}: {
  subject: CoreSubjectProgress
  activeTab: string
  onTabChange: (tab: string) => void
  onBack: () => void
  search: string
}) {
  const totalTopics = subject.topics.length
  const mastered = subject.topics.filter(t => t.status === 'mastered').length
  const inProgress = subject.topics.filter(t => t.status === 'learning' || t.status === 'reviewing').length
  const pct = totalTopics > 0 ? Math.round((mastered / totalTopics) * 100) : 0

  const tabs = [
    { id: 'topics', label: 'Topics', icon: BookOpen },
    { id: 'questions', label: 'Questions', icon: HelpCircle },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'revision', label: 'Revision', icon: RefreshCw },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft size={18} className="text-zinc-400" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{subject.icon}</span>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{subject.name}</h2>
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span>{mastered}/{totalTopics} topics mastered</span>
              <span>{subject.hoursStudied}h studied</span>
              <span className={`font-mono font-semibold ${pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                {pct}% readiness
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-blue-500'
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="min-h-[300px]">
        {activeTab === 'topics' && <TopicsTab subject={subject} search={search} />}
        {activeTab === 'questions' && <QuestionsTab subject={subject} />}
        {activeTab === 'resources' && <ResourcesTab subject={subject} />}
        {activeTab === 'revision' && <RevisionTab subject={subject} />}
        {activeTab === 'analytics' && <AnalyticsTab subject={subject} />}
      </div>
    </motion.div>
  )
}

function TopicsTab({ subject, search }: { subject: CoreSubjectProgress; search: string }) {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredTopics = useMemo(() => {
    let topics = subject.topics
    if (search) {
      const q = search.toLowerCase()
      topics = topics.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.interviewQuestions.some(qq => qq.question.toLowerCase().includes(q))
      )
    }
    if (statusFilter !== 'all') {
      topics = topics.filter(t => t.status === statusFilter)
    }
    return topics
  }, [subject.topics, search, statusFilter])

  const filters = ['all', 'not-started', 'learning', 'reviewing', 'mastered']

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              statusFilter === f
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-zinc-800/30 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('-', ' ')}
          </button>
        ))}
      </div>
      {filteredTopics.length === 0 ? (
        <p className="text-xs text-zinc-500 py-8 text-center">No topics match your filters</p>
      ) : (
        <div className="space-y-1.5">
          {filteredTopics.map(topic => (
            <TopicCard key={topic.id} topic={topic} subjectId={subject.id} />
          ))}
        </div>
      )}
    </div>
  )
}

function QuestionsTab({ subject }: { subject: CoreSubjectProgress }) {
  const allQuestions = useMemo(() => {
    const qs: { question: InterviewQuestion; topicName: string; topicId: string }[] = []
    for (const t of subject.topics) {
      for (const q of t.interviewQuestions) {
        qs.push({ question: q, topicName: t.name, topicId: t.id })
      }
    }
    return qs.sort((a, b) => a.question.difficulty === 'hard' ? -1 : 1)
  }, [subject.topics])

  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')

  const filtered = filter === 'all' ? allQuestions : allQuestions.filter(q => q.question.difficulty === filter)

  const difficultyFilters = ['all', 'easy', 'medium', 'hard']

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">{filtered.length} questions</p>
        <div className="flex gap-1">
          {difficultyFilters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                filter === f ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-xs text-zinc-500 py-8 text-center">No questions yet</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(q => (
            <div key={q.question.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/20">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-200">{q.question.question}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-zinc-800 text-zinc-500">{q.topicName}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${difficultyColors[q.question.difficulty]}`}>{q.question.difficulty}</span>
                  {q.question.companies.slice(0, 3).map(c => (
                    <span key={c} className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-zinc-800 text-zinc-500">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ResourcesTab({ subject }: { subject: CoreSubjectProgress }) {
  return (
    <div className="space-y-3">
      <a
        href={subject.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors group"
      >
        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <Play size={20} className="text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">One Shot: {subject.name}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Complete placement preparation video on YouTube</p>
        </div>
        <ExternalLink size={16} className="text-zinc-500 flex-shrink-0" />
      </a>

      {subject.topics.filter(t => t.interviewQuestions.length > 0).length > 0 && (
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Topics with Practice Questions</h3>
          <div className="space-y-1.5">
            {subject.topics.filter(t => t.interviewQuestions.length > 0).slice(0, 8).map(t => (
              <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/20 text-xs">
                <span className="text-zinc-300">{t.name}</span>
                <span className="text-zinc-500">{t.interviewQuestions.length} questions</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Practice Tips</h3>
        <ul className="space-y-2 text-xs text-zinc-400">
          <li className="flex items-start gap-2">
            <Lightbulb size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
            Focus on mastering high-frequency topics first — they appear in most interviews
          </li>
          <li className="flex items-start gap-2">
            <Lightbulb size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
            Pair each topic with a LeetCode problem for hands-on practice
          </li>
          <li className="flex items-start gap-2">
            <Lightbulb size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
            Revise each topic at least 3 times for long-term retention
          </li>
        </ul>
      </div>
    </div>
  )
}

function RevisionTab({ subject }: { subject: CoreSubjectProgress }) {
  const overdue = useMemo(() => {
    return subject.topics
      .filter(t => t.revisionCount > 0 && t.status !== 'mastered')
      .sort((a, b) => b.revisionCount - a.revisionCount)
  }, [subject.topics])

  const notStarted = useMemo(() => {
    return subject.topics.filter(t => t.status === 'not-started')
  }, [subject.topics])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
          <p className="text-2xl font-bold font-mono text-amber-400">{overdue.length}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Need Revision</p>
        </div>
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
          <p className="text-2xl font-bold font-mono text-blue-400">{notStarted.length}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Not Started</p>
        </div>
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
          <p className="text-2xl font-bold font-mono text-emerald-400">{subject.topics.filter(t => t.status === 'mastered').length}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Mastered</p>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Topics Due for Revision</h3>
          <div className="space-y-1.5">
            {overdue.map(t => (
              <div key={t.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-500/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-200">{t.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${difficultyColors[t.difficulty]}`}>{t.difficulty}</span>
                </div>
                <span className="text-amber-400 font-mono">Rev x{t.revisionCount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {notStarted.length > 0 && (
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Still Not Started</h3>
          <div className="space-y-1.5">
            {notStarted.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/20 text-xs">
                <span className="text-zinc-400">{t.name}</span>
                <span className="text-zinc-500">{t.estimatedTime}min</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AnalyticsTab({ subject }: { subject: CoreSubjectProgress }) {
  const store = useCoreSubjectsStore()

  const completionData = useMemo(() => {
    return [{
      name: subject.name.split(' ')[0],
      mastered: subject.topics.filter(t => t.status === 'mastered').length,
      learning: subject.topics.filter(t => t.status === 'learning').length,
      reviewing: subject.topics.filter(t => t.status === 'reviewing').length,
      notStarted: subject.topics.filter(t => t.status === 'not-started').length,
    }]
  }, [subject])

  const confidenceData = useMemo(() => {
    const dist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    for (const t of subject.topics) {
      dist[String(t.confidence)]++
    }
    return Object.entries(dist).map(([level, count]) => ({ level: `L${level}`, count }))
  }, [subject])

  const difficultyDist = useMemo(() => {
    const d: Record<string, number> = { easy: 0, medium: 0, hard: 0 }
    for (const t of subject.topics) {
      d[t.difficulty]++
    }
    return Object.entries(d).map(([name, value]) => ({ name, value }))
  }, [subject])

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EAB308', '#06B6D4', '#F43F5E', '#6366F1', '#EC4899']

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Mastered</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{subject.topics.filter(t => t.status === 'mastered').length}</p>
        </div>
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Learning</p>
          <p className="text-2xl font-bold font-mono text-blue-400 mt-1">{subject.topics.filter(t => t.status === 'learning').length}</p>
        </div>
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Not Started</p>
          <p className="text-2xl font-bold font-mono text-zinc-400 mt-1">{subject.topics.filter(t => t.status === 'not-started').length}</p>
        </div>
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Avg Confidence</p>
          <p className="text-2xl font-bold font-mono text-blue-400 mt-1">
            {subject.topics.length > 0 ? (subject.topics.reduce((s, t) => s + t.confidence, 0) / subject.topics.length).toFixed(1) : '0'}/5
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-40 bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">Status Breakdown</p>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-[#E2E8F0] dark:stroke-zinc-700" />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} />
              <YAxis stroke="#a1a1aa" fontSize={10} />
              <Tooltip content={chartTooltip} />
              <Bar dataKey="mastered" name="Mastered" stackId="a" fill="#16A34A" radius={[0, 0, 0, 0]} />
              <Bar dataKey="learning" name="Learning" stackId="a" fill="#2563EB" />
              <Bar dataKey="reviewing" name="Reviewing" stackId="a" fill="#D97706" />
              <Bar dataKey="notStarted" name="Not Started" stackId="a" fill="#71717A" radius={[0, 0, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-40 bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">Confidence</p>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-[#E2E8F0] dark:stroke-zinc-700" />
              <XAxis dataKey="level" stroke="#a1a1aa" fontSize={10} />
              <YAxis stroke="#a1a1aa" fontSize={10} />
              <Tooltip content={chartTooltip} />
              <Area type="monotone" dataKey="count" className="stroke-[#2563EB] dark:stroke-blue-500" fill="#2563EB" fillOpacity={0.2} name="Topics" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="h-40 bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">Difficulty</p>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={difficultyDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={35} stroke="none">
                {difficultyDist.map((entry, i) => (
                  <Cell key={i} fill={i === 0 ? '#16A34A' : i === 1 ? '#D97706' : '#DC2626'} />
                ))}
              </Pie>
              <Tooltip content={chartTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function SmartRevision() {
  const store = useCoreSubjectsStore()
  const overdue = useMemo(() => {
    const items: { subjectName: string; topicName: string; daysSinceRevision: number; icon: string }[] = []
    for (const sub of store.subjects) {
      for (const t of sub.topics) {
        if (t.revisionCount > 0 && t.status !== 'mastered') {
          const days = Math.min(t.revisionCount * 7, 30)
          items.push({ subjectName: sub.name, topicName: t.name, daysSinceRevision: days, icon: sub.icon })
        }
      }
    }
    return items.sort((a, b) => b.daysSinceRevision - a.daysSinceRevision).slice(0, 5)
  }, [store.subjects])

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-blue-500" />
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Smart Revision</h2>
      </div>
      {overdue.length === 0 ? (
        <p className="text-xs text-zinc-500">No revisions due. Keep learning!</p>
      ) : (
        <div className="space-y-2">
          {overdue.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex-shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-zinc-200 truncate">{item.topicName}</p>
                  <p className="text-zinc-500 text-[10px] truncate">{item.subjectName}</p>
                </div>
              </div>
              <span className="text-amber-400 font-mono flex-shrink-0">{item.daysSinceRevision}d</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function InterviewReadiness() {
  const store = useCoreSubjectsStore()
  const read = useMemo(() => {
    let totalTopics = 0
    let masteredTopics = 0
    let totalConfidence = 0
    let totalRevisions = 0
    const subjects: { name: string; icon: string; readiness: number; color: string }[] = []
    for (const sub of store.subjects) {
      const t = sub.topics.length
      const m = sub.topics.filter(x => x.status === 'mastered').length
      const conf = sub.topics.reduce((s, x) => s + x.confidence, 0)
      const rev = sub.topics.reduce((s, x) => s + x.revisionCount, 0)
      totalTopics += t
      masteredTopics += m
      totalConfidence += conf
      totalRevisions += rev
      subjects.push({ name: sub.name, icon: sub.icon, color: sub.color, readiness: t > 0 ? Math.round((m / t) * 100) : 0 })
    }
    const strongest = subjects.reduce((best, s) => s.readiness > best.readiness ? s : best)
    const weakest = subjects.reduce((worst, s) => s.readiness < worst.readiness ? s : worst)
    return { overall: totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0, avgConfidence: totalTopics > 0 ? Math.round(totalConfidence / totalTopics) : 0, subjects, strongest, weakest, totalRevisions, masteredTopics, totalTopics }
  }, [store.subjects])

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Target size={16} className="text-blue-500" />
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Interview Readiness</h2>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-16 h-16">
          <ProgressRing pct={read.overall} size={64} strokeWidth={4} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold font-mono ${read.overall >= 70 ? 'text-emerald-400' : read.overall >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
              {read.overall}%
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-zinc-500">
          <p className="text-zinc-300 text-sm font-semibold">{read.avgConfidence}/5 <span className="text-zinc-500 font-normal text-xs">avg conf</span></p>
          <p className="mt-0.5">{read.totalRevisions} total revisions</p>
          <p className="mt-0.5">{read.masteredTopics} / {read.totalTopics} topics</p>
        </div>
      </div>
      <div className="space-y-1.5 mb-3">
        {read.subjects.map(s => (
          <div key={s.name} className="flex items-center gap-2 text-xs">
            <span className="text-sm w-5 text-center flex-shrink-0">{s.icon}</span>
            <span className="text-zinc-400 w-20 truncate flex-shrink-0 text-[10px]">{s.name.split(' ')[0]}</span>
            <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${s.readiness}%`, backgroundColor: s.color }} />
            </div>
            <span className="font-mono text-[10px] w-8 text-right" style={{ color: s.color }}>{s.readiness}%</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="px-2.5 py-2 rounded-lg bg-emerald-500/10">
          <p className="text-emerald-400 font-medium text-[10px]">Strongest</p>
          <p className="text-zinc-300 text-[10px] mt-0.5 truncate">{read.strongest.icon} {read.strongest.name.split(' ')[0]}</p>
        </div>
        <div className="px-2.5 py-2 rounded-lg bg-red-500/10">
          <p className="text-red-400 font-medium text-[10px]">Weakest</p>
          <p className="text-zinc-300 text-[10px] mt-0.5 truncate">{read.weakest.icon} {read.weakest.name.split(' ')[0]}</p>
        </div>
      </div>
    </div>
  )
}

export default function CoreSubjects() {
  const store = useCoreSubjectsStore()
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('topics')
  const [search, setSearch] = useState('')

  const selectedSubject = selectedSubjectId ? store.subjects.find(s => s.id === selectedSubjectId) ?? null : null

  const sortedSubjects = useMemo(() => {
    const ordered = [...store.subjects].sort((a, b) => subjectOrder.indexOf(a.id as any) - subjectOrder.indexOf(b.id as any))
    if (!search) return ordered
    const q = search.toLowerCase()
    return ordered.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.topics.some(t => t.name.toLowerCase().includes(q) ||
        t.interviewQuestions.some(qq => qq.question.toLowerCase().includes(q)))
    )
  }, [store.subjects, search])

  const stats = useMemo(() => {
    let totalTopics = 0, masteredTopics = 0, revisions = 0
    for (const sub of store.subjects) {
      for (const t of sub.topics) {
        totalTopics++
        if (t.status === 'mastered') masteredTopics++
        revisions += t.revisionCount
      }
    }
    const completedSubjects = store.subjects.filter(s => s.status === 'completed').length
    return { totalTopics, masteredTopics, revisions, completedSubjects }
  }, [store.subjects])

  const revisionDueCount = useMemo(() => {
    let count = 0
    for (const sub of store.subjects) {
      for (const t of sub.topics) {
        if (t.revisionCount > 0 && t.status !== 'mastered') count++
      }
    }
    return count
  }, [store.subjects])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#18181B] rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Core Subjects</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Interview Preparation Hub</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search subjects, topics, questions..."
                className="w-56 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-lg pl-7 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-400"
              />
            </div>
            {selectedSubjectId && (
              <button onClick={() => { setSelectedSubjectId(null); setActiveTab('topics') }}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 text-xs font-medium transition-colors">
                All Subjects
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
          <StatCard icon={BookOpen} label="Subjects" value={`${stats.completedSubjects}/${store.subjects.length}`} sub="completed" />
          <StatCard icon={Award} label="Topics Mastered" value={`${stats.masteredTopics}/${stats.totalTopics}`} />
          <StatCard icon={TrendingUp} label="Revisions" value={`${stats.revisions}`} />
          <StatCard icon={Target} label="Readiness" value={`${stats.totalTopics > 0 ? Math.round((stats.masteredTopics / stats.totalTopics) * 100) : 0}%`} />
          <StatCard icon={BarChart3} label="Avg Confidence" value={`${stats.totalTopics > 0 ? Math.round(store.subjects.reduce((s, sub) => s + sub.topics.reduce((a, t) => a + t.confidence, 0), 0) / stats.totalTopics) : 0}/5`} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {selectedSubject ? (
            <SubjectDetail
              subject={selectedSubject}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onBack={() => { setSelectedSubjectId(null); setActiveTab('topics') }}
              search={search}
            />
          ) : sortedSubjects.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 bg-white dark:bg-[#18181B] rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <Search size={32} className="mx-auto text-zinc-700 mb-3" />
              <p className="text-sm">No subjects match your search</p>
              <button onClick={() => setSearch('')} className="mt-2 text-xs text-blue-400 hover:underline">Clear search</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedSubjects.map((subject, i) => (
                <motion.div key={subject.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <SubjectCard subject={subject} onSelect={() => { setSelectedSubjectId(subject.id); setActiveTab('topics') }} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <InterviewReadiness />
          <SmartRevision />
        </div>
      </div>
    </div>
  )
}
