import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export default function AnimatedCounter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 })
  const display = useTransform(spring, (v) => v.toFixed(decimals))

  useEffect(() => { spring.set(value) }, [value, spring])

  return <motion.span className="font-mono tabular-nums">{display}</motion.span>
}
