import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useGamificationStore } from '../store/gamificationStore'
import { useLeetCodeStore } from '../store/leetcodeStore'
import { useDSAStore } from '../store/dsaStore'
import { usePlannerStore } from '../store/plannerStore'
import { useRoadmapStore } from '../store/roadmapStore'
import { useCoreSubjectsStore } from '../store/coreSubjectsStore'
import { seedSubjects } from '../data/coreSubjects'

const STORAGE_KEYS = [
  'placement-os-gamification',
  'placement-os-leetcode',
  'placement-os-dsa',
  'placement-os-planner',
  'placement-os-roadmap',
  'placement-os-core-subjects',
  'placement-os-streak',
  'placement-os-streak-last',
  'placement-os-identity-skipped',
  'placement-os-achievements',
  'placement-os-quick-notes',
]

function clearStorage() {
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
}

function resetStores() {
  useGamificationStore.setState({
    xp: 0,
    level: 1,
    displayName: 'User',
    achievements: [],
  })
  useLeetCodeStore.setState({
    username: '',
    isSyncing: false,
    lastSynced: null,
    syncError: null,
    stats: {
      totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
      acceptanceRate: 0, currentStreak: 0, longestStreak: 0,
      contestRating: 0, contestPeakRating: 0, globalRanking: 0, countryRanking: 0,
      studyHours: 0, weeklyGoal: 15, monthlyGoal: 60, weeklyProgress: 0, monthlyProgress: 0,
    },
    activity: [],
    topicProgress: [],
    weakTopics: [],
    studyInsights: [],
    contest: { rating: 0, peakRating: 0, attended: 0, bestRank: 0, worstRank: 0, averageRank: 0 },
    problemHistory: [],
    recentActivity: [],
    badges: [],
    goals: { easy: 2, medium: 2, hard: 1 },
    dailyGoalCompleted: false,
    profile: { username: '', rating: 0, contestBadge: '' },
  })
  useDSAStore.setState({ progress: {}, expandedSections: {} })
  usePlannerStore.setState({ tasks: [] })
  useRoadmapStore.setState({ techProgress: {} })
  useCoreSubjectsStore.setState({ subjects: seedSubjects })
}

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, name: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let lastUserId: string | undefined

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        lastUserId = session?.user?.id
      })
      .catch(() => {
        console.warn('Supabase session check failed')
      })
      .finally(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user && session.user.id !== lastUserId) {
        clearStorage()
        resetStores()
      }
      lastUserId = session?.user?.id
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  const signUp = async (email: string, password: string, name: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    return error?.message ?? null
  }

  const signOut = async () => {
    clearStorage()
    resetStores()
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
