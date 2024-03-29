import { type CardPropList, cardProps, type CardProps } from "@/app/game/Card"

const validateProperty = (
  cards: CardProps[],
  property: CardPropList
): boolean => {
  const propertyList: any[] = []

  cards
    .map((c) => c[property])
    .forEach((p) => {
      if (!propertyList.includes(p)) {
        propertyList.push(p)
      }
    })

  return propertyList.length === 1 || propertyList.length === 3
}

export const validateCards = (
  cards: CardProps[],
  gameCards?: CardProps[]
): { valid: boolean; error: string } => {
  // Check if three cards were provided
  if (cards.length !== 3) {
    return {
      valid: false,
      error: `Only exactly three cards form one set. You provided ${cards.length} cards.`,
    }
  }

  // Check if cards are currently visible
  if (gameCards) {
    console.log("validating cards for visibility")

    for (let index = 0; index < cards.length; index++) {
      const card = cards[index]
      const cardInDeck = gameCards.find((c) => c.id == card.id)
      console.log(cardInDeck, cardInDeck?.hidden)
      if (
        cardInDeck?.hidden ||
        cardInDeck?.set ||
        !cardInDeck?.row ||
        !cardInDeck?.column
      ) {
        return {
          valid: false,
          error: `Card is not visible and can't be selected for set: ${cardInDeck?.count} ${cardInDeck?.color} ${cardInDeck?.shape} ${cardInDeck?.shading}`,
        }
      }
    }
  }

  for (let index = 0; index < cardProps.length; index++) {
    const prop = cardProps[index]

    if (!validateProperty(cards, prop)) {
      return {
        valid: false,
        error: `Validation failed for: ${prop}`,
      }
    }
  }

  // Return success
  return {
    valid: true,
    error: "",
  }
}

export const findSetInCards = (rawCards: CardProps[]): CardProps[] | null => {
  let set: CardProps[] = []
  const cards = rawCards.filter((c) => !c.hidden)

  // Helper function
  const getAllSetsOfThree = (arr: CardProps[]): CardProps[][] => {
    const result = []

    for (let i = 0; i < arr.length - 2; i++) {
      for (let j = i + 1; j < arr.length - 1; j++) {
        for (let k = j + 1; k < arr.length; k++) {
          result.push([arr[i], arr[j], arr[k]])
        }
      }
    }

    return result
  }

  const allPotentialSets = getAllSetsOfThree(cards)
  let index = 0

  while (index < allPotentialSets.length && set.length === 0) {
    const potentialSet = allPotentialSets[index]

    if (validateCards(potentialSet).valid) {
      set = potentialSet
      break
    }

    index++
  }

  return set.length > 0 ? set : null
}
