import { Action_SetUsername, UserAction } from "./types"

export interface User {
  sockets: string[]
  publicUuid: string
  globalUsername?: string
  online: boolean
}

export interface Users {
  [key: string]: User
}

export interface PublicUser {
  online: boolean
  globalUsername?: string
}

export interface PublicUsers {
  [key: string]: PublicUser
}

export const getUuidBySocketId = (socketId: string, users: Users) => {
  return Object.keys(users).find((uuid) =>
    users[uuid].sockets.includes(socketId)
  )
}

export const createPublicUserObject = (users: Users) => {
  const publicUsers: PublicUsers = {}

  Object.values(users).forEach((user) => {
    publicUsers[user.publicUuid] = {
      online: user.online,
      globalUsername: user.globalUsername,
    }
  })

  return publicUsers
}

export const handleUserAction = (
  action: UserAction,
  privateUuid: string,
  socketId: string,
  users: Users
): {
  newUserData?: User | undefined
  error?: string | undefined
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
  switch (action.type) {
    case "SET_USERNAME":
      return handleSetUsername(action as Action_SetUsername, user)

    default:
      return { error: "Unknown action!" }
  }
}

const handleSetUsername = (action: Action_SetUsername, user: User) => {
  if (!action.username) {
    return { error: "Username is required." }
  }

  const newUserData: User = { ...user, globalUsername: action.username }
  return { newUserData }
}
