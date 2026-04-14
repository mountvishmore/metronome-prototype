import { useRef } from 'react'

type Props = {
  label: string
  /** BPM units applied per "tick" of accumulated drag. */
  step: number
  /** Ticks per pixel of vertical drag. */
  sensitivity: number
  onBpmDelta: (delta: number) => void
}

export function DragPad({ label, step, sensitivity, onBpmDelta }: Props) {
  const lastY = useRef<number | null>(null)
  const accum = useRef(0)

  const flushTicks = () => {
    const whole = Math.trunc(accum.current)
    if (whole !== 0) {
      accum.current -= whole
      onBpmDelta(whole * step)
    }
  }

  return (
    <div
      role="slider"
      aria-label={label}
      tabIndex={0}
      className="flex h-full w-full select-none items-center justify-center rounded-md bg-white/8 active:bg-white/15 transition-colors touch-none cursor-ns-resize"
      onPointerDown={(e) => {
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        lastY.current = e.clientY
        accum.current = 0
      }}
      onPointerMove={(e) => {
        if (lastY.current === null) return
        const dy = lastY.current - e.clientY
        lastY.current = e.clientY
        accum.current += dy * sensitivity
        flushTicks()
      }}
      onPointerUp={(e) => {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
        lastY.current = null
      }}
      onPointerCancel={() => {
        lastY.current = null
      }}
      onWheel={(e) => {
        const ticks =
          -Math.sign(e.deltaY) *
          Math.max(1, Math.round(Math.abs(e.deltaY) * sensitivity * 0.4))
        if (ticks) onBpmDelta(ticks * step)
      }}
    >
      <div className="text-[11px] uppercase tracking-widest text-white/70">
        <span className="font-mono mr-1.5 text-white/45">±{step}</span>
        {label}
      </div>
    </div>
  )
}
