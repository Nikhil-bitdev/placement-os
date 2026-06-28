import { useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { fetchPatternProgress, upsertPatternProgress } from '../../lib/supabaseSync'

export function DsaPatternSync() {
  const { user } = useAuth()
  const lastSavedRef = useRef('')

  useEffect(() => {
    if (!user) return
    fetchPatternProgress(user.id).then(rows => {
      const ids = rows.filter(r => r.solved).map(r => r.pattern_id)
      const existing = (() => {
        try { return JSON.parse(localStorage.getItem('pattern_solved_ids') || '[]') }
        catch { return [] }
      })()
      if (ids.length > 0) {
        const merged = [...new Set([...existing, ...ids])]
        localStorage.setItem('pattern_solved_ids', JSON.stringify(merged))
        lastSavedRef.current = JSON.stringify(merged)
      }
    })
  }, [user?.id])

  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      const raw = localStorage.getItem('pattern_solved_ids') || '[]'
      if (raw === lastSavedRef.current) return
      lastSavedRef.current = raw
      const ids = JSON.parse(raw)
      upsertPatternProgress(user.id, ids)
    }, 3000)
    return () => clearInterval(interval)
  }, [user?.id])

  return null
}
