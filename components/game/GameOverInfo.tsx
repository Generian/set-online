import styles from "@/styles/GameOverInfo.module.css"
import { Game } from "@/helpers/gameHandling"

const GameOverInfo = ({ game }: { game: Game }) => {
  return (
    <div className={styles.container}>
      <span>Game over!</span>
    </div>
  )
}

export default GameOverInfo
