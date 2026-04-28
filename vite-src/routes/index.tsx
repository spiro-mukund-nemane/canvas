import { createFileRoute } from '@tanstack/react-router'
import  {HomePage} from '../components/home/home-page' 
// import {ProjectsPage} from '@/components/project/projects-page'

export const Route = createFileRoute('/')({
  component:HomePage,
})

