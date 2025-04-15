import { createFileRoute } from '@tanstack/react-router'
import {SelectFiles} from '../../../components/project/select-files'

export const Route = createFileRoute('/project/$projectId/_layout/files')({
  component: SelectFiles,
})
