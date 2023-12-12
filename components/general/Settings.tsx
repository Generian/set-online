import { getPublicUuid } from "@/helpers/uuidHandler"
import styles from "@/styles/Settings.module.css"
import { TextField } from "@mui/material"
import { useContext } from "react"
import { SocketContext } from "./SocketConnection"

const Settings = () => {
  const { userData } = useContext(SocketContext)
  let { submitAction } = useContext(SocketContext)

  const user = userData[getPublicUuid()]

  if (!user) return <></>

  const { globalUsername } = user

  // Event handlers
  const handleUsernameChange = (newUsername: string) => {
    console.log(newUsername)
    submitAction({
      type: "SET_USERNAME",
      username: newUsername,
    })
  }

  return (
    <div className={styles.container}>
      <h1>Settings</h1>
      <div>
        <TextField
          id="outlined-basic"
          label="Username"
          variant="outlined"
          defaultValue={globalUsername ? globalUsername : ""}
          onBlur={(event) => handleUsernameChange(event.target.value)}
        />
      </div>
    </div>
  )
}

export default Settings
