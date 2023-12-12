import { CardProps } from "@/components/game/Card"
import { Dispatch, SetStateAction } from "react"
import { DEALING_TIME } from "./constants"
import { getMaxColumn } from "./getMaxColumns"
import { getPositions } from "./positions"

export const addAdditionalCards = (
  setCards: Dispatch<SetStateAction<CardProps[]>>,
  setMaxColumns: Dispatch<SetStateAction<number>>
) => {
  const addOneCard = () =>
    setCards((cards) => {
      const freePosition = getPositions().filter((p) => {
        return !cards.find(
          (c) => !c.hidden && c.column == p.column && c.row == p.row
        )
      })[0]

      let newCards: CardProps[] = [...cards]
      let cardsLeftToAdd = 1 // TODO refactor

      for (let index = 0; index < cards.length; index++) {
        let card = cards[index]
        if (card.hidden && !card.row && !card.column && cardsLeftToAdd > 0) {
          newCards[index] = {
            ...card,
            hidden: false,
            ...freePosition,
          }
          cardsLeftToAdd--
        }
      }

      // Update maxColumns
      setMaxColumns(getMaxColumn(newCards))

      return newCards
    })

  let count = 0
  const cardsToAdd = 3

  const intervalId = setInterval(() => {
    count++

    // Your code here (this code will run at each interval)
    addOneCard()

    if (count === cardsToAdd) {
      clearInterval(intervalId) // Stop the interval when the desired number of iterations is reached
    }
  }, DEALING_TIME)
}
