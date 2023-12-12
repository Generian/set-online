import styles from "@/styles/Index.module.css"
import PageFrame from "@/components/general/PageFrame"
import { StartGameButton } from "@/components/indexPage/StartGameButton"

export default function Home() {
  return (
    <PageFrame>
      <div className={styles.container}>
        <StartGameButton gameType={"TIME_ATTACK"} />
        <StartGameButton gameType={"MULTIPLAYER"} />
      </div>
    </PageFrame>
  )
}
