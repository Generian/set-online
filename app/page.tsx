import styles from "@/styles/Index.module.css"
import { StartGameButton } from "./index/StartGameButton"
import ActiveUserCount from "./index/ActiveUsersCount"

export default function Home() {
  return (
    <div className={styles.container}>
      <StartGameButton gameType={"TIME_ATTACK"} />
      <StartGameButton gameType={"MULTIPLAYER"} />
      <div className={styles.activeUserCountContainer}>
        <ActiveUserCount />
      </div>
    </div>
  )
}
