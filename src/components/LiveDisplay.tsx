import { useLayoutEffect, useRef, useState } from 'react'
import { computeBeatRects, type BeatRect } from '@/lib/sizing'

type Props = {
  group1: number
  group2: number
  currentBeat: number
  isPlaying: boolean
  height?: number
  heightStep?: number
  groupGap?: number
}

const ACTIVE_FILL = '#97b1c2'
const PAST_NEAR: RGB = [0x7b, 0x8f, 0x9c] // #7b8f9c — beat just before active
const PAST_FAR: RGB = [0x5f, 0x6d, 0x75]  // #5f6d75 — earliest past beat
const FUTURE_FILL = '#303741'
const FUTURE_OVERLAY = 'rgba(48, 55, 65, 0.27)'
const FUTURE_BORDER = '#97b1c2'
const BORDER_RADIUS = 4

type RGB = [number, number, number]

function rgb([r, g, b]: RGB) {
  return `rgb(${r}, ${g}, ${b})`
}

function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function pastFill(distance: number, maxDistance: number) {
  if (maxDistance <= 1) return rgb(PAST_NEAR)
  const t = (distance - 1) / (maxDistance - 1)
  return rgb(lerpColor(PAST_NEAR, PAST_FAR, t))
}

function BeatLayer({
  rect,
  state,
  pastDistance,
  maxPastDistance,
}: {
  rect: BeatRect
  state: 'active' | 'past' | 'future'
  pastDistance: number
  maxPastDistance: number
}) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height,
    borderRadius: BORDER_RADIUS,
    boxSizing: 'border-box',
  }

  if (state === 'active') {
    return <div style={{ ...baseStyle, background: ACTIVE_FILL }} />
  }

  if (state === 'past') {
    return (
      <div
        style={{
          ...baseStyle,
          background: pastFill(pastDistance, maxPastDistance),
        }}
      />
    )
  }

  return (
    <>
      <div style={{ ...baseStyle, background: FUTURE_OVERLAY }} />
      <div
        style={{
          ...baseStyle,
          background: FUTURE_FILL,
          border: `1px solid ${FUTURE_BORDER}`,
        }}
      />
    </>
  )
}

export function LiveDisplay({
  group1,
  group2,
  currentBeat,
  isPlaying,
  height = 230,
  heightStep = 32,
  groupGap = 16,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(360)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      if (w > 0) setWidth(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const rects = computeBeatRects({
    outerWidth: width,
    displayHeight: height,
    heightStep,
    group1,
    group2,
    groupGap,
  })

  const active = isPlaying ? currentBeat : -1
  const maxPastDistance = Math.max(1, active)

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      {rects.map((r) => {
        let state: 'active' | 'past' | 'future'
        let distance = 0
        if (active < 0 || r.globalIndex > active) {
          state = 'future'
        } else if (r.globalIndex === active) {
          state = 'active'
        } else {
          state = 'past'
          distance = active - r.globalIndex
        }
        return (
          <BeatLayer
            key={r.globalIndex}
            rect={r}
            state={state}
            pastDistance={distance}
            maxPastDistance={maxPastDistance}
          />
        )
      })}
    </div>
  )
}
