import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { ScrollArea } from "../../ui/scroll-area"
import { ChevronDown, ChevronUp, Search, Download, ArrowUpDown } from "lucide-react"
import { Alert, AlertDescription } from "../../ui/alert"

interface AttributeTableProps {
  layer: any
}

export function AttributeTable({ layer }: AttributeTableProps) {
  const [features, setFeatures] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | number | null>(null)

  const rowsPerPage = 10

  // Extract features and columns from layer data
  useEffect(() => {
    if (layer?.data?.features) {
      setFeatures(layer.data.features)

      // Get all unique property keys from all features
      const allColumns = new Set<string>()

      layer.data.features.forEach((feature: any) => {
        if (feature.properties) {
          Object.keys(feature.properties).forEach((key) => {
            allColumns.add(key)
          })
        }
      })

      setColumns(Array.from(allColumns))
    }
  }, [layer])

  // Filter and sort features
  const filteredFeatures = useMemo(() => {
    if (!features.length) return []

    let result = [...features]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((feature) => {
        if (!feature.properties) return false

        return Object.entries(feature.properties).some(([_key, value]) => {
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(query)
        })
      })
    }

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const aValue = a.properties?.[sortColumn]
        const bValue = b.properties?.[sortColumn]

        // Handle null/undefined values
        if (aValue === undefined || aValue === null) return sortDirection === "asc" ? -1 : 1
        if (bValue === undefined || bValue === null) return sortDirection === "asc" ? 1 : -1

        // Compare based on type
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue
        }

        // Default string comparison
        const aStr = String(aValue).toLowerCase()
        const bStr = String(bValue).toLowerCase()
        return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
      })
    }

    return result
  }, [features, searchQuery, sortColumn, sortDirection])

  // Calculate pagination
  const totalPages = Math.ceil(filteredFeatures.length / rowsPerPage)
  const paginatedFeatures = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return filteredFeatures.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredFeatures, currentPage])

  // Handle column sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // New column, default to ascending
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Export data as CSV
  const exportCSV = () => {
    if (!features.length || !columns.length) return

    // Create CSV header
    let csv = columns.join(",") + "\n"

    // Add rows
    features.forEach((feature) => {
      const row = columns.map((col) => {
        const value = feature.properties?.[col]
        // Handle null values and escape commas
        if (value === null || value === undefined) return ""
        return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
      })
      csv += row.join(",") + "\n"
    })

    // Create download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${layer.name || "layer"}_attributes.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Format cell value for display
  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return "—"
    if (typeof value === "object") return JSON.stringify(value)
    return String(value)
  }

  // Handle row click
  const handleRowClick = (featureId: string | number) => {
    setSelectedFeatureId(selectedFeatureId === featureId ? null : featureId)
  }

  if (!layer) {
    return (
      <Alert>
        <AlertDescription>No layer selected</AlertDescription>
      </Alert>
    )
  }

  if (!features.length) {
    return (
      <Alert>
        <AlertDescription>This layer has no feature data available</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Attribute Table</h3>
          <p className="text-xs text-muted-foreground">{filteredFeatures.length} features</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search attributes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
              className="pl-8 h-8 w-[200px]"
            />
          </div>

          <Button variant="outline" size="sm" onClick={exportCSV} className="h-8">
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <ScrollArea className="h-[400px]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column} className="whitespace-nowrap">
                      <Button variant="ghost" size="sm" className="h-8 font-medium" onClick={() => handleSort(column)}>
                        {column}
                        {sortColumn === column ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                        )}
                      </Button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFeatures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center h-24">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFeatures.map((feature, index) => {
                    const featureId = feature.id || index
                    return (
                      <TableRow
                        key={featureId}
                        className={selectedFeatureId === featureId ? "bg-muted" : ""}
                        onClick={() => handleRowClick(featureId)}
                      >
                        {columns.map((column) => (
                          <TableCell key={`${featureId}-${column}`} className="whitespace-nowrap">
                            {formatCellValue(feature.properties?.[column])}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, filteredFeatures.length)} of {filteredFeatures.length} entries
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum = currentPage
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-muted-foreground">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
