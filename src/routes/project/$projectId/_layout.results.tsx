import { createFileRoute } from '@tanstack/react-router'
import {AnalysisResults} from '../../../components/analysis/analysis-results'


export const Route = createFileRoute('/project/$projectId/_layout/results')({
  component: AnalysisResults,
})


