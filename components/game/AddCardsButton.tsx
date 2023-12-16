import { useContext } from "react"
import { SocketContext } from "../general/SocketConnection"
import styles from "@/styles/AddCardsButton.module.css"
import AddIcon from "@mui/icons-material/Add"
import { GameContext } from "./Game"

const AddCardsButton = () => {
  let { submitAction } = useContext(SocketContext)
  let { game } = useContext(GameContext)

  const cardsLeft =
    game && game.cards.filter((c) => c.hidden && !c.column && !c.row).length > 0

  if (game?.gameOver || !cardsLeft) {
    return <></>
  }

  return (
    <div
      className={styles.container}
      onClick={() =>
        submitAction({
          type: "REQUEST_CARDS",
        })
      }
    >
      <div className={styles.button}>
        <AddIcon fontSize="large" />
      </div>
    </div>
  )
}

export default AddCardsButton
