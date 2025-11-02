import {
  Action_CreateLobby,
  Action_JoinLobby,
  Action_LeaveLobby,
  Action_StartGame,
  LobbyAction,
  MultiplayerLobbies,
  MultiplayerLobby,
} from "./types"
import { Users, User } from "./userHandling"
import { createLobbyId } from "./utils"

export const handleLobbyAction = (
  action: LobbyAction & {
    lobbyId: string
    publicUuid: string
  },
  lobbies: MultiplayerLobbies,
  privateUuid?: string,
  socketId?: string,
  users?: Users,
  isLocalCheck?: boolean
): {
  lobbyId?: string | undefined
  error?: string | undefined
  newLobbyData?: MultiplayerLobby | undefined
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
  if (action.type == "CREATE_LOBBY") {
    return handleCreateLobby(
      action as Action_CreateLobby & { publicUuid: string }
    )
  } else {
    const lobby = lobbies[action.lobbyId]

    if (!lobby) {
      console.error(lobbies, action.lobbyId)
      return { error: "No game found!" }
    }

    // Check if player is authorised to perform action

    if (!lobby.players.includes(publicUuid) && action.type != "JOIN_LOBBY") {
      return {
        error: "Player not authorised to perform action.",
      }
    }

    switch (action.type) {
      case "JOIN_LOBBY":
        return handleJoinLobby(
          action as Action_JoinLobby & { publicUuid: string },
          lobby,
          lobbies,
          publicUuid,
          isLocalCheck,
          user as User
        )
      case "LEAVE_LOBBY":
        return handleLeaveLobby(
          action as Action_LeaveLobby & { publicUuid: string },
          lobby,
          publicUuid,
          isLocalCheck,
          user as User
        )

      default:
        return { error: "Unknown action!" }
    }
  }
}

// ------------
// Action handlers
// ------------

const handleCreateLobby = (
  action: Action_CreateLobby & { publicUuid: string }
) => {
  const newLobby: MultiplayerLobby = {
    lobbyId: createLobbyId(),
    maxPlayers: 4,
    players: [action.publicUuid],
    host: action.publicUuid,
  }

  return {
    lobbyId: newLobby.lobbyId,
    newLobbyData: newLobby,
  }
}

const handleJoinLobby = (
  action: Action_JoinLobby & { publicUuid: string },
  lobby: MultiplayerLobby,
  lobbies: MultiplayerLobbies,
  publicUuid: string,
  isLocalCheck: boolean | undefined,
  user?: User
) => {
  // Check if publicUuid exists or if already in lobby
  if (!publicUuid) {
    return { error: "No publicUuid provided." }
  }

  if (lobby.players.includes(publicUuid)) {
    return { error: "PublicUuid already in lobby." }
  }

  // Check if lobby exists
  if (!lobby) {
    return { error: "No lobby found.", lobby }
  }

  // Check if player is in any other lobby
  const playerInOtherLobby = Object.values(lobbies).some((lobby) =>
    lobby.players.includes(publicUuid)
  )
  if (playerInOtherLobby) {
    return { error: "Player is in another lobby." }
  }

  // Check if lobby is full
  if (lobby.players.length >= lobby.maxPlayers) {
    return { error: "Lobby is full." }
  }

  // Add publicUuid to lobby players
  return {
    lobbyId: lobby.lobbyId,
    newLobbyData: {
      ...lobby,
      players: [...lobby.players, publicUuid],
    },
  }
}

const handleLeaveLobby = (
  action: Action_LeaveLobby & { publicUuid: string },
  lobby: MultiplayerLobby,
  publicUuid: string,
  isLocalCheck: boolean | undefined,
  user?: User
) => {
  // Check if publicUuid exists or if already in lobby
  if (!publicUuid) {
    return { error: "No publicUuid provided." }
  }

  if (!lobby.players.includes(publicUuid)) {
    return { error: "PublicUuid not in lobby." }
  }

  // Check if lobby exists
  if (!lobby) {
    return { error: "No lobby found." }
  }

  // Remove publicUuid from lobby players
  const newLobbyData: MultiplayerLobby = {
    ...lobby,
    players: lobby.players.filter((p) => p !== publicUuid),
  }

  // Check if publicUuid was host
  if (lobby.host === publicUuid) {
    // Find new host
    const newHost = lobby.players.find((p) => p !== publicUuid)
    if (newHost) {
      newLobbyData.host = newHost
    }
  }

  return {
    lobbyId: action.lobbyId,
    newLobbyData,
  }
}
