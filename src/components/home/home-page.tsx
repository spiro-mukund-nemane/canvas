import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Plus, Search } from "lucide-react"
import { ProjectCard } from "./project-card"
import { fetchProjects } from "../../store/project/projectSlice"
import type { AppDispatch, RootState } from "../../store"

export function HomePage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { projects, loading } = useSelector((state: RootState) => state.project)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  // Filter projects based on search term
  const filteredProjects = projects.filter((project) =>
    project.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateProject = () => {
    navigate({ to: "/project/new" })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your geospatial projects</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateProject} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={{
                ...project,
                // These are placeholder values - in a real app, you'd get this data from your API
                createdDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
                updatedDate: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
                country: Math.random() > 0.5 ? "USA" : undefined,
                region: Math.random() > 0.5 ? "California" : undefined,
                fileCount: Math.floor(Math.random() * 10),
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No projects found</h2>
          <p className="text-muted-foreground mb-6">
            {searchTerm ? "No projects match your search criteria." : "You haven't created any projects yet."}
          </p>
          {!searchTerm && <Button onClick={handleCreateProject}>Create your first project</Button>}
        </div>
      )}
    </div>
  )
}

