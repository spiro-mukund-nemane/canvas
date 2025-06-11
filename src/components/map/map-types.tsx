export type GeometryType = 'Point' | 'Line' | 'Polygon'
export type MapLayerType = 'fill' | 'circle' | 'line' | 'fill' | 'raster'

export interface LayerStyle {
  size?: number
  color?: string
  opacity?: number
  stroke?: string
  strokeWidth?: number
  filteredData?: GeoJSON.FeatureCollection;
}

export interface Layer {
  id: string
  name: string
  geometryType: GeometryType
  mapLayerType: MapLayerType
  visible: boolean
  data?: any // GeoJSON data
  mbtilesUrl?: string // URL for mbtiles source
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
