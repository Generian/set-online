import styles from "@/styles/SetsCounter.module.css"
import { getPublicUuid } from "@/helpers/uuidHandler"
import { Game } from "@/helpers/gameHandling"

interface SetsCounterProps {
  game: Game
}

const SetsCounter = ({ game }: SetsCounterProps) => {
  const publicUuid = getPublicUuid()

  const { setsWon, players } = game

  let count

  if (players.find((p) => p == publicUuid)) {
    count = setsWon.filter((s) => s.publicUuid == publicUuid).length
  } else {
    count = setsWon.length
  }

  return (
    <div className={styles.container}>
      <span>Sets won:</span>
      <div className={styles.setsContainer}>{count}</div>
    </div>
  )
}

export default SetsCounter
