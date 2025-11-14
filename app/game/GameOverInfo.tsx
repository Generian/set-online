import styles from "@/styles/GameOverInfo.module.css"
import { Game, TimeAttackGame } from "@/helpers/types"
import { formatTime } from "./Timer"
import { StartGameButton } from "../index/StartGameButton"
import SetsCounter from "./SetsCounter"

const GameOverInfo = ({ game }: { game: Game }) => {
  if (game.gameType == "TIME_ATTACK") {
    const {
      gameOver,
      timeAttackAttributes: { startTime, userPenalties },
    } = game as TimeAttackGame
    return (
      <div className={styles.container}>
        <h2 className={styles.headline}>Finished!</h2>
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
              {userPenalties[game.players[0]]
                ? userPenalties[game.players[0]]
                : 0}
            </span>
          </div>
          <div className={styles.detailsContainerRow}>
            <span className={styles.category}>Total</span>
            <span className={styles.value}>
              {formatTime(
                gameOver -
                  startTime +
                  (userPenalties[game.players[0]]
                    ? userPenalties[game.players[0]] * 60 * 1000
                    : 0)
              )}
            </span>
          </div>
          <div className={styles.playAgainContainer}>
            <StartGameButton
              gameType="TIME_ATTACK"
              label="Play again"
              size="small"
            />
          </div>
        </div>
      </div>
    )
  } else if (game.gameType == "MULTIPLAYER") {
    return (
      <div className={styles.container}>
        <h2 className={styles.headline}>Finished!</h2>
        <div className={styles.detailsContainerMultiplayer}>
          <SetsCounter game={game} gameOverMode={true} />
          <div className={styles.playAgainContainer}></div>
        </div>
      </div>
    )
  } else {
    return <></>
  }
}

export default GameOverInfo
