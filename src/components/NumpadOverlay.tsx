type Props = {
  onDigit: (digit: string) => void
  onBackspace: () => void
}

const KEYS: Array<{ label: string; kind: 'digit' | 'back' | 'spacer'; value?: string }> = [
  { label: '1', kind: 'digit', value: '1' },
  { label: '2', kind: 'digit', value: '2' },
  { label: '3', kind: 'digit', value: '3' },
  { label: '4', kind: 'digit', value: '4' },
  { label: '5', kind: 'digit', value: '5' },
  { label: '6', kind: 'digit', value: '6' },
  { label: '7', kind: 'digit', value: '7' },
  { label: '8', kind: 'digit', value: '8' },
  { label: '9', kind: 'digit', value: '9' },
  { label: '', kind: 'spacer' },
  { label: '0', kind: 'digit', value: '0' },
  { label: '⌫', kind: 'back' },
]

export function NumpadOverlay({ onDigit, onBackspace }: Props) {
  return (
    <div className="grid w-full flex-1 grid-cols-3 gap-2 min-h-[180px]">
      {KEYS.map((k, i) => {
        if (k.kind === 'spacer') return <div key={i} />
        const handler = k.kind === 'digit' ? () => onDigit(k.value!) : onBackspace
        return (
          <button
            key={i}
            type="button"
            onClick={handler}
            className="rounded-md bg-white/8 hover:bg-white/12 active:bg-white/15 transition-colors font-mono text-2xl text-white"
          >
            {k.label}
          </button>
        )
      })}
    </div>
  )
}
