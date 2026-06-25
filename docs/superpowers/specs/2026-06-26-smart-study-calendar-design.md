# Smart Study Calendar — Design Spec

## Overview

The Calendar is the central planning hub of Placement OS. It presents a unified daily, weekly, and monthly view of the user's placement preparation, aggregating data from all other pages.

## Data Sources

| Store | Key Data | Date Format |
|---|---|---|
| `plannerStore` | `tasks[]` — date, time, category, status | `DD-MM-YYYY` |
| `leetcodeStore` | `activity[]` — problems solved, hours studied per day | `YYYY-MM-DD` |
| `leetcodeStore` | `stats` — streaks, contest data | — |
| `dsaStore` | `progress` — per-problem solve status | — |
| `roadmapStore` | `techProgress` — per-tech status/hours | — |
| `gamificationStore` | `xp`, `level`, `achievements` | — |
| `coreSubjectsStore` | (new) `progress`, `chapters`, `hoursStudied` per subject | `YYYY-MM-DD` |

## New Store: coreSubjectsStore

Lightweight Zustand + persist (key: `placement-os-core-subjects`), matching existing store patterns.

```ts
interface CoreSubjectProgress {
  subjectId: string
  subjectName: string
  chaptersCompleted: number
  totalChapters: number
  hoursStudied: number
  status: 'not-started' | 'learning' | 'completed'
  lastStudied: string | null  // ISO date
}

interface CoreSubjectsState {
  subjects: CoreSubjectProgress[]
  setSubjectStatus: (id: string, status: CoreSubjectProgress['status']) => void
  markChapter: (id: string) => void
  logHours: (id: string, hours: number) => void
  getSubject: (id: string) => CoreSubjectProgress | undefined
}
```

Seed data: OS (7 chapters), DBMS (8 chapters), Networks (6 chapters).

## Component Architecture

Single file (`src/pages/Calendar.tsx`) with inline sub-components, matching Dashboard pattern.

### Component Tree

```
CalendarLayout
├── CalendarHeader
│   ├── Month navigation (← Month Year →)
│   ├── Today button
│   ├── Search input
│   ├── View toggle (Month | Week | Agenda)
│   └── Filters row (DSA, Full Stack, LeetCode, Core Subjects, Projects)
│
├── CalendarGrid (based on active view)
│   ├── [MonthView] — 7×6 grid of DayCells
│   ├── [WeekView] — 7 columns × time slots
│   └── [AgendaView] — scrollable task list
│
├── SelectedDayDetails (slide-down panel)
│   ├── Date + Productivity Score
│   ├── Study Timeline (tasks by time slot)
│   ├── Stats row (study hours, tasks completed, leetcode solved, XP)
│   ├── Topic cards (DSA, Full Stack, LeetCode, Core Subjects)
│   ├── Quick Edit buttons
│   └── Generate Tomorrow's Plan
│
├── SmartPlanningSection
│   └── "Generate Study Plan" CTA (shown when day is empty)
│
├── StudyHeatmap (GitHub-style contribution graph, 365 days)
│
├── MonthlyAnalytics
│   ├── 4 stat cards (Study Hours, Problems, XP, Avg Productivity)
│   ├── Line chart (daily study hours)
│   ├── Bar chart (problems by category)
│   └── Pie chart (time distribution)
│
├── WeeklySummary
│   ├── 7-day bar row with labels
│   ├── Best/Worst day callout
│   └── Generate Weekly Report button
│
├── SmartInsights
│   └── Text insight cards (derived from stores)
│
└── CalendarFAB
    ├── Toggle button
    └── Quick action items (Add Task, Add Study Session, Start Pomodoro, Generate Plan)
```

## Date Normalization

```ts
// plannerStore uses DD-MM-YYYY
// leetcodeStore uses YYYY-MM-DD
// coreSubjectsStore uses YYYY-MM-DD

function toDisplay(d: Date): string        // "Mon, Jun 26"
function toPlannerKey(d: Date): string     // "DD-MM-YYYY"
function toISOKey(d: Date): string         // "YYYY-MM-DD"
function parsePlannerKey(s: string): Date  // "DD-MM-YYYY" -> Date
```

All internal state uses `Date` objects. Conversion only at store boundaries.

## Color System for Day Cells

| Color | Meaning | Condition |
|---|---|---|
| `bg-emerald-500/20` text-emerald-400 | Completed | All tasks done + goals met |
| `bg-amber-500/20` text-amber-400 | Partial | Some tasks done |
| `bg-orange-500/20` text-orange-400 | Below Goal | <50% of daily goal |
| `bg-red-500/20` text-red-400 | Missed | No tasks done, day passed |
| `bg-blue-500/20` text-blue-400 | Today | Current day |
| Transparent / `bg-zinc-800/30` | No Activity | No data |

## View States

### Month View (default)
- 7-column grid (Sun–Sat), rows for each week
- Each cell: day number + colored dot indicators for activity level
- Click selects day → opens SelectedDayDetails

### Week View
- 7 columns × hourly time slots (7 AM – 11 PM)
- Planner tasks rendered as colored blocks in their time slot
- Click on empty slot → quick add task

### Agenda View
- Chronological list of tasks + events for selected period
- Grouped by category with expand/collapse

## Filters

Filter chips at top: DSA | Full Stack | LeetCode | Core Subjects | Projects

- Toggle filters on/off
- Affects CalendarGrid, SelectedDayDetails, and MonthlyAnalytics
- "All" toggle to reset

## Empty States

- No tasks for a day: Show "No study plan" + "Generate Study Plan" CTA
- No heatmap data: "Start solving to see your activity"
- No analytics: Placeholder text with icon
- No insights: Show hardcoded welcome message

## Loading States

- All data is from Zustand stores (synchronous reads after initial load)
- No async loading needed — data is always available (stores have seed data)
- Sync from LeetCode is async (handled by leetcodeStore)

## Error States

- LeetCode activity may be empty if sync fails: silently skip leetcode data, show other available data
- coreSubjectsStore: seed data always present, no error state needed

## Animation Patterns

Consistent with existing pages:
- Page mount: `PageTransition` wrapper (fade + slide-up)
- Sub-component mount: `motion.div` with `initial={{ opacity: 0, y: 20 }}` / `animate`
- Staggered children: `transition: { delay: i * 0.05 }`
- Day cell hover: `hover:scale-105`
- Selected day panel: `AnimatePresence` with slide-down
- FAB: `AnimatePresence` with scale + fade

## Dependencies (all exist)

- `framer-motion` — animations
- `lucide-react` — icons
- `recharts` — analytics charts
- `zustand` — coreSubjectsStore
- `react-router-dom` — navigation
- Tailwind CSS — styling

## Implementation Plan

1. Create `src/store/coreSubjectsStore.ts`
2. Create `src/lib/dateUtils.ts` (date normalization)
3. Create `src/pages/Calendar.tsx` with all sub-components
4. Update `src/App.tsx` — replace Placeholder with Calendar import

## Out of Scope (for this implementation)

- Projects and Notes stores (will be added later)
- Habits and Revision (excluded as Management was removed)
- Real-time sync / WebSocket updates
- Drag-and-drop task scheduling
- Calendar export / share
