"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Mock data for deforestation hotspots
const deforestationHotspots = [
  {
    id: 1,
    name: "Amazon Rainforest - Sector A",
    coordinates: [-3.4653, -62.2159],
    severity: "high",
    type: "Illegal Logging",
    date: "April 10, 2025",
    area: "1,245 hectares",
  },
  {
    id: 2,
    name: "Congo Basin - Zone B",
    coordinates: [0.7893, 24.5703],
    severity: "medium",
    type: "Agricultural Expansion",
    date: "April 8, 2025",
    area: "876 hectares",
  },
  {
    id: 3,
    name: "Borneo - North Region",
    coordinates: [1.8282, 113.9213],
    severity: "high",
    type: "Palm Oil Plantation",
    date: "April 5, 2025",
    area: "2,130 hectares",
  },
  {
    id: 4,
    name: "Sumatra - Eastern District",
    coordinates: [-0.5897, 101.3431],
    severity: "medium",
    type: "Illegal Logging",
    date: "April 3, 2025",
    area: "654 hectares",
  },
  {
    id: 5,
    name: "Brazilian Atlantic Forest",
    coordinates: [-23.5505, -46.6333],
    severity: "low",
    type: "Urban Expansion",
    date: "March 29, 2025",
    area: "320 hectares",
  },
]

// Mock data for mining hotspots
const miningHotspots = [
  {
    id: 6,
    name: "Madre de Dios, Peru",
    coordinates: [-12.5933, -70.0319],
    severity: "high",
    type: "Illegal Gold Mining",
    date: "April 12, 2025",
    area: "785 hectares",
  },
  {
    id: 7,
    name: "Chhattisgarh, India",
    coordinates: [21.2787, 81.8661],
    severity: "medium",
    type: "Coal Mining",
    date: "April 7, 2025",
    area: "540 hectares",
  },
  {
    id: 8,
    name: "Katanga, DRC",
    coordinates: [-11.6876, 27.5026],
    severity: "high",
    type: "Copper Mining",
    date: "April 4, 2025",
    area: "1,120 hectares",
  },
  {
    id: 9,
    name: "Western Australia",
    coordinates: [-30.7333, 121.4667],
    severity: "low",
    type: "Legal Iron Mining",
    date: "April 1, 2025",
    area: "2,450 hectares",
  },
  {
    id: 10,
    name: "Minas Gerais, Brazil",
    coordinates: [-19.9167, -43.9345],
    severity: "medium",
    type: "Iron Ore Mining",
    date: "March 30, 2025",
    area: "980 hectares",
  },
]

// GeoJSON style functions
const getDeforestationStyle = (feature: any) => {
  const loss = feature.properties.loss
  return {
    fillColor: loss > 75 ? "#ef4444" : loss > 25 ? "#f97316" : "#eab308",
    weight: 1,
    opacity: 0.7,
    color: "white",
    fillOpacity: 0.5,
  }
}

const getMiningStyle = (feature: any) => {
  const type = feature.properties.type
  return {
    fillColor: type === "illegal" ? "#ef4444" : type === "legal" ? "#3b82f6" : "#eab308",
    weight: 1,
    opacity: 0.7,
    color: "white",
    fillOpacity: 0.5,
  }
}

// Mock GeoJSON data
const deforestationGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Amazon Deforestation", loss: 80 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-65, -5],
            [-60, -5],
            [-60, -10],
            [-65, -10],
            [-65, -5],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Congo Basin Deforestation", loss: 45 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [20, 0],
            [25, 0],
            [25, 5],
            [20, 5],
            [20, 0],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Borneo Deforestation", loss: 70 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [110, 0],
            [115, 0],
            [115, 5],
            [110, 5],
            [110, 0],
          ],
        ],
      },
    },
  ],
}

const miningGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Peru Mining", type: "illegal" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-71, -12],
            [-69, -12],
            [-69, -14],
            [-71, -14],
            [-71, -12],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "DRC Mining", type: "illegal" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [26, -11],
            [28, -11],
            [28, -13],
            [26, -13],
            [26, -11],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Australia Mining", type: "legal" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [120, -30],
            [123, -30],
            [123, -32],
            [120, -32],
            [120, -30],
          ],
        ],
      },
    },
  ],
}

interface MapComponentProps {
  options: {
    center: [number, number]
    zoom: number
    layers: string
    showHotspots: boolean
    showOverlay: boolean
  }
  onHotspotSelect: (hotspot: any) => void
}

export default function MapComponent({ options, onHotspotSelect }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null)

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map("map", {
        center: options.center,
        zoom: options.zoom,
        zoomControl: true,
        attributionControl: false,
      })

      // Add dark theme tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Create layer group for hotspots
      layerGroupRef.current = L.layerGroup().addTo(mapRef.current)
    }

    // Clear existing layers
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers()
    }

    if (geoJsonLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(geoJsonLayerRef.current)
      geoJsonLayerRef.current = null
    }

    // Add GeoJSON overlay if enabled
    if (options.showOverlay && mapRef.current) {
      const geoData = options.layers === "deforestation" ? deforestationGeoJSON : miningGeoJSON
      const styleFunc = options.layers === "deforestation" ? getDeforestationStyle : getMiningStyle

      geoJsonLayerRef.current = L.geoJSON(geoData as any, {
        style: styleFunc,
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`<b>${feature.properties.name}</b>`)
        },
      }).addTo(mapRef.current)
    }

    // Add hotspots if enabled
    if (options.showHotspots && layerGroupRef.current) {
      const hotspots = options.layers === "deforestation" ? deforestationHotspots : miningHotspots

      hotspots.forEach((hotspot) => {
        // Create pulsing marker
        const pulseIcon = L.divIcon({
          className: "custom-div-icon",
          html: `
            <div style="position: relative;">
              <div style="position: absolute; top: -10px; left: -10px; width: 20px; height: 20px; background-color: ${
                hotspot.severity === "high" ? "#ef4444" : hotspot.severity === "medium" ? "#f97316" : "#eab308"
              }; border-radius: 50%; opacity: 0.7;"></div>
              <div style="position: absolute; top: -10px; left: -10px; width: 20px; height: 20px; background-color: ${
                hotspot.severity === "high" ? "#ef4444" : hotspot.severity === "medium" ? "#f97316" : "#eab308"
              }; border-radius: 50%; opacity: 0.7; animation: pulse 2s infinite;"></div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        const marker = L.marker(hotspot.coordinates as L.LatLngExpression, { icon: pulseIcon }).addTo(
          layerGroupRef.current!,
        )

        marker.on("click", () => {
          onHotspotSelect(hotspot)
        })
      })
    }

    // Cleanup function
    return () => {
      // We don't destroy the map on cleanup to prevent re-initialization issues
      // Just clean up the layers we added
    }
  }, [options, onHotspotSelect])

  return <div id="map" className="map-container" />
}
