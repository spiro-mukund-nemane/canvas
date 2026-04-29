export type GeometryType = "Point" | "Line" | "Polygon"

export interface LayerStyle {
  size: number
  color: string
  opacity: number
  stroke: string
  strokeWidth: number
  filteredData?: any
}

export interface Layer {
  id: string
  name: string
  geometryType: GeometryType
  mapLayerType: "circle" | "line" | "fill"
  visible: boolean
  data?: any
  tileJson?: any
  mbtilesUrl?: string
  style: LayerStyle
  fileId?: string
}

export interface LayerGroup {
  id: string
  name: string
  visible: boolean
  layers: Layer[]
}

export interface FeatureInfo {
  feature: any
  coordinates: [number, number]
}
