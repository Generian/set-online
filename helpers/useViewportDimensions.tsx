import { useState, useEffect } from "react"

const getViewportDimensions = () => {
  if (typeof window == "undefined") {
    return {
      width: 0,
      height: 0,
      fieldWidth: 0,
      fieldHeight: 0,
    }
  } else {
    const { innerWidth: width, innerHeight: height } = window
    const field = document.getElementById("fieldContainer")
    const fieldWidth = field?.offsetWidth
    const fieldHeight = field?.offsetHeight
    return {
      width,
      height,
      fieldWidth,
      fieldHeight,
    }
  }
}

export default function useViewportDimensions() {
  const [viewportDimensions, setViewportDimensions] = useState(
    getViewportDimensions()
  )
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function handleResize() {
      const newViewportDimensions = getViewportDimensions()
      setViewportDimensions(newViewportDimensions)
      setIsMobile(newViewportDimensions.width <= 800)
    }

    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return {
    ...viewportDimensions,
    isMobile,
  }
}
