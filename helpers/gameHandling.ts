import { CardProps } from "@/components/game/Card"
import { initialiseCards } from "./cardsInitialiser"
import { createLobbyId } from "./utils"
import { Users } from "./userHandling"
import { findSetInCards, validateCards } from "./setValidator"
import { reorderCards } from "./reorderCards"
import { getMaxColumn } from "./getMaxColumns"
import { getPositions } from "./positions"
import { saveHighscoreToDatabase } from "@/prisma/database"
import { getTotalTimeAndPenalties } from "@/components/game/Timer"

export type Game = TimeAttackGame | MultiplayerkGame

export interface BaseGame {
  lobbyId: string
  gameType: GameType
  players: string[] // publicUuid's
  cards: CardProps[]
  maxColumns: number
  hasSet: boolean | null
  setsWon: SetWon[]
  actions: (GameAction & { publicUuid: string })[]
  gameOver: number
}

export interface TimeAttackGame extends BaseGame {
  timeAttackAttributes: TimeAttackAttributesProps
}

export interface MultiplayerkGame extends BaseGame {
  multiplayerAttributes: any
}

interface TimeAttackAttributesProps {
  startTime: number
  userPenalties: {
    [key: string]: number
  }
}

export interface Games {
  [key: string]: Game
}

export type GameType = "TIME_ATTACK" | "MULTIPLAYER"

export type GameAction =
  | Action_InitialiseGame
  | Action_SubmitSet
  | Action_RequestCards

export type UserAction = Action_SetUsername

export type ActionType =
  | "INITIALISE_GAME"
  | "SUBMIT_SET"
  | "REQUEST_CARDS"
  | "SET_USERNAME"

export const getActionCategory = (action: Action) => {
  const gameActions: ActionType[] = [
    "INITIALISE_GAME",
    "REQUEST_CARDS",
    "SUBMIT_SET",
  ]
  const userActions: ActionType[] = ["SET_USERNAME"]

  if (userActions.includes(action.type)) {
    return "USER"
  } else if (gameActions.includes(action.type)) {
    return "GAME"
  } else {
    return "UNKNOWN"
  }
}

export type ActionCategory = "USER" | "GAME"

interface Action {
  type: ActionType
  lobbyId?: string
}

export interface Action_InitialiseGame extends Action {
  gameType: GameType
}

export interface Action_SubmitSet extends Action {
  selectedCards: CardProps[]
}

export interface Action_RequestCards extends Action {}

export interface Action_SetUsername extends Action {
  username: string
}

export interface SetWon {
  publicUuid: string
  set: CardProps[]
}

export const handleGameAction = (
  action: GameAction,
  privateUuid: string,
  socketId: string,
  users: Users,
  games: Games
): {
  lobbyId?: string | undefined
  newGameData?: Game | undefined
  error?: string | undefined
  isValidSet?: boolean
} => {
  // Resolve public uuid from private one
  const user = users[privateUuid]

  if (!user.publicUuid) {
    return { error: "Could not resolve user." }
  }

  if (!user.sockets.includes(socketId)) {
    return { error: "Socket unknown for given user." }
  }

  // Handle action
  if (!action?.lobbyId) {
    if (action.type == "INITIALISE_GAME") {
      const a = action as Action_InitialiseGame
      const cards = initialiseCards(12)
      const newGame: Game = {
        lobbyId: createLobbyId(),
        gameType: a.gameType,
        players: [user.publicUuid],
        cards: cards,
        maxColumns: 4,
        hasSet: !!findSetInCards(cards),
        setsWon: [],
        timeAttackAttributes: {
          startTime: new Date().getTime(),
          userPenalties: {},
        },
        actions: [],
        gameOver: 0,
      }
      return {
        lobbyId: newGame.lobbyId,
        newGameData: newGame,
      }
    } else {
      return { error: "No lobbyId provided." }
    }
  } else {
    const game = games[action.lobbyId]

    if (!game) {
      return { error: "No game found!" }
    }

    // Check if player is authorised to perform action

    if (!game.players.includes(user.publicUuid)) {
      return {
        error: "Player not authorised to perform action.",
      }
    }

    switch (action.type) {
      case "SUBMIT_SET":
        return handleSubmitSet(
          action as Action_SubmitSet,
          game,
          user.publicUuid
        )

      case "REQUEST_CARDS":
        return handleRequestCards(
          action as Action_SubmitSet,
          game,
          user.publicUuid
        )

      default:
        return { error: "Unknown action!" }
    }
  }
}

const handleSubmitSet = (
  action: Action_SubmitSet,
  game: Game,
  publicUuid: string
): {
  lobbyId?: string | undefined
  newGameData?: Game | undefined
  error?: string | undefined
  isValidSet?: boolean
} => {
  if (!(action.selectedCards.length == 3)) {
    return { error: "Not exactly three cards submitted" }
  } else {
    const { valid, error } = validateCards(action.selectedCards)
    if (!valid) {
      console.log("Set validation failed. Not a valid set.")

      if (game.gameType == "TIME_ATTACK") {
        let newGameData = { ...game } as TimeAttackGame
        // const hasSet = findSetInCards(game.cards)

        const previousPenalties =
          newGameData.timeAttackAttributes?.userPenalties[publicUuid]

        newGameData = {
          ...newGameData,
          timeAttackAttributes: {
            ...(newGameData.timeAttackAttributes as TimeAttackAttributesProps),
            userPenalties: {
              ...newGameData.timeAttackAttributes?.userPenalties,
              [publicUuid]: previousPenalties ? previousPenalties + 1 : 1,
            },
          },
        }
        return { lobbyId: action.lobbyId, newGameData, isValidSet: false }
      } else {
        // TODO handle Multiplayer case
        return { error: `Set validation error: ${error}` }
      }
    } else {
      console.log("Set validation success.")

      // Hide cards from field
      const newCards = game.cards.map((card) => {
        if (action.selectedCards.map((c) => c.id).includes(card.id)) {
          return {
            ...card,
            hidden: true,
            set: true,
          }
        } else {
          return card
        }
      })

      let reorderedCards: CardProps[] = []

      // Add additional cards if valid
      if (newCards.filter((c) => !c.hidden).length < 12) {
        console.log("adding cards", newCards.filter((c) => !c.hidden).length)

        reorderedCards = addCards(newCards, 3).newCards
      }

      // Reorder cards
      reorderedCards = reorderCards(reorderedCards)

      // Create new game data
      const newGameData: Game = {
        ...game,
        cards: reorderedCards,
        maxColumns: getMaxColumn(reorderedCards),
        hasSet: !!findSetInCards(reorderedCards),
        setsWon: [
          ...game.setsWon,
          {
            publicUuid,
            set: action.selectedCards,
          },
        ],
      }

      // Check win condition
      const gameOver =
        !newGameData.hasSet &&
        newCards.filter((c) => c.hidden && !c.set).length == 0

      gameOver && console.log("game over after set submission.")
      // Save highscore
      if (gameOver) {
        newGameData.gameOver = new Date().getTime()
        saveHighscore(newGameData, publicUuid, action.lobbyId as string)
      }

      // Return new game data
      return { lobbyId: action.lobbyId, newGameData, isValidSet: true }
    }
  }
}

const addCards = (cards: CardProps[], cardsToAdd: number) => {
  const freePositions = getPositions().filter((p) => {
    return !cards.find(
      (c) => !c.hidden && c.column == p.column && c.row == p.row
    )
  })

  let newCards: CardProps[] = [...cards]
  let cardsLeftToAdd = cardsToAdd // TODO refactor

  for (let index = 0; index < cards.length; index++) {
    let card = cards[index]
    if (card.hidden && !card.row && !card.column && cardsLeftToAdd > 0) {
      newCards[index] = {
        ...card,
        hidden: false,
        ...freePositions[cardsToAdd - cardsLeftToAdd],
      }
      console.log("Adding card:", newCards[index])
      cardsLeftToAdd--
    }
  }

  return { newCards, error: cardsLeftToAdd > 0 }
}

const handleRequestCards = (
  action: Action_SubmitSet,
  gameData: Game,
  publicUuid: string
): {
  lobbyId?: string | undefined
  newGameData?: Game | undefined
  error?: string | undefined
} => {
  if (gameData.gameType == "TIME_ATTACK") {
    const game = gameData as TimeAttackGame
    // const hasSet = findSetInCards(game.cards)

    let newGameData: TimeAttackGame

    if (game.hasSet) {
      const previousPenalties =
        game.timeAttackAttributes?.userPenalties[publicUuid]

      newGameData = {
        ...game,
        timeAttackAttributes: {
          ...(game.timeAttackAttributes as TimeAttackAttributesProps),
          userPenalties: {
            ...game.timeAttackAttributes?.userPenalties,
            [publicUuid]: previousPenalties ? previousPenalties + 1 : 1,
          },
        },
      }
    } else {
      const { newCards, error } = addCards(game.cards, 3)

      if (error) {
        return { error: "Couldn't add more cards." }
      }

      newGameData = {
        ...game,
        cards: newCards,
        maxColumns: getMaxColumn(newCards),
        hasSet: !!findSetInCards(newCards),
      }

      // Check win condition
      const gameOver =
        !newGameData.hasSet &&
        newCards.filter((c) => c.hidden && !c.set).length == 0

      gameOver && console.log("game over after adding last card")

      // Save highscore
      if (gameOver) {
        newGameData.gameOver = new Date().getTime()
        saveHighscore(newGameData, publicUuid, action.lobbyId as string)
      }
    }
    return { lobbyId: action.lobbyId, newGameData }
  } else if (gameData.gameType == "MULTIPLAYER") {
    return { error: "Can't handle Multiplayer mode yet." }
  } else {
    return { error: "Unknown game mode." }
  }
}

export const sanitiseGameData = (game: Game) => {
  return {
    ...game,
    hasSet: null,
  }
}

const saveHighscore = (gameData: Game, publicUuid: string, lobbyId: string) => {
  if (gameData.gameType == "TIME_ATTACK") {
    const { totalTime, penalties } = getTotalTimeAndPenalties(
      gameData as TimeAttackGame,
      publicUuid
    )
    saveHighscoreToDatabase({
      publicUuid,
      lobbyId: lobbyId as string,
      totalTime,
      penalties,
    })
  } else if (gameData.gameType == "MULTIPLAYER") {
    // TODO handle multiplayer highscore submission
  }
}
