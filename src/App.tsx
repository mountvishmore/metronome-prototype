import { useCallback, useEffect, useRef, useState } from 'react'
import { LiveDisplay } from '@/components/LiveDisplay'
import { InfoBar } from '@/components/InfoBar'
import { ControlZone } from '@/components/ControlZone'
import { NumpadOverlay } from '@/components/NumpadOverlay'
import { CountEditor } from '@/components/CountEditor'
import { BottomButton } from '@/components/BottomButton'
import { useMetronome } from '@/hooks/useMetronome'

type Mode = 'home' | 'numpad' | 'count' | 'tap'

const TAP_TIMEOUT_MS = 3000
const TAPS_TO_CONFIRM = 4

function App() {
  const m = useMetronome({ bpm: 120, group1: 4, group2: 0 })

  const [mode, setMode] = useState<Mode>('home')

  // numpad pending
  const [pendingBpm, setPendingBpm] = useState('')

  // count editor: live preview — write directly to m, snapshot for cancel
  const countSnapshotRef = useRef<{ g1: number; g2: number } | null>(null)

  // tap tempo
  const tapsRef = useRef<number[]>([])
  const tapTimerRef = useRef<number | null>(null)
  const [tapCount, setTapCount] = useState(0)

  const clearTapTimer = useCallback(() => {
    if (tapTimerRef.current !== null) {
      clearTimeout(tapTimerRef.current)
      tapTimerRef.current = null
    }
  }, [])

  const exitTap = useCallback(() => {
    clearTapTimer()
    tapsRef.current = []
    setTapCount(0)
  }, [clearTapTimer])

  useEffect(() => () => clearTapTimer(), [clearTapTimer])

  // ---- Mode entry ----
  const enterNumpad = () => {
    setPendingBpm('')
    setMode('numpad')
  }
  const enterCount = () => {
    countSnapshotRef.current = { g1: m.group1, g2: m.group2 }
    setMode('count')
  }

  // ---- Cancel ----
  const cancelNumpad = () => {
    setPendingBpm('')
    setMode('home')
  }
  const cancelCount = () => {
    const snap = countSnapshotRef.current
    if (snap) {
      m.setGroup1(snap.g1)
      m.setGroup2(snap.g2)
    }
    countSnapshotRef.current = null
    setMode('home')
  }

  // ---- Numpad ----
  const onDigit = (d: string) => {
    setPendingBpm((cur) => {
      const next = (cur + d).replace(/^0+/, '')
      if (next.length > 3) return cur
      const n = Number(next)
      if (n > 999) return cur
      return next
    })
  }
  const onBackspace = () => setPendingBpm((cur) => cur.slice(0, -1))
  const onSetNumpad = () => {
    const n = Number(pendingBpm)
    if (pendingBpm && n > 0) m.setBpm(n)
    setPendingBpm('')
    setMode('home')
  }

  // ---- Count (live writes to metronome) ----
  const onChangeG1 = (v: number) => m.setGroup1(v)
  const onChangeG2 = (v: number) => m.setGroup2(v)
  const onSetCount = () => {
    countSnapshotRef.current = null
    setMode('home')
  }

  // ---- Tap ----
  const onTap = useCallback(() => {
    const now = performance.now()
    if (mode !== 'tap') {
      tapsRef.current = [now]
      setTapCount(1)
      setMode('tap')
    } else {
      tapsRef.current.push(now)
      const taps = tapsRef.current
      setTapCount(taps.length)

      if (taps.length >= TAPS_TO_CONFIRM) {
        const intervals: number[] = []
        for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1])
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
        const bpm = Math.max(20, Math.min(300, Math.round(60000 / avg)))
        m.setBpm(bpm)
        exitTap()
        setMode('home')
        return
      }
    }

    clearTapTimer()
    tapTimerRef.current = window.setTimeout(() => {
      exitTap()
      setMode('home')
    }, TAP_TIMEOUT_MS)
  }, [mode, m, clearTapTimer, exitTap])

  const remainingTaps = TAPS_TO_CONFIRM - tapCount

  // ---- Render ----
  const renderInfoBar = () => {
    switch (mode) {
      case 'home':
        return (
          <InfoBar
            mode="home"
            bpm={m.bpm}
            group1={m.group1}
            group2={m.group2}
            onTempoTap={enterNumpad}
            onCountTap={enterCount}
          />
        )
      case 'numpad':
        return <InfoBar mode="numpad" currentBpm={m.bpm} pending={pendingBpm} />
      case 'count':
        return <InfoBar mode="count" pendingG1={m.group1} pendingG2={m.group2} />
      case 'tap':
        return <InfoBar mode="tap" remaining={remainingTaps} />
    }
  }

  const renderControl = () => {
    switch (mode) {
      case 'home':
      case 'tap':
        return (
          <ControlZone
            onBpmDelta={(d) => m.setBpm((cur) => cur + d)}
            onTap={onTap}
          />
        )
      case 'numpad':
        return <NumpadOverlay onDigit={onDigit} onBackspace={onBackspace} />
      case 'count':
        return (
          <CountEditor
            pendingG1={m.group1}
            pendingG2={m.group2}
            onChangeG1={onChangeG1}
            onChangeG2={onChangeG2}
          />
        )
    }
  }

  const renderBottom = () => {
    if (mode === 'numpad') {
      return (
        <div className="flex h-full w-full gap-4">
          <BottomButton label="Cancel" onClick={cancelNumpad} variant="secondary" className="flex-1" />
          <BottomButton label="Set" onClick={onSetNumpad} className="flex-1" />
        </div>
      )
    }
    if (mode === 'count') {
      return (
        <div className="flex h-full w-full gap-4">
          <BottomButton label="Cancel" onClick={cancelCount} variant="secondary" className="flex-1" />
          <BottomButton label="Set" onClick={onSetCount} className="flex-1" />
        </div>
      )
    }
    return (
      <BottomButton
        label={m.isPlaying ? 'Stop' : 'Start'}
        onClick={m.toggle}
        className="w-full"
      />
    )
  }

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#1a1a1a] text-fg">
      <div className="flex h-[100dvh] w-full max-h-[932px] max-w-[480px] flex-col gap-4 bg-bg p-4">
        <div className="w-full min-h-0" style={{ flex: 321 }}>
          <LiveDisplay
            group1={m.group1}
            group2={m.group2}
            currentBeat={m.currentBeat}
            isPlaying={m.isPlaying}
          />
        </div>
        <div className="w-full min-h-0" style={{ flex: 97 }}>
          {renderInfoBar()}
        </div>
        <div className="w-full min-h-0" style={{ flex: 321 }}>
          {renderControl()}
        </div>
        <div className="w-full min-h-0" style={{ flex: 96 }}>
          {renderBottom()}
        </div>
      </div>
    </div>
  )
}

export default App
