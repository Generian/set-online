import styles from "@/styles/StartGameButton.module.css"
import { SocketContext } from "@/components/general/SocketConnection"
import { useRouter } from "next/router"
import { useContext } from "react"
import { GameType } from "@/helpers/gameHandling"

interface StartGameButtonProps {
  gameType: GameType
}

export const StartGameButton = ({ gameType }: StartGameButtonProps) => {
  let { submitAction } = useContext(SocketContext)

  const router = useRouter()

  const navigateToGamePage = (obj: any) => {
    router.push(`/game?lobbyId=${obj.lobbyId}`)
  }

  const handleClick = () => {
    submitAction(
      {
        type: "INITIALISE_GAME",
        gameType,
      },
      navigateToGamePage
    )
  }

  const disabled = gameType == "MULTIPLAYER"

  return (
    <div
      className={`${styles.container} ${disabled ? styles.disabled : ""}`}
      onClick={() => {
        !disabled && handleClick()
      }}
    >
      <h2>{gameType == "TIME_ATTACK" ? "Time attack!" : "Multiplayer"}</h2>
    </div>
  )
}
