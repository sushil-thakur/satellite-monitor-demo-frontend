"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "@/components/navbar"
import PropertyValueEstimator from "@/components/property-value-estimator"
import PricePredictionChart from "@/components/price-prediction-chart"

// Dynamically import the map component to avoid SSR issues
const RealEstateMap = dynamic(() => import("@/components/real-estate-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-5rem)] flex items-center justify-center bg-muted">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading real estate data...</p>
      </div>
    </div>
  ),
})

export default function RealEstatePage() {
  const [loaded, setLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("growth-potential")
  const [showEstimator, setShowEstimator] = useState(false)
  const [showPredictionChart, setShowPredictionChart] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState("San Francisco")
  const [locationData, setLocationData] = useState(null)

  // Filter states
  const [infrastructureAccess, setInfrastructureAccess] = useState([50])
  const [populationGrowth, setPopulationGrowth] = useState([30])
  const [elevationRange, setElevationRange] = useState([20, 80])
  const [timeframe, setTimeframe] = useState("6-months")

  useEffect(() => {
    setLoaded(true)
  }, [])

  const mapOptions = {
    center: [37.7749, -122.4194], // San Francisco
    zoom: 5,
    layer: activeTab,
    filters: {
      infrastructureAccess: infrastructureAccess[0],
      populationGrowth: populationGrowth[0],
      elevationMin: elevationRange[0],
      elevationMax: elevationRange[1],
      timeframe,
    },
  }

  const handleLocationSelect = (location: string, data: any) => {
    setSelectedLocation(location)
    setLocationData(data)
    setShowPredictionChart(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: loaded ? 1 : 0, x: loaded ? 0 : -20 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-80 bg-card border-r border-border p-4 space-y-4 overflow-auto"
        >
          <div>
            <h1 className="text-2xl font-bold font-heading">Real Estate Prediction</h1>
            <p className="text-sm text-muted-foreground">
              Identify high-value growth areas and investment opportunities
            </p>
          </div>

          <Tabs defaultValue="growth-potential" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="growth-potential">Growth Potential</TabsTrigger>
              <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="infrastructure-access" className="text-sm">
                  Infrastructure Access
                </Label>
                <span className="text-xs text-muted-foreground">{infrastructureAccess}%</span>
              </div>
              <Slider
                id="infrastructure-access"
                defaultValue={[50]}
                max={100}
                step={1}
                value={infrastructureAccess}
                onValueChange={setInfrastructureAccess}
              />
              <p className="text-xs text-muted-foreground">Proximity to roads, utilities, and public services</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="population-growth" className="text-sm">
                  Population Growth
                </Label>
                <span className="text-xs text-muted-foreground">{populationGrowth}%</span>
              </div>
              <Slider
                id="population-growth"
                defaultValue={[30]}
                max={100}
                step={1}
                value={populationGrowth}
                onValueChange={setPopulationGrowth}
              />
              <p className="text-xs text-muted-foreground">Projected population increase in the area</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="elevation-range" className="text-sm">
                  Elevation Range
                </Label>
                <span className="text-xs text-muted-foreground">
                  {elevationRange[0]}m - {elevationRange[1]}m
                </span>
              </div>
              <Slider
                id="elevation-range"
                defaultValue={[20, 80]}
                max={100}
                step={1}
                value={elevationRange}
                onValueChange={setElevationRange}
              />
              <p className="text-xs text-muted-foreground">Terrain elevation preferences</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe" className="text-sm">
                Prediction Timeframe
              </Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-months">3 Months</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                  <SelectItem value="1-year">1 Year</SelectItem>
                  <SelectItem value="5-years">5 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" onClick={() => setShowEstimator(true)}>
              Estimate Property Value
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-medium mb-2">Legend</h3>
            <div className="space-y-2">
              {activeTab === "growth-potential" ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-green-500/70"></div>
                    <span className="text-sm">High Growth ({">"}30%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500/70"></div>
                    <span className="text-sm">Moderate Growth (10-30%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500/70"></div>
                    <span className="text-sm">Stable Growth (0-10%)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-red-500/70"></div>
                    <span className="text-sm">High Risk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500/70"></div>
                    <span className="text-sm">Moderate Risk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-green-500/70"></div>
                    <span className="text-sm">Low Risk</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Map and Estimator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 relative"
        >
          <RealEstateMap options={mapOptions} onLocationSelect={handleLocationSelect} />

          {showPredictionChart && (
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <PricePredictionChart
                location={selectedLocation}
                locationData={locationData}
                onClose={() => setShowPredictionChart(false)}
              />
            </div>
          )}

          {showEstimator && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-30">
              <PropertyValueEstimator onClose={() => setShowEstimator(false)} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
