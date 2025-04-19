"use client"

import { useState, useEffect } from "react"
import { TrendingUp, ChevronDown, ChevronUp, Calendar, DollarSign, BarChart2, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Chart } from "@/components/ui/chart"
import { motion } from "framer-motion"

interface PricePredictionChartProps {
  location: string
  locationData?: any
  onClose: () => void
}

export default function PricePredictionChart({ location, locationData, onClose }: PricePredictionChartProps) {
  const [timeframe, setTimeframe] = useState("1-year")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    setIsVisible(true)
  }, [])

  // Use location data if provided, otherwise use default values
  const currentPrice = locationData?.currentPrice || 750000
  const growthRate = locationData?.growthRate || 10
  const pricePerSqFt = locationData?.pricePerSqFt || 500
  const description = locationData?.description || "Prime location with excellent growth potential"

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="border-primary/30 bg-background/90 backdrop-blur-md shadow-lg shadow-primary/10 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                {location} Property Value Forecast
              </CardTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-months">3 Months</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                  <SelectItem value="1-year">1 Year</SelectItem>
                  <SelectItem value="5-years">5 Years</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isCollapsed && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                  <div className="flex items-center text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="text-xs">Current Value</span>
                  </div>
                  <div className="text-xl font-bold">${currentPrice.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">${pricePerSqFt}/sq.ft</div>
                </div>

                <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                  <div className="flex items-center text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">Growth Rate</span>
                  </div>
                  <div className="text-xl font-bold text-primary">
                    +{growthRate}% <span className="text-sm font-normal">per year</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Above market average</div>
                </div>

                <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                  <div className="flex items-center text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-xs">Forecast Period</span>
                  </div>
                  <div className="text-xl font-bold">{timeframe.replace("-", " ")}</div>
                  <div className="text-xs text-muted-foreground">Updated daily</div>
                </div>
              </div>

              <div className="h-64 bg-card/30 rounded-lg border border-border/50 p-2">
                <Chart
                  type="line"
                  data={getPredictionData(location, timeframe, currentPrice, growthRate)}
                  index="date"
                  categories={["predicted", "actual"]}
                  colors={["#22c55e", "#3b82f6"]}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  showLegend={true}
                  showXAxis={true}
                  showYAxis={true}
                  showGridLines={false}
                />
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                    <span className="text-xs">Predicted Value</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-xs">Historical Value</span>
                  </div>
                </div>
                <div className="flex items-center text-primary">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    +{getPredictionGrowth(timeframe, growthRate)}% Growth Predicted
                  </span>
                </div>
              </div>

              <div className="mt-4 bg-primary/10 border border-primary/20 rounded-lg p-3">
                <div className="flex items-start">
                  <BarChart2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-primary">AI Analysis</h4>
                    <p className="text-xs text-muted-foreground">{getAIAnalysis(location, timeframe, growthRate)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Helper function to generate prediction data based on location and timeframe
function getPredictionData(location: string, timeframe: string, currentPrice: number, growthRate: number) {
  // Determine number of data points based on timeframe
  let dataPoints = 12
  let interval = "month"

  switch (timeframe) {
    case "3-months":
      dataPoints = 90
      interval = "day"
      break
    case "6-months":
      dataPoints = 180
      interval = "day"
      break
    case "1-year":
      dataPoints = 12
      interval = "month"
      break
    case "5-years":
      dataPoints = 20
      interval = "quarter"
      break
  }

  // Generate data
  const data = []
  const now = new Date()

  // Historical data (past 6 points)
  for (let i = -6; i < 0; i++) {
    const date = new Date(now)

    if (interval === "day") {
      date.setDate(date.getDate() + i)
    } else if (interval === "month") {
      date.setMonth(date.getMonth() + i)
    } else if (interval === "quarter") {
      date.setMonth(date.getMonth() + i * 3)
    }

    // Add some randomness to historical data
    const randomFactor = 0.98 + Math.random() * 0.04
    const historicalGrowth = 1 - (Math.abs(i) / 6) * (growthRate / 100)

    data.push({
      date: formatDate(date, interval),
      actual: Math.round(currentPrice * historicalGrowth * randomFactor),
      predicted: null,
    })
  }

  // Current value
  data.push({
    date: formatDate(now, interval),
    actual: currentPrice,
    predicted: currentPrice,
  })

  // Future predictions
  for (let i = 1; i <= dataPoints; i++) {
    const date = new Date(now)

    if (interval === "day") {
      date.setDate(date.getDate() + i)
    } else if (interval === "month") {
      date.setMonth(date.getMonth() + i)
    } else if (interval === "quarter") {
      date.setMonth(date.getMonth() + i * 3)
    }

    // Calculate growth with some randomness
    const randomFactor = 0.98 + Math.random() * 0.04
    const futureGrowth = 1 + (i / dataPoints) * (growthRate / 100)

    data.push({
      date: formatDate(date, interval),
      actual: null,
      predicted: Math.round(currentPrice * futureGrowth * randomFactor),
    })
  }

  return data
}

// Helper function to format dates based on interval
function formatDate(date: Date, interval: string) {
  if (interval === "day") {
    return `${date.getMonth() + 1}/${date.getDate()}`
  } else if (interval === "month") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months[date.getMonth()]
  } else if (interval === "quarter") {
    return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`
  }
  return date.toLocaleDateString()
}

// Helper function to get the growth percentage
function getPredictionGrowth(timeframe: string, growthRate: number) {
  switch (timeframe) {
    case "3-months":
      return Math.round(growthRate * 0.25 * 10) / 10
    case "6-months":
      return Math.round(growthRate * 0.5 * 10) / 10
    case "1-year":
      return growthRate
    case "5-years":
      return Math.round(growthRate * 5 * 10) / 10
    default:
      return growthRate
  }
}

// Helper function to generate AI analysis text
function getAIAnalysis(location: string, timeframe: string, growthRate: number) {
  const growth = getPredictionGrowth(timeframe, growthRate)

  if (growth > 15) {
    return `${location} shows exceptional growth potential with a projected ${growth}% increase over the next ${timeframe.replace("-", " ")}. Our satellite data indicates rapid infrastructure development and population growth in this area, making it an excellent investment opportunity.`
  } else if (growth > 10) {
    return `${location} is showing strong growth indicators with a projected ${growth}% increase over the next ${timeframe.replace("-", " ")}. Satellite imagery reveals new construction and development projects that will likely drive property values higher.`
  } else if (growth > 5) {
    return `${location} demonstrates steady growth potential with a projected ${growth}% increase over the next ${timeframe.replace("-", " ")}. Our analysis shows moderate development activity and stable population trends in this region.`
  } else {
    return `${location} shows modest growth potential with a projected ${growth}% increase over the next ${timeframe.replace("-", " ")}. While not exceptional, this growth rate is consistent with stable markets and may represent a lower-risk investment.`
  }
}
