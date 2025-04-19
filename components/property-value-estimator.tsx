"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Search, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Chart } from "@/components/ui/chart"

interface PropertyValueEstimatorProps {
  onClose: () => void
}

export default function PropertyValueEstimator({ onClose }: PropertyValueEstimatorProps) {
  const [address, setAddress] = useState("")
  const [propertyType, setPropertyType] = useState("residential")
  const [timeframe, setTimeframe] = useState("6-months")
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<null | {
    prediction: number
    confidence: number
    currentValue: number
  }>(null)
  const [showTypewriter, setShowTypewriter] = useState(false)

  const handleSearch = () => {
    if (!address) return

    setIsSearching(true)

    // Simulate API call
    setTimeout(() => {
      setIsSearching(false)
      setResult({
        prediction: 28,
        confidence: 87,
        currentValue: 750000,
      })
      setShowTypewriter(true)
    }, 2000)
  }

  // Chart data
  const chartData = [
    { month: "Jan", value: 750000 },
    { month: "Feb", value: 760000 },
    { month: "Mar", value: 780000 },
    { month: "Apr", value: 790000 },
    { month: "May", value: 810000 },
    { month: "Jun", value: 830000 },
    { month: "Jul", value: 850000 },
    { month: "Aug", value: 880000 },
    { month: "Sep", value: 910000 },
    { month: "Oct", value: 940000 },
    { month: "Nov", value: 960000 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-2xl"
    >
      <Card className="border border-border bg-card/90 backdrop-blur-sm">
        <CardHeader className="relative">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl font-heading">Property Value Estimation</CardTitle>
          <CardDescription>Enter a property address to predict future value growth</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address">Property Address or Coordinates</Label>
            <div className="flex space-x-2">
              <Input
                id="address"
                placeholder="123 Main St, San Francisco, CA or 37.7749,-122.4194"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Button onClick={handleSearch} disabled={isSearching || !address}>
                {isSearching ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property-type">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger id="property-type">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="land">Undeveloped Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prediction-timeframe">Prediction Timeframe</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger id="prediction-timeframe">
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
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="h-64 w-full">
                <Chart
                  type="line"
                  data={chartData}
                  index="month"
                  categories={["value"]}
                  colors={["#22c55e"]}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  showLegend={false}
                  showXAxis={true}
                  showYAxis={true}
                  showGridLines={false}
                />
              </div>

              <Card className="border border-primary/50 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div className={showTypewriter ? "typewriter" : ""} style={{ width: "100%" }}>
                      <p className="font-medium text-primary">
                        This property is expected to rise by +{result.prediction}% in {timeframe.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Current estimated value: ${result.currentValue.toLocaleString()}</p>
                    <p>
                      Future estimated value: $
                      {Math.round(result.currentValue * (1 + result.prediction / 100)).toLocaleString()}
                    </p>
                    <p>Prediction confidence: {result.confidence}%</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
