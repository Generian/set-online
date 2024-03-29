import Header from "@/app/Header"
import SocketConnection from "@/app/SocketConnection"
import "@/styles/globals.css"
import styles from "@/styles/PageFrame.module.css"
import { Suspense } from "react"

export const metadata = {
  title: "Play Set online!",
  description: "Web-based online version of the card game Set.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <SocketConnection>
            <div className={styles.container}>
              <Header />
              <div className={styles.bodyContainer}>{children}</div>
            </div>
          </SocketConnection>
        </Suspense>
      </body>
    </html>
  )
}
