import { getCookie } from "@/helpers/cookies"
import { GameAction, Games, UserAction } from "@/helpers/gameHandling"
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/helpers/socketHelpers"
import { PublicUsers } from "@/helpers/userHandling"
import { getUuid, handleNewUuid } from "@/helpers/uuidHandler"
import { useRouter } from "next/router"
import { createContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

interface SocketContextProps {
  gameData: Games
  userData: PublicUsers
  submitAction: (
    a: GameAction | UserAction,
    callback?: (obj: any) => void
  ) => void
}

export const SocketContext = createContext<SocketContextProps>({
  gameData: {},
  userData: {},
  submitAction: () => {},
})

interface SocketConnectionProps {
  children?: JSX.Element
}

const SocketConnection = ({ children }: SocketConnectionProps) => {
  const [gameData, setGameData] = useState<Games>({})
  const [userData, setUserData] = useState<PublicUsers>({})
  const [submitAction, setSubmitAction] = useState<
    (a: GameAction, callback?: (obj: any) => void) => void
  >((a: GameAction, callback?: (obj: any) => void) => {})

  const router = useRouter()
  let { lobbyId } = router.query

  // Initialise socket when component mounts
  useEffect(() => {
    socketInitializer()
  }, [])

  useEffect(() => {
    const submitActionHandler = (
      action: GameAction,
      callback?: (obj: any) => void
    ) => {
      const enrichedAction = {
        ...action,
        lobbyId,
      }
      console.log("Submit action:", enrichedAction)
      socket.emit("action", getUuid(), enrichedAction, callback)
    }

    setSubmitAction((s: any) => {
      return submitActionHandler
    })
  }, [lobbyId])

  const socketInitializer = async () => {
    console.log("Initialising socket")
    await fetch("/api/socket")
    socket = io()

    socket.on("connect", () => {
      console.log("connected", socket.id)

      socket.emit(
        "requestUuid",
        getCookie("uuid"),
        getCookie("publicUuid"),
        (newUuid, newPublicUuid) => {
          handleNewUuid(newUuid, "uuid")
          handleNewUuid(newPublicUuid, "publicUuid")
        }
      )
    })

    socket.on("gameDataUpdate", (data: Games) => {
      console.log("receiving game data:", data)
      setGameData(data)
    })

    socket.on("userDataUpdate", (data: PublicUsers) => {
      console.log("receiving user data:", data)
      setUserData(data)
    })
  }

  return (
    <SocketContext.Provider value={{ gameData, userData, submitAction }}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketConnection
