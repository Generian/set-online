import { Game } from "@/helpers/types"
import styles from "@/styles/SetAnnouncer.module.css"
import { useContext, useEffect, useRef, useState } from "react"
import { UserPreferencesContext } from "../UserPreferences"

interface SetAnnouncerProps {
  game: Game
}

const SetAnnouncer = ({ game }: SetAnnouncerProps) => {
  const [wonSets, setWonSets] = useState(0)
  const [showSetAnnouncer, setShowSetAnnouncer] = useState(false)
  const isFirstRender = useRef(true)
  const { cleanMode } = useContext(UserPreferencesContext)

  const { setsWon } = game as Game

  useEffect(() => {
    if (!isFirstRender.current) {
      setWonSets(setsWon.length)
    } else {
      isFirstRender.current = false
    }
  }, [setsWon])

  useEffect(() => {
    let timeout: NodeJS.Timer | undefined = undefined
    setShowSetAnnouncer(true)
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      setShowSetAnnouncer(false)
    }, 2000)

    return () => {
      clearTimeout(timeout)
    }
  }, [wonSets])

  if (cleanMode) return <></>

  return (
    <div className={styles.container}>
      <svg
        version="1.2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 630 300"
        width="630"
        height="300"
        className={`${styles.image} ${
          showSetAnnouncer && wonSets ? styles.animate : ""
        }`}
      >
        <path
          className={styles.shape}
          d="M 42.823 98.89 L 146.823 134.89 L 4.823 172.89 L 163.823 176.89 L 43.823 243.89 L 170.823 225.89 L 150.823 290.89 L 251.823 235.89 L 289.823 285.89 L 339.823 242.89 L 463.823 283.89 L 422.823 208.89 L 537.823 214.89 L 490.823 172.89 L 620.823 148.89 L 495.823 116.89 L 558.823 52.89 L 416.823 92.89 L 481.823 3.89 L 335.823 78.89 L 290.823 22.89 L 225.823 82.89 L 147.823 49.89 L 178.823 91.89 L 42.823 98.89 Z M 42.823 98.89 L 146.823 134.89 L 4.823 172.89 L 163.823 176.89 L 43.823 243.89 L 170.823 225.89 L 150.823 290.89 L 251.823 235.89 L 289.823 285.89 L 339.823 242.89 L 463.823 283.89 L 422.823 208.89 L 537.823 214.89 L 490.823 172.89 L 620.823 148.89 L 495.823 116.89 L 558.823 52.89 L 416.823 92.89 L 481.823 3.89 L 335.823 78.89 L 290.823 22.89 L 225.823 82.89 L 147.823 49.89 L 178.823 91.89 L 42.823 98.89 Z"
        />
        <path
          id="letter_S"
          className={styles.text}
          d="M 223.745 102.509 L 194.745 78.509 C 194.745 78.509 162.745 96.809 167.745 130.509 C 172.745 164.209 188.945 163.809 195.545 185.009 C 202.045 205.709 173.745 215.509 173.745 215.509 L 208.745 242.509 C 208.745 242.509 234.145 223.309 233.945 194.509 C 233.745 166.109 225.145 158.809 210.845 145.809 C 206.345 141.709 200.445 129.509 206.645 120.609 C 213.245 111.009 223.745 102.509 223.745 102.509 Z"
        />
        <path
          id="letter_E"
          className={styles.text}
          d="M 240.745 97.509 C 240.745 97.509 248.745 138.609 249.745 158.509 C 250.745 178.409 251.745 218.509 251.745 218.509 C 251.745 218.509 271.145 217.409 289.745 218.509 C 308.345 219.609 323.745 220.509 323.745 220.509 L 324.745 189.509 L 280.745 190.509 L 278.745 167.509 L 312.745 159.509 L 312.745 136.509 L 276.745 143.509 L 274.745 119.509 L 312.745 111.509 L 312.745 79.509 C 312.745 79.509 294.645 84.309 280.745 87.509 C 266.845 90.709 240.745 97.509 240.745 97.509 Z"
        />
        <path
          id="letter_T"
          className={styles.text}
          d="M 351.745 213.509 L 395.745 207.509 C 395.745 207.509 388.545 161.809 386.745 149.509 C 384.945 137.209 381.745 99.509 381.745 99.509 L 402.745 98.509 L 409.245 62.809 C 409.245 62.809 368.645 71.409 347.245 74.909 C 334.845 76.909 324.745 74.509 324.745 74.509 C 324.745 74.509 325.645 79.409 324.745 90.509 C 323.845 101.609 321.745 108.509 321.745 108.509 C 321.745 108.509 326.154 109.031 333.745 107.509 C 341.336 105.987 351.745 101.509 351.745 101.509 C 351.745 101.509 353.045 170.209 352.745 176.509 C 352.445 182.809 351.745 213.509 351.745 213.509 Z"
        />
        <path
          id="letter_!"
          className={styles.text}
          d="M 437.745 58.509 C 437.745 58.509 442.445 97.809 442.745 110.509 C 443.045 123.209 445.745 156.509 445.745 156.509 C 445.745 156.509 465.745 160.709 461.745 159.509 C 457.745 158.309 472.745 162.509 472.745 162.509 C 472.745 162.509 475.945 114.909 476.745 102.509 C 477.545 90.109 478.745 44.509 478.745 44.509 C 478.745 44.509 463.245 52.209 455.745 54.509 C 448.245 56.809 437.745 58.509 437.745 58.509 Z M 443.345 176.909 C 439.045 183.709 439.245 198.309 449.045 200.609 C 458.845 203.009 468.345 203.709 474.745 196.109 C 478.045 192.209 478.345 174.109 467.745 171.509 C 454.445 168.309 446.545 172.009 443.345 176.909 Z"
        />
      </svg>
    </div>
  )
}

export default SetAnnouncer
