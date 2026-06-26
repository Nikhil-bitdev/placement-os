import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Code2, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'
import { useGamificationStore } from '../store/gamificationStore'
import { useLeetCodeStore } from '../store/leetcodeStore'
import { fetchLeetCodeProfile } from '../lib/leetcodeApi'

export default function IdentityForm() {
  const { displayName, setDisplayName } = useGamificationStore()
  const { username, setUsername } = useLeetCodeStore()
  const [name, setName] = useState(displayName !== 'User' ? displayName : '')
  const [lcUsername, setLcUsername] = useState(username || '')
  const [step, setStep] = useState<'name' | 'leetcode' | 'verifying' | 'done'>(
    displayName !== 'User' && username ? 'done' : displayName !== 'User' ? 'leetcode' : 'name'
  )
  const [nameError, setNameError] = useState('')
  const [lcError, setLcError] = useState('')
  const [verifying, setVerifying] = useState(false)

  const skipKey = 'placement-os-identity-skipped'
  const [skipped, setSkipped] = useState(() => localStorage.getItem(skipKey) === 'true')

  if (skipped || step === 'done') return null

  function validateName(v: string) {
    if (!v.trim()) return 'Name is required'
    if (!/^[a-zA-Z\s'-]{2,50}$/.test(v.trim())) return 'Enter a valid name (letters only, 2-50 chars)'
    return ''
  }

  async function handleNameNext() {
    const err = validateName(name)
    if (err) { setNameError(err); return }
    setNameError('')
    setDisplayName(name.trim())
    setStep('leetcode')
  }

  async function handleLcVerify() {
    if (!lcUsername.trim()) { setLcError('LeetCode ID is required'); return }
    setLcError('')
    setVerifying(true)
    setStep('verifying')
    try {
      await fetchLeetCodeProfile(lcUsername.trim())
      setUsername(lcUsername.trim())
      setVerifying(false)
      setStep('done')
    } catch {
      setVerifying(false)
      setLcError('Invalid LeetCode ID — user not found')
      setStep('leetcode')
    }
  }

  function handleSkip() {
    localStorage.setItem(skipKey, 'true')
    setSkipped(true)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md bg-white dark:bg-[#18181B] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              {step === 'name' ? <User size={18} className="text-blue-400" /> : <Code2 size={18} className="text-blue-400" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Welcome to Placement OS</h2>
              <p className="text-xs text-zinc-500">Set up your profile to get started</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'name' && (
              <motion.div key="name" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Your Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      value={name}
                      onChange={e => { setName(e.target.value); setNameError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleNameNext()}
                      placeholder="e.g. John Doe"
                      autoFocus
                      className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-zinc-400"
                    />
                  </div>
                  {nameError && <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1"><XCircle size={11} /> {nameError}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleNameNext}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors">
                    Continue <ArrowRight size={14} />
                  </button>
                  <button onClick={handleSkip}
                    className="px-4 py-2.5 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                    Skip
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'leetcode' && (
              <motion.div key="leetcode" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">LeetCode Username</label>
                  <div className="relative">
                    <Code2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      value={lcUsername}
                      onChange={e => { setLcUsername(e.target.value); setLcError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleLcVerify()}
                      placeholder="e.g. leetcodeuser"
                      autoFocus
                      className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-zinc-400"
                    />
                  </div>
                  {lcError && <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1"><XCircle size={11} /> {lcError}</p>}
                  <p className="text-[10px] text-zinc-500 mt-1">We'll verify this against LeetCode's API</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleLcVerify} disabled={verifying}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors">
                    {verifying ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    {verifying ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                  <button onClick={handleSkip}
                    className="px-4 py-2.5 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                    Skip
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'verifying' && (
              <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
                <Loader2 size={28} className="animate-spin text-blue-400 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">Verifying your LeetCode ID...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${step === 'name' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <div className={`w-2 h-2 rounded-full ${step === 'name' ? 'bg-zinc-600' : step === 'leetcode' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <div className={`w-2 h-2 rounded-full ${step !== 'name' && step !== 'leetcode' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
