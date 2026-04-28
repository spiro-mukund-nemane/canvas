import type React from "react"
import { useEffect, useState, useRef } from "react"
import { type MapRef, Marker } from "react-map-gl/maplibre"
import { useDispatch, useSelector } from "react-redux"
import { v4 as uuidv4 } from "uuid"
// import { X } from "lucide-react"
import { Button } from "../../ui/button"
import RouteInfoPanel from "./route-info-panel"
import { cancelMeasuring } from "../../../store/map/measurementSlice"
import type { RootState } from "../../../store" // Adjust the import path as needed

interface DistanceMeasureControlProps {
  mapRef: React.RefObject<MapRef | null>
  apiUrl: string
  apiKey?: string
}

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

export function DistanceMeasureControl({ mapRef, apiUrl, apiKey }: DistanceMeasureControlProps) {
  const dispatch = useDispatch();
  // Get isMeasuring from Redux store
  const isMeasuring = useSelector((state: RootState) => state.measurement.isMeasuring)
  const [points, setPoints] = useState<RoutePoint[]>([])
  const [segments, setSegments] = useState<RouteSegment[]>([])
  const [totalDistance, setTotalDistance] = useState<number>(0)
  const [totalDuration, setTotalDuration] = useState<number>(0)
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)
  const markersContainerRef = useRef<HTMLDivElement>(null)

  // Reset everything when measuring is cancelled
  useEffect(() => {
    if (!isMeasuring) {
      cleanupMap()
      setPoints([])
      setSegments([])
      setTotalDistance(0)
      setTotalDuration(0)
      setIsPanelOpen(false)
    } else {
      // Open panel when measuring starts
      setIsPanelOpen(true)
    }
  }, [isMeasuring])

  // Update totals when segments change
  useEffect(() => {
    if (segments.length > 0) {
      let distanceSum = 0
      let durationSum = 0

      segments.forEach((segment) => {
        distanceSum += Number.parseFloat(segment.distance.split(" ")[0])
        durationSum += Number.parseFloat(segment.duration.split(" ")[0])
      })

      setTotalDistance(distanceSum)
      setTotalDuration(durationSum)
    } else {
      setTotalDistance(0)
      setTotalDuration(0)
    }
  }, [segments])

  // Handle map click events
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handleClick = async (e: any) => {
      if (!isMeasuring) return

      const { lngLat } = e
      const newPoint: RoutePoint = {
        id: uuidv4(),
        coordinates: [lngLat.lng, lngLat.lat],
      }

      setPoints((prev) => [...prev, newPoint])

      if (points.length > 0) {
        const previousPoint = points[points.length - 1]
        await addRouteSegment(previousPoint, newPoint)
      }
    }

    map.on("click", handleClick)

    return () => {
      map.off("click", handleClick)
    }
  }, [isMeasuring, points, mapRef])

  //   // Add a new route segment between two points
  //   const addRouteSegment = async (startPoint: RoutePoint, endPoint: RoutePoint) => {
  //     const map = mapRef.current
  //     if (!map) return

  //     const feature = await fetchRoute(startPoint.coordinates, endPoint.coordinates)
  //     const segmentId = uuidv4()

  //     console.log("Feature to add on map:",feature)

  //     // Add the line to the map
  //     map.addSource(`line-${segmentId}`, {
  //       type: "geojson",
  //       data: feature,
  //     })

  //     map.addLayer({
  //       id: `line-${segmentId}`,
  //       type: "line",
  //       source: `line-${segmentId}`,
  //       paint: {
  //         "line-color": "#3b82f6", // Blue color
  //         "line-width": 4,
  //         "line-opacity": 0.8,
  //       },
  //     })

  //     // Store the segment data
  //     setSegments((prev) => [
  //       ...prev,
  //       {
  //         id: segmentId,
  //         startPointId: startPoint.id,
  //         endPointId: endPoint.id,
  //         distance: feature.properties.distance,
  //         duration: feature.properties.duration,
  //         geometry: feature.geometry,
  //       },
  //     ])
  //   }

  //   // Clean up map layers and sources
  //   const cleanupMap = () => {
  //     const map = mapRef.current
  //     if (!map) return

  //     segments.forEach((segment) => {
  //       try {
  //         map.removeLayer(`line-${segment.id}`)
  //         map.removeSource(`line-${segment.id}`)
  //       } catch (err) {
  //         console.warn("Error cleaning layers:", err)
  //       }
  //     })
  //   }

  //   // Remove a specific point and connected segments
  //   const removePoint = (pointId: string) => {
  //     const map = mapRef.current
  //     if (!map) return

  //     // Remove connected segments
  //     const connectedSegments = segments.filter((s) => s.startPointId === pointId || s.endPointId === pointId)

  //     connectedSegments.forEach((segment) => {
  //       try {
  //         map.removeLayer(`line-${segment.id}`)
  //         map.removeSource(`line-${segment.id}`)
  //       } catch (err) {
  //         console.warn("Error removing segment:", err)
  //       }
  //     })

  //     // Update segments state
  //     setSegments((prev) => prev.filter((s) => s.startPointId !== pointId && s.endPointId !== pointId))

  //     // Update points state
  //     setPoints((prev) => prev.filter((p) => p.id !== pointId))
  //   }


  //   // Remove a specific segment and connected points/segments
  // const removeSegment = (segmentId: string) => {
  //   const map = mapRef.current;
  //   if (!map) return;

  //   // Find the segment to remove
  //   const segmentToRemove = segments.find((s) => s.id === segmentId);
  //   if (!segmentToRemove) {
  //     console.warn("Segment not found:", segmentId);
  //     return;
  //   }

  //   // Remove the segment layer and source from the map
  //   try {
  //     map.removeLayer(`line-${segmentId}`);
  //     map.removeSource(`line-${segmentId}`);
  //   } catch (err) {
  //     console.warn("Error removing segment from map:", err);
  //   }

  //   // Check if it's a middle segment
  //   const isMiddleSegment = segments.some(
  //     (s) =>
  //       (s.startPointId === segmentToRemove.startPointId && s.id !== segmentId) ||
  //       (s.endPointId === segmentToRemove.endPointId && s.id !== segmentId)
  //   );

  //   if (isMiddleSegment) {
  //     // If it's a middle segment, remove all points and segments aligned with it
  //     const pointsToRemove = new Set<string>();
  //     const segmentsToRemove = new Set<string>();

  //     const traverseAndCollect = (startPointId: string) => {
  //       segments.forEach((s) => {
  //         if (s.startPointId === startPointId || s.endPointId === startPointId) {
  //           segmentsToRemove.add(s.id);
  //           pointsToRemove.add(s.startPointId);
  //           pointsToRemove.add(s.endPointId);
  //           traverseAndCollect(s.startPointId);
  //           traverseAndCollect(s.endPointId);
  //         }
  //       });
  //     };

  //     traverseAndCollect(segmentToRemove.startPointId);

  //     // Remove collected segments
  //     Array.from(segmentsToRemove).forEach((id) => {
  //       try {
  //         map.removeLayer(`line-${id}`);
  //         map.removeSource(`line-${id}`);
  //       } catch (err) {
  //         console.warn("Error removing segment:", err);
  //       }
  //     });

  //     // Update state
  //     setSegments((prev) => prev.filter((s) => !segmentsToRemove.has(s.id)));
  //     setPoints((prev) => prev.filter((p) => !pointsToRemove.has(p.id)));
  //   } else {
  //     // If it's not a middle segment, just remove the segment and the last point
  //     const pointToRemove =
  //       segmentToRemove.endPointId !== segmentToRemove.startPointId
  //         ? segmentToRemove.endPointId
  //         : segmentToRemove.startPointId;

  //     // Remove point from the map
  //     setPoints((prev) => prev.filter((p) => p.id !== pointToRemove));
  //     setSegments((prev) => prev.filter((s) => s.id !== segmentId));
  //   }
  // };

// Add a new route segment between two points
const addRouteSegment = async (startPoint: RoutePoint, endPoint: RoutePoint) => {
  const mapInstance = mapRef.current as any
  if (!mapInstance) return

  const feature = await fetchRoute(startPoint.coordinates, endPoint.coordinates)
  const segmentId = uuidv4()

  console.log("Feature to add on map:", feature)

  // Add the line to the map
  mapInstance.addSource(`line-${segmentId}`, {
    type: "geojson",
    data: feature,
  })

  mapInstance.addLayer({
    id: `line-${segmentId}`,
    type: "line",
    source: `line-${segmentId}`,
    paint: {
      "line-color": "#3b82f6", // Blue color
      "line-width": 4,
      "line-opacity": 0.8,
    },
  })

  // Store the segment data
  setSegments((prev) => [
    ...prev,
    {
      id: segmentId,
      startPointId: startPoint.id,
      endPointId: endPoint.id,
      distance: feature.properties.distance,
      duration: feature.properties.duration,
      geometry: feature.geometry,
    },
  ])
}

// Clean up map layers and sources
const cleanupMap = () => {
  const mapInstance = mapRef.current as any
  if (!mapInstance) return

  segments.forEach((segment) => {
    try {
      mapInstance.removeLayer(`line-${segment.id}`)
      mapInstance.removeSource(`line-${segment.id}`)
    } catch (err) {
      console.warn("Error cleaning layers:", err)
    }
  })
}

// Remove a specific point and connected segments
const removePoint = (pointId: string) => {
  const mapInstance = mapRef.current as any
  if (!mapInstance) return

  // Remove connected segments
  const connectedSegments = segments.filter((s) => s.startPointId === pointId || s.endPointId === pointId)

  connectedSegments.forEach((segment) => {
    try {
      mapInstance.removeLayer(`line-${segment.id}`)
      mapInstance.removeSource(`line-${segment.id}`)
    } catch (err) {
      console.warn("Error removing segment:", err)
    }
  })

  // Update segments state
  setSegments((prev) => prev.filter((s) => s.startPointId !== pointId && s.endPointId !== pointId))

  // Update points state
  setPoints((prev) => prev.filter((p) => p.id !== pointId))
}

// Remove a specific segment and connected points/segments
const removeSegment = (segmentId: string) => {
  const mapInstance = mapRef.current as any
  if (!mapInstance) return

  // Find the segment to remove
  const segmentToRemove = segments.find((s) => s.id === segmentId)
  if (!segmentToRemove) {
    console.warn("Segment not found:", segmentId)
    return
  }

  // Remove the segment layer and source from the map
  try {
    mapInstance.removeLayer(`line-${segmentId}`)
    mapInstance.removeSource(`line-${segmentId}`)
  } catch (err) {
    console.warn("Error removing segment from map:", err)
  }

  // Check if it's a middle segment
  const isMiddleSegment = segments.some(
    (s) =>
      (s.startPointId === segmentToRemove.startPointId && s.id !== segmentId) ||
      (s.endPointId === segmentToRemove.endPointId && s.id !== segmentId)
  )

  if (isMiddleSegment) {
    // If it's a middle segment, remove all points and segments aligned with it
    const pointsToRemove = new Set<string>()
    const segmentsToRemove = new Set<string>()

    const traverseAndCollect = (startPointId: string) => {
      segments.forEach((s) => {
        if (s.startPointId === startPointId || s.endPointId === startPointId) {
          segmentsToRemove.add(s.id)
          pointsToRemove.add(s.startPointId)
          pointsToRemove.add(s.endPointId)
          traverseAndCollect(s.startPointId)
          traverseAndCollect(s.endPointId)
        }
      })
    }

    traverseAndCollect(segmentToRemove.startPointId)

    // Remove collected segments
    Array.from(segmentsToRemove).forEach((id) => {
      try {
        mapInstance.removeLayer(`line-${id}`)
        mapInstance.removeSource(`line-${id}`)
      } catch (err) {
        console.warn("Error removing segment:", err)
      }
    })

    // Update state
    setSegments((prev) => prev.filter((s) => !segmentsToRemove.has(s.id)))
    setPoints((prev) => prev.filter((p) => !pointsToRemove.has(p.id)))
  } else {
    // If it's not a middle segment, just remove the segment and the last point
    const pointToRemove =
      segmentToRemove.endPointId !== segmentToRemove.startPointId
        ? segmentToRemove.endPointId
        : segmentToRemove.startPointId

    // Remove point from the map
    setPoints((prev) => prev.filter((p) => p.id !== pointToRemove))
    setSegments((prev) => prev.filter((s) => s.id !== segmentId))
  }
}

  // Fetch route between two points
  async function fetchRoute(coord1: [number, number], coord2: [number, number]) {
    try {
      const url = `${apiUrl}/directions/route?${apiKey ? `key=${apiKey}&` : ""}json=${encodeURIComponent(
        JSON.stringify({
          locations: [
            { lat: coord1[1], lon: coord1[0] },
            { lat: coord2[1], lon: coord2[0] },
          ],
          costing: "auto",
          directions_options: { units: "kilometers" },
        }),
      )}`

      const response = await fetch(url)
      if (!response.ok) throw new Error("Routing API error")

      const data = await response.json()
      console.log("Response Data:", data)
      if (!data?.trip?.legs?.length) throw new Error("No route found")

      const decoded = decodePolyline(data.trip.legs[0].shape)
      const distance = data.trip.summary.length?.toFixed(2) ?? "N/A"
      const duration = (data.trip.summary.time / 60)?.toFixed(2) ?? "N/A"

      // console.log("decoded co-ordinates:", decoded)

      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: decoded,
        },
        properties: {
          distance: `${distance} km`,
          duration: `${duration} min`,
        },
      }
    } catch (error) {
      console.warn("Falling back to straight-line")
      const distance = haversineDistance(coord1, coord2)
      const duration = ((distance / 40) * 60).toFixed(2) // assuming 40km/h

      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [coord1, coord2],
        },
        properties: {
          distance: `${distance.toFixed(2)} km`,
          duration: `${duration} min`,
        },
      }
    }
  }

  function haversineDistance([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]) {
    const R = 6371
    const toRad = (x: number) => (x * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lng2 - lng1)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }


  function decodePolyline(encoded: string): [number, number][] {
    let index = 0,
      lat = 0,
      lng = 0,
      coordinates: [number, number][] = [];

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      // Adjust scaling factor if necessary
      const longitude = lng / 1e6;
      const latitude = lat / 1e6;

      // Validate decoded coordinates
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        console.warn("Invalid decoded coordinate:", { longitude, latitude });
      } else {
        coordinates.push([longitude, latitude]);
      }
    }

    return coordinates;
  }


  // Render markers for each point
  const renderMarkers = () => {
    return points.map((point, index) => (
      <Marker key={point.id} longitude={point.coordinates[0]} latitude={point.coordinates[1]} anchor="center">
        <div className="relative group cursor-pointer">
          <div className="w-6 h-6 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <div className="text-blue-500 font-semibold text-xs">{index + 1}</div>
          </div>
          {/* <Button
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-4 w-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              removePoint(point.id)
            }}
          >
            <X className="h-3 w-3" />
          </Button> */}
        </div>
      </Marker>
    ))
  }

  // Handle closing the measurement mode
  const handleClose = () => {
    dispatch(cancelMeasuring())
  }

  return (
    <>
      {isMeasuring && (
        <>
          <div ref={markersContainerRef}>{renderMarkers()}</div>

          {isPanelOpen && (
            <RouteInfoPanel
              points={points}
              segments={segments}
              totalDistance={totalDistance}
              totalDuration={totalDuration}
              onClose={handleClose}
              onRemovePoint={removePoint}
              onRemoveSegment={removeSegment}
            />
          )}

          {!isPanelOpen && points.length > 0 && (
            <Button className="absolute bottom-4 right-4 z-10" onClick={() => setIsPanelOpen(true)}>
              Show Route Info
            </Button>
          )}
        </>
      )}
    </>
  )
}
