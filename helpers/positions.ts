export const getPositions = (maxCardColumns: number = 10) => {
  const positions = []
  for (let column = 1; column <= maxCardColumns; column++) {
    for (let row = 1; row <= 3; row++) {
      positions.push({
        column,
        row,
      })
    }
  }
  return positions
}

export const getCoordinatesAndSize = (
  column: number | null,
  row: number | null,
  maxColumns: number,
  set: boolean | undefined
) => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  const cardHeight = 150
  const cardWidth = (150 * 8) / 11.5

  const gap = cardHeight * 0.1
  const leftMargin = (viewport.width - maxColumns * (cardWidth + gap) + gap) / 2

  if (set) {
    return {
      left: viewport.width / 2 - cardWidth / 2,
      top: 3 * cardHeight + cardWidth + 5 * gap,
      height: cardHeight,
    }
  } else if (column && row) {
    return {
      left: (column - 1) * (cardWidth + gap) + leftMargin,
      top: (row - 1) * (cardHeight + gap) + cardWidth + 2 * gap,
      height: cardHeight,
    }
  } else {
    return {
      left: viewport.width / 2 - cardWidth / 2,
      top: -gap,
      height: cardHeight,
    }
  }
}
