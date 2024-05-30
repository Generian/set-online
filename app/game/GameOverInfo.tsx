import styles from "@/styles/GameOverInfo.module.css"
import { Game, TimeAttackGame } from "@/helpers/gameHandling"
import { formatTime } from "./Timer"

const GameOverInfo = ({ game }: { game: Game }) => {
  if (game.gameType == "TIME_ATTACK") {
    const {
      gameOver,
      timeAttackAttributes: { startTime, userPenalties },
    } = game as TimeAttackGame
    return (
      <div className={styles.container}>
        <h2 className={styles.headline}>Game over!</h2>
        <div className={styles.detailsContainer}>
          <div className={styles.detailsContainerRow}>
            <span className={styles.category}>Time</span>
            <span className={styles.value}>
              {formatTime(gameOver - startTime)}
            </span>
          </div>
          <div className={styles.detailsContainerRow}>
            <span className={styles.category}>Penalties</span>
            <span className={styles.value}>
              {userPenalties[game.players[0]]}
            </span>
          </div>
          <div className={styles.detailsContainerRow}>
            <span className={styles.category}>Total</span>
            <span className={styles.value}>
              {formatTime(
                gameOver -
                  startTime +
                  userPenalties[game.players[0]] * 60 * 1000
              )}
            </span>
          </div>
        </div>
      </div>
    )
  } else {
    return <></>
  }
}

export default GameOverInfo
