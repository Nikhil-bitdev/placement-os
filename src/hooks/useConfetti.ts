export function useConfetti() {
  const fire = (x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
    document.body.appendChild(container)

    const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div')
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = Math.random() * 6 + 4
      const angle = Math.random() * Math.PI * 2
      const velocity = Math.random() * 300 + 100
      const tx = Math.cos(angle) * velocity
      const ty = Math.sin(angle) * velocity - 200

      el.style.cssText = `
        position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;
        background:${color};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        animation:confetti-fly 1s ease-out forwards;
        --tx:${tx}px;--ty:${ty}px;--r:${Math.random() * 720}deg;
      `
      container.appendChild(el)
    }

    setTimeout(() => container.remove(), 1500)
  }

  return { fire }
}
