import { createFileRoute } from '@tanstack/react-router'
import {RunAnalysis} from '../../../components/analysis/run-analysis'

export const Route = createFileRoute(
  '/project/$projectId/_layout/run-analysis',
)({
  component: RunAnalysis,
})

function RouteComponent() {
  return <div>Hello "/project/$projectId/_layout/run-analysis"!</div>
}
