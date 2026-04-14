import { DragPad } from './DragPad'

type Props = {
  onBpmDelta: (delta: number) => void
  onTap: () => void
}

export function ControlZone({ onBpmDelta, onTap }: Props) {
  return (
    <div className="grid w-full min-h-0 flex-1 gap-2 grid-cols-[2fr_1fr_2fr] min-h-[180px]">
      <DragPad label="Coarse" step={5} sensitivity={0.12} onBpmDelta={onBpmDelta} />
      <DragPad label="Fine" step={1} sensitivity={0.1} onBpmDelta={onBpmDelta} />
      <button
        type="button"
        onClick={onTap}
        className="rounded-md bg-white/8 hover:bg-white/12 active:bg-white/15 transition-colors text-white/80 text-sm uppercase tracking-widest"
      >
        Tap
      </button>
    </div>
  )
}
