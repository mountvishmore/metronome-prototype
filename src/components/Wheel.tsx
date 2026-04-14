import { useLayoutEffect, useRef, useState } from 'react'
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
  type WheelPickerValue,
} from '@ncdai/react-wheel-picker'

const TARGET_ITEM_HEIGHT = 36
const MIN_ITEM_HEIGHT = 28
const MAX_ITEM_HEIGHT = 56
const MIN_VISIBLE = 4

type FillingWheelProps<T extends WheelPickerValue> = {
  options: WheelPickerOption<T>[]
  value: T
  onValueChange: (v: T) => void
}

/**
 * WheelPicker that fills its parent vertically. Picks visibleCount as the
 * largest multiple of 4 fitting at TARGET_ITEM_HEIGHT, then expands
 * optionItemHeight so the picker actually consumes the full container.
 */
export function FillingWheel<T extends WheelPickerValue>({
  options,
  value,
  onValueChange,
}: FillingWheelProps<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(8)
  const [itemHeight, setItemHeight] = useState(TARGET_ITEM_HEIGHT)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const h = el.getBoundingClientRect().height
      if (h <= 0) return
      const fits = Math.max(MIN_VISIBLE, Math.floor(h / TARGET_ITEM_HEIGHT / 4) * 4)
      const itemH = Math.max(
        MIN_ITEM_HEIGHT,
        Math.min(MAX_ITEM_HEIGHT, Math.floor(h / fits)),
      )
      setVisibleCount(fits)
      setItemHeight(itemH)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative h-full w-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <WheelPickerWrapper className="rwp-dark w-full">
          <WheelPicker
            options={options}
            value={value}
            onValueChange={onValueChange}
            visibleCount={visibleCount}
            optionItemHeight={itemHeight}
            classNames={{
              optionItem: 'text-white/40',
              highlightWrapper: 'bg-white/10 rounded-md text-white',
              highlightItem: 'text-white',
            }}
          />
        </WheelPickerWrapper>
      </div>
    </div>
  )
}
