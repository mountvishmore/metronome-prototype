type Props = {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  className?: string
}

const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-white/15 hover:bg-white/20 active:bg-white/25 text-white',
  secondary: 'bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/70',
}

export function BottomButton({
  label,
  onClick,
  disabled,
  variant = 'primary',
  className = '',
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md py-5 text-lg uppercase tracking-[0.3em] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {label}
    </button>
  )
}
