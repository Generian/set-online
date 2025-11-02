import styles from "@/styles/Index.module.css"
import {
  MultiplayerButton,
  StartGameButton,
  TutorialButton,
} from "./index/StartGameButton"
import ChatComponent from "./shared/GameChat"
import { TimeAttackGameHighscoreList } from "./game/Highscores"

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.columnContainer}>
        <StartGameButton gameType={"TIME_ATTACK"} />
        <MultiplayerButton />
        <TutorialButton />
      </div>
      <div className={styles.columnContainer}>
        <ChatComponent />
      </div>
      <div className={styles.columnContainer}>
        <TimeAttackGameHighscoreList />
      </div>
    </div>
  )
}
