import { useState, useEffect } from "react"

const getViewportDimensions = () => {
  if (typeof window == "undefined") {
    return {
      width: 0,
      height: 0,
    }
  } else {
    const { innerWidth: width, innerHeight: height } = window
    return {
      width,
      height,
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
      setIsMobile(newViewportDimensions.width <= 600)
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
