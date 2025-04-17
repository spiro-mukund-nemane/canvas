import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Switch } from "../../components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Slider } from "../../components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Info, Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Steps } from "../../components/ui/steps"
import type { AppDispatch, RootState } from "../../store"
import {
  runAnalysis,
  categorizeFilesByLayerType,
  fetchProjectFiles,
  setNormalizationFile,
  addNormalizationLayer,
  removeNormalizationLayer,
  setBoundaryShape,
  setOutputFolder,
  setDivideBoundaryByAttribute,
  setGenerateIsochrone,
  setSaveIntermediateOutput,
  setWeight,
  setIsochroneConfig,
  setCurrentStep,
  nextStep,
  prevStep,
  resetAnalysisState,
} from "../../store/analysis/analysisSlice"
import { ConfigPreview } from "./config-preview"

export function RunAnalysis() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { currentProject } = useSelector((state: RootState) => state.project)
  const { config, loading, error, success, availableFiles, currentStep } = useSelector(
    (state: RootState) => state.analysis,
  )
  const { files } = useSelector((state: RootState) => state.file)

  // State for new layer type and file selection
  const [newLayerType, setNewLayerType] = useState("")
  const [customLayerType, setCustomLayerType] = useState("")
  const [selectedFileId, setSelectedFileId] = useState<string>("")

  // Fetch files when component mounts
  useEffect(() => {
    if (currentProject?.id) {
      dispatch(fetchProjectFiles(currentProject.id))
      dispatch(categorizeFilesByLayerType(currentProject.id))
    }
  }, [dispatch, currentProject?.id])

  // Reset analysis state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetAnalysisState())
    }
  }, [dispatch])

  // Show success/error toast when status changes
  useEffect(() => {
    if (success) {
      toast.success("Analysis started successfully", {
        description: "You will be notified when the analysis is complete.",
      })
      // Navigate to results page
      if (currentProject?.id) {
        navigate({ to: `/project/${currentProject.id}/analysis-results` })
      }
    }
    if (error) {
      toast.error("Analysis failed", {
        description: error,
      })
    }
  }, [success, error, navigate, currentProject?.id])

  const handleRunAnalysis = () => {
    if (!currentProject?.id) {
      toast.error("No project selected")
      return
    }

    if (!config.boundaryShape) {
      toast.error("Boundary shape is required")
      return
    }

    // Check if at least one normalization file is selected
    const hasNormalizationFile = Object.values(config.normalization).some(
      (fileId) => fileId !== null && fileId !== undefined,
    )

    if (!hasNormalizationFile) {
      toast.error("At least one normalization file is required")
      return
    }

    dispatch(runAnalysis(config))
  }

  const handleAddNormalizationLayer = () => {
    // Get the final layer type (either selected or custom)
    const finalLayerType = newLayerType === "other" ? customLayerType.trim() : newLayerType.trim()

    // Validate inputs
    if (!finalLayerType) {
      toast.error("Please select or enter a layer type")
      return
    }

    if (!selectedFileId) {
      toast.error("Please select a file")
      return
    }

    // Add the new layer to the configuration
    dispatch(
      addNormalizationLayer({
        layerType: finalLayerType,
        fileId: selectedFileId ? Number.parseInt(selectedFileId) : null,
      }),
    )

    // Reset form fields
    setNewLayerType("")
    setCustomLayerType("")
    setSelectedFileId("")
  }

  // Predefined normalization layer types
  const predefinedLayerTypes = [
    { value: "buildings", label: "Buildings" },
    { value: "landuse", label: "Land Use" },
    { value: "poisPoint", label: "POIs (Point)" },
    { value: "poisPolygon", label: "POIs (Polygon)" },
    { value: "roads", label: "Roads" },
    { value: "trafficPoint", label: "Traffic (Point)" },
    { value: "trafficPolygon", label: "Traffic (Polygon)" },
    { value: "transportPoint", label: "Transport (Point)" },
    { value: "transportPolygon", label: "Transport (Polygon)" },
    { value: "population", label: "Population" },
    { value: "other", label: "Other (Custom)" },
  ]

  // Get all boundary files
  const boundaryFiles = files.filter(
    (file) =>
      file.file_layer_type.toLowerCase().includes("boundary") || file.file_layer_type.toLowerCase().includes("border"),
  )

  // Get all attribute options for the selected boundary file
  const getBoundaryAttributes = () => {
    if (!config.boundaryShape) return []

    const boundaryFile = files.find((file) => file.id === config.boundaryShape)
    if (
      !boundaryFile ||
      !boundaryFile.geojson ||
      !boundaryFile.geojson.features ||
      boundaryFile.geojson.features.length === 0
    ) {
      return []
    }

    const properties = boundaryFile.geojson.features[0].properties || {}
    return Object.keys(properties)
  }

  const boundaryAttributes = getBoundaryAttributes()

  // Weight configuration items
  const weightItems = [
    { key: "population_score", label: "Population" },
    { key: "roads_score", label: "Roads" },
    { key: "landuse_score", label: "Land Use" },
    { key: "building_score", label: "Buildings" },
    { key: "pois_score", label: "POIs" },
    { key: "transport_score", label: "Transport" },
    { key: "traffic_score", label: "Traffic" },
  ]

  // Step 1: Edit Configuration
  const renderEditConfigStep = () => (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Normalization Files</CardTitle>
          <CardDescription>Select files for each layer type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing normalization layers */}
          {Object.entries(config.normalization).map(([layerType, fileId]) => (
            <div key={layerType} className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="mb-2 block">{layerType}</Label>
                <Select
                  value={fileId?.toString() || ""}
                  onValueChange={(value) =>
                    dispatch(
                      setNormalizationFile({
                        layerType,
                        fileId: value ? Number.parseInt(value) : null,
                      }),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${layerType} file`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {files.map((file) => (
                      <SelectItem key={file.id} value={file.id.toString()}>
                        {file.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mt-8"
                onClick={() => dispatch(removeNormalizationLayer(layerType))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Add new normalization layer */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-4">Add New Layer</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-layer-type" className="mb-2 block">
                  Layer Type
                </Label>
                <Select value={newLayerType} onValueChange={setNewLayerType}>
                  <SelectTrigger id="new-layer-type">
                    <SelectValue placeholder="Select layer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedLayerTypes
                      .filter((type) => !Object.keys(config.normalization).includes(type.value))
                      .map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {newLayerType === "other" && (
                  <div className="mt-2">
                    <Input
                      placeholder="Enter custom layer type"
                      value={customLayerType}
                      onChange={(e) => setCustomLayerType(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="new-file" className="mb-2 block">
                  File
                </Label>
                <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                  <SelectTrigger id="new-file">
                    <SelectValue placeholder="Select file" />
                  </SelectTrigger>
                  <SelectContent>
                    {files.map((file) => (
                      <SelectItem key={file.id} value={file.id.toString()}>
                        {file.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="mt-4"
              onClick={handleAddNormalizationLayer}
              disabled={!newLayerType || (newLayerType === "other" && !customLayerType) || !selectedFileId}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Layer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Boundary Configuration</CardTitle>
          <CardDescription>Configure boundary and output settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="boundary-shape">Boundary Shape</Label>
            <Select
              value={config.boundaryShape?.toString() || ""}
              onValueChange={(value) => dispatch(setBoundaryShape(value ? Number.parseInt(value) : null))}
            >
              <SelectTrigger id="boundary-shape">
                <SelectValue placeholder="Select boundary shape file" />
              </SelectTrigger>
              <SelectContent>
                {boundaryFiles.map((file) => (
                  <SelectItem key={file.id} value={file.id.toString()}>
                    {file.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {config.boundaryShape && boundaryAttributes.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="divide-boundary">Divide Boundary By Attribute</Label>
              <Select
                value={config.divideBoundaryByAttribute || ""}
                onValueChange={(value) => dispatch(setDivideBoundaryByAttribute(value))}
              >
                <SelectTrigger id="divide-boundary">
                  <SelectValue placeholder="Select attribute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {boundaryAttributes.map((attr) => (
                    <SelectItem key={attr} value={attr}>
                      {attr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="output-folder">Output Folder</Label>
            <Input
              id="output-folder"
              value={config.outputFolder}
              onChange={(e) => dispatch(setOutputFolder(e.target.value))}
              placeholder="./data/output/"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="save-intermediate"
              checked={config.saveIntermediateOutput}
              onCheckedChange={(checked) => dispatch(setSaveIntermediateOutput(checked))}
            />
            <Label htmlFor="save-intermediate">Save Intermediate Output</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Weights</CardTitle>
          <CardDescription>Configure the importance of each factor in the analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {weightItems.map((item) => (
              <div key={item.key} className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor={`weight-${item.key}`}>{item.label}</Label>
                  <span className="text-sm font-medium">
                    {config.weights[item.key as keyof typeof config.weights]}%
                  </span>
                </div>
                <Slider
                  id={`weight-${item.key}`}
                  min={0}
                  max={100}
                  step={1}
                  value={[config.weights[item.key as keyof typeof config.weights]]}
                  onValueChange={(value) => dispatch(setWeight({ key: item.key, value: value[0] }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Isochrone Configuration</CardTitle>
          <CardDescription>Configure isochrone generation settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="generate-isochrone"
              checked={config.generateIsochrone}
              onCheckedChange={(checked) => dispatch(setGenerateIsochrone(checked))}
            />
            <Label htmlFor="generate-isochrone">Generate Isochrone</Label>
          </div>

          {config.generateIsochrone && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="isochrone-api">API Endpoint</Label>
                <Input
                  id="isochrone-api"
                  value={config.isochroneConfig.api}
                  onChange={(e) => dispatch(setIsochroneConfig({ api: e.target.value }))}
                  placeholder="http://localhost:8002/isochrone"
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="isochrone-distance">Isochrone Distance (km)</Label>
                <div className="flex gap-2">
                  <Input
                    id="isochrone-distance-min"
                    type="number"
                    value={config.isochroneConfig.isochroneDistance[0]}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value)
                      if (!isNaN(value)) {
                        const newDistances = [...config.isochroneConfig.isochroneDistance]
                        newDistances[0] = value
                        dispatch(setIsochroneConfig({ isochroneDistance: newDistances }))
                      }
                    }}
                    min={0.1}
                    step={0.1}
                  />
                  <Input
                    id="isochrone-distance-max"
                    type="number"
                    value={config.isochroneConfig.isochroneDistance[1]}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value)
                      if (!isNaN(value)) {
                        const newDistances = [...config.isochroneConfig.isochroneDistance]
                        newDistances[1] = value
                        dispatch(setIsochroneConfig({ isochroneDistance: newDistances }))
                      }
                    }}
                    min={0.1}
                    step={0.1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="overlap-percentage">Overlap Percentage</Label>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{config.isochroneConfig.overlapPercentage}%</span>
                </div>
                <Slider
                  id="overlap-percentage"
                  min={0}
                  max={100}
                  step={1}
                  value={[config.isochroneConfig.overlapPercentage]}
                  onValueChange={(value) => dispatch(setIsochroneConfig({ overlapPercentage: value[0] }))}
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="max-score-value">Max Score Value</Label>
                <Input
                  id="max-score-value"
                  type="number"
                  value={config.isochroneConfig.maxScoreValue}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value)
                    if (!isNaN(value)) {
                      dispatch(setIsochroneConfig({ maxScoreValue: value }))
                    }
                  }}
                  min={0.1}
                  step={0.1}
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="sort-attribute">Sort Attribute</Label>
                <Input
                  id="sort-attribute"
                  value={config.isochroneConfig.sortAttribute}
                  onChange={(e) => dispatch(setIsochroneConfig({ sortAttribute: e.target.value }))}
                  placeholder="combined_score"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Step 2: Preview Configuration
  const renderPreviewConfigStep = () => <ConfigPreview />

  // Step 3: Run Analysis
  const renderRunAnalysisStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Run Analysis</CardTitle>
        <CardDescription>Start the analysis with the current configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Analysis Configuration</AlertTitle>
          <AlertDescription>
            Make sure you have selected at least one normalization file and a boundary shape before running the
            analysis. The analysis may take several minutes to complete.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => dispatch(prevStep())}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Preview
        </Button>
        <Button onClick={handleRunAnalysis} disabled={loading}>
          {loading ? "Running..." : "Run Analysis"}
        </Button>
      </CardFooter>
    </Card>
  )

  // Render the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderEditConfigStep()
      case 2:
        return renderPreviewConfigStep()
      case 3:
        return renderRunAnalysisStep()
      default:
        return renderEditConfigStep()
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Run Analysis</h1>
          <p className="text-muted-foreground">Configure and run spatial analysis for {currentProject?.name}</p>
        </div>
      </div>

      {!currentProject ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <p className="text-center mb-4">Select a project to run analysis</p>
            <Button onClick={() => navigate({ to: "/" })}>Go to Projects</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <Steps
            steps={[
              { label: "Edit Configuration", description: "Set up analysis parameters" },
              { label: "Preview Configuration", description: "Review JSON configuration" },
              { label: "Run Analysis", description: "Execute the analysis" },
            ]}
            currentStep={currentStep}
            onStepClick={(step) => dispatch(setCurrentStep(step))}
          />

          {renderCurrentStep()}

          {currentStep === 1 && (
            <div className="flex justify-end">
              <Button onClick={() => dispatch(nextStep())}>
                Preview Configuration <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => dispatch(prevStep())}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Edit Configuration
              </Button>
              <Button onClick={() => dispatch(nextStep())}>
                Run Analysis <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
