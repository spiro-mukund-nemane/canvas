export type GeometryType = "Point" | "Line" | "Polygon"
export type MapLibreLayerType = "circle" | "line" | "fill"

export interface LayerStyle {
  size: number
  color: string
  opacity: number
  stroke: string
  strokeWidth: number
}

export interface Layer {
  id: string
  name: string
  geometryType: GeometryType
  mapLayerType: MapLibreLayerType
  visible: boolean
  data: any // GeoJSON data
  style: LayerStyle
}

export interface LayerGroup {
  id: string
  name: string
  visible: boolean
  layers: Layer[]
}

