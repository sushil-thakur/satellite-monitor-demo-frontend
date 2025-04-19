"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Mock data for heatmap
const generateHeatmapData = (center: [number, number], count: number, radius: number, intensity: number) => {
  const points = []
  for (let i = 0; i < count; i++) {
    // Random point within radius of center
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * radius
    const lat = center[0] + distance * Math.cos(angle) * 0.01
    const lng = center[1] + distance * Math.sin(angle) * 0.01
    points.push([lat, lng, Math.random() * intensity])
  }
  return points
}

// Growth potential heatmap data
const growthPotentialData = [
  { center: [37.7749, -122.4194], count: 200, radius: 10, intensity: 1 }, // San Francisco
  { center: [37.8044, -122.2712], count: 150, radius: 8, intensity: 0.8 }, // Oakland
  { center: [37.3382, -121.8863], count: 180, radius: 9, intensity: 0.9 }, // San Jose
  { center: [37.4443, -122.1598], count: 220, radius: 7, intensity: 1 }, // Palo Alto
]

// Risk assessment heatmap data
const riskAssessmentData = [
  { center: [37.7749, -122.4194], count: 100, radius: 5, intensity: 0.7 }, // San Francisco
  { center: [37.8044, -122.2712], count: 180, radius: 7, intensity: 0.9 }, // Oakland
  { center: [37.3382, -121.8863], count: 120, radius: 6, intensity: 0.6 }, // San Jose
  { center: [37.4443, -122.1598], count: 80, radius: 4, intensity: 0.4 }, // Palo Alto
]

// City data with property prices
const cities = [
  {
    name: "San Francisco",
    location: [37.7749, -122.4194],
    currentPrice: 1250000,
    pricePerSqFt: 1100,
    growthRate: 12,
    description: "Tech hub with high demand and limited supply",
  },
  {
    name: "New York",
    location: [40.7128, -74.006],
    currentPrice: 1500000,
    pricePerSqFt: 1300,
    growthRate: 8,
    description: "Financial center with premium real estate",
  },
  {
    name: "Austin",
    location: [30.2672, -97.7431],
    currentPrice: 550000,
    pricePerSqFt: 350,
    growthRate: 18,
    description: "Rapidly growing tech scene and affordable housing",
  },
  {
    name: "Miami",
    location: [25.7617, -80.1918],
    currentPrice: 650000,
    pricePerSqFt: 400,
    growthRate: 15,
    description: "Luxury coastal properties with international appeal",
  },
  {
    name: "Seattle",
    location: [47.6062, -122.3321],
    currentPrice: 850000,
    pricePerSqFt: 550,
    growthRate: 10,
    description: "Tech industry growth driving housing demand",
  },
  {
    name: "Los Angeles",
    location: [34.0522, -118.2437],
    currentPrice: 1100000,
    pricePerSqFt: 750,
    growthRate: 9,
    description: "Entertainment industry hub with diverse neighborhoods",
  },
  {
    name: "Chicago",
    location: [41.8781, -87.6298],
    currentPrice: 450000,
    pricePerSqFt: 250,
    growthRate: 5,
    description: "Affordable metropolitan area with stable growth",
  },
  {
    name: "Denver",
    location: [39.7392, -104.9903],
    currentPrice: 600000,
    pricePerSqFt: 320,
    growthRate: 14,
    description: "Outdoor lifestyle with growing tech presence",
  },
]

interface RealEstateMapProps {
  options: {
    center: [number, number]
    zoom: number
    layer: string
    filters: {
      infrastructureAccess: number
      populationGrowth: number
      elevationMin: number
      elevationMax: number
      timeframe: string
    }
  }
  onLocationSelect?: (location: string, data: any) => void
}

export default function RealEstateMap({ options, onLocationSelect }: RealEstateMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const heatLayerRef = useRef<any>(null)

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map("real-estate-map", {
        center: options.center,
        zoom: options.zoom,
        zoomControl: true,
        attributionControl: false,
      })

      // Add dark theme tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Create a simple heatmap implementation since leaflet.heat might not be available
      updateHeatmap()
    } else {
      // Just update the existing map
      mapRef.current.setView(options.center, options.zoom)
      updateHeatmap()
    }
  }, [options.center, options.zoom])

  const updateHeatmap = () => {
    if (!mapRef.current) return

    // Remove existing heatmap layer
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current)
      heatLayerRef.current = null
    }

    // Apply filters to data
    const filterMultiplier = (options.filters.infrastructureAccess * 0.4 + options.filters.populationGrowth * 0.6) / 100

    // Select data based on layer type
    const baseData = options.layer === "growth-potential" ? growthPotentialData : riskAssessmentData

    // Instead of using L.heatLayer, we'll create circle markers for each point
    const layerGroup = L.layerGroup()

    baseData.forEach((location) => {
      const adjustedIntensity = location.intensity * filterMultiplier
      const points = generateHeatmapData(
        location.center,
        Math.floor(location.count * filterMultiplier),
        location.radius,
        adjustedIntensity,
      )

      // Create circle markers for each point
      points.forEach((point) => {
        const [lat, lng, intensity] = point
        const radius = Math.max(5, intensity * 15) // Scale radius based on intensity

        // Choose color based on layer type and intensity
        const color =
          options.layer === "growth-potential"
            ? intensity > 0.7
              ? "#22c55e"
              : intensity > 0.4
                ? "#3b82f6"
                : "#eab308"
            : intensity > 0.7
              ? "#ef4444"
              : intensity > 0.4
                ? "#f97316"
                : "#22c55e"

        L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: color,
          color: "transparent",
          fillOpacity: 0.5,
        }).addTo(layerGroup)
      })

      // Add marker for the center of each location
      const markerIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: white; width: 10px; height: 10px; border-radius: 50%; border: 2px solid ${
          options.layer === "growth-potential" ? "#22c55e" : "#ef4444"
        };"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      L.marker(location.center, { icon: markerIcon }).addTo(layerGroup)
    })

    // Add city markers with interactive popups
    cities.forEach((city) => {
      // Calculate future price based on growth rate and timeframe
      const timeframeYears =
        options.filters.timeframe === "3-months"
          ? 0.25
          : options.filters.timeframe === "6-months"
            ? 0.5
            : options.filters.timeframe === "1-year"
              ? 1
              : 5

      const futurePrice = Math.round(city.currentPrice * (1 + (city.growthRate / 100) * timeframeYears))
      const growthAmount = futurePrice - city.currentPrice
      const growthPercent = Math.round((growthAmount / city.currentPrice) * 100 * 10) / 10

      // Create a pulsing marker for each city
      const markerIcon = L.divIcon({
        className: "custom-div-icon",
        html: `
          <div style="position: relative; cursor: pointer;">
            <div style="position: absolute; top: -15px; left: -15px; width: 30px; height: 30px; background-color: ${
              options.layer === "growth-potential" ? "#22c55e" : "#ef4444"
            }; border-radius: 50%; opacity: 0.2; animation: pulse 2s infinite;"></div>
            <div style="position: absolute; top: -10px; left: -10px; width: 20px; height: 20px; background-color: ${
              options.layer === "growth-potential" ? "#22c55e" : "#ef4444"
            }; border-radius: 50%; opacity: 0.7;"></div>
            <div style="position: absolute; top: -30px; left: -50px; width: 100px; text-align: center; color: white; font-weight: bold; font-size: 12px; text-shadow: 0 0 3px black;">${city.name}</div>
          </div>
        `,
        iconSize: [0, 0],
      })

      const marker = L.marker(city.location as L.LatLngExpression, { icon: markerIcon }).addTo(layerGroup)

      // Create a custom popup with price information
      const popupContent = `
        <div style="min-width: 200px; padding: 10px; text-align: center;">
          <h3 style="margin: 0 0 10px; font-size: 16px; color: #fff;">${city.name}</h3>
          <div style="margin-bottom: 10px; font-size: 12px; color: #aaa;">${city.description}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: #aaa;">Current Price:</span>
            <span style="font-weight: bold; color: #fff;">$${city.currentPrice.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: #aaa;">Price/sq.ft:</span>
            <span style="color: #fff;">$${city.pricePerSqFt}/sq.ft</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #aaa;">Predicted (${options.filters.timeframe}):</span>
            <span style="font-weight: bold; color: ${
              options.layer === "growth-potential" ? "#22c55e" : "#ef4444"
            };">$${futurePrice.toLocaleString()}</span>
          </div>
          <div style="background: rgba(34, 197, 94, 0.2); padding: 5px; border-radius: 4px; text-align: center; margin-bottom: 10px;">
            <span style="color: ${
              options.layer === "growth-potential" ? "#22c55e" : "#ef4444"
            }; font-weight: bold;">+${growthPercent}% Growth</span>
          </div>
          <button style="background: #22c55e; color: #000; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; width: 100%; font-weight: bold;" class="view-forecast-btn" data-city="${city.name}">View Price Forecast</button>
        </div>
      `

      const popup = L.popup({
        className: "custom-popup",
        closeButton: true,
        autoClose: true,
        closeOnEscapeKey: true,
        closeOnClick: true,
      }).setContent(popupContent)

      marker.bindPopup(popup)

      // Add click handler for the marker
      marker.on("click", () => {
        marker.openPopup()
      })

      // Add click handler for the "View Price Forecast" button
      marker.on("popupopen", () => {
        setTimeout(() => {
          const btn = document.querySelector(".view-forecast-btn")
          if (btn) {
            btn.addEventListener("click", (e) => {
              e.preventDefault()
              const cityName = (e.target as HTMLElement).getAttribute("data-city")
              if (cityName && onLocationSelect) {
                const cityData = cities.find((c) => c.name === cityName)
                onLocationSelect(cityName, cityData)
                marker.closePopup()
              }
            })
          }
        }, 100)
      })

      // Add mouseover effect
      marker.on("mouseover", () => {
        marker.setZIndexOffset(1000)
      })

      marker.on("mouseout", () => {
        marker.setZIndexOffset(0)
      })
    })

    // Add the layer group to the map
    layerGroup.addTo(mapRef.current)
    heatLayerRef.current = layerGroup

    // Add custom CSS for the popup
    const style = document.createElement("style")
    style.innerHTML = `
      .custom-popup .leaflet-popup-content-wrapper {
        background: rgba(30, 41, 59, 0.9);
        color: #fff;
        border-radius: 8px;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(34, 197, 94, 0.3);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      }
      .custom-popup .leaflet-popup-tip {
        background: rgba(30, 41, 59, 0.9);
        border: 1px solid rgba(34, 197, 94, 0.3);
      }
      .custom-popup .leaflet-popup-close-button {
        color: #fff;
      }
      .view-forecast-btn:hover {
        background: #16a34a !important;
      }
      @keyframes pulse {
        0% {
          transform: scale(0.95);
          opacity: 0.7;
        }
        70% {
          transform: scale(1.5);
          opacity: 0.2;
        }
        100% {
          transform: scale(0.95);
          opacity: 0.7;
        }
      }
    `
    document.head.appendChild(style)
  }

  return <div id="real-estate-map" className="map-container" />
}
