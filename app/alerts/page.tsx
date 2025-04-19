"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Filter, Bell, Eye, EyeOff, MapPin, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "@/components/navbar"

export default function AlertsPage() {
  const [loaded, setLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [alertFilter, setAlertFilter] = useState("all")
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setLoaded(true)
    setAlerts(mockAlerts)

    // Simulate new alert coming in
    const timer = setTimeout(() => {
      const newAlert: Alert = {
        id: "alert-new",
        title: "Illegal Mining Activity Detected",
        description: "New mining operation detected in protected area of Madre de Dios, Peru.",
        type: "mining",
        severity: "high",
        location: "Madre de Dios, Peru",
        coordinates: [-12.5933, -70.0319],
        time: "Just now",
        isNew: true,
      }

      setAlerts((prev) => [newAlert, ...prev])
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab !== "all" && alert.type !== activeTab) return false
    if (alertFilter !== "all" && alert.severity !== alertFilter) return false
    return true
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-heading">Alert System</h1>
            <p className="text-muted-foreground">Real-time notifications about environmental changes and activities</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="mb-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="all">All Alerts</TabsTrigger>
              <TabsTrigger value="deforestation">Deforestation</TabsTrigger>
              <TabsTrigger value="mining">Mining</TabsTrigger>
              <TabsTrigger value="fire">Fires</TabsTrigger>
            </TabsList>
          </Tabs>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 p-4 border border-border rounded-md bg-card/50"
            >
              <div className="flex items-center space-x-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Severity</label>
                  <Select value={alertFilter} onValueChange={setAlertFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No alerts found</h3>
              <p className="text-muted-foreground">There are no alerts matching your current filters</p>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={alert.isNew ? { opacity: 0, y: -20 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: alert.isNew ? 0 : loaded ? 0.1 * index : 0,
                }}
                className={`alert-card ${alert.isNew ? "border-l-4 border-l-destructive" : ""}`}
              >
                <Card className="border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className={`p-4 md:p-6 flex-1 ${alert.isNew ? "bg-destructive/5" : ""}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div
                              className={`p-2 rounded-full ${
                                alert.severity === "high"
                                  ? "bg-destructive/20 text-destructive"
                                  : alert.severity === "medium"
                                    ? "bg-orange-500/20 text-orange-500"
                                    : "bg-yellow-500/20 text-yellow-500"
                              }`}
                            >
                              <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{alert.title}</h3>
                                {alert.isNew && (
                                  <Badge variant="destructive" className="text-xs">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {alert.location}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {alert.time}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={`
                            ${
                              alert.type === "deforestation"
                                ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                                : alert.type === "mining"
                                  ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                                  : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                            }
                          `}
                          >
                            {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex border-t md:border-t-0 md:border-l border-border">
                        <Button variant="ghost" className="flex-1 rounded-none h-auto py-4">
                          <Eye className="h-4 w-4 mr-2" />
                          View on Map
                        </Button>
                        <Button variant="ghost" className="flex-1 rounded-none h-auto py-4 border-l border-border">
                          <EyeOff className="h-4 w-4 mr-2" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

interface Alert {
  id: string
  title: string
  description: string
  type: "deforestation" | "mining" | "fire"
  severity: "high" | "medium" | "low"
  location: string
  coordinates: [number, number]
  time: string
  isNew?: boolean
}

const mockAlerts: Alert[] = [
  {
    id: "alert-1",
    title: "Illegal Mining Detected in Chhattisgarh",
    description: "Satellite imagery shows new mining activity in protected forest area.",
    type: "mining",
    severity: "high",
    location: "Chhattisgarh, India",
    coordinates: [21.2787, 81.8661],
    time: "3 hours ago",
  },
  {
    id: "alert-2",
    title: "Rapid Deforestation in Amazon Basin",
    description: "Significant forest loss detected over 500 hectares in the past week.",
    type: "deforestation",
    severity: "high",
    location: "Amazonas, Brazil",
    coordinates: [-3.4653, -62.2159],
    time: "6 hours ago",
  },
  {
    id: "alert-3",
    title: "Forest Fire in Borneo",
    description: "Thermal anomalies detected indicating active fires in protected area.",
    type: "fire",
    severity: "medium",
    location: "Borneo, Indonesia",
    coordinates: [1.8282, 113.9213],
    time: "12 hours ago",
  },
  {
    id: "alert-4",
    title: "Small-scale Logging Activity",
    description: "Potential illegal logging detected in Congo Basin conservation zone.",
    type: "deforestation",
    severity: "low",
    location: "Congo Basin",
    coordinates: [0.7893, 24.5703],
    time: "1 day ago",
  },
  {
    id: "alert-5",
    title: "Mining Expansion in Protected Area",
    description: "Existing mining operation expanding into protected watershed.",
    type: "mining",
    severity: "medium",
    location: "Madre de Dios, Peru",
    coordinates: [-12.5933, -70.0319],
    time: "2 days ago",
  },
]
