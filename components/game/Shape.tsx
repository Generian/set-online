import styles from "@/styles/Shape.module.css"

export type ShapeType = "oval" | "squiggle" | "box"
export type Color = "red" | "blue" | "green"
export type Shading = "solid" | "striped" | "open"
export type Count = 1 | 2 | 3

export type BoxVariant = "RECTANGLE" | "DIAMOND"
export type OvalVariant = "OVAL" | "TUBE"

export interface ShapeVariants {
  box?: BoxVariant
  oval?: OvalVariant
  squiggle?: undefined
}

export type CustomColors = {
  [key in Color]: string
}

export const defaultColors: CustomColors = {
  red: "#ff0000",
  blue: "#0000ff",
  green: "#008000",
}

export const Shape = ({
  shape,
  color,
  shading,
  shapeVariant,
  customColors,
}: {
  shape: ShapeType
  color: Color
  shading: Shading
  shapeVariant?: BoxVariant | OvalVariant
  customColors?: CustomColors
}) => {
  const colorToUse = customColors ? customColors[color] : color

  // Styles

  const solid = {
    stroke: "none",
    fill: colorToUse,
    background: colorToUse,
  }

  const striped = {
    backgroundImage: `radial-gradient(circle, ${colorToUse} 25%, transparent 26%), radial-gradient(circle at bottom left, ${colorToUse} 12%, transparent 13%), radial-gradient(circle at bottom right, ${colorToUse} 12%, transparent 13%), radial-gradient(circle at top left, ${colorToUse} 12%, transparent 13%), radial-gradient(circle at top right, ${colorToUse} 12%, transparent 13%)`,
    backgroundSize: "0.33em 0.33em",
    backgroundColor: "#ffffff",
    opacity: 1,
  }

  const open = {
    background: "transparent",
    backgroundColor: "transparent",
    fill: "none",
  }

  // Color styles

  const colorClass = {
    borderColor: colorToUse,
    stroke: colorToUse,
  }

  //////////

  switch (shape) {
    case "oval":
      return (
        <div
          className={`${styles.shape} ${styles[shape]} ${
            shapeVariant ? styles[shapeVariant] : ""
          }`}
          style={
            shading == "solid"
              ? { ...colorClass, ...solid }
              : shading == "striped"
              ? { ...colorClass, ...striped }
              : { ...colorClass, ...open }
          }
        ></div>
      )

    case "squiggle":
      return (
        <svg
          version="1.2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 100"
          className={`${styles[shape]}`}
        >
          <defs>
            <pattern
              id={`${shading}_${colorToUse}`}
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
                // className={styles[`solid_${color}`]}
                style={solid}
              />
            </pattern>
          </defs>
          <path
            className={`${styles.shape} ${styles[shape]}`}
            style={
              shading == "solid"
                ? { ...colorClass, ...solid }
                : shading == "striped"
                ? { ...colorClass, ...striped }
                : { ...colorClass, ...open }
            }
            fill={`url(#${shading}_${colorToUse})`}
            d="m0 57.4c-1.3 34.4 22.3 42.7 30 42.6 17.3-0.2 25.9-19.4 42.7-19.1 16.8 0.2 46.9 13.1 72.4 10.7 21.3-2 36.1-10.7 45.2-24.3 6.1-9 10.7-24.5 9.7-35.9-1.1-12.6-9-31.1-27.7-31.4-18.7-0.3-26.8 19.4-41 22.1-21.2 4-64.4-14.3-86.8-12.6-25.8 1.8-43.7 24.8-44.5 47.9z"
          />
        </svg>
      )

    case "box":
      if (!shapeVariant || shapeVariant == "RECTANGLE") {
        return (
          <div
            className={`${styles.shape} ${styles[shape]} ${
              shapeVariant ? styles[shapeVariant] : ""
            }`}
            style={
              shading == "solid"
                ? { ...colorClass, ...solid }
                : shading == "striped"
                ? { ...colorClass, ...striped }
                : { ...colorClass, ...open }
            }
          ></div>
        )
      } else {
        return (
          <svg
            version="1.2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 250 100"
            className={`${styles[shapeVariant]}`}
            style={{ borderColor: colorToUse }}
          >
            <defs>
              <pattern
                id={`${shading}_${colorToUse}`}
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
                  // className={styles[`solid_${color}`]}
                  style={solid}
                />
              </pattern>
            </defs>
            <path
              className={`${styles.shape} ${styles[shape]}`}
              style={
                shading == "solid"
                  ? { ...colorClass, ...solid }
                  : shading == "striped"
                  ? { ...colorClass, ...striped }
                  : { ...colorClass, ...open }
              }
              fill={`url(#${shading}_${colorToUse})`}
              d="m0 50l125-50 125 50-125 50z"
            />
          </svg>
        )
      }

    default:
      return <></>
  }
}
