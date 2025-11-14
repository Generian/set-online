import { Highscore } from "@/app/game/Highscores"
import { initialiseCards } from "./cardsInitialiser"
import { getMaxColumn } from "./getMaxColumns"
import { saveHighscore } from "./highscores"
import { getPositions } from "./positions"
import { reorderCards } from "./reorderCards"
import { findSetInCards, validateCards } from "./setValidator"
import { informSlackAboutNewGameStarted } from "./slackHelper"
import {
  GameAction,
  Games,
  Game,
  ChatAction,
  Action_InitialiseGame,
  Action_SubmitSet,
  TimeAttackGame,
  TimeAttackAttributesProps,
  ActionType,
  MultiplayerLobbies,
  MultiplayerLobby,
  MultiplayerGame,
  MultiplayerAttributesProps,
  BaseGame,
} from "./types"
import { Users, User } from "./userHandling"
import { createLobbyId } from "./utils"
import { CardProps } from "@/app/game/Card"

export const handleGameAction = (
  action: GameAction & {
    lobbyId: string
    publicUuid: string
  },
  games: Games,
  lobbies?: MultiplayerLobbies,
  highscores?: Highscore[],
  privateUuid?: string,
  socketId?: string,
  users?: Users,
  isLocalCheck?: boolean
): {
  lobbyId?: string | undefined
  lobbyIdToDelete?: string | undefined
  newGameData?: Game | undefined
  error?: string | undefined
  isValidSet?: boolean
  isLocalCheck?: boolean
  chatAction?: ChatAction & {
    lobbyId: string
    publicUuid: string
  }
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
  if (!action?.lobbyId || action.type == "INITIALISE_GAME") {
    if (action.type == "INITIALISE_GAME") {
      return handleInitialiseGame(
        action as Action_InitialiseGame,
        publicUuid,
        user as User,
        lobbies
      )
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
          user as User,
          highscores
        )

      case "REQUEST_CARDS":
        return handleRequestCards(
          action as Action_SubmitSet,
          game,
          publicUuid,
          isLocalCheck,
          user as User,
          highscores
        )

      default:
        return { error: "Unknown action!" }
    }
  }
}

// ------------
// Action handlers
// ------------

const handleInitialiseGame = (
  action: Action_InitialiseGame,
  publicUuid: string,
  user: User,
  lobbies?: MultiplayerLobbies
) => {
  const { gameType, lobbyId } = action as Action_InitialiseGame

  const isMultiplayer = gameType == "MULTIPLAYER"
  let lobby: MultiplayerLobby | undefined

  if (isMultiplayer) {
    if (!lobbyId) {
      return { error: "No lobbyId provided to start multiplayer game." }
    }
    lobby = lobbies && lobbies[lobbyId]
    if (!lobby?.lobbyId || !lobby?.host) {
      return { error: "No lobby found to start multiplayer game." }
    }
  }

  const cards = initialiseCards(12)
  const baseGame: BaseGame = {
    lobbyId: isMultiplayer && lobbyId ? lobbyId : createLobbyId(),
    gameType,
    players: isMultiplayer && lobby ? lobby.players : [publicUuid],
    cards: cards,
    maxColumns: 4,
    hasSet: !!findSetInCards(cards),
    setsWon: [],
    actions: [],
    gameOver: 0,
  }

  let newGame: Game
  if (gameType == "TIME_ATTACK") {
    newGame = {
      ...baseGame,
      timeAttackAttributes: {
        startTime: new Date().getTime(),
        userPenalties: {},
      },
    } as TimeAttackGame
  } else if (gameType == "MULTIPLAYER") {
    newGame = {
      ...baseGame,
      multiplayerAttributes: {
        host: lobby!.host,
        playersInTimeOut: {},
      },
    } as MultiplayerGame
  } else {
    return { error: "Unknown game type." }
  }

  // Inform slack
  informSlackAboutNewGameStarted(
    user ? user.globalUsername : "unknown",
    newGame.lobbyId,
    gameType
  )

  // Return new game
  return {
    lobbyId: newGame.lobbyId,
    newGameData: newGame,
    lobbyIdToDelete: isMultiplayer && lobbyId ? lobbyId : undefined,
    chatAction: {
      message: `Has started a new ${
        gameType == "TIME_ATTACK"
          ? "time attack"
          : gameType == "MULTIPLAYER"
          ? "multiplayer"
          : "unknown"
      } game.`,
      type: "NEW_CHAT_MESSAGE" as ActionType,
      lobbyId: newGame.lobbyId,
      publicUuid,
      addGameLink: true,
    },
  }
}

const handleSubmitSet = (
  action: Action_SubmitSet,
  game: Game,
  publicUuid: string,
  isLocalCheck: boolean | undefined,
  user?: User,
  highscores?: Highscore[]
): {
  lobbyId?: string | undefined
  newGameData?: Game | undefined
  error?: string | undefined
  isValidSet?: boolean
} => {
  if (!(action.selectedCards.length == 3)) {
    return { error: "Not exactly three cards submitted" }
  } else {
    // Check if player is in time out
    if (isPlayerInTimeout(game as MultiplayerGame, publicUuid)) {
      return { error: "Player is in time out." }
    }

    // Validate set
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
      } else if (game.gameType == "MULTIPLAYER") {
        let newGameData = { ...game } as MultiplayerGame
        const previousPlayersInTimeOut =
          newGameData.multiplayerAttributes?.playersInTimeOut

        newGameData = {
          ...newGameData,
          multiplayerAttributes: {
            ...(newGameData.multiplayerAttributes as MultiplayerAttributesProps),
            playersInTimeOut: {
              ...previousPlayersInTimeOut,
              [publicUuid]: new Date().getTime(),
            },
          },
        }
        return { lobbyId: action.lobbyId, newGameData, isValidSet: false }
      } else {
        return { error: "Unknown game type." }
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
      let newGameData: Game = {
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

      // Handle multiplayer case
      if (game.gameType == "MULTIPLAYER") {
        newGameData = newGameData as MultiplayerGame

        newGameData = {
          ...newGameData,
          multiplayerAttributes: {
            ...(newGameData.multiplayerAttributes as MultiplayerAttributesProps),
            playersInTimeOut: {},
          },
        }
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
          highscores &&
          game.gameType == "TIME_ATTACK" &&
          saveHighscore(
            highscores,
            newGameData,
            publicUuid,
            action.lobbyId as string,
            user
          )
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
  user?: User,
  highscores?: Highscore[]
): {
  lobbyId?: string | undefined
  newGameData?: Game | undefined
  error?: string | undefined
} => {
  // Check if player is in time out
  if (isPlayerInTimeout(gameData as MultiplayerGame, publicUuid)) {
    return { error: "Player is in time out." }
  }

  let game = gameData as Game

  let newGameData: Game

  if (game.hasSet) {
    if (game.gameType == "TIME_ATTACK") {
      game = game as TimeAttackGame
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
    } else if (game.gameType == "MULTIPLAYER") {
      game = game as MultiplayerGame
      const previousPlayersInTimeOut =
        game.multiplayerAttributes?.playersInTimeOut

      newGameData = {
        ...game,
        multiplayerAttributes: {
          ...(game.multiplayerAttributes as MultiplayerAttributesProps),
          playersInTimeOut: {
            ...previousPlayersInTimeOut,
            [publicUuid]: new Date().getTime(),
          },
        },
      }
    } else {
      return {
        error: "No set found and game type is not TIME_ATTACK or MULTIPLAYER.",
      }
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

    // Handle multiplayer case
    if (game.gameType == "MULTIPLAYER") {
      newGameData = newGameData as MultiplayerGame
      newGameData = {
        ...newGameData,
        multiplayerAttributes: {
          ...(newGameData.multiplayerAttributes as MultiplayerAttributesProps),
          playersInTimeOut: {},
        },
      }
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
        highscores &&
        game.gameType == "TIME_ATTACK" &&
        saveHighscore(
          highscores,
          newGameData,
          publicUuid,
          action.lobbyId as string,
          user
        )
    }
  }
  return { lobbyId: action.lobbyId, newGameData }
}

export const sanitiseGameData = (game: Game) => {
  return {
    ...game,
    hasSet: null,
  }
}

export const isPlayerInTimeout = (
  game: MultiplayerGame,
  publicUuid: string
) => {
  // Check latest time out timestamp for player
  const latestTimeOutTimestamp =
    game.multiplayerAttributes?.playersInTimeOut[publicUuid]
  if (!latestTimeOutTimestamp) {
    return false
  }
  // Check if player is in timeout
  const timeSinceTimeout = new Date().getTime() - latestTimeOutTimestamp
  if (timeSinceTimeout < 10000) {
    return true
  }
  return false
}
