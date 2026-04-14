type ScheduledNote = { beat: number; time: number }

export type SchedulerConfig = {
  bpm: number
  group1: number
  group2: number
}

const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD_S = 0.1
const CLICK_DURATION_S = 0.05

export class MetronomeScheduler {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private timerId: number | null = null
  private nextNoteTime = 0
  private currentBeatIdx = 0
  private notesQueue: ScheduledNote[] = []
  private playing = false

  config: SchedulerConfig = { bpm: 120, group1: 4, group2: 0 }

  setConfig(partial: Partial<SchedulerConfig>) {
    this.config = { ...this.config, ...partial }
  }

  get isPlaying() {
    return this.playing
  }

  private ensureContext() {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctor()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 0.6
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  start() {
    const ctx = this.ensureContext()
    this.playing = true
    this.currentBeatIdx = 0
    this.nextNoteTime = ctx.currentTime + 0.06
    this.notesQueue = []
    this.tick()
  }

  stop() {
    this.playing = false
    if (this.timerId !== null) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
    this.notesQueue = []
  }

  private tick = () => {
    if (!this.playing || !this.ctx) return
    while (this.nextNoteTime < this.ctx.currentTime + SCHEDULE_AHEAD_S) {
      this.scheduleClick(this.currentBeatIdx, this.nextNoteTime)
      this.advance()
    }
    this.timerId = window.setTimeout(this.tick, LOOKAHEAD_MS)
  }

  private scheduleClick(beat: number, time: number) {
    if (!this.ctx || !this.masterGain) return
    const { group1, group2 } = this.config
    const isGroupStart = beat === 0 || (group2 > 0 && beat === group1)
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.frequency.value = isGroupStart ? 1100 : 800
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(isGroupStart ? 1.0 : 0.7, time + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + CLICK_DURATION_S)
    osc.connect(gain).connect(this.masterGain)
    osc.start(time)
    osc.stop(time + CLICK_DURATION_S + 0.01)
    this.notesQueue.push({ beat, time })
  }

  private advance() {
    const totalBeats = this.config.group1 + this.config.group2
    const secondsPerBeat = 60 / this.config.bpm
    this.nextNoteTime += secondsPerBeat
    this.currentBeatIdx = (this.currentBeatIdx + 1) % Math.max(1, totalBeats)
  }

  /** Pop notes whose time has passed `now`. Called from rAF for visual sync. */
  drainPlayedNotes(now: number): number | null {
    let lastBeat: number | null = null
    while (this.notesQueue.length && this.notesQueue[0].time <= now) {
      lastBeat = this.notesQueue.shift()!.beat
    }
    return lastBeat
  }

  get currentTime() {
    return this.ctx?.currentTime ?? 0
  }

  dispose() {
    this.stop()
    void this.ctx?.close()
    this.ctx = null
  }
}
