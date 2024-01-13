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
  shapeVariants,
  customColors,
}: {
  shape: ShapeType
  color: Color
  shading: Shading
  shapeVariants: ShapeVariants | undefined
  customColors?: CustomColors | undefined
}) => {
  const colorToUse = customColors ? customColors[color] : color

  // Styles

  const baseStyle = {
    strokeWidth: "0.60rem",
    overflow: "visible",
    width: "100%",
  }

  const colorStyle = {
    stroke: colorToUse,
  }

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

  //////////

  const style =
    shading == "solid"
      ? { ...colorStyle, ...solid }
      : shading == "striped"
      ? { ...colorStyle, ...striped }
      : { ...colorStyle, ...open }

  const fill = `url(#${shading}_${colorToUse})`

  const pathAttributes = {
    style,
    fill,
  }

  const path = () => {
    switch (shape) {
      case "box":
        if (shapeVariants?.box == "DIAMOND") {
          return <path {...pathAttributes} d="m0 50l100-45 100 45-100 45z" />
        } else {
          return <path {...pathAttributes} d="m5 10h190v80h-190z" />
        }

      case "oval":
        if (shapeVariants?.oval == "TUBE") {
          return (
            <rect
              x="0"
              y="5"
              rx="45"
              ry="45"
              width="200"
              height="90"
              {...pathAttributes}
            />
          )
        } else {
          return (
            <ellipse cx="100" cy="50" rx="100" ry="45" {...pathAttributes} />
          )
        }

      case "squiggle":
        return (
          <path
            {...pathAttributes}
            d="m0 57.4c-1.3 34.4 22.3 42.7 30 42.6 17.3-0.2 25.9-19.4 42.7-19.1 16.8 0.2 46.9 13.1 72.4 10.7 21.3-2 36.1-10.7 45.2-24.3 6.1-9 10.7-24.5 9.7-35.9-1.1-12.6-9-31.1-27.7-31.4-18.7-0.3-26.8 19.4-41 22.1-21.2 4-64.4-14.3-86.8-12.6-25.8 1.8-43.7 24.8-44.5 47.9z"
          />
        )

      default:
        return <></>
    }
  }

  // Return path inside svg
  return (
    <svg
      version="1.2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 100"
      style={baseStyle}
    >
      <defs>
        <pattern
          id={`${shading}_${colorToUse}`}
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="6" cy="6" r="2" style={solid} />
        </pattern>
      </defs>
      {path()}
    </svg>
  )
}
