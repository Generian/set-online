import styles from "@/styles/Shape.module.css"

export type ShapeType = "oval" | "squiggle" | "box"
export type Color = "red" | "blue" | "green"
export type Shading = "solid" | "striped" | "open"
export type Count = 1 | 2 | 3

export const Shape = ({
  type,
  color,
  shading,
}: {
  type: ShapeType
  color: Color
  shading: Shading
}) => {
  switch (type) {
    case "oval":
      return (
        <div
          className={`${styles.shape} ${styles[type]} ${styles[color]} ${
            shading == "striped"
              ? styles[`${shading}_${color}`]
              : styles[shading]
          }`}
        ></div>
      )

    case "squiggle":
      return (
        <svg
          version="1.2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 100"
          className={`${styles[type]}`}
        >
          <defs>
            <pattern
              id={`${shading}_${color}`}
              x="0"
              y="0"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="3"
                cy="3"
                r="3"
                // style={{ stroke: "none", fill: "green" }}
                className={styles[`solid_${color}`]}
              />
            </pattern>
          </defs>
          <path
            className={`${styles.shape} ${styles[type]} ${styles[color]} ${
              shading == "striped" || shading == "solid"
                ? styles[`${shading}_${color}`]
                : styles[shading]
            }`}
            fill={`url(#${shading}_${color})`}
            d="m0 57.4c-1.3 34.4 22.3 42.7 30 42.6 17.3-0.2 25.9-19.4 42.7-19.1 16.8 0.2 46.9 13.1 72.4 10.7 21.3-2 36.1-10.7 45.2-24.3 6.1-9 10.7-24.5 9.7-35.9-1.1-12.6-9-31.1-27.7-31.4-18.7-0.3-26.8 19.4-41 22.1-21.2 4-64.4-14.3-86.8-12.6-25.8 1.8-43.7 24.8-44.5 47.9z"
          />
        </svg>
      )

    case "box":
      return (
        <div
          className={`${styles.shape} ${styles[type]} ${styles[color]} ${
            shading == "striped"
              ? styles[`${shading}_${color}`]
              : styles[shading]
          }`}
        ></div>
      )

    default:
      return <></>
  }
}
