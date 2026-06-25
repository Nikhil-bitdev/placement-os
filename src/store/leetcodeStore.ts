import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchLeetCodeProfile } from '../lib/leetcodeApi'

export interface ActivityDay {
  date: string
  level: 0 | 1 | 2 | 3 | 4
  problemsSolved: number
  hoursStudied: number
  notes: string
}

export interface TopicProgress {
  topic: string
  solved: number
  total: number
  confidence: number
  revisionCount: number
  lastRevised: string | null
}

export interface ProblemEntry {
  id: string
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  companyTags: string[]
  attempts: number
  solved: boolean
  timeTaken: number
  revisionCount: number
  notes: string
  favorite: boolean
  status: 'solved' | 'unsolved' | 'revision-needed'
}

export interface Badge {
  id: string
  name: string
  unlocked: boolean
  unlockedAt: string | null
}

export interface LeetCodeState {
  username: string
  isSyncing: boolean
  lastSynced: string | null
  syncError: string | null
  stats: {
    totalSolved: number
    easySolved: number
    mediumSolved: number
    hardSolved: number
    acceptanceRate: number
    currentStreak: number
    longestStreak: number
    contestRating: number
    contestPeakRating: number
    globalRanking: number
    countryRanking: number
    studyHours: number
    weeklyGoal: number
    monthlyGoal: number
    weeklyProgress: number
    monthlyProgress: number
  }
  activity: ActivityDay[]
  topicProgress: TopicProgress[]
  weakTopics: { topic: string; solved: number; total: number; confidence: number; recommended: string }[]
  studyInsights: { text: string; type: 'positive' | 'negative' | 'neutral' }[]
  contest: { rating: number; peakRating: number; attended: number; bestRank: number; worstRank: number; averageRank: number }
  problemHistory: ProblemEntry[]
  recentActivity: { type: string; text: string; date: string }[]
  badges: Badge[]
  goals: { easy: number; medium: number; hard: number }
  dailyGoalCompleted: boolean
  profile: { username: string; rating: number; contestBadge: string }
  setDailyGoalCompleted: (completed: boolean) => void
  updateStats: (updates: Partial<LeetCodeState['stats']>) => void
  addActivity: (day: ActivityDay) => void
  updateProblem: (id: string, updates: Partial<ProblemEntry>) => void
  toggleFavorite: (id: string) => void
  setUsername: (username: string) => void
  syncFromLeetCode: () => Promise<void>
}

function generateActivity(): ActivityDay[] {
  const days: ActivityDay[] = []
  const now = new Date()
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const date = d.toISOString().split('T')[0]
    const daysAgo = i
    let level: 0 | 1 | 2 | 3 | 4 = 0
    let problemsSolved = 0
    let hoursStudied = 0
    const r = Math.random()
    if (daysAgo < 30 && r < 0.7) {
      level = r < 0.25 ? 1 : r < 0.45 ? 2 : r < 0.6 ? 3 : 4
      problemsSolved = level === 1 ? Math.ceil(Math.random() * 2) : level === 2 ? Math.ceil(Math.random() * 3) + 1 : level === 3 ? Math.ceil(Math.random() * 4) + 2 : Math.ceil(Math.random() * 5) + 3
      hoursStudied = Math.round((problemsSolved * (0.5 + Math.random() * 1.5)) * 10) / 10
    } else if (daysAgo < 90 && r < 0.4) {
      level = r < 0.2 ? 1 : r < 0.3 ? 2 : 3
      problemsSolved = level === 1 ? Math.ceil(Math.random() * 2) : level === 2 ? Math.ceil(Math.random() * 3) + 1 : Math.ceil(Math.random() * 4) + 2
      hoursStudied = Math.round((problemsSolved * (0.5 + Math.random() * 1.5)) * 10) / 10
    } else if (r < 0.15) {
      level = r < 0.08 ? 1 : 2
      problemsSolved = level === 1 ? 1 : Math.ceil(Math.random() * 2) + 1
      hoursStudied = Math.round((problemsSolved * (0.5 + Math.random() * 1.5)) * 10) / 10
    }
    days.push({ date, level, problemsSolved, hoursStudied, notes: '' })
  }
  return days
}

const topics = [
  'Arrays', 'Strings', 'Binary Search', 'Linked List', 'Stack', 'Queue',
  'Trees', 'BST', 'Heap', 'Graphs', 'Greedy', 'Sliding Window',
  'Two Pointer', 'Backtracking', 'Dynamic Programming', 'Bit Manipulation',
  'Tries', 'Segment Tree', 'DSU', 'LCA', 'Sorting', 'Recursion', 'Advanced DP',
]

function generateTopicProgress(): TopicProgress[] {
  return topics.map(topic => {
    const total = topic === 'Arrays' ? 48 : topic === 'Strings' ? 32 : topic === 'Dynamic Programming' ? 42 :
      topic === 'Graphs' ? 38 : topic === 'Trees' ? 28 : topic === 'BST' ? 22 : topic === 'Binary Search' ? 20 :
        topic === 'Linked List' ? 25 : topic === 'Stack' ? 18 : topic === 'Queue' ? 16 : topic === 'Heap' ? 18 :
          topic === 'Greedy' ? 22 : topic === 'Sliding Window' ? 16 : topic === 'Two Pointer' ? 14 :
            topic === 'Backtracking' ? 20 : topic === 'Bit Manipulation' ? 15 : topic === 'Tries' ? 14 :
              topic === 'Segment Tree' ? 12 : topic === 'DSU' ? 10 : topic === 'LCA' ? 10 :
                topic === 'Sorting' ? 15 : topic === 'Recursion' ? 20 : 24
    const solved = Math.round(total * (0.1 + Math.random() * 0.7))
    const confidence = Math.round(Math.max(10, solved / total * 100 + (Math.random() * 20 - 10)))
    const revisionCount = Math.round(Math.random() * 8)
    const daysAgo = Math.round(Math.random() * 60)
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    return { topic, solved: Math.min(solved, total), total, confidence: Math.min(100, Math.max(5, confidence)), revisionCount, lastRevised: daysAgo < 180 ? d.toISOString().split('T')[0] : null }
  })
}

function generateWeakTopics(tp: TopicProgress[]) {
  return tp
    .filter(t => t.confidence < 60 || t.solved / t.total < 0.4)
    .slice(0, 6)
    .map(t => ({
      topic: t.topic,
      solved: t.solved,
      total: t.total,
      confidence: t.confidence,
      recommended: `Solve ${Math.max(3, Math.round(t.total * 0.3 - t.solved))} more ${t.topic} problems.`,
    }))
}

function generateInsights(tp: TopicProgress[], stats: LeetCodeState['stats']) {
  const ins: { text: string; type: 'positive' | 'negative' | 'neutral' }[] = []
  const easyPct = stats.totalSolved > 0 ? stats.easySolved / stats.totalSolved : 0
  const mediumPct = stats.totalSolved > 0 ? stats.mediumSolved / stats.totalSolved : 0
  if (mediumPct > easyPct) ins.push({ text: 'You solve more Medium than Easy problems. Great challenge level!', type: 'positive' })
  const weak = tp.filter(t => t.confidence < 40)
  if (weak.length > 0) {
    weak.slice(0, 2).forEach(t => ins.push({ text: `Your ${t.topic} success rate is only ${t.confidence}%.`, type: 'negative' }))
  }
  const dp = tp.find(t => t.topic === 'Dynamic Programming')
  if (dp && dp.lastRevised) {
    const daysSince = Math.floor((Date.now() - new Date(dp.lastRevised).getTime()) / 86400000)
    if (daysSince > 7) ins.push({ text: `Dynamic Programming has not been revised in ${daysSince} days.`, type: 'negative' })
  }
  if (stats.currentStreak > 3) ins.push({ text: `Your solving consistency streak is ${stats.currentStreak} days. Keep going!`, type: 'positive' })
  ins.push({ text: `You've improved by ${Math.round(Math.random() * 25 + 5)}% in overall consistency this month.`, type: 'positive' })
  const best = tp.reduce((a, b) => a.confidence > b.confidence ? a : b)
  ins.push({ text: `${best.topic} is your strongest topic at ${best.confidence}% confidence.`, type: 'positive' })
  return ins.slice(0, 5)
}

function generateProblemHistory(): ProblemEntry[] {
  const companies = ['Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Uber', 'Adobe', 'Bloomberg', 'Tesla', 'Flipkart', 'Atlassian']
  const topics = ['Arrays', 'Strings', 'Binary Search', 'Linked List', 'Stack', 'Queue', 'Trees', 'BST', 'Heap', 'Graphs', 'Greedy', 'Sliding Window', 'Two Pointer', 'Backtracking', 'Dynamic Programming', 'Bit Manipulation', 'Tries', 'Segment Tree']
  const problemPrefixes = ['Two Sum', 'Valid Parentheses', 'Merge Intervals', 'Reverse Linked List', 'Maximum Subarray', 'Binary Tree Level Order', 'LRU Cache', 'Longest Substring', '3Sum', 'Number of Islands', 'Climbing Stairs', 'Coin Change', 'Word Break', 'House Robber', 'Course Schedule', 'Pacific Atlantic', 'Serialize Tree', 'Container With Most', 'Longest Palindromic', 'Product of Array', 'Search Rotated', 'Combination Sum', 'Permutations', 'Group Anagrams', 'Kth Largest', 'Minimum Window', 'Word Search', 'Decode Ways', 'Max Profit', 'Lowest Common', 'Validate BST', 'Binary Tree Max', 'Clone Graph', 'Top K Frequent', 'Find Median', 'Alien Dictionary', 'Longest Consecutive', 'Palindrome', 'Reorder List', 'Rotate Image', 'Set Matrix Zeroes', 'Spiral Matrix', 'Jump Game', 'Unique Paths', 'Longest Increasing', 'Partition Equal', 'Edit Distance', 'Maximum Product']
  const problems: ProblemEntry[] = []
  for (let i = 0; i < 60; i++) {
    const diff = Math.random() < 0.3 ? 'easy' : Math.random() < 0.6 ? 'medium' : 'hard' as 'easy' | 'medium' | 'hard'
    const topic = topics[Math.floor(Math.random() * topics.length)]
    const prefix = problemPrefixes[i % problemPrefixes.length]
    const name = `${prefix}${i > problemPrefixes.length - 1 ? ` II` : ''}`
    const solved = Math.random() < 0.6
    const tagCount = Math.ceil(Math.random() * 3)
    const tags: string[] = []
    for (let j = 0; j < tagCount; j++) {
      const t = companies[Math.floor(Math.random() * companies.length)]
      if (!tags.includes(t)) tags.push(t)
    }
    const d = new Date()
    d.setDate(d.getDate() - Math.round(Math.random() * 180))
    problems.push({
      id: `lc-${i}`,
      name,
      difficulty: diff,
      topic,
      companyTags: tags,
      attempts: solved ? Math.ceil(Math.random() * 3) : Math.ceil(Math.random() * 5) + 1,
      solved,
      timeTaken: solved ? Math.round(Math.random() * 60 + 15) : Math.round(Math.random() * 120 + 30),
      revisionCount: solved ? Math.round(Math.random() * 4) : 0,
      notes: solved && Math.random() > 0.5 ? 'Good problem for understanding ' + topic.toLowerCase() : '',
      favorite: Math.random() > 0.85,
      status: solved ? 'solved' as const : 'unsolved' as const,
    })
  }
  return problems
}

function generateRecentActivity(): { type: string; text: string; date: string }[] {
  const activities = [
    { type: 'solve', text: 'Solved Two Sum (Easy)', date: '' },
    { type: 'solve', text: 'Solved Valid Parentheses (Easy)', date: '' },
    { type: 'solve', text: 'Solved Maximum Subarray (Medium)', date: '' },
    { type: 'contest', text: 'Participated in Weekly Contest 398', date: '' },
    { type: 'streak', text: '7-day streak achieved!', date: '' },
    { type: 'badge', text: 'Unlocked 50 Problems badge', date: '' },
    { type: 'solve', text: 'Solved Number of Islands (Medium)', date: '' },
    { type: 'revision', text: 'Revised Dynamic Programming', date: '' },
  ]
  return activities.map(a => {
    const d = new Date()
    d.setDate(d.getDate() - Math.round(Math.random() * 14))
    return { ...a, date: d.toISOString().split('T')[0] }
  })
}

function generateBadges(): Badge[] {
  const badgeDefs = [
    { id: 'problems-50', name: '50 Problems Solved' },
    { id: 'problems-100', name: '100 Problems Solved' },
    { id: 'problems-200', name: '200 Problems Solved' },
    { id: 'streak-7', name: '7-Day Streak' },
    { id: 'streak-30', name: '30-Day Streak' },
    { id: 'contest-winner', name: 'Contest Winner' },
    { id: 'graph-master', name: 'Graph Master' },
    { id: 'dp-master', name: 'DP Master' },
  ]
  return badgeDefs.map((b, i) => {
    const unlocked = i < 4
    const d = new Date()
    d.setDate(d.getDate() - Math.round(Math.random() * 90))
    return { ...b, unlocked, unlockedAt: unlocked ? d.toISOString().split('T')[0] : null }
  })
}

const totalP = 187
const easyP = 58
const mediumP = 94
const hardP = 35
const streakVal = 12

const statsSeed = {
  totalSolved: totalP,
  easySolved: easyP,
  mediumSolved: mediumP,
  hardSolved: hardP,
  acceptanceRate: 67,
  currentStreak: streakVal,
  longestStreak: 23,
  contestRating: 1542,
  contestPeakRating: 1620,
  globalRanking: 187432,
  countryRanking: 8421,
  studyHours: 342,
  weeklyGoal: 15,
  monthlyGoal: 60,
  weeklyProgress: 11,
  monthlyProgress: 42,
}

function getInitialState(): LeetCodeState {
  const activity = generateActivity()
  const topicProgress = generateTopicProgress()
  const weakTopics = generateWeakTopics(topicProgress)
  const studyInsights = generateInsights(topicProgress, statsSeed)
  const problemHistory = generateProblemHistory()
  const recentActivity = generateRecentActivity()
  const badges = generateBadges()
  return {
    username: 'nikhil282',
    isSyncing: false,
    lastSynced: null,
    syncError: null,
    stats: { ...statsSeed },
    activity,
    topicProgress,
    weakTopics,
    studyInsights,
    contest: { rating: 1542, peakRating: 1620, attended: 38, bestRank: 125, worstRank: 3452, averageRank: 892 },
    problemHistory,
    recentActivity,
    badges,
    goals: { easy: 2, medium: 2, hard: 1 },
    dailyGoalCompleted: false,
    profile: { username: 'nikhil282', rating: 1542, contestBadge: 'Guardian' },
    setDailyGoalCompleted: () => {},
    updateStats: () => {},
    addActivity: () => {},
    updateProblem: () => {},
    toggleFavorite: () => {},
    setUsername: () => {},
    syncFromLeetCode: async () => {},
  }
}

export const useLeetCodeStore = create<LeetCodeState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),
      setDailyGoalCompleted: (completed: boolean) => set({ dailyGoalCompleted: completed }),
      updateStats: (updates: Partial<LeetCodeState['stats']>) => set(state => ({ stats: { ...state.stats, ...updates } })),
      addActivity: (day: ActivityDay) => set(state => {
        const idx = state.activity.findIndex(a => a.date === day.date)
        const newActivity = [...state.activity]
        if (idx >= 0) newActivity[idx] = day
        else newActivity.push(day)
        return { activity: newActivity }
      }),
      updateProblem: (id: string, updates: Partial<ProblemEntry>) => set(state => ({
        problemHistory: state.problemHistory.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      toggleFavorite: (id: string) => set(state => ({
        problemHistory: state.problemHistory.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p)
      })),
      setUsername: (username: string) => set({ username }),
      syncFromLeetCode: async () => {
        const state = get()
        set({ isSyncing: true, syncError: null })
        try {
          const data = await fetchLeetCodeProfile(state.username)
          set({
            stats: {
              ...state.stats,
              totalSolved: data.totalSolved,
              easySolved: data.easySolved,
              mediumSolved: data.mediumSolved,
              hardSolved: data.hardSolved,
              acceptanceRate: data.acceptanceRate,
              currentStreak: data.currentStreak,
              globalRanking: data.globalRanking,
            },
            activity: data.activity,
            isSyncing: false,
            lastSynced: new Date().toISOString(),
          })
        } catch (e) {
          set({
            isSyncing: false,
            syncError: e instanceof Error ? e.message : 'Failed to sync with LeetCode',
          })
        }
      },
    }),
    { name: 'placement-os-leetcode' }
  )
)
