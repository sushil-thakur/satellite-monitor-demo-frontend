"use client"

import React from "react"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Zap, Shield, Satellite, BarChart2, Scan, AlertTriangle, Radar, Globe, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import EarthGlobe from "@/components/earth-globe"
import ParticleBackground from "@/components/particle-background"
import DataVisualizer from "@/components/data-visualizer"
import InteractiveDemo from "@/components/interactive-demo"

export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [showScanner, setShowScanner] = useState(true)
  const [activeTab, setActiveTab] = useState("globe")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setLoaded(true)

    // Auto-rotate through features
    intervalRef.current = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-950 via-indigo-950 to-background">
        <div className="absolute inset-0 opacity-30">
          <ParticleBackground />
        </div>
      </div>

      {/* Cyberpunk grid background */}
      <div className="absolute inset-0 cyber-grid opacity-20 z-0"></div>

      <Navbar />

      <div className="relative flex-1 flex flex-col items-center justify-center z-10">
        {/* Scanning effect */}
        {showScanner && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="scanner-line"></div>
            <div className="absolute top-0 left-0 w-full h-full border-2 border-primary/30"></div>
            <div className="absolute top-4 left-4 text-xs text-primary/70 font-mono">SCANNING...</div>
            <div className="absolute top-4 right-4 text-xs text-primary/70 font-mono">
              {new Date().toISOString().split("T")[0]}
            </div>
            <div className="absolute bottom-4 left-4 text-xs text-primary/70 font-mono">
              LAT: 37.7749° N, LONG: 122.4194° W
            </div>
            <div className="absolute bottom-4 right-4 text-xs text-primary/70 font-mono">
              <button onClick={() => setShowScanner(false)} className="hover:text-primary">
                [CLOSE]
              </button>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-1/2 text-left lg:pr-8 mb-12 lg:mb-0"
          >
            <div className="inline-block px-3 py-1 mb-6 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/20 text-primary">
              <span className="flex items-center text-sm">
                <Zap className="mr-2 h-3.5 w-3.5" />
                Next-Gen Satellite Monitoring
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-400 to-secondary">
                Monitor the Earth.
              </span>
              <br />
              <span className="neon-text">Predict the Future.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              Advanced satellite-based monitoring system with AI-powered analytics for environmental tracking and real
              estate prediction.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="glow-button group bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground hover:from-primary/90 hover:to-cyan-500/90 text-lg px-8 py-6 w-full sm:w-auto"
                >
                  Start Monitoring{" "}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link href="/deforestation">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/50 text-foreground hover:bg-primary/10 text-lg px-8 py-6 w-full sm:w-auto"
                >
                  Explore Features
                </Button>
              </Link>
            </div>

            {/* Feature highlights */}
            <div className="mt-12">
              <div className="flex space-x-2 mb-4">
                {features.map((_, index) => (
                  <button
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeFeature ? "bg-primary w-8" : "bg-muted w-4"
                    }`}
                    onClick={() => setActiveFeature(index)}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-6"
                >
                  <div className="flex items-start">
                    <div className="mr-4 p-3 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
                      {React.createElement(features[activeFeature].icon, { className: "h-6 w-6" })}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{features[activeFeature].title}</h3>
                      <p className="text-muted-foreground">{features[activeFeature].description}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right content - Interactive visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 0.9 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full lg:w-1/2 flex flex-col items-center"
          >
            {/* Tabs for different visualizations */}
            <div className="flex space-x-2 mb-4 bg-card/30 backdrop-blur-sm rounded-full p-1 border border-border/50">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === "globe"
                    ? "bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("globe")}
              >
                <Globe className="h-4 w-4 inline mr-1" /> 3D Globe
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === "data"
                    ? "bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("data")}
              >
                <BarChart2 className="h-4 w-4 inline mr-1" /> Data Viz
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === "demo"
                    ? "bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("demo")}
              >
                <Scan className="h-4 w-4 inline mr-1" /> Interactive
              </button>
            </div>

            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-card/10 backdrop-blur-sm rounded-lg border border-border/50 overflow-hidden shadow-2xl shadow-primary/20">
              {activeTab === "globe" && (
                <div className="absolute inset-0">
                  <EarthGlobe />
                </div>
              )}

              {activeTab === "data" && (
                <div className="absolute inset-0">
                  <DataVisualizer />
                </div>
              )}

              {activeTab === "demo" && (
                <div className="absolute inset-0">
                  <InteractiveDemo />
                </div>
              )}

              {/* Targeting elements */}
              <div className="absolute top-1/4 left-1/4 w-16 h-16 pointer-events-none">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
              </div>

              <div className="absolute bottom-1/4 right-1/3 w-16 h-16 pointer-events-none">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-secondary"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-secondary"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-secondary"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-secondary"></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Global monitoring points */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full mt-12 py-12 bg-gradient-to-r from-background via-primary/5 to-background"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center neon-text">Global Monitoring Network</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {monitoringPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-center mb-2">
                    <div className="relative">
                      <MapPin className={`h-6 w-6 text-${point.color}`} />
                      <div
                        className={`absolute -inset-1 bg-${point.color}/30 rounded-full animate-ping opacity-75 group-hover:opacity-100`}
                      ></div>
                    </div>
                  </div>
                  <h3 className="font-medium mb-1">{point.location}</h3>
                  <p className="text-xs text-muted-foreground">{point.status}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Data visualization section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 30 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="w-full py-12 bg-gradient-to-r from-background via-primary/5 to-background"
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="w-full lg:w-1/2">
                <h2 className="text-3xl font-bold mb-4 neon-text-blue">Real-time Data Visualization</h2>
                <p className="text-muted-foreground mb-6">
                  Our advanced AI algorithms process terabytes of satellite data daily to provide actionable insights
                  and predictive analytics.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {dataPoints.map((point, index) => (
                    <div
                      key={index}
                      className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center mb-2">
                        {React.createElement(point.icon, { className: "h-5 w-5 text-primary mr-2" })}
                        <h3 className="font-medium">{point.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{point.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-1/2 h-[300px] bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden shadow-lg shadow-primary/10">
                <DataVisualizer />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 30 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="w-full py-12 bg-gradient-to-r from-background via-primary/5 to-background"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2 neon-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

const features = [
  {
    title: "Real-Time Monitoring",
    description:
      "Track environmental changes as they happen with our advanced satellite imagery and AI detection systems.",
    icon: Satellite,
  },
  {
    title: "Predictive Analytics",
    description:
      "Leverage AI to predict property value growth and identify high-potential investment zones before the market.",
    icon: BarChart2,
  },
  {
    title: "Environmental Protection",
    description:
      "Detect illegal activities like deforestation and mining to protect our planet's most valuable resources.",
    icon: Shield,
  },
  {
    title: "Instant Alerts",
    description: "Receive real-time notifications about environmental changes and market opportunities as they emerge.",
    icon: Zap,
  },
]

const stats = [
  { value: "98.7%", label: "Detection Accuracy" },
  { value: "15TB+", label: "Satellite Data Processed Daily" },
  { value: "142", label: "Countries Covered" },
  { value: "28.4M", label: "Hectares Monitored" },
]

const dataPoints = [
  {
    title: "Threat Detection",
    description: "Identify environmental threats before they cause irreversible damage.",
    icon: AlertTriangle,
  },
  {
    title: "Area Scanning",
    description: "Comprehensive scanning of target areas with multi-spectral analysis.",
    icon: Scan,
  },
  {
    title: "Radar Mapping",
    description: "Advanced radar technology for mapping through cloud cover and darkness.",
    icon: Radar,
  },
  {
    title: "Predictive Models",
    description: "AI-powered models to forecast environmental changes and market trends.",
    icon: BarChart2,
  },
]

const monitoringPoints = [
  { location: "Amazon Basin", status: "Active Monitoring", color: "primary" },
  { location: "Arctic Circle", status: "Ice Melt Analysis", color: "secondary" },
  { location: "Sahara Desert", status: "Desertification Tracking", color: "warning" },
  { location: "Great Barrier Reef", status: "Coral Health Monitoring", color: "destructive" },
  { location: "Siberian Forests", status: "Fire Risk Assessment", color: "destructive" },
  { location: "Himalayan Glaciers", status: "Melt Rate Tracking", color: "secondary" },
  { location: "Congo Basin", status: "Deforestation Alert", color: "primary" },
  { location: "California Coast", status: "Urban Development", color: "warning" },
]
