"use client"

import { useSelector } from "react-redux"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import type { RootState } from "../../store"

export function ConfigPreview() {
  const { config } = useSelector((state: RootState) => state.analysis)
  const { files } = useSelector((state: RootState) => state.file)

  // Convert the config to the format expected by the backend
  const getFormattedConfig = () => {
    // Helper to get file path from ID
    const getFilePath = (fileId: number | null | undefined) => {
      if (fileId === null || fileId === undefined) return undefined
      const file = files.find((f) => f.id === fileId)
      return file ? `./data/${file.file_layer_type.toLowerCase()}/${file.name}` : undefined
    }

    // Format normalization files
    const normalization: Record<string, string> = {}
    Object.entries(config.normalization).forEach(([key, fileId]) => {
      const path = getFilePath(fileId)
      if (path) {
        normalization[key] = path
      }
    })

    // Format boundary shape
    const boundaryShape = getFilePath(config.boundaryShape)

    return {
      normalization,
      boundaryShape,
      outputFolder: config.outputFolder,
      divideBoundaryByAttribute: config.divideBoundaryByAttribute,
      generateIsochrone: config.generateIsochrone,
      saveIntermediateOutput: config.saveIntermediateOutput,
      weights: config.weights,
      isochroneConfig: config.generateIsochrone ? config.isochroneConfig : undefined,
    }
  }

  const formattedConfig = getFormattedConfig()
  const configJson = JSON.stringify(formattedConfig, null, 2)

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(configJson)
    toast.success("Configuration copied to clipboard")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Configuration Preview</CardTitle>
          <CardDescription>JSON configuration that will be sent to the backend</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleCopyConfig}>
          <Copy className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-xs">{configJson}</pre>
      </CardContent>
    </Card>
  )
}
