type HomeProps = {
  mode: 'home'
  bpm: number
  group1: number
  group2: number
  onTempoTap: () => void
  onCountTap: () => void
}

type NumpadProps = {
  mode: 'numpad'
  currentBpm: number
  pending: string
}

type CountProps = {
  mode: 'count'
  pendingG1: number
  pendingG2: number
}

type TapProps = {
  mode: 'tap'
  remaining: number
}

type Props = HomeProps | NumpadProps | CountProps | TapProps

function formatCount(g1: number, g2: number) {
  return g2 > 0 ? `${g1}+${g2}` : `${g1}`
}

const cellBase = 'rounded-md bg-white/8 px-4 py-3 text-left'
const cellTap = 'hover:bg-white/12 active:bg-white/15 transition-colors'
const labelClass = 'text-[10px] uppercase tracking-widest text-white/50'
const valueClass = 'font-mono text-2xl tabular-nums text-white'

export function InfoBar(props: Props) {
  if (props.mode === 'home') {
    return (
      <div className="grid h-full w-full gap-4 grid-cols-[2.3fr_1fr_2.35fr]">
        <button
          type="button"
          onClick={props.onTempoTap}
          className={`col-span-2 h-full ${cellBase} ${cellTap}`}
        >
          <div className={labelClass}>Tempo</div>
          <div className={valueClass}>{props.bpm}</div>
        </button>
        <button
          type="button"
          onClick={props.onCountTap}
          className={`col-span-1 h-full ${cellBase} ${cellTap}`}
        >
          <div className={labelClass}>Count</div>
          <div className={valueClass}>{formatCount(props.group1, props.group2)}</div>
        </button>
      </div>
    )
  }

  if (props.mode === 'numpad') {
    const hasPending = props.pending.length > 0
    return (
      <div className={`${cellBase} flex h-full w-full items-end justify-between gap-3`}>
        <div className={labelClass}>Tempo</div>
        <div className="flex items-baseline gap-3">
          <span className={`${valueClass} ${hasPending ? 'text-white/35' : ''}`}>
            {props.currentBpm}
          </span>
          {hasPending && (
            <>
              <span className="text-xl text-white/30">→</span>
              <span className={valueClass}>{props.pending}</span>
            </>
          )}
        </div>
      </div>
    )
  }

  if (props.mode === 'count') {
    return (
      <div className={`${cellBase} flex h-full w-full items-end justify-between gap-3`}>
        <div className={labelClass}>Count</div>
        <div className={valueClass}>{formatCount(props.pendingG1, props.pendingG2)}</div>
      </div>
    )
  }

  // tap
  return (
    <div className={`${cellBase} flex h-full w-full items-end justify-between gap-3`}>
      <div className={labelClass}>Keep tapping</div>
      <div className={valueClass}>{props.remaining}</div>
    </div>
  )
}
