// import { Button } from "../../components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../../components/ui/dropdown-menu"
// import { useNavigate } from "@tanstack/react-router"
// import { ChevronDown, Plus, Check } from "lucide-react"
// import { useDispatch } from "react-redux"
// import { setCurrentProject } from "../../store/project/projectSlice"
// import { resetFetchedProjects } from "../../store/file/fileSlice"
// import { useMemo } from "react"
// import type { Project } from "../../store/project/projectSlice"

// interface ProjectSwitcherProps {
//   currentProject?: Project | null
//   projects?: Project[] | null
// }

// // Function to generate a consistent color based on project name
// const getProjectColor = (name: string | undefined) => {
//   const colors = [
//     { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
//     { bg: "bg-red-100", text: "text-red-600", border: "border-red-200" },
//     { bg: "bg-green-100", text: "text-green-600", border: "border-green-200" },
//     { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
//     { bg: "bg-yellow-100", text: "text-yellow-600", border: "border-yellow-200" },
//     { bg: "bg-pink-100", text: "text-pink-600", border: "border-pink-200" },
//     { bg: "bg-indigo-100", text: "text-indigo-600", border: "border-indigo-200" },
//     { bg: "bg-teal-100", text: "text-teal-600", border: "border-teal-200" },
//   ]

//   // If name is undefined, return the first color
//   if (!name) return colors[0]

//   // Use the sum of character codes to pick a color
//   const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
//   return colors[sum % colors.length]
// }

// export function ProjectSwitcher({ currentProject, projects = [] }: ProjectSwitcherProps) {
//   const navigate = useNavigate()
//   const dispatch = useDispatch()

//   const handleProjectSwitch = async (projectId: number) => {
//     // Reset fetched projects when switching projects
//     dispatch(resetFetchedProjects())
//     // Set the current project
//     dispatch(setCurrentProject(projectId))
//     // Navigate to the project
//     await navigate({ to: `/project/${projectId}/files` })
//   }

//   const handleCreateProject = async () => {
//     await navigate({ to: "/project/new" })
//   }

//   // Get color for current project
//   const currentProjectColor = useMemo(() => {
//     if (!currentProject) return null
//     return getProjectColor(currentProject.name)
//   }, [currentProject])

//   // If there are no projects, show a button to create a new project
//   if (!projects || projects.length === 0) {
//     return (
//       <div className="px-2 py-2">
//         <Button
//           variant="ghost"
//           className="w-full justify-between items-center px-2 py-2 hover:bg-accent rounded-md"
//           onClick={handleCreateProject}
//         >
//           <div className="flex items-center gap-2">
//             <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
//               <Plus className="h-4 w-4" />
//             </div>
//           </div>
//           <ChevronDown className="h-4 w-4 text-muted-foreground" />
//         </Button>
//       </div>
//     )
//   }

//   return (
//     <div className="px-2 py-2">
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant="ghost" className="w-full justify-between items-center px-2 py-2 hover:bg-accent rounded-md">
//             <div className="flex items-center gap-2">
//               {currentProject ? (
//                 <>
//                   <div
//                     className={`h-8 w-8 rounded-full ${currentProjectColor?.bg} flex items-center justify-center border ${currentProjectColor?.border}`}
//                   >
//                     <span className={`${currentProjectColor?.text} font-medium text-sm`}>
//                       {currentProject.name && currentProject.name[0] ? currentProject.name[0].toUpperCase() : "P"}
//                     </span>
//                   </div>
//                   <span className="text-sm font-medium">{currentProject.name || "Project"}</span>
//                 </>
//               ) : (
//                 <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
//                   <Plus className="h-4 w-4" />
//                 </div>
//               )}
//             </div>
//             <ChevronDown className="h-4 w-4 text-muted-foreground" />
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px]">
//           {projects.map((project) => {
//             const isActive = currentProject?.id === project.id
//             const projectColor = getProjectColor(project.name)

//             return (
//               <DropdownMenuItem
//                 key={project.id}
//                 className="flex items-center gap-2 cursor-pointer py-2"
//                 onClick={() => handleProjectSwitch(project.id)}
//               >
//                 {isActive && <Check className="h-4 w-4 absolute left-2" />}
//                 <div
//                   className={`h-8 w-8 rounded-full ${projectColor.bg} flex items-center justify-center border ${projectColor.border} ${isActive ? "ml-6" : ""}`}
//                 >
//                   <span className={`${projectColor.text} font-medium text-sm`}>
//                     {project.name && project.name[0] ? project.name[0].toUpperCase() : "P"}
//                   </span>
//                 </div>
//                 <span>{project.name || "Unnamed Project"}</span>
//               </DropdownMenuItem>
//             )
//           })}

//           <DropdownMenuSeparator />
//           <DropdownMenuItem onClick={handleCreateProject} className="cursor-pointer">
//             Create project
//           </DropdownMenuItem>
//           <DropdownMenuItem className="cursor-pointer">Log out</DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </div>
//   )
// }
