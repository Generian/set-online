import { useContext } from "react"
import { SocketContext } from "../general/SocketConnection"
import styles from "@/styles/AddCardsButton.module.css"
import AddIcon from "@mui/icons-material/Add"

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
      <div className={styles.button}>
        <AddIcon fontSize="large" />
      </div>
    </div>
  )
}

export default AddCardsButton
