

import { useState } from "react"
import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "../../components/ui/input"
import { ImageIcon } from "lucide-react"
import { useDispatch } from "react-redux"
import { useNavigate } from "@tanstack/react-router"
import { createProject, setCurrentProject } from "../../store/project/projectSlice"
import type { AppDispatch } from "../../store"
import { toast } from "sonner"


export default function CreateProject() {
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const handleCreateProject = async () => {
    if (!projectName.trim()) return

    setIsLoading(true)
    try {
      const resultAction = await dispatch(createProject(projectName))

      if (resultAction.meta.requestStatus === "fulfilled") {
        // Get the newly created project ID from the response
        const newProjectId = resultAction.payload.id
        toast.success("Project created",{description: `Project "${projectName}" has been created successfully.`})

        // Navigate to the newly created project's files page
        navigate({ to: `/project/${newProjectId}/files` })
      } else {
        throw new Error("Failed to create project")
      }
    } catch (error) {
      console.error("Failed to create project:", error)
      toast.error("Error",{ description: "Failed to create project. Please try again."})

    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = ()=>{

    navigate({to:'/'})
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create a project</h1>
            <p className="text-sm text-muted-foreground">
              A project organizes your maps and data in one place, and you can invite others to easily collaborate
              together.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Project name
              </label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  placeholder="Your Project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && projectName) {
                      handleCreateProject()
                    }
                  }}
                />
                <Button variant="outline" size="icon" className="shrink-0">
                  <ImageIcon className="h-4 w-4" />
                  <span className="sr-only">Choose icon</span>
                </Button>
              </div>
            </div>
            {/* <CardFooter className="flex justify-between"> */}
            <Button
              size="lg"
              className=" w-full bg-pink-500 hover:bg-pink-600"
              disabled={!projectName || isLoading}
              onClick={handleCreateProject}
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
            <Button size="lg" variant="outline" onClick={handleCancel}>Cancel</Button>
            {/* </CardFooter> */}
          </div>
          
        </CardContent>
      </Card>
    </div>
  )
}
