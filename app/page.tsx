import styles from "@/styles/Index.module.css"
import { StartGameButton, TutorialButton } from "./index/StartGameButton"
import GameChat from "./shared/GameChat"
import { TimeAttackGameHighscoreList } from "./game/Highscores"

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.columnContainer}>
        <StartGameButton gameType={"TIME_ATTACK"} />
        <StartGameButton gameType={"MULTIPLAYER"} />
        <TutorialButton />
      </div>
      <div className={styles.columnContainer}>
        <GameChat />
      </div>
      <div className={styles.columnContainer}>
        <TimeAttackGameHighscoreList />
      </div>
    </div>
  )
}
