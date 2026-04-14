import { useMemo } from 'react'
import { FillingWheel } from './Wheel'
import type { WheelPickerOption } from '@ncdai/react-wheel-picker'

type Props = {
  pendingG1: number
  pendingG2: number
  onChangeG1: (v: number) => void
  onChangeG2: (v: number) => void
}

function range(min: number, max: number): WheelPickerOption<number>[] {
  return Array.from({ length: max - min + 1 }, (_, i) => {
    const v = i + min
    return { value: v, label: String(v) }
  })
}

export function CountEditor({ pendingG1, pendingG2, onChangeG1, onChangeG2 }: Props) {
  const g1Options = useMemo(() => range(1, 16), [])
  const g2Options = useMemo(() => range(0, 16), [])

  return (
    <div className="flex h-full w-full min-h-0 gap-4">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-1 text-center text-[10px] uppercase tracking-widest text-white/50">
          Group 1
        </div>
        <div className="min-h-0 flex-1">
          <FillingWheel options={g1Options} value={pendingG1} onValueChange={onChangeG1} />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-1 text-center text-[10px] uppercase tracking-widest text-white/50">
          Group 2
        </div>
        <div className="min-h-0 flex-1">
          <FillingWheel options={g2Options} value={pendingG2} onValueChange={onChangeG2} />
        </div>
      </div>
    </div>
  )
}
