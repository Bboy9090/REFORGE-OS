import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT)

  useEffect(() => {
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
