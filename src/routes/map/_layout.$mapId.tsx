

import { useEffect } from "react"
import { useParams, createFileRoute } from "@tanstack/react-router"
import { useDispatch, useSelector } from "react-redux"
import MapComponent from "../../components/map/map-view"
import { fetchProjects, setCurrentProject } from "../../store/project/projectSlice"
// import { fetchFiles } from "../../store/file/fileSlice"
import type { AppDispatch, RootState } from "../../store"

export const Route = createFileRoute("/map/_layout/$mapId")({
  component: RootComponent,
})

export function RootComponent() {
  const { mapId } = useParams({ from: "/map/_layout/$mapId" })
  const projectId = mapId // No need to parse as number anymore
  const dispatch = useDispatch<AppDispatch>()
  const { currentProject } = useSelector((state: RootState) => state.project)

  // Fetch project data when the component mounts
  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjects())
    }
  }, [dispatch, projectId])

  // Set current project when project data is loaded
  useEffect(() => {
    if (currentProject?.id !== projectId && projectId) {
      dispatch(setCurrentProject(projectId))
    }
  }, [dispatch, currentProject?.id, projectId])

  // // Fetch files for the project
  // useEffect(() => {
  //   if (projectId) {
  //     dispatch(fetchFiles(projectId))
  //   }
  // }, [dispatch, projectId])

  return (
    <div>
      <MapComponent />
    </div>
  )
}
