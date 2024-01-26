import { Server } from "socket.io"
import type { NextApiRequest, NextApiResponse } from "next"
import type { Server as HTTPServer } from "http"
import { Socket as NetSocket } from "net"
import type { Server as IOServer } from "socket.io"
import { v4 } from "uuid"
import {
  Users,
  createPublicUserObject,
  getUuidBySocketId,
  handleUserAction,
} from "@/helpers/userHandling"
import {
  ChatAction,
  GameAction,
  Games,
  UserAction,
  getActionCategory,
  handleGameAction,
} from "@/helpers/gameHandling"
import {
  retrieveListOfGamesFromDatabase,
  retrieveListOfUsersFromDatabase,
  saveGameToDatabase,
  saveUserToDatabase,
} from "@/app/actions/databaseActions"
import { handleMetaAction } from "@/helpers/metaHandling"
import { ChatMessage } from "@/app/shared/GameChat"

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

const SocketHandler = async (
  _: NextApiRequest,
  res: NextApiResponseWithSocket
) => {
  if (res?.socket?.server?.io) {
    console.log("Socket is already running")
  } else {
    console.log("Socket is initializing")
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    // Set variables
    let users: Users = {}
    let games: Games = {}
    let chat: ChatMessage[] = []

    // On server start, fetch data from database
    games = await retrieveListOfGamesFromDatabase()
    users = await retrieveListOfUsersFromDatabase()

    // Logic starts here
    io.on("connection", (socket) => {
      console.log("connected")
      // Set user uuid
      socket.on(
        "requestUuid",
        (
          uuid: string | undefined,
          publicUuid: string | undefined,
          callback: (newUuid: string, newPublicUuid: string) => void
        ) => {
          let newUuid = uuid
          let newPublicUuid = publicUuid
          if (newUuid && uuid && publicUuid && newPublicUuid) {
            const user = users[uuid]
            if (user) {
              // Update user online status
              users[uuid].online = true

              // Fetch publicUuid
              newPublicUuid = users[uuid].publicUuid

              // Store socketId
              if (!user.sockets.includes(socket.id)) {
                users[uuid] = {
                  ...user,
                  sockets: [...users[uuid].sockets, socket.id],
                }
              }
            } else {
              users[uuid] = {
                sockets: [socket.id],
                publicUuid, // Ideally store in db and retrieve from there at some point
                online: true,
              }
            }
          } else {
            newUuid = v4()
            newPublicUuid = v4()
            users[newUuid] = {
              sockets: [socket.id],
              publicUuid: newPublicUuid,
              online: true,
            }
          }

          // Save user to database
          saveUserToDatabase(users[newUuid], newUuid)

          // Update the client
          callback(newUuid, newPublicUuid)

          // Update all users
          io.emit("userDataUpdate", createPublicUserObject(users))

          // Send game data to client
          socket.emit("gameDataUpdate", { ...games })

          // Send chat data to client
          socket.emit("chatDataUpdate", chat)
        }
      )

      // Game handling
      socket.on(
        "action",
        async (
          privateUuid: string,
          action: (GameAction | UserAction) & {
            lobbyId: string
            publicUuid: string
          },
          callback?: (obj: any) => void
        ) => {
          // Log new action received by the server
          console.log("action:", action)

          const publicUuid = users[privateUuid].publicUuid

          if (getActionCategory(action) == "GAME") {
            // Handle action
            const actionResponse = handleGameAction(
              action,
              games,
              privateUuid,
              socket.id,
              users
            )

            const { lobbyId, newGameData, error } = actionResponse

            if (error || !lobbyId || !newGameData) {
              console.error(error)
            } else {
              games[lobbyId] = {
                ...newGameData,
                actions: [
                  ...newGameData.actions,
                  {
                    ...action,
                    publicUuid,
                  },
                ],
              }

              // Save game to database
              saveGameToDatabase(games[lobbyId])

              // Return values
              io.emit("gameDataUpdate", { ...games })
              callback && callback(actionResponse)
            }
          } else if (getActionCategory(action) == "USER") {
            console.log("handle user action")

            // Handle action
            const actionResponse = handleUserAction(
              action as UserAction,
              privateUuid,
              socket.id,
              users
            )

            const { newUserData, error } = actionResponse

            if (error || !newUserData) {
              console.error(error)
            } else {
              users[privateUuid] = newUserData

              // Save user to database
              saveUserToDatabase(newUserData, privateUuid)

              // Return values
              io.emit("userDataUpdate", createPublicUserObject(users))
              callback && callback(actionResponse)
            }
          } else if (getActionCategory(action) == "META") {
            const actionResponse = await handleMetaAction(
              action,
              games,
              users,
              privateUuid,
              socket.id
            )

            const { newGamesData, newUsersData, error } = actionResponse

            if (error) {
              console.error(error)
            } else {
              if (newGamesData) {
                games = { ...games, ...newGamesData }
                io.emit("gameDataUpdate", { ...games })
              }

              if (newUsersData) {
                users = { ...users, ...newUsersData }
                io.emit("userDataUpdate", createPublicUserObject(users))
              }

              // Handle callback
              callback && callback(actionResponse)
            }
          } else if (getActionCategory(action) == "CHAT") {
            const { publicUuid, lobbyId, message } = action as ChatAction & {
              lobbyId: string
              publicUuid: string
            }
            const newChatMessage: ChatMessage = {
              publicUuid,
              lobbyId,
              message,
              time: new Date().getTime(),
              messageUuid: v4(),
            }
            chat = [...chat, newChatMessage]
            io.emit("chatDataUpdate", [newChatMessage])

            // Handle callback
            callback && callback({ valid: true })
          }
        }
      )

      // Handle disconnect
      socket.on("disconnect", () => {
        const uuid = getUuidBySocketId(socket.id, users)

        if (uuid) {
          // Update user online status
          users[uuid].online = false

          // Inform users
          io.emit("userDataUpdate", createPublicUserObject(users))

          console.log("player disconnected:", users[uuid]?.globalUsername)
        } else {
          console.warn("user without uuid disconnected:", socket.id)
        }
      })
    })
  }
  res.end()
}

export default SocketHandler
