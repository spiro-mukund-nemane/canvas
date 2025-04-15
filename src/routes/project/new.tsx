import { createFileRoute } from '@tanstack/react-router'
import  CreateProject  from '@/components/project/new'

export const Route = createFileRoute('/project/new')({
  component: CreateProject,
})


