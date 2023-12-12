import styles from "@/styles/SetsCounter.module.css"
import { getPublicUuid } from "@/helpers/uuidHandler"
import { Game } from "@/helpers/gameHandling"

interface SetsCounterProps {
  game: Game
}

const SetsCounter = ({ game }: SetsCounterProps) => {
  const publicUuid = getPublicUuid()

  const { setsWon } = game

  const count = setsWon.filter((s) => s.publicUuid == publicUuid).length

  return (
    <div className={styles.container}>
      <span>Sets won:</span>
      <div className={styles.setsContainer}>{count}</div>
    </div>
  )
}

export default SetsCounter
