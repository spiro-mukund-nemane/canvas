import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '@/components/layout'


export const Route = createFileRoute('/project/$projectId/_layout')({
  component:Layout,
})
