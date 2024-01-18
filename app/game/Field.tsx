import styles from "@/styles/Field.module.css"

export const Field = ({ children }: { children: any }) => {
  return (
    <div id="fieldContainer" className={styles.container}>
      <div className={styles.field}>{children}</div>
    </div>
  )
}
