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
  viewportDimensions: {
    isMobile: boolean
    width: number
    height: number
    fieldWidth: number | undefined
    fieldHeight: number | undefined
  },
  column: number | null,
  row: number | null,
  maxColumns: number,
  set: boolean | undefined
) => {
  const { width, height, fieldWidth, fieldHeight, isMobile } =
    viewportDimensions

  if (!isMobile) {
    const cardHeight = 150
    const cardWidth = (cardHeight * 8) / 11.5

    const gap = cardHeight * 0.1
    const leftMargin = (width - maxColumns * (cardWidth + gap) + gap) / 2

    if (set) {
      return {
        left: width * 0.81,
        top: "-2rem",
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
        left: width / 2 - cardWidth / 2,
        top: -gap,
        height: cardHeight,
      }
    }
  } else {
    let cardHeight = fieldHeight
      ? fieldHeight / 5.5
      : ((width / 4.5) * 11.5) / 8

    const cardWidth = (cardHeight * 8) / 11.5

    const gap = cardWidth * 0.1
    const leftMargin = (width - 3 * (cardWidth + gap) + gap) / 2

    if (set) {
      return {
        left: width * 0.81,
        top: "-2rem",
        height: cardHeight,
      }
    } else if (column && row) {
      return {
        left: (row - 1) * (cardWidth + gap) + leftMargin,
        top: (column - 1) * (cardHeight + gap) + 1.5 * cardWidth + 2 * gap,
        height: cardHeight,
      }
    } else {
      const reducedCardHeight = cardHeight * 0.75
      const reducedCardWidth = cardWidth * 0.75
      return {
        left: width / 2 - reducedCardWidth / 2,
        top: gap + 0.5 * cardWidth,
        height: reducedCardHeight,
      }
    }
  }
}
