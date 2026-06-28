import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

type StoreApi<T> = {
  getState: () => T
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void
  subscribe: (listener: (state: T, prevState: T) => void) => () => void
}

export function useSupabaseSync<T extends Record<string, any>>(
  store: StoreApi<T>,
  config: {
    userId: string | null
    enabled: boolean
    load: (userId: string) => Promise<Partial<T> | null>
    save: (userId: string, state: T) => Promise<void>
    debounceMs?: number
  },
) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const prevStateRef = useRef<string>()

  // Load from DB on mount / user change
  useEffect(() => {
    if (!config.userId || !config.enabled) return
    config.load(config.userId).then((dbData) => {
      if (dbData) {
        store.setState(dbData)
      }
    })
  }, [config.userId, config.enabled])

  // Debounced save on every state change
  useEffect(() => {
    if (!config.userId || !config.enabled) return
    const unsub = store.subscribe((state) => {
      const serialized = JSON.stringify(state)
      if (serialized === prevStateRef.current) return
      prevStateRef.current = serialized

      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        config.save(config.userId!, state)
      }, config.debounceMs ?? 1000)
    })
    return () => {
      unsub()
      clearTimeout(timerRef.current)
    }
  }, [config.userId, config.enabled])
}
