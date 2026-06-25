import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { seedSubjects } from '../data/coreSubjects'

export interface Resource {
  type: 'youtube' | 'written-notes' | 'cheat-sheet' | 'practice' | 'quiz' | 'diagram' | 'official-docs'
  title: string
  url: string
  description: string
}

export interface InterviewQuestion {
  id: string
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  companies: string[]
  practiced: boolean
  favorited: boolean
  notes: string
  revisionStatus: 'new' | 'learning' | 'reviewing' | 'mastered'
}

export interface Topic {
  id: string
  name: string
  status: 'not-started' | 'learning' | 'reviewing' | 'mastered'
  confidence: 1 | 2 | 3 | 4 | 5
  revisionCount: number
  estimatedTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  interviewFrequency: 'low' | 'medium' | 'high'
  notes: string
  bookmarked: boolean
  interviewQuestions: InterviewQuestion[]
}

export interface CoreSubjectProgress {
  id: string
  name: string
  icon: string
  color: string
  chaptersCompleted: number
  totalChapters: number
  hoursStudied: number
  status: 'not-started' | 'learning' | 'completed'
  lastStudied: string | null
  topics: Topic[]
  interviewReadiness: number
  videoUrl: string
}

interface CoreSubjectsState {
  subjects: CoreSubjectProgress[]
  setSubjectStatus: (id: string, status: CoreSubjectProgress['status']) => void
  markChapter: (id: string) => void
  logHours: (id: string, hours: number) => void
  getSubject: (id: string) => CoreSubjectProgress | undefined
  updateTopicStatus: (subjectId: string, topicId: string, status: Topic['status']) => void
  updateTopicConfidence: (subjectId: string, topicId: string, confidence: Topic['confidence']) => void
  incrementTopicRevision: (subjectId: string, topicId: string) => void
  toggleTopicBookmark: (subjectId: string, topicId: string) => void
  updateTopicNotes: (subjectId: string, topicId: string, notes: string) => void
  toggleQuestionPracticed: (subjectId: string, topicId: string, questionId: string) => void
  toggleQuestionFavorite: (subjectId: string, topicId: string, questionId: string) => void
  updateQuestionNotes: (subjectId: string, topicId: string, questionId: string, notes: string) => void
  updateQuestionRevisionStatus: (subjectId: string, topicId: string, questionId: string, status: InterviewQuestion['revisionStatus']) => void
}

export const useCoreSubjectsStore = create<CoreSubjectsState>()(
  persist(
    (set, get) => ({
      subjects: seedSubjects,

      setSubjectStatus: (id, status) =>
        set(s => ({ subjects: s.subjects.map(sub => sub.id === id ? { ...sub, status, lastStudied: new Date().toISOString().slice(0, 10) } : sub) })),

      markChapter: (id) =>
        set(s => {
          const sub = s.subjects.find(x => x.id === id)
          if (!sub || sub.chaptersCompleted >= sub.totalChapters) return s
          const nc = sub.chaptersCompleted + 1
          return { subjects: s.subjects.map(x => x.id === id ? { ...x, chaptersCompleted: nc, status: nc >= x.totalChapters ? 'completed' as const : x.status, lastStudied: new Date().toISOString().slice(0, 10) } : x) }
        }),

      logHours: (id, hours) =>
        set(s => ({ subjects: s.subjects.map(x => x.id === id ? { ...x, hoursStudied: x.hoursStudied + hours, lastStudied: new Date().toISOString().slice(0, 10) } : x) })),

      getSubject: (id) => get().subjects.find(x => x.id === id),

      updateTopicStatus: (subjectId, topicId, status) =>
        set(s => ({ subjects: s.subjects.map(sub => sub.id !== subjectId ? sub : { ...sub, topics: sub.topics.map(t => t.id === topicId ? { ...t, status } : t) }) })),

      updateTopicConfidence: (subjectId, topicId, confidence) =>
        set(s => ({ subjects: s.subjects.map(sub => sub.id !== subjectId ? sub : { ...sub, topics: sub.topics.map(t => t.id === topicId ? { ...t, confidence } : t) }) })),

      incrementTopicRevision: (subjectId, topicId) =>
        set(s => ({ subjects: s.subjects.map(sub => sub.id !== subjectId ? sub : { ...sub, topics: sub.topics.map(t => t.id === topicId ? { ...t, revisionCount: t.revisionCount + 1 } : t) }) })),

      toggleTopicBookmark: (subjectId, topicId) =>
        set(s => ({ subjects: s.subjects.map(sub => sub.id !== subjectId ? sub : { ...sub, topics: sub.topics.map(t => t.id === topicId ? { ...t, bookmarked: !t.bookmarked } : t) }) })),

      updateTopicNotes: (subjectId, topicId, notes) =>
        set(s => ({ subjects: s.subjects.map(sub => sub.id !== subjectId ? sub : { ...sub, topics: sub.topics.map(t => t.id === topicId ? { ...t, notes } : t) }) })),

      toggleQuestionPracticed: (subjectId, topicId, questionId) =>
        set(s => ({ subjects: s.subjects.map(sub => sub.id !== subjectId ? sub : { ...sub, topics: sub.topics.map(t => t.id !== topicId ? t : { ...t, interviewQuestions: t.interviewQuestions.map(qq => qq.id === questionId ? { ...qq, practiced: !qq.practiced } : qq) }) }) })),

      toggleQuestionFavorite: (subjectId, topicId, questionId) =>
        set(s => ({ subjects: s.subjects.map(sub => sub.id !== subjectId ? sub : { ...sub, topics: sub.topics.map(t => t.id !== topicId ? t : { ...t, interviewQuestions: t.interviewQuestions.map(qq => qq.id === questionId ? { ...qq, favorited: !qq.favorited } : qq) }) }) })),

      updateQuestionNotes: (subjectId, topicId, questionId, notes) =>
        set(s => ({ subjects: s.subjects.map(sub => sub.id !== subjectId ? sub : { ...sub, topics: sub.topics.map(t => t.id !== topicId ? t : { ...t, interviewQuestions: t.interviewQuestions.map(qq => qq.id === questionId ? { ...qq, notes } : qq) }) }) })),

      updateQuestionRevisionStatus: (subjectId, topicId, questionId, status) =>
        set(s => ({ subjects: s.subjects.map(sub => sub.id !== subjectId ? sub : { ...sub, topics: sub.topics.map(t => t.id !== topicId ? t : { ...t, interviewQuestions: t.interviewQuestions.map(qq => qq.id === questionId ? { ...qq, revisionStatus: status } : qq) }) }) })),
    }),
    { name: 'placement-os-core-subjects' }
  )
)
