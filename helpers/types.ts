import { CardProps } from "@/app/game/Card"

export type Game = TimeAttackGame | MultiplayerGame

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

export interface TimeAttackAttributesProps {
  startTime: number
  userPenalties: {
    [key: string]: number
  }
}

export interface MultiplayerGame extends BaseGame {
  multiplayerAttributes: MultiplayerAttributesProps
}

export interface MultiplayerAttributesProps {
  host: string // publicUuid
  playersInTimeOut: { [key: string]: number } // publicUuid's and time out timestmap in epoch milliseconds
}

export interface MultiplayerLobby {
  lobbyId: string
  maxPlayers: number
  players: string[] // publicUuid
  host: string // publicUuid
}

export interface Games {
  [key: string]: Game
}

export interface MultiplayerLobbies {
  [key: string]: MultiplayerLobby
}

export type GameType = "TIME_ATTACK" | "MULTIPLAYER"

export type GameAction =
  | Action_InitialiseGame
  | Action_SubmitSet
  | Action_RequestCards

export type LobbyAction =
  | Action_CreateLobby
  | Action_JoinLobby
  | Action_LeaveLobby

export interface Action_CreateLobby extends Action {}

export interface Action_JoinLobby extends Action {
  lobbyId: string
}

export interface Action_LeaveLobby extends Action {
  lobbyId: string
}

export interface Action_StartGame extends Action {
  lobbyId: string
}

export type UserAction = Action_SetUsername

export type ChatAction = Action_NewChatMessage

export type ActionType =
  | "INITIALISE_GAME"
  | "SUBMIT_SET"
  | "REQUEST_CARDS"
  | "SET_USERNAME"
  | "GET_GAME_DATA"
  | "NEW_CHAT_MESSAGE"
  | "GET_HIGHSCORES"
  | "CREATE_LOBBY"
  | "JOIN_LOBBY"
  | "LEAVE_LOBBY"

export const getActionCategory = (action: Action): ActionCategory => {
  const gameActions: ActionType[] = [
    "INITIALISE_GAME",
    "REQUEST_CARDS",
    "SUBMIT_SET",
  ]
  const lobbyActions: ActionType[] = [
    "CREATE_LOBBY",
    "JOIN_LOBBY",
    "LEAVE_LOBBY",
  ]

  const userActions: ActionType[] = ["SET_USERNAME"]

  const metaActions: ActionType[] = ["GET_GAME_DATA", "GET_HIGHSCORES"]

  const chatActions: ActionType[] = ["NEW_CHAT_MESSAGE"]

  if (userActions.includes(action.type)) {
    return "USER"
  } else if (gameActions.includes(action.type)) {
    return "GAME"
  } else if (lobbyActions.includes(action.type)) {
    return "LOBBY"
  } else if (metaActions.includes(action.type)) {
    return "META"
  } else if (chatActions.includes(action.type)) {
    return "CHAT"
  } else {
    return "UNKNOWN"
  }
}

export type ActionCategory =
  | "USER"
  | "GAME"
  | "LOBBY"
  | "META"
  | "CHAT"
  | "UNKNOWN"

export interface Action {
  type: ActionType
  lobbyId?: string
}

export interface Action_InitialiseGame extends Action {
  gameType: GameType
  lobbyId?: string
}

export interface Action_SubmitSet extends Action {
  selectedCards: CardProps[]
}

export interface Action_RequestCards extends Action {}

export interface Action_SetUsername extends Action {
  username: string
}

export interface Action_NewChatMessage extends Action {
  message: string
  publicUuid?: string
  addGameLink?: boolean
}

export interface SetWon {
  publicUuid: string
  set: CardProps[]
}
