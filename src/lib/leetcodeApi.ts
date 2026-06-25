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
  globalRanking: number
  contestRating: number
  activity: { date: string; level: 0 | 1 | 2 | 3 | 4; problemsSolved: number; hoursStudied: number; notes: string }[]
}

export async function fetchLeetCodeProfile(username: string): Promise<LeetCodeApiResult> {
  const profileQuery = `
    query($username:String!) {
      matchedUser(username:$username) {
        submitStats {
          acSubmissionNum { difficulty count }
          totalSubmissionNum { difficulty count }
        }
        profile { ranking }
        userCalendar { streak totalActiveDays submissionCalendar }
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

  return {
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    acceptanceRate,
    currentStreak,
    globalRanking,
    contestRating: 0,
    activity: buildActivity(calendar.submissionCalendar || '{}'),
  }
}
