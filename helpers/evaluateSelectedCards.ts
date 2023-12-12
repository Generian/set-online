import { CardProps } from "@/components/game/Card"
import { Dispatch, SetStateAction } from "react"
import { GameAction } from "./gameHandling"

export const evaluateSelectedCardsForSet = (
  selectedCards: CardProps[],
  setSelectedCards: Dispatch<SetStateAction<CardProps[]>>,
  setErrorCards: Dispatch<SetStateAction<CardProps[]>>,
  submitAction: (a: GameAction, callback?: (obj: any) => void) => void
) => {
  if (selectedCards.length >= 3) {
    // Submit set to server
    submitAction(
      {
        type: "SUBMIT_SET",
        selectedCards,
      },
      ({ isValidSet }) => {
        console.log("set valid:", isValidSet)

        if (!isValidSet) {
          setErrorCards((cards) => [...cards, ...selectedCards])

          setTimeout(() => {
            setErrorCards((cards) => {
              let newCards = [...cards]
              for (let i = 0; i < selectedCards.length; i++) {
                const s = selectedCards[i]
                const index = newCards.findIndex((c) => c.id == s.id)

                if (index >= 0) {
                  newCards.splice(index, 1)
                }
              }
              return newCards
            })
          }, 2000)
        }
      }
    )

    // Reset state
    setSelectedCards([])
  }
}
