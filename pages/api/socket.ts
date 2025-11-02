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
  LobbyAction,
  Games,
  MultiplayerLobbies,
  UserAction,
  getActionCategory,
} from "@/helpers/types"
import {
  retrieveListOfGamesFromDatabase,
  retrieveListOfUsersFromDatabase,
  saveGameToDatabase,
  saveUserToDatabase,
} from "@/app/actions/databaseActions"
import { handleMetaAction } from "@/helpers/metaHandling"
import { ChatMessage } from "@/app/shared/GameChat"
import { Highscore } from "@/app/game/Highscores"
import { handleGameAction } from "@/helpers/gameHandling"
import { handleLobbyAction } from "@/helpers/lobbyHandling"

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
    let highscores: Highscore[] = []

    let lobbies: MultiplayerLobbies = {}
    let chat: ChatMessage[] = []

    // Define shared functions
    const sendChatMessage = (
      action: ChatAction & {
        lobbyId: string
        publicUuid: string
      }
    ) => {
      const { publicUuid, lobbyId, message, addGameLink } = action

      // Message is user-entered message. Must be cleaned and sanitized
      const cleanedMessage = message.replace(/<[^>]*>?/g, "").trim()

      // Limit message length to 500 characters
      if (cleanedMessage.length > 500) {
        return // Reject message if too long
      }

      const newChatMessage: ChatMessage = {
        publicUuid,
        lobbyId,
        message,
        time: new Date().getTime(),
        messageUuid: v4(),
        addGameLink,
      }

      let removedChatMessageUuids: string[] = []

      if (addGameLink) {
        // Remove previous game start messages for same user
        removedChatMessageUuids = chat
          .filter(
            (message) =>
              message.publicUuid === publicUuid && message.addGameLink
          )
          .map((message) => message.messageUuid)

        chat = chat.filter(
          (message) => !removedChatMessageUuids.includes(message.messageUuid)
        )
      }

      // Add new message to chat array
      chat = [...chat, newChatMessage]

      // Send chat data to clients
      io.emit("chatDataUpdate", chat, removedChatMessageUuids)
    }

    // On server start, fetch data from database
    users = await retrieveListOfUsersFromDatabase()
    games = await retrieveListOfGamesFromDatabase()

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

          // Send multiplayer lobby data to client
          socket.emit("multiplayerLobbyDataUpdate", { ...lobbies })

          // Send chat data to client
          socket.emit("chatDataUpdate", chat)
        }
      )

      // Game handling
      socket.on(
        "action",
        async (
          privateUuid: string,
          action: (GameAction | LobbyAction | UserAction) & {
            lobbyId: string
            publicUuid: string
          },
          callback?: (obj: any) => void
        ) => {
          const publicUuid = users[privateUuid].publicUuid

          if (getActionCategory(action) == "LOBBY") {
            // Handle action
            const actionResponse = handleLobbyAction(
              action,
              lobbies,
              privateUuid,
              socket.id,
              users
            )

            const { lobbyId, newLobbyData, error } = actionResponse

            if (error || !lobbyId || !newLobbyData) {
              console.error(error)
            } else {
              if (newLobbyData.players.length === 0) {
                // Remove lobby when last player leaves
                delete lobbies[lobbyId]
              } else {
                lobbies[lobbyId] = newLobbyData
              }
              io.emit("multiplayerLobbyDataUpdate", { ...lobbies })
              callback && callback(actionResponse)
            }
          } else if (getActionCategory(action) == "GAME") {
            // Handle action
            const actionResponse = handleGameAction(
              action,
              games,
              lobbies,
              highscores,
              privateUuid,
              socket.id,
              users
            )

            const { lobbyId, lobbyIdToDelete, newGameData, error, chatAction } =
              actionResponse

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

              // In case a multiplayer game has been started, delete the lobby
              if (lobbyIdToDelete) {
                delete lobbies[lobbyIdToDelete]
                io.emit("multiplayerLobbyDataUpdate", { ...lobbies })
              }

              // Send chat message
              if (chatAction) {
                sendChatMessage(chatAction)
              }

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
              highscores,
              privateUuid,
              socket.id
            )

            const { newGamesData, newUsersData, newHighscores, error } =
              actionResponse

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
            sendChatMessage(
              action as ChatAction & {
                lobbyId: string
                publicUuid: string
              }
            )

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

          // Remove from any lobby and transfer host if needed
          const publicUuid = users[uuid].publicUuid
          Object.values(lobbies).forEach((l) => {
            if (l.players.includes(publicUuid)) {
              l.players = l.players.filter((p) => p !== publicUuid)
              if (l.players.length === 0) {
                delete lobbies[l.lobbyId]
              } else if (l.host === publicUuid) {
                l.host = l.players[0]
              }
            }
          })

          // Send multiplayer lobby data to client
          io.emit("multiplayerLobbyDataUpdate", { ...lobbies })

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
