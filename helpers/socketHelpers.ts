import { ChatMessage } from "@/app/shared/GameChat"
import { PublicUsers } from "./userHandling"
import { Games, MultiplayerLobbies } from "./types"

export interface ServerToClientEvents {
  gameDataUpdate: (data: Games) => void
  multiplayerLobbyDataUpdate: (data: MultiplayerLobbies) => void
  userDataUpdate: (data: PublicUsers) => void
  chatDataUpdate: (
    newChatMessages: ChatMessage[],
    removedChatMessageUuids?: string[]
  ) => void
}

export interface ClientToServerEvents {
  requestUuid: (
    uuid: string | null | undefined,
    publicUuid: string | null | undefined,
    callback: (uuid: string, publicUuid: string) => void
  ) => void
  action: (
    privateUuid: string,
    action: any,
    callback?: (obj: any) => void
  ) => void
}
