

import { CalendarIcon, ClockIcon, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useNavigate } from "@tanstack/react-router"
import { useDispatch } from "react-redux"
import type { Project } from "../../store/project/projectSlice"
import { deleteProject, setCurrentProject } from "../../store/project/projectSlice"

interface ProjectCardProps {
  project: Project & {
    createdDate?: string
    updatedDate?: string
    country?: string
    region?: string
    fileCount?: number
  }
}

// Function to generate a consistent color based on project name
const getProjectColor = (name: string | undefined) => {
  const colors = [
    { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
    { bg: "bg-red-100", text: "text-red-600", border: "border-red-200" },
    { bg: "bg-green-100", text: "text-green-600", border: "border-green-200" },
    { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
    { bg: "bg-yellow-100", text: "text-yellow-600", border: "border-yellow-200" },
    { bg: "bg-pink-100", text: "text-pink-600", border: "border-pink-200" },
    { bg: "bg-indigo-100", text: "text-indigo-600", border: "border-indigo-200" },
    { bg: "bg-teal-100", text: "text-teal-600", border: "border-teal-200" },
  ]

  // If name is undefined, return the first color
  if (!name) return colors[0]

  // Use the sum of character codes to pick a color
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[sum % colors.length]
}

// Format date to a readable format
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A"

  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate()
  const projectColor = getProjectColor(project.name)
  const dispatch = useDispatch()

  const handleOpenProject = () => {
    // Set the current project before navigating
    dispatch(setCurrentProject(project.id))
    navigate({ to: `/map/${project.id}` })
  }

  const handleDeleteProject = () => {
    dispatch(deleteProject(project.id))
  }

  const handleOpenFiles = () => {
    // Set the current project before navigating to files
    dispatch(setCurrentProject(project.id))
    navigate({ to: `/project/${project.id}/files` })
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className={`${projectColor.bg} pb-2`}>
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-full ${projectColor.bg} flex items-center justify-center border ${projectColor.border}`}
          >
            <span className={`${projectColor.text} font-medium text-lg`}>
              {project.name && project.name[0] ? project.name[0].toUpperCase() : "P"}
            </span>
          </div>
          <CardTitle className="text-lg">{project.name || "Unnamed Project"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>Created: {formatDate(project.createdDate)}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <ClockIcon className="mr-2 h-4 w-4" />
            <span>Updated: {formatDate(project.updatedDate)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button size="sm" onClick={handleOpenProject}>
          Open Project
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete project and remove your data from servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProject}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
