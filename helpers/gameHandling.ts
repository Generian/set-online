import { CardProps } from "@/app/game/Card"
import { initialiseCards } from "./cardsInitialiser"
import { createLobbyId } from "./utils"
import { User, Users } from "./userHandling"
import { findSetInCards, validateCards } from "./setValidator"
import { reorderCards } from "./reorderCards"
import { getMaxColumn } from "./getMaxColumns"
import { getPositions } from "./positions"
import { saveHighscoreToDatabase } from "@/prisma/database"
import { formatTime, getTotalTimeAndPenalties } from "@/app/game/Timer"
import {
  informSlackAboutNewTimeattackHighscore,
  informSlackAboutTimeattackGameStarted,
} from "./slackHelper"

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
  action: GameAction & {
    lobbyId: string
    publicUuid: string
  },
  games: Games,
  privateUuid?: string,
  socketId?: string,
  users?: Users,
  isLocalCheck?: boolean
): {
  lobbyId?: string | undefined
  newGameData?: Game | undefined
  error?: string | undefined
  isValidSet?: boolean
  isLocalCheck?: boolean
} => {
  const user = users && privateUuid && users[privateUuid]

  if (!isLocalCheck) {
    if (!socketId) {
      return { error: "No socketId found." }
    }

    if (!user) {
      return { error: "No user found." }
    }

    if (!user?.publicUuid) {
      return { error: "User data corrupted." }
    }

    if (!user.sockets.includes(socketId)) {
      return { error: "Socket unknown for given user." }
    }
  }

  const { publicUuid } = action

  // Handle action
  if (!action?.lobbyId) {
    if (action.type == "INITIALISE_GAME") {
      const a = action as Action_InitialiseGame
      const cards = initialiseCards(12)
      const newGame: Game = {
        lobbyId: createLobbyId(),
        gameType: a.gameType,
        players: [publicUuid],
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

      // Inform slack
      informSlackAboutTimeattackGameStarted(
        user ? user.globalUsername : "unknown",
        newGame.lobbyId
      )

      // Return new game
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
      console.log(games, action.lobbyId)
      return { error: "No game found!" }
    }

    // Check if player is authorised to perform action

    if (!game.players.includes(publicUuid)) {
      return {
        error: "Player not authorised to perform action.",
      }
    }

    switch (action.type) {
      case "SUBMIT_SET":
        return handleSubmitSet(
          action as Action_SubmitSet,
          game,
          publicUuid,
          isLocalCheck,
          user as User
        )

      case "REQUEST_CARDS":
        return handleRequestCards(
          action as Action_SubmitSet,
          game,
          publicUuid,
          isLocalCheck,
          user as User
        )

      default:
        return { error: "Unknown action!" }
    }
  }
}

const handleSubmitSet = (
  action: Action_SubmitSet,
  game: Game,
  publicUuid: string,
  isLocalCheck: boolean | undefined,
  user?: User
): {
  lobbyId?: string | undefined
  newGameData?: Game | undefined
  error?: string | undefined
  isValidSet?: boolean
} => {
  if (!(action.selectedCards.length == 3)) {
    return { error: "Not exactly three cards submitted" }
  } else {
    const { valid, error } = validateCards(action.selectedCards, game.cards)
    if (!valid) {
      console.log("Set validation failed. Error:", error)

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
      let newCards = game.cards.map((card) => {
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

      // Add additional cards if valid
      if (newCards.filter((c) => !c.hidden).length < 12) {
        newCards = addCards(newCards, 3).newCards
      }

      // Reorder cards
      const reorderedCards: CardProps[] = reorderCards(newCards)

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
        !isLocalCheck &&
          saveHighscore(newGameData, publicUuid, action.lobbyId as string)

        // Inform slack about new highscore
        if (game.gameType == "TIME_ATTACK") {
          const {
            lobbyId,
            gameOver,
            timeAttackAttributes: { startTime, userPenalties },
          } = newGameData as TimeAttackGame
          !isLocalCheck &&
            informSlackAboutNewTimeattackHighscore(
              user?.globalUsername ? user?.globalUsername : "unknown",
              lobbyId,
              formatTime(gameOver - startTime),
              userPenalties[publicUuid]
            )
        }
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
      cardsLeftToAdd--
    }
  }

  return { newCards, error: cardsLeftToAdd > 0 }
}

const handleRequestCards = (
  action: Action_SubmitSet,
  gameData: Game,
  publicUuid: string,
  isLocalCheck: boolean | undefined,
  user?: User
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
        !isLocalCheck &&
          saveHighscore(newGameData, publicUuid, action.lobbyId as string)

        // Inform slack about new highscore
        !isLocalCheck &&
          informSlackAboutNewTimeattackHighscore(
            user?.globalUsername ? user?.globalUsername : "unknown",
            newGameData.lobbyId,
            formatTime(
              newGameData.gameOver - newGameData.timeAttackAttributes.startTime
            ),
            newGameData.timeAttackAttributes.userPenalties[publicUuid]
          )
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
