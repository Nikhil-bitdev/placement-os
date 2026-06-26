const API = '/api/leetcode'

async function graphql(query: string, variables: Record<string, unknown>) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error')
  return json.data
}

function buildActivity(submissionCalendar: string) {
  let calendar: Record<string, number> = {}
  try { calendar = JSON.parse(submissionCalendar) } catch {}

  const now = Date.now()
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000
  const activity: { date: string; level: 0 | 1 | 2 | 3 | 4; problemsSolved: number; hoursStudied: number; notes: string }[] = []

  for (let d = new Date(oneYearAgo); d.getTime() <= now; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const ts = Math.floor(d.getTime() / 1000)
    const count = calendar[String(ts)] || 0
    let level: 0 | 1 | 2 | 3 | 4 = 0
    if (count > 0) level = count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4
    activity.push({ date: dateStr, level, problemsSolved: count, hoursStudied: 0, notes: '' })
  }
  return activity
}

export interface LeetCodeApiResult {
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  acceptanceRate: number
  currentStreak: number
  longestStreak: number
  globalRanking: number
  contestRating: number
  contestPeakRating: number
  attendedContests: number
  contestTopPercentage: number
  badges: { id: string; name: string; creationDate: string }[]
  profileUsername: string
  contestBadge: string
  activity: { date: string; level: 0 | 1 | 2 | 3 | 4; problemsSolved: number; hoursStudied: number; notes: string }[]
  tagProgress: { tagName: string; problemsSolved: number }[]
  recentSubmissions: { title: string; titleSlug: string; timestamp: number }[]
  weeklyActivity: { week: string; solved: number }[]
  monthlyActivity: { month: string; solved: number }[]
}

export async function fetchLeetCodeProfile(username: string): Promise<LeetCodeApiResult> {
  const profileQuery = `
    query($username:String!) {
      matchedUser(username:$username) {
        username
        submitStats {
          acSubmissionNum { difficulty count }
          totalSubmissionNum { difficulty count }
        }
        profile { ranking }
        userCalendar { streak totalActiveDays submissionCalendar }
        tagProblemCounts {
          advanced { tagName problemsSolved }
          intermediate { tagName problemsSolved }
          fundamental { tagName problemsSolved }
        }
        badges { id name creationDate }
      }
      recentAcSubmissionList(username:$username, limit:20) {
        title
        titleSlug
        timestamp
      }
      userContestRanking(username:$username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
        badge { name }
      }
    }`

  const data = await graphql(profileQuery, { username })
  const user = data.matchedUser

  if (!user) throw new Error('User not found')

  const acStats = user.submitStats?.acSubmissionNum || []
  const findCount = (d: string) => acStats.find((s: { difficulty: string }) => s.difficulty === d)?.count || 0
  const totalSolved = findCount('All')
  const easySolved = findCount('Easy')
  const mediumSolved = findCount('Medium')
  const hardSolved = findCount('Hard')

  const totalSubmissions = user.submitStats?.totalSubmissionNum || []
  const totalAttempts = totalSubmissions.find((s: { difficulty: string }) => s.difficulty === 'All')?.count || totalSolved || 1
  const acceptanceRate = totalAttempts > 0 ? Math.round((totalSolved / totalAttempts) * 100) : 0

  const calendar = user.userCalendar || {}
  const currentStreak = calendar.streak || 0
  const globalRanking = user.profile?.ranking || 0

  let submissionCal: Record<string, number> = {}
  try { submissionCal = JSON.parse(calendar.submissionCalendar || '{}') } catch {}

  const sortedDays = Object.entries(submissionCal)
    .map(([ts, count]) => ({ ts: Number(ts), count }))
    .sort((a, b) => a.ts - b.ts)

  let longestStreak = 0
  let currentRun = 0
  let prevDay: number | null = null
  for (const day of sortedDays) {
    if (day.count === 0) continue
    const date = new Date(day.ts * 1000)
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 1000
    if (prevDay !== null && dayStart - prevDay === 86400) {
      currentRun++
    } else {
      currentRun = 1
    }
    if (currentRun > longestStreak) longestStreak = currentRun
    prevDay = dayStart
  }

  const weeks: Record<string, number> = {}
  const months: Record<string, number> = {}
  for (const [ts, count] of Object.entries(submissionCal)) {
    const d = new Date(Number(ts) * 1000)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const weekStr = weekStart.toISOString().split('T')[0]
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    weeks[weekStr] = (weeks[weekStr] || 0) + count
    months[monthStr] = (months[monthStr] || 0) + count
  }
  const sortedWeeks = Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b))
  const weeklyActivity = sortedWeeks.slice(-10).map(([week, solved]) => ({ week, solved }))
  const sortedMonths = Object.entries(months).sort(([a], [b]) => a.localeCompare(b))
  const monthlyActivity = sortedMonths.slice(-12).map(([month, solved]) => ({ month, solved }))

  const tagCounts = user.tagProblemCounts || {}
  const allTags = [
    ...(tagCounts.advanced || []),
    ...(tagCounts.intermediate || []),
    ...(tagCounts.fundamental || []),
  ]
  const tagProgress = allTags.map((t: { tagName: string; problemsSolved: number }) => ({
    tagName: t.tagName,
    problemsSolved: t.problemsSolved,
  }))

  const recentSubmissions: { title: string; titleSlug: string; timestamp: number }[] =
    (data.recentAcSubmissionList || []).map((s: { title: string; titleSlug: string; timestamp: number }) => ({
      title: s.title,
      titleSlug: s.titleSlug,
      timestamp: s.timestamp,
    }))

  const contestRanking = data.userContestRanking || {}
  const badges: { id: string; name: string; creationDate: string }[] = (user.badges || []).map((b: { id: string; name: string; creationDate: string }) => ({
    id: b.id,
    name: b.name,
    creationDate: b.creationDate,
  }))

  return {
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    acceptanceRate,
    currentStreak,
    longestStreak,
    globalRanking,
    contestRating: Math.round(contestRanking.rating || 0),
    contestPeakRating: Math.round(contestRanking.rating || 0),
    attendedContests: contestRanking.attendedContestsCount || 0,
    contestTopPercentage: Math.round(contestRanking.topPercentage || 0),
    badges,
    profileUsername: user.username || '',
    contestBadge: contestRanking.badge?.name || '',
    activity: buildActivity(calendar.submissionCalendar || '{}'),
    tagProgress,
    recentSubmissions,
    weeklyActivity,
    monthlyActivity,
  }
}

export async function fetchProblemDetails(titleSlugs: string[]): Promise<Map<string, { difficulty: string; tags: string[] }>> {
  const details = new Map<string, { difficulty: string; tags: string[] }>()
  const unique = [...new Set(titleSlugs)]
  for (let i = 0; i < unique.length; i += 10) {
    const batch = unique.slice(i, i + 10)
    const results = await Promise.allSettled(batch.map(async slug => {
      const q = `query($titleSlug:String!){ question(titleSlug:$titleSlug) { difficulty topicTags { name } } }`
      const data = await graphql(q, { titleSlug: slug })
      return { slug, ...data.question }
    }))
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        details.set(r.value.slug, {
          difficulty: r.value.difficulty?.toLowerCase() || 'medium',
          tags: (r.value.topicTags || []).map((t: { name: string }) => t.name),
        })
      }
    }
  }
  return details
}
