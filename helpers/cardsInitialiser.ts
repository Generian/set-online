import { CardProps } from "../app/game/Card"
import { Color, Count, Shading, ShapeType } from "../app/game/Shape"
import { getPositions } from "./positions"

export interface BaseCard {
  id: number
  shape: ShapeType
  count: Count
  color: Color
  shading: Shading
}

export const initialiseCards = (numberOfCards: number) => {
  const cards: BaseCard[] = []
  const deck: CardProps[] = []

  const types: ShapeType[] = ["oval", "squiggle", "box"]
  const colors: Color[] = ["red", "blue", "green"]
  const shadings: Shading[] = ["solid", "striped", "open"]
  const counts: Count[] = [1, 2, 3]

  // Add all variants to array
  types.forEach((t, i) => {
    colors.forEach((c, j) => {
      shadings.forEach((s, k) => {
        counts.forEach((count, l) => {
          cards.push({
            id: Number(`${i}${j}${k}${l}`),
            shape: t,
            count: count,
            color: c,
            shading: s,
          })
        })
      })
    })
  })

  // Shuffle array
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }

  // Place initial cards
  const positions = getPositions()
  for (let index = 0; index < cards.length; index++) {
    if (index < numberOfCards) {
      deck[index] = {
        ...cards[index],
        ...positions[index],
        hidden: false,
        rank: index,
      }
    } else {
      deck[index] = {
        ...cards[index],
        row: null,
        column: null,
        hidden: true,
        rank: index,
      }
    }
  }

  return deck
}
