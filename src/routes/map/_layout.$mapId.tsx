import { useEffect } from "react"
import { useParams, createFileRoute } from "@tanstack/react-router"
import { useDispatch, useSelector } from "react-redux"
import  MapComponent  from "../../components/map/map-component"
// import { Header } from "../components/map/header"
import { fetchProjects, setCurrentProject } from "../../store/project/projectSlice"
import { fetchFiles } from "../../store/file/fileSlice"
import { loadSelectedFilesAsLayers } from "../../store/map/layerSlice"
import type { AppDispatch, RootState } from "../../store"

export const Route = createFileRoute('/map/_layout/$mapId')({
  component: RootComponent,
})

export function RootComponent() {
  const { mapId } = useParams({ from: "/map/_layout/$mapId" })
  const projectId = Number.parseInt(mapId as string)
  const dispatch = useDispatch<AppDispatch>()
  const { currentProject } = useSelector((state: RootState) => state.project)
  const { files } = useSelector((state: RootState) => state.file)

  // Fetch project data when the component mounts
  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjects(projectId))
    }
  }, [dispatch, projectId])

  // Set current project when project data is loaded
  useEffect(() => {
    if (currentProject?.id !== projectId && projectId) {
      dispatch(setCurrentProject(projectId))
    }
  }, [dispatch, currentProject?.id, projectId])

  // Fetch files for the project
  useEffect(() => {
    if (projectId) {
      dispatch(fetchFiles(projectId))
    }
  }, [dispatch, projectId])

  // Load selected files as layers
  useEffect(() => {
    if (files.length > 0) {
      const selectedFiles = files.filter((file) => file.selected)
      if (selectedFiles.length > 0) {
        const selectedFileIds = selectedFiles.map((file) => file.id)
        dispatch(loadSelectedFilesAsLayers(selectedFileIds))
      }
    }
  }, [dispatch, files])
  return (
    <div>
      <MapComponent />
    </div>
  
)
}