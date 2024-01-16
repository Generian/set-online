import { getCookie } from "@/helpers/cookies"
import { GameAction, Games, UserAction } from "@/helpers/gameHandling"
import { handleActionLocally } from "@/helpers/handleActionLocally"
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/helpers/socketHelpers"
import { PublicUsers } from "@/helpers/userHandling"
import { getPublicUuid, getUuid, handleNewUuid } from "@/helpers/uuidHandler"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react"
import { io, Socket } from "socket.io-client"

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

interface SocketContextProps {
  gameData: Games
  localGameData: Games
  setLocalGameData: Dispatch<SetStateAction<Games>>
  userData: PublicUsers
  submitAction: (
    a: GameAction | UserAction,
    callback?: (obj: any) => void
  ) => void
}

export const SocketContext = createContext<SocketContextProps>({
  gameData: {},
  localGameData: {},
  setLocalGameData: () => {},
  userData: {},
  submitAction: () => {},
})

interface SocketConnectionProps {
  children?: JSX.Element
}

export type EnrichedAction = (GameAction | UserAction) & {
  lobbyId: string
  publicUuid: string
}

const SocketConnection = ({ children }: SocketConnectionProps) => {
  const [gameData, setGameData] = useState<Games>({})
  const [localGameData, setLocalGameData] = useState<Games>({})
  const [userData, setUserData] = useState<PublicUsers>({})
  const [submitAction, setSubmitAction] = useState<
    (a: GameAction, callback?: (obj: any) => void) => void
  >((a: GameAction, callback?: (obj: any) => void) => {})

  // const router = useRouter()
  const searchParams = useSearchParams()
  const lobbyId = searchParams?.get("lobbyId")

  // Initialise socket when component mounts
  useEffect(() => {
    socketInitializer()
  }, [])

  useEffect(() => {
    const submitActionHandler = (
      action: GameAction,
      callback?: (obj: any) => void
    ) => {
      const enrichedAction: EnrichedAction = {
        ...action,
        lobbyId: lobbyId as string,
        publicUuid: getPublicUuid(),
      }
      console.log("Submit action:", enrichedAction)

      // Local action handling
      handleActionLocally(
        enrichedAction,
        localGameData,
        setLocalGameData,
        callback
      )

      // Emit action to server
      socket && socket.emit("action", getUuid(), enrichedAction, callback)
    }

    setSubmitAction((s: any) => {
      return submitActionHandler
    })
  }, [lobbyId, localGameData])

  useEffect(() => {
    console.log(
      "local:",
      localGameData,
      lobbyId,
      localGameData[lobbyId as string]
    )
  }, [localGameData, lobbyId])

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
      setLocalGameData((localGameData) => {
        if (!Object.keys(localGameData).length) {
          console.log("Setting local game data from scratch.")
          return { ...data }
        } else if (typeof lobbyId == "string" && !localGameData[lobbyId]) {
          console.log("Enriching local game data with data for this lobby.")
          return { ...data }
        } else {
          console.log("Local game data for lobby already set. Not updating.")
          return localGameData
        }
      })
    })

    socket.on("userDataUpdate", (data: PublicUsers) => {
      console.log("receiving user data:", data)
      setUserData(data)
    })
  }

  return (
    <SocketContext.Provider
      value={{
        gameData,
        localGameData,
        setLocalGameData,
        userData,
        submitAction,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export default SocketConnection
