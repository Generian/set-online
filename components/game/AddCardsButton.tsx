import { useContext } from "react"
import { SocketContext } from "../general/SocketConnection"
import styles from "@/styles/AddCardsButton.module.css"
import AddIcon from "@mui/icons-material/Add"
import { GameContext } from "./Game"
import { getCoordinatesAndSize } from "@/helpers/positions"
import useViewportDimensions from "@/helpers/useViewportDimensions"

const AddCardsButton = () => {
  const { submitAction } = useContext(SocketContext)
  const { game } = useContext(GameContext)

  const viewportDimensions = useViewportDimensions()
  const { isMobile } = viewportDimensions

  const cardsLeft =
    game && game.cards.filter((c) => c.hidden && !c.column && !c.row).length > 0

  if (game?.gameOver || !cardsLeft) {
    return <></>
  }

  const { left, top, height } = getCoordinatesAndSize(
    viewportDimensions,
    null,
    null,
    4,
    false
  )

  return (
    <div
      className={styles.container}
      style={{ left, top, height }}
      onClick={() =>
        submitAction({
          type: "REQUEST_CARDS",
        })
      }
    >
      <div className={styles.button}>
        <AddIcon fontSize={isMobile ? "medium" : "large"} />
      </div>
    </div>
  )
}

export default AddCardsButton
