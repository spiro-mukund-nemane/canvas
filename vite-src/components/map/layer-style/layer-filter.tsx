import { useState, useEffect } from "react"
import { Plus, Trash2, Filter } from "lucide-react"
import { Button } from "../../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Card, CardContent } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Switch } from "../../ui/switch"
import { Separator } from "../../ui/separator"
import { ScrollArea } from "../../ui/scroll-area"
import { Alert, AlertDescription } from "../../ui/alert"

interface FilterCondition {
  id: string
  field: string
  operator: string
  value: string | number
  value2?: string | number // For "between" operator
}

interface LayerFilterProps {
  layer: any
  onFilterChange: (filters: FilterCondition[]) => void
  activeFilters?: FilterCondition[]
}

const OPERATORS = [
  { value: "==", label: "Equal to" },
  { value: "!=", label: "Not equal to" },
  { value: ">", label: "Greater than" },
  { value: ">=", label: "Greater than or equal to" },
  { value: "<", label: "Less than" },
  { value: "<=", label: "Less than or equal to" },
  { value: "between", label: "Between" },
  { value: "contains", label: "Contains" },
  { value: "starts_with", label: "Starts with" },
  { value: "ends_with", label: "Ends with" },
  { value: "is_null", label: "Is null" },
  { value: "is_not_null", label: "Is not null" },
]

export function LayerFilter({ layer, onFilterChange, activeFilters = [] }: LayerFilterProps) {
  const [fields, setFields] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterCondition[]>(activeFilters)
  const [isFilterActive, setIsFilterActive] = useState(activeFilters.length > 0)

  // Extract available fields from layer data
  useEffect(() => {
    if (layer?.data?.features && layer.data.features.length > 0) {
      // Get all unique property keys from all features
      const allFields = new Set<string>()

      layer.data.features.forEach((feature: any) => {
        if (feature.properties) {
          Object.keys(feature.properties).forEach((key) => {
            allFields.add(key)
          })
        }
      })

      setFields(Array.from(allFields))
    }
  }, [layer])

  // Add a new filter condition
  const addFilterCondition = () => {
    if (fields.length === 0) return

    const newFilter: FilterCondition = {
      id: `filter-${Date.now()}`,
      field: fields[0],
      operator: "==",
      value: "",
    }

    setFilters([...filters, newFilter])
    setIsFilterActive(true)
  }

  // Remove a filter condition
  const removeFilterCondition = (id: string) => {
    const updatedFilters = filters.filter((filter) => filter.id !== id)
    setFilters(updatedFilters)

    if (updatedFilters.length === 0) {
      setIsFilterActive(false)
    }

    onFilterChange(updatedFilters)
  }

  // Update a filter condition
  const updateFilterCondition = (id: string, field: string, value: any) => {
    const updatedFilters = filters.map((filter) => {
      if (filter.id === id) {
        return { ...filter, [field]: value }
      }
      return filter
    })

    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  // Toggle filter active state
  const toggleFilterActive = (active: boolean) => {
    setIsFilterActive(active)
    if (!active) {
      onFilterChange([])
    } else {
      onFilterChange(filters)
    }
  }

  // Apply all filters
  const applyFilters = () => {
    onFilterChange(filters)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters([])
    setIsFilterActive(false)
    onFilterChange([])
  }

  // Determine if a field is numeric
  const isNumericField = (fieldName: string): boolean => {
    if (!layer?.data?.features || layer.data.features.length === 0) return false

    // Check the first feature with this property
    for (const feature of layer.data.features) {
      if (feature.properties && feature.properties[fieldName] !== undefined) {
        return typeof feature.properties[fieldName] === "number"
      }
    }

    return false
  }

  // Render input based on operator
  const renderValueInput = (filter: FilterCondition) => {
    const isNumeric = isNumericField(filter.field)

    // Operators that don't need value inputs
    if (filter.operator === "is_null" || filter.operator === "is_not_null") {
      return null
    }

    // Operators that need two values
    if (filter.operator === "between") {
      return (
        <div className="flex gap-2 items-center">
          <Input
            type={isNumeric ? "number" : "text"}
            value={filter.value}
            onChange={(e) =>
              updateFilterCondition(filter.id, "value", isNumeric ? Number(e.target.value) : e.target.value)
            }
            placeholder="Min"
            className="w-full"
          />
          <span>and</span>
          <Input
            type={isNumeric ? "number" : "text"}
            value={filter.value2 || ""}
            onChange={(e) =>
              updateFilterCondition(filter.id, "value2", isNumeric ? Number(e.target.value) : e.target.value)
            }
            placeholder="Max"
            className="w-full"
          />
        </div>
      )
    }

    // Standard single value input
    return (
      <Input
        type={isNumeric ? "number" : "text"}
        value={filter.value}
        onChange={(e) => updateFilterCondition(filter.id, "value", isNumeric ? Number(e.target.value) : e.target.value)}
        placeholder="Value"
        className="w-full"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <h3 className="text-sm font-medium">Layer Filters</h3>
          {filters.length > 0 && <Badge variant="secondary">{filters.length}</Badge>}
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="filter-active" className="text-xs">
            Active
          </Label>
          <Switch
            id="filter-active"
            checked={isFilterActive}
            onCheckedChange={toggleFilterActive}
            disabled={filters.length === 0}
          />
        </div>
      </div>

      <Separator />

      {fields.length === 0 ? (
        <Alert>
          <AlertDescription>
            No fields available for filtering. This layer may not have feature properties.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-3">
              {filters.map((filter) => (
                <Card key={filter.id} className="relative">
                  <CardContent className="p-3">
                    <div className="grid gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`field-${filter.id}`} className="text-xs">
                            Field
                          </Label>
                          <Select
                            value={filter.field}
                            onValueChange={(value) => updateFilterCondition(filter.id, "field", value)}
                          >
                            <SelectTrigger id={`field-${filter.id}`} className="w-full">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {fields.map((field) => (
                                <SelectItem key={field} value={field}>
                                  {field}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`operator-${filter.id}`} className="text-xs">
                            Operator
                          </Label>
                          <Select
                            value={filter.operator}
                            onValueChange={(value) => updateFilterCondition(filter.id, "operator", value)}
                          >
                            <SelectTrigger id={`operator-${filter.id}`} className="w-full">
                              <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {OPERATORS.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`value-${filter.id}`} className="text-xs">
                          Value
                        </Label>
                        {renderValueInput(filter)}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeFilterCondition(filter.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-between pb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={addFilterCondition}
              className="flex items-center gap-1 text-xs h-8 px-2"
            >
              <Plus className="h-3 w-3" /> Add
            </Button>

            <div className="space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={filters.length === 0}
                className="text-xs h-8 px-2"
              >
                Clear
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={applyFilters}
                disabled={filters.length === 0}
                className="text-xs h-8 px-2"
              >
                Apply
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
