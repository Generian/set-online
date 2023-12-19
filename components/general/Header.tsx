import styles from "@/styles/Header.module.css"
import { SocketContext } from "./SocketConnection"
import { useContext } from "react"
import { getPublicUuid } from "@/helpers/uuidHandler"
import { useRouter } from "next/router"
import Image from "next/image"
import logo from "public/set-logo.jpg"

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

  const router = useRouter()

  const handleClick = () => {
    router.push("/settings")
  }

  return (
    <div className={styles.userContainer} onClick={handleClick}>
      <div className={styles.username}>
        {user?.globalUsername ? user.globalUsername : "Unknow Player"}
      </div>
      <div className={styles.avatar}>
        {user?.globalUsername ? user.globalUsername.slice(0, 2) : "UP"}
      </div>
    </div>
  )
}

export default Header
