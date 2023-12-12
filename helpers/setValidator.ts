import { CardPropList, cardProps, CardProps } from "@/components/game/Card"

const validateProperty = (cards: CardProps[], property: CardPropList) => {
  const propertyList: any[] = []

  cards
    .map((c) => c[property])
    .forEach((p) => {
      if (!propertyList.includes(p)) {
        propertyList.push(p)
      }
    })

  return propertyList.length == 1 || propertyList.length == 3
}

export const validateCards = (cards: CardProps[]) => {
  // Check if three cards were provided
  if (cards.length !== 3) {
    return {
      valid: false,
      error: `Only exactly three cards form one set. You provided ${cards.length} cards.`,
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

export const findSetInCards = (rawCards: CardProps[]) => {
  console.log("start validating cards for set")

  let set: CardProps[] = []
  const cards = rawCards.filter((c) => !c.hidden)

  // Helper function
  const getAllSetsOfThree = (arr: CardProps[]) => {
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

  while (index < allPotentialSets.length && !set.length) {
    const potentialSet = allPotentialSets[index]

    if (validateCards(potentialSet).valid) {
      set = potentialSet
      break
    }

    index++
  }

  console.log("completed validation. Has set:", !!set.length)
  return set.length ? set : null
}
