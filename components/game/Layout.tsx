import styles from "@/styles/Layout.module.css"

interface LayoutProps {
  field: JSX.Element
  infoContainer: JSX.Element
  setsContainer: JSX.Element
  children?: JSX.Element
}

const Layout = ({
  field,
  infoContainer,
  setsContainer,
  children,
}: LayoutProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.field}>{field}</div>
      <div className={styles.infoContainer}>{infoContainer}</div>
      <div className={styles.setsContainer}>{setsContainer}</div>
      {children}
    </div>
  )
}

export default Layout
