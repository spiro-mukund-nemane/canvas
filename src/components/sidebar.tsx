import type React from "react"
import { Map, FileText, Menu, Cpu, CloudDownload } from "lucide-react"
import { Link, useNavigate, useMatch } from "@tanstack/react-router"
import { cn } from "../lib/utils"
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { ProjectSwitcher } from "./project/project-switcher"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../store"
import { fetchProjects, setCurrentProject } from "../store/project/projectSlice"
import { resetFetchedProjects } from "../store/file/fileSlice"
import type { AppDispatch } from "../store"

interface SidebarProps {
  className?: string
}

const NavLink = ({
  to,
  icon: Icon,
  children,
  disabled = false,
}: { to: string; icon: any; children: React.ReactNode; disabled?: boolean }) => {
  if (disabled) {
    return (
      <div className="flex items-center gap-2 p-2 rounded text-muted-foreground opacity-50 cursor-not-allowed">
        <Icon className="h-4 w-4" />
        {children}
      </div>
    )
  }
  return (
    <Link
      to={to}
      className="flex items-center gap-2 p-2 rounded hover:bg-accent/50"
      activeProps={{ className: "bg-accent/10" }}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}

export function Sidebar({ className }: SidebarProps) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const match = useMatch({ to: "/project/:projectId/*" })

  // Get workspaces data from Redux store
  const { projects, currentProject } = useSelector((state: RootState) => state.project)
  const { files } = useSelector((state: RootState) => state.file)

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  // Set current project based on URL when component mounts or route changes
  useEffect(() => {
    if (match && match.params.projectId) {
      const projectId = Number(match.params.projectId)
      const project = projects.find((p) => p.id === projectId)

      if (project && (!currentProject || currentProject.id !== projectId)) {
        // Reset fetched projects when switching projects
        dispatch(resetFetchedProjects())
        // Set the current project
        dispatch(setCurrentProject(projectId))
      }
    }
  }, [match, projects, currentProject, dispatch])

  // Check if any files are selected
  const hasSelectedFiles = files.some((file) => file.selected)

  const isVisualizeDisabled = !hasSelectedFiles

  const SidebarContent = () => (
    <div className={cn("flex flex-col h-full border-r bg-background w-64", className)}>
      <div className="flex h-14 items-center px-4">
        <Link to="/" className="font-serif text-2xl">
          Spiro
        </Link>
      </div>

      <ProjectSwitcher currentProject={currentProject} projects={projects} />

      <ScrollArea className="flex-1 px-4 py-2">
        {currentProject && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground">Navigation</h3>
              <div className="space-y-1">
                <NavLink to={`/project/${currentProject.id}/files`} icon={FileText}>
                  Files
                </NavLink>
                <NavLink to={`/map/${currentProject.id}`} disabled={isVisualizeDisabled} icon={Map}>
                  Visualization
                </NavLink>
                <NavLink to={`/project/${currentProject.id}/run-analysis`} icon={Cpu}>
                  Run analysis
                </NavLink>
                <NavLink to={`/project/${currentProject.id}/results`} icon={CloudDownload}>
                  Results
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )

  return (
    <>
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
