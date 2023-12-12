import styles from "@/styles/PageFrame.module.css"
import { HeadComponent } from "./Head"
import Header from "./Header"
import SocketConnection from "./SocketConnection"

interface SocketConnectionProps {
  children?: JSX.Element
}

const PageFrame = ({ children }: SocketConnectionProps) => {
  return (
    <SocketConnection>
      <HeadComponent>
        <div className={styles.container}>
          <Header />
          <div className={styles.bodyContainer}>{children}</div>
        </div>
      </HeadComponent>
    </SocketConnection>
  )
}

export default PageFrame
