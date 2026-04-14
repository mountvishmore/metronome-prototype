import { useCallback, useEffect, useRef, useState } from 'react'
import { MetronomeScheduler } from '@/lib/audio'

export type MetronomeState = {
  isPlaying: boolean
  bpm: number
  group1: number
  group2: number
  currentBeat: number
}

export function useMetronome(initial: { bpm?: number; group1?: number; group2?: number } = {}) {
  const schedulerRef = useRef<MetronomeScheduler | null>(null)
  if (schedulerRef.current === null) {
    schedulerRef.current = new MetronomeScheduler()
  }

  const [bpm, setBpmState] = useState(initial.bpm ?? 120)
  const [group1, setGroup1] = useState(initial.group1 ?? 4)
  const [group2, setGroup2] = useState(initial.group2 ?? 0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(-1)

  useEffect(() => {
    schedulerRef.current?.setConfig({ bpm, group1, group2 })
  }, [bpm, group1, group2])

  useEffect(() => {
    if (!isPlaying) return
    let rafId = 0
    const loop = () => {
      const sched = schedulerRef.current
      if (!sched) return
      const beat = sched.drainPlayedNotes(sched.currentTime)
      if (beat !== null) setCurrentBeat(beat)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [isPlaying])

  useEffect(() => {
    return () => {
      schedulerRef.current?.dispose()
      schedulerRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    schedulerRef.current?.start()
    setCurrentBeat(-1)
    setIsPlaying(true)
  }, [])

  const stop = useCallback(() => {
    schedulerRef.current?.stop()
    setIsPlaying(false)
    setCurrentBeat(-1)
  }, [])

  const toggle = useCallback(() => {
    if (schedulerRef.current?.isPlaying) {
      schedulerRef.current.stop()
      setIsPlaying(false)
      setCurrentBeat(-1)
    } else {
      schedulerRef.current?.start()
      setCurrentBeat(-1)
      setIsPlaying(true)
    }
  }, [])

  const setBpm = useCallback((next: number | ((cur: number) => number)) => {
    setBpmState((cur) => {
      const v = typeof next === 'function' ? next(cur) : next
      return Math.min(300, Math.max(20, Math.round(v)))
    })
  }, [])

  return {
    bpm,
    setBpm,
    group1,
    setGroup1,
    group2,
    setGroup2,
    isPlaying,
    currentBeat,
    start,
    stop,
    toggle,
  }
}
