"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { Layers, AlertTriangle, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "@/components/navbar"

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-5rem)] flex items-center justify-center bg-muted">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading satellite data...</p>
      </div>
    </div>
  ),
})

export default function DeforestationPage() {
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("forest-loss");
  const [showHotspots, setShowHotspots] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<null | {
    id: number;
    name: string;
    coordinates: [number, number];
    severity: "high" | "medium" | "low";
    type: string;
    date: string;
    area: string;
  }>(null);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const mapOptions = {
    center: [0, 0],
    zoom: 3,
    layers: activeTab === "forest-loss" ? "deforestation" : "mining",
    showHotspots,
    showOverlay,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: loaded ? 1 : 0, x: loaded ? 0 : -20 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-80 bg-card border-r border-border p-4 space-y-4"
        >
          <div>
            <h1 className="text-2xl font-bold font-heading">
              Environmental Monitoring
            </h1>
            <p className="text-sm text-muted-foreground">
              Track deforestation and illegal mining activities
            </p>
          </div>

          <Tabs
            defaultValue="forest-loss"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="forest-loss">Forest Loss</TabsTrigger>
              <TabsTrigger value="mining-zones">Mining Zones</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="h-4 w-4 text-primary" />
                <Label htmlFor="show-overlay">Show Data Overlay</Label>
              </div>
              <Switch
                id="show-overlay"
                checked={showOverlay}
                onCheckedChange={setShowOverlay}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <Label htmlFor="show-hotspots">Show Hotspots</Label>
              </div>
              <Switch
                id="show-hotspots"
                checked={showHotspots}
                onCheckedChange={setShowHotspots}
              />
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-medium mb-2">Legend</h3>
            <div className="space-y-2">
              {activeTab === "forest-loss" ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-red-500/70"></div>
                    <span className="text-sm">Severe Loss ({'>'}75%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500/70"></div>
                    <span className="text-sm">Moderate Loss (25-75%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500/70"></div>
                    <span className="text-sm">Minor Loss ({'<'}25%)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-red-500/70"></div>
                    <span className="text-sm">Illegal Mining</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500/70"></div>
                    <span className="text-sm">Legal Mining</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500/70"></div>
                    <span className="text-sm">Suspected Activity</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {selectedHotspot && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">
                    {selectedHotspot.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedHotspot(null)}
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{selectedHotspot.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Severity:</span>
                  <span
                    className={
                      selectedHotspot.severity === "high"
                        ? "text-destructive"
                        : selectedHotspot.severity === "medium"
                        ? "text-orange-500"
                        : "text-yellow-500"
                    }
                  >
                    {selectedHotspot.severity.charAt(0).toUpperCase() +
                      selectedHotspot.severity.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Detected:</span>
                  <span>{selectedHotspot.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Area:</span>
                  <span>{selectedHotspot.area}</span>
                </div>
                <Button
                  className="w-full mt-2"
                  variant="outline"
                  size="sm"
                >
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1"
        >
          <MapComponent 
            options={mapOptions} 
            onHotspotSelect={setSelectedHotspot}
          />
        </motion.div>
      </div>
    </div>
  );
}
