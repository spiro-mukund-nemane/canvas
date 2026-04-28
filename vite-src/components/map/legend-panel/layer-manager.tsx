import { CollapsibleLegend } from "./collapsible-legend"
import { StylePanel } from "../layer-style/style-panel"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../../../store"
import {
  setSelectedLayerId,
  toggleLayerVisibility,
  toggleGroupVisibility,
  updateLayerStyle,
  deleteLayer,
  deleteGroup,
  createGroup,
  renameGroup,
  renameLayer,
  reorderLayers,
  addUploadedLayer,
  fitToLayer,
} from "../../../store/map/layerSlice"
// import type { MutableRefObject } from "react"
// import type { Map as MaplibreMap } from "maplibre-gl"

// interface LayerManagerProps {
//   mapRef: MutableRefObject<MaplibreMap | null>
// }

// export function LayerManager({ mapRef }: LayerManagerProps) {
export function LayerManager() {
  const dispatch = useDispatch<AppDispatch>()
  const { layerGroups } = useSelector((state: RootState) => state.layer)
  const selectedLayerId = useSelector((state: RootState) => state.layer.selectedLayerId)

  // Find the selected layer
  const selectedLayer = selectedLayerId
    ? layerGroups.flatMap((g) => g.layers).find((l) => l.id === selectedLayerId)
    : null

  const handleLayerVisibilityChange = (layerId: string) => {
    dispatch(toggleLayerVisibility(layerId))
  }

  const handleGroupVisibilityChange = (groupId: string) => {
    dispatch(toggleGroupVisibility(groupId))
  }

  const handleLayerClick = (layerId: string) => {
    dispatch(setSelectedLayerId(layerId))
  }

  const handleStyleChange = (style: any) => {
    if (selectedLayerId) {
      dispatch(updateLayerStyle({ layerId: selectedLayerId, style }))
    }
  }

  const handleDeleteLayer = (layerId: string) => {
    dispatch(deleteLayer(layerId))
  }

  const handleDeleteGroup = (groupId: string) => {
    dispatch(deleteGroup(groupId))
  }

  const handleCreateGroup = (layerIds: string[], groupName: string) => {
    dispatch(createGroup({ layerIds, groupName }))
  }

  const handleRenameGroup = (groupId: string, newName: string) => {
    dispatch(renameGroup({ groupId, newName }))
  }

  const handleRenameLayer = (layerId: string, newName: string) => {
    dispatch(renameLayer({ layerId, newName }))
  }

  const handleReorderLayers = (groupId: string, startIndex: number, endIndex: number) => {
    dispatch(reorderLayers({ groupId, startIndex, endIndex }))
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const geoJSON = JSON.parse(content)

        dispatch(
          addUploadedLayer({
            geoJSON,
            fileName: file.name,
          }),
        )
      } catch (error) {
        console.error("Error parsing GeoJSON:", error)
        alert("Invalid GeoJSON file")
      }
    }
    reader.readAsText(file)
  }

  const handleFitToLayer = (layerId: string) => {
    dispatch(fitToLayer(layerId))
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="relative h-full w-full">
        <div
          className="absolute left-4 z-10 pointer-events-auto"
          style={{
            top: "calc(64px + 1rem)",
          }}
        >
          <CollapsibleLegend
            groups={layerGroups}
            onLayerVisibilityChange={handleLayerVisibilityChange}
            onGroupVisibilityChange={handleGroupVisibilityChange}
            onLayerClick={handleLayerClick}
            onFileUpload={handleFileUpload}
            onDeleteLayer={handleDeleteLayer}
            onDeleteGroup={handleDeleteGroup}
            onCreateGroup={handleCreateGroup}
            onRenameGroup={handleRenameGroup}
            onRenameLayer={handleRenameLayer}
            onReorderLayers={handleReorderLayers}
            selectedLayerId={selectedLayerId}
            onFitToLayer={handleFitToLayer}
          />
        </div>
        {selectedLayer && (
          <div
            className="absolute right-4 z-10 pointer-events-auto"
            style={{
              top: "calc(64px + 1rem)",
            }}
          >
            <StylePanel
              layer={selectedLayer}
              onClose={() => dispatch(setSelectedLayerId(null))}
              onStyleChange={handleStyleChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}
