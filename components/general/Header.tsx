import styles from "@/styles/Header.module.css"
import { SocketContext } from "./SocketConnection"
import { useContext } from "react"
import { getPublicUuid } from "@/helpers/uuidHandler"
import { useRouter } from "next/router"
import Image from "next/image"
import logo from "public/set-logo.jpg"
import useUserPreferences from "@/helpers/useUserPreferences"

const Header = () => {
  const router = useRouter()

  const handleLogoClick = () => {
    router.push("/")
  }

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer} onClick={handleLogoClick}>
        <Image src={logo} alt="logo" priority={true} className={styles.logo} />
      </div>
      <div className={styles.user}>
        <User />
      </div>
    </div>
  )
}

const User = () => {
  const { userData } = useContext(SocketContext)
  const user = userData[getPublicUuid()]
  const { username } = useUserPreferences()

  const router = useRouter()

  const handleClick = () => {
    router.push("/settings")
  }

  const usernameString = user?.globalUsername
    ? user.globalUsername
    : username
    ? username
    : ""

  return (
    <div className={styles.userContainer} onClick={handleClick}>
      <div className={styles.username}>{usernameString}</div>
      <div className={styles.avatar}>
        {usernameString ? usernameString.slice(0, 2) : "UP"}
      </div>
    </div>
  )
}

export default Header
