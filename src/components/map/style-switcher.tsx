import { useEffect } from "react"
import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "../ui/button"
import { useDispatch, useSelector } from "react-redux"
import { toggleMapStyle } from "../../store/map/layerSlice"
import type { RootState, AppDispatch } from "../../store"

export default function StyleSwitcher() {
  const dispatch = useDispatch<AppDispatch>()
  const { mapStyle } = useSelector((state: RootState) => state.layer)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => dispatch(toggleMapStyle())}
      title={`Switch to ${mapStyle === "light" ? "dark" : "light"} mode`}
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all ${mapStyle === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"}`}
      />
      <Moon
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${mapStyle === "light" ? "rotate-90 scale-0" : "rotate-0 scale-100"}`}
      />
      <span className="sr-only">Toggle map style</span>
    </Button>
  )
}
