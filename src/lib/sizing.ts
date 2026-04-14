export type BeatRect = {
  x: number
  y: number
  width: number
  height: number
  group: 1 | 2
  indexInGroup: number
  globalIndex: number
}

export type SizingInput = {
  outerWidth: number
  displayHeight: number
  heightStep: number
  group1: number
  group2: number
  groupGap: number
}

/**
 * Bottom-right anchored nesting. Within each group, every beat shares the
 * group's bottom-right corner. Beat 0 spans the full group; each subsequent
 * beat is one beatWidth narrower (cut from the left) and one heightStep
 * shorter (cut from the top).
 */
export function computeBeatRects({
  outerWidth,
  displayHeight,
  heightStep,
  group1,
  group2,
  groupGap,
}: SizingInput): BeatRect[] {
  if (group1 < 1) return []

  const buildGroup = (
    startX: number,
    groupWidth: number,
    beatWidth: number,
    count: number,
    group: 1 | 2,
    globalOffset: number,
  ): BeatRect[] => {
    const rects: BeatRect[] = []
    for (let i = 0; i < count; i++) {
      const width = Math.max(0, groupWidth - i * beatWidth)
      const height = Math.max(0, displayHeight - i * heightStep)
      rects.push({
        x: startX + i * beatWidth,
        y: displayHeight - height,
        width,
        height,
        group,
        indexInGroup: i,
        globalIndex: globalOffset + i,
      })
    }
    return rects
  }

  if (group2 === 0) {
    const beatWidth = outerWidth / group1
    return buildGroup(0, outerWidth, beatWidth, group1, 1, 0)
  }

  const totalBeats = group1 + group2
  const availableWidth = outerWidth - groupGap
  const beatWidth = availableWidth / totalBeats
  const group1Width = beatWidth * group1
  const group2Width = beatWidth * group2

  return [
    ...buildGroup(0, group1Width, beatWidth, group1, 1, 0),
    ...buildGroup(group1Width + groupGap, group2Width, beatWidth, group2, 2, group1),
  ]
}
