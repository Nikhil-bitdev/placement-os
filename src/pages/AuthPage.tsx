import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required')
      setSubmitting(false)
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setSubmitting(false)
      return
    }

    const err = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password, name || 'Student')

    if (err) {
      setError(err)
      setSubmitting(false)
      return
    }

    if (mode === 'signup') {
      await signIn(email, password)
    }

    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Placement OS</h1>
          <p className="text-sm text-[#64748B] mt-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wider mb-1">Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] dark:bg-zinc-800/50 border border-[#E2E8F0] dark:border-zinc-700/50 text-sm text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#93C5FD]"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@college.edu"
              className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] dark:bg-zinc-800/50 border border-[#E2E8F0] dark:border-zinc-700/50 text-sm text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#93C5FD]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#64748B] uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] dark:bg-zinc-800/50 border border-[#E2E8F0] dark:border-zinc-700/50 text-sm text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#93C5FD]"
            />
          </div>

          {error && (
            <p className="text-xs text-[#EF4444] text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-xs text-center text-[#64748B]">
            {mode === 'login' ? (
              <>No account? <button type="button" onClick={() => { setMode('signup'); setError('') }} className="text-[#2563EB] hover:underline">Sign up</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => { setMode('login'); setError('') }} className="text-[#2563EB] hover:underline">Sign in</button></>
            )}
          </p>
        </form>
      </motion.div>
    </div>
  )
}
