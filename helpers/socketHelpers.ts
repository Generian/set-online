import { ChatMessage } from "@/app/shared/GameChat"
import { Games } from "./gameHandling"
import { PublicUsers } from "./userHandling"

export interface ServerToClientEvents {
  gameDataUpdate: (data: Games) => void
  userDataUpdate: (data: PublicUsers) => void
  chatDataUpdate: (newChatMessages: ChatMessage[]) => void
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
