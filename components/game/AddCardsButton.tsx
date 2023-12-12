import { useContext } from "react"
import { SocketContext } from "../general/SocketConnection"
import styles from "@/styles/AddCardsButton.module.css"

const AddCardsButton = () => {
  let { submitAction } = useContext(SocketContext)

  return (
    <div
      className={styles.container}
      onClick={() =>
        submitAction({
          type: "REQUEST_CARDS",
        })
      }
    >
      <button className={styles.button}>+</button>
    </div>
  )
}

export default AddCardsButton
