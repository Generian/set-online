import styles from "@/styles/GameOverInfo.module.css"
import { Game } from "@/helpers/gameHandling"

const GameOverInfo = ({ game }: { game: Game }) => {
  return (
    <div className={styles.container}>
      <div className={styles.contentContainer}>
        <svg
          version="1.2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 630 300"
          width="150%"
          className={styles.shape}
        >
          <path d="M 42.823 98.89 L 146.823 134.89 L 4.823 172.89 L 163.823 176.89 L 43.823 243.89 L 170.823 225.89 L 150.823 290.89 L 251.823 235.89 L 289.823 285.89 L 339.823 242.89 L 463.823 283.89 L 422.823 208.89 L 537.823 214.89 L 490.823 172.89 L 620.823 148.89 L 495.823 116.89 L 558.823 52.89 L 416.823 92.89 L 481.823 3.89 L 335.823 78.89 L 290.823 22.89 L 225.823 82.89 L 147.823 49.89 L 178.823 91.89 L 42.823 98.89 Z M 42.823 98.89 L 146.823 134.89 L 4.823 172.89 L 163.823 176.89 L 43.823 243.89 L 170.823 225.89 L 150.823 290.89 L 251.823 235.89 L 289.823 285.89 L 339.823 242.89 L 463.823 283.89 L 422.823 208.89 L 537.823 214.89 L 490.823 172.89 L 620.823 148.89 L 495.823 116.89 L 558.823 52.89 L 416.823 92.89 L 481.823 3.89 L 335.823 78.89 L 290.823 22.89 L 225.823 82.89 L 147.823 49.89 L 178.823 91.89 L 42.823 98.89 Z" />
        </svg>
        <span className={styles.text}>Game over!</span>
      </div>
    </div>
  )
}

export default GameOverInfo
