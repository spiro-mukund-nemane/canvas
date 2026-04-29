// Color Palettes
export interface ColorPalette {
  type: 'light' | 'dark'
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  border: string
  success: string
  warning: string
  error: string
  info: string
}

export const LIGHT_PALETTE: ColorPalette = {
  type: 'light',
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  accent: '#EC4899',
  background: '#FFFFFF',
  foreground: '#1F2937',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
}

export const DARK_PALETTE: ColorPalette = {
  type: 'dark',
  primary: '#60A5FA',
  secondary: '#A78BFA',
  accent: '#F472B6',
  background: '#111827',
  foreground: '#F3F4F6',
  border: '#374151',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#22D3EE',
}

// Layer Configuration
export interface LayerConfig {
  name: string
  type: 'geojson' | 'vector' | 'raster'
  visible: boolean
  opacity: number
  paintProperties?: Record<string, unknown>
  layoutProperties?: Record<string, unknown>
}

// Map Configuration
export interface MapConfig {
  initialCenter: [number, number]
  initialZoom: number
  minZoom: number
  maxZoom: number
  defaultStyle: 'light' | 'dark'
  pitch: number
  bearing: number
}

export const DEFAULT_MAP_CONFIG: MapConfig = {
  initialCenter: [0, 0],
  initialZoom: 2,
  minZoom: 0,
  maxZoom: 20,
  defaultStyle: 'light',
  pitch: 0,
  bearing: 0,
}

// API URLs
export const API_URLS = {
  darkStyleUrl: process.env.NEXT_PUBLIC_DARK_STYLE_API_URL || '',
  lightStyleUrl: process.env.NEXT_PUBLIC_LIGHT_STYLE_API_URL || '',
}
