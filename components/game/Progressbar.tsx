import LinearProgress from "@mui/material/LinearProgress"
import { useContext } from "react"
import { GameContext } from "./Game"
import styles from "@/styles/Progressbar.module.css"

const Progressbar = () => {
  const { game } = useContext(GameContext)
  let progress = 0

  if (game) {
    const cardsInSet = game.cards.filter((c) => c.set).length
    const allCards = game.cards.length
    progress = ((cardsInSet * 1.0) / allCards) * 100

    if (game.gameOver) {
      progress = 100
    }
  }

  return (
    <div className={styles.container}>
      <LinearProgress variant="determinate" value={progress} />
    </div>
  )
}

export default Progressbar
