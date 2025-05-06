import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, Route, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Point } from "maplibre-gl"

interface RoutePoint {
  id: string
  coordinates: [number, number]
  address?: string
}

interface RouteSegment {
  id: string
  startPointId: string
  endPointId: string
  distance: string
  duration: string
  geometry: {
    type: string
    coordinates: [number, number][]
  }
}

interface RouteInfoPanelProps {
  points: RoutePoint[]
  segments: RouteSegment[]
  totalDistance: number
  totalDuration: number
  onClose: () => void
  onRemovePoint: (pointId: string) => void
  onRemoveSegment: (SegmentId: string) => void
}

export default function RouteInfoPanel({
  points,
  segments,
  totalDistance,
  totalDuration,
  onClose,
  onRemovePoint,
  onRemoveSegment,
}: RouteInfoPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={`absolute ${isCollapsed ? "right-0 w-12" : "right-4 w-80"} top-20 z-10 transition-all duration-300`}
    >
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-10 top-2 bg-white dark:bg-gray-800 shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronLeft /> : <ChevronRight />}
      </Button>

      {isCollapsed ? (
        <Card className="h-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-2 flex flex-col items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(false)}>
              <Route className="h-6 w-6" />
            </Button>
            <Badge variant="outline" className="px-1.5 py-1 rotate-90">
              {totalDistance.toFixed(2)} km
            </Badge>
          </CardContent>
        </Card>
      ) : (
        <Card className="h-auto max-h-[70vh] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Route className="h-5 w-5" />
              Route Information
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="px-4 pb-4">
            <Tabs defaultValue="summary">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <ScrollArea className="h-[40vh] pr-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <p className="text-sm text-muted-foreground">Total Distance</p>
                          <p className="text-2xl font-bold">{totalDistance.toFixed(2)} km</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <p className="text-sm text-muted-foreground">Total Time</p>
                          <p className="text-2xl font-bold">{totalDuration.toFixed(0)} min</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Route Overview</h3>
                      <Card>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <p className="text-sm">
                              {points.length} points • {segments.length} segments
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="details">
                <ScrollArea className="h-[40vh] pr-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Points</h3>
                    <div className="space-y-2">
                      {points.map((point, index) => (
                        <Card key={point.id}>
                          <CardContent className="p-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-sm font-medium">Point {index + 1}</p>
                                <p className="text-xs text-muted-foreground">
                                  {point.coordinates[1].toFixed(5)}, {point.coordinates[0].toFixed(5)}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => onRemovePoint(point.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {segments.length > 0 && (
                      <>
                        <h3 className="text-sm font-medium mt-4">Segments</h3>
                        <div className="space-y-2">
                          {segments.map((segment, index) => {
                            const startPointIndex = points.findIndex((p) => p.id === segment.startPointId)
                            const endPointIndex = points.findIndex((p) => p.id === segment.endPointId)

                            return (
                              <Card key={segment.id}>
                                <CardContent className="p-3">
                                  <div className="flex justify-between items-center mb-4">
                                    <p className="text-sm font-medium">
                                      {startPointIndex + 1} → {endPointIndex + 1}
                                    </p>
                                    <Badge variant="outline">{segment.distance}</Badge>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>{segment.duration}</span>
                                    </div>
                                    <Button variant="destructive" size="icon" onClick={() => onRemoveSegment(segment.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
