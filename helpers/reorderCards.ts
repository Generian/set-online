import { CardProps } from "@/app/game/Card"

export const reorderCards = (unorderedCards: CardProps[]) => {
  let reorderedCards: CardProps[] = [...unorderedCards]

  const shiftCardsOneByLeft = () => {
    const maxColumn = Math.max(...reorderedCards.map((c) => c.column as number))
    for (let column = 2; column <= maxColumn; column++) {
      for (let row = 1; row <= 3; row++) {
        if (reorderedCards.find((c) => c.column == column && c.row == row)) {
          if (
            !reorderedCards
              .filter((c) => !c.hidden)
              .find((c) => c.column == column - 1 && c.row == row)
          ) {
            reorderedCards = reorderedCards.map((c) => {
              if (c.column == column && c.row == row) {
                return {
                  ...c,
                  column: column - 1,
                }
              } else {
                return c
              }
            })
          }
        }
      }
    }
  }

  const fixLastColumn = () => {
    const maxColumn = Math.max(...reorderedCards.map((c) => c.column as number))
    for (let row = 1; row <= 3; row++) {
      if (reorderedCards.find((c) => c.column == maxColumn && c.row == row)) {
        for (let rowToLeft = 1; rowToLeft <= 3; rowToLeft++) {
          if (
            !reorderedCards
              .filter((c) => !c.hidden)
              .find((c) => c.column == maxColumn - 1 && c.row == rowToLeft)
          ) {
            reorderedCards = reorderedCards.map((c) => {
              if (c.column == maxColumn && c.row == row) {
                return {
                  ...c,
                  column: c.column - 1,
                  row: rowToLeft,
                }
              } else {
                return c
              }
            })
          }
        }
      }
    }
  }

  for (let index = 0; index < 3; index++) {
    // Up to three times as multiple cards might be misplaced
    shiftCardsOneByLeft()
    fixLastColumn()
  }

  return reorderedCards
}
