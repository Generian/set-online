import { retrieveSpecificGameFromDatabase } from "@/prisma/database"
import { Action, Games } from "./gameHandling"
import { Users } from "./userHandling"

export type MetaAction = Action_GetGameData

export interface Action_GetGameData extends Action {
  lobbyId: string
}

export const handleMetaAction = async (
  action: MetaAction,
  games: Games,
  users: Users,
  privateUuid: string,
  socketId: string
): Promise<{
  newGamesData?: Games | undefined
  newUsersData?: Users | undefined
  error?: string | undefined
}> => {
  // // Resolve public uuid from private one
  // const user = users[privateUuid]

  // if (!user.publicUuid) {
  //   return { error: "Could not resolve user." }
  // }

  // if (!user.sockets.includes(socketId)) {
  //   return { error: "Socket unknown for given user." }
  // }

  // Handle action
  switch (action.type) {
    case "GET_GAME_DATA":
      return await fetchGameData(action as Action_GetGameData)

    default:
      return { error: "Unknown action!" }
  }
}

const fetchGameData = async (action: Action_GetGameData) => {
  const newGamesData: Games = {}
  const game = await retrieveSpecificGameFromDatabase(action.lobbyId)
  if (game) {
    newGamesData[game.lobbyId] = game
  }
  return { newGamesData }
}
