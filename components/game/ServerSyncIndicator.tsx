import styles from "@/styles/ServerSyncIndicator.module.css"
import { CircularProgress } from "@mui/material"

interface ServerSyncIndicatorProps {
  show: boolean
}

const ServerSyncIndicator = ({ show }: ServerSyncIndicatorProps) => {
  return (
    <div className={`${styles.container} ${show ? styles.show : ""}`}>
      <CircularProgress size={15} />
      <span className={styles.text}>{"Syncronising"}</span>
    </div>
  )
}

export default ServerSyncIndicator
;("")
