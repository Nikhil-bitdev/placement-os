import { Routes, Route, Navigate } from 'react-router-dom'
// Layout will be built in Task 7 — for now the import will error
// This is expected and will be resolved in a later task

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full">
    <p className="text-gray-400 text-lg">{title} — Coming Soon</p>
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route element={<Placeholder title="App Shell" />}>
        <Route index element={<Navigate to="/dsa-tracker" replace />} />
        <Route path="/dsa-tracker" element={<Placeholder title="DSA Tracker" />} />
        <Route path="/roadmap" element={<Placeholder title="Full Stack Roadmap" />} />
        <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
        <Route path="/planner" element={<Placeholder title="Today's Planner" />} />
        <Route path="/calendar" element={<Placeholder title="Study Calendar" />} />
        <Route path="/projects" element={<Placeholder title="Projects" />} />
        <Route path="/subjects" element={<Placeholder title="Core Subjects" />} />
        <Route path="/leetcode" element={<Placeholder title="LeetCode" />} />
        <Route path="/contests" element={<Placeholder title="Contests" />} />
        <Route path="/revision" element={<Placeholder title="Revision" />} />
        <Route path="/notes" element={<Placeholder title="Notes" />} />
        <Route path="/habits" element={<Placeholder title="Habits" />} />
        <Route path="/statistics" element={<Placeholder title="Statistics" />} />
        <Route path="/achievements" element={<Placeholder title="Achievements" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
      </Route>
    </Routes>
  )
}
