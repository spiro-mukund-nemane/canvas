

import { useRef } from "react"
import { ScrollArea } from "../../../components/ui/scroll-area"

interface FeaturePopupProps {
  feature: any
  maxHeight?: number
}

export function FeaturePopup({ feature, maxHeight = 300 }: FeaturePopupProps) {
  const properties = feature?.properties || {}
  const scrollRef = useRef<HTMLDivElement>(null)

  // Determine if we should show the feature type
  const featureType = feature?.geometry?.type || "Unknown"

  // Format property values for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "—"
    if (typeof value === "object") return JSON.stringify(value)
    return String(value)
  }

  return (
    <div className="p-2 max-w-xs">
      <h3 className="font-bold text-sm mb-1">{properties.name || properties.title || "Feature Information"}</h3>
      <p className="text-xs text-muted-foreground mb-2">{featureType}</p>

      <ScrollArea className="pr-4" style={{ maxHeight: `${maxHeight}px` }}>
        <div ref={scrollRef} className="w-full">
          <table className="w-full text-xs border-collapse">
            <tbody>
              {Object.entries(properties).map(([key, value]) => (
                <tr key={key} className="border-b border-gray-100 last:border-0">
                  <td className="py-1 font-medium text-muted-foreground pr-2 align-top">{key}</td>
                  <td className="py-1 break-words">{formatValue(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  )
}
