function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function toDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function toDisplayFull(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function toPlannerKey(date: Date): string {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`
}

export function toISOKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parsePlannerKey(s: string): Date {
  const [d, m, y] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function parseISOKey(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

export function getMonthDays(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()
  const weeks: Date[][] = []
  let day = 1
  const totalDays = lastDay.getDate()
  for (let w = 0; w < 6; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      if ((w === 0 && d < startPad) || day > totalDays) {
        week.push(new Date(0))
      } else {
        week.push(new Date(year, month, day++))
      }
    }
    weeks.push(week)
    if (day > totalDays) break
  }
  return weeks
}

export function getMonthName(month: number): string {
  return new Date(2000, month, 1).toLocaleDateString('en-US', { month: 'long' })
}

export function getToday(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const diff = d.getDay()
  d.setDate(d.getDate() - diff)
  return d
}

export function endOfWeek(date: Date): Date {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 6)
  return d
}

export function getWeekDates(date: Date): Date[] {
  const start = startOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}
