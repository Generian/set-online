import { Dispatch, SetStateAction } from "react"
import { Games, getActionCategory, handleGameAction } from "./gameHandling"
import { EnrichedAction } from "@/components/general/SocketConnection"

export const handleActionLocally = (
  action: EnrichedAction,
  localGameData: Games,
  setLocalGameData: Dispatch<SetStateAction<Games>>
) => {
  if (
    getActionCategory(action) == "GAME" &&
    action.type !== "INITIALISE_GAME"
  ) {
    // Handle action
    const actionResponse = handleGameAction(
      action,
      localGameData,
      undefined,
      undefined,
      undefined,
      true
    )

    const { lobbyId, newGameData, error } = actionResponse

    if (error || !lobbyId || !newGameData) {
      console.error(error)
    } else {
      const newLocalGameData = { ...localGameData }
      newLocalGameData[lobbyId] = {
        ...newGameData,
        actions: [...newGameData.actions, action],
      }

      // Save game to database
      console.log("Setting new local game data:", newLocalGameData[lobbyId])
      setLocalGameData(newLocalGameData)
    }
  }
}
