"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Check, X, Satellite, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InteractiveDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [satellitePosition, setSatellitePosition] = useState({ x: 0, y: 0 })
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 })
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResult, setScanResult] = useState<null | { type: string; severity: string; description: string }>(null)
  const [alerts, setAlerts] = useState<
    Array<{ id: number; type: string; severity: string; position: { x: number; y: number } }>
  >([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }

    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    // Initialize satellite position
    setSatellitePosition({
      x: canvas.width * 0.8,
      y: canvas.height * 0.2,
    })

    // Initialize target position
    setTargetPosition({
      x: canvas.width * 0.5,
      y: canvas.height * 0.5,
    })

    // Generate random alerts
    const newAlerts = []
    for (let i = 0; i < 5; i++) {
      newAlerts.push({
        id: i,
        type: Math.random() > 0.5 ? "deforestation" : "mining",
        severity: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
        position: {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
        },
      })
    }
    setAlerts(newAlerts)

    // Draw function
    function draw() {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.strokeStyle = "rgba(34, 197, 94, 0.1)"
      ctx.lineWidth = 1

      // Vertical grid lines
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Horizontal grid lines
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw alerts
      alerts.forEach((alert) => {
        const color = alert.severity === "high" ? "#ef4444" : alert.severity === "medium" ? "#f97316" : "#eab308"

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(alert.position.x, alert.position.y, 5, 0, Math.PI * 2)
        ctx.fill()

        // Draw pulse effect
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(alert.position.x, alert.position.y, 10 + Math.sin(Date.now() / 200) * 5, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Draw target
      ctx.strokeStyle = "rgba(34, 197, 94, 0.8)"
      ctx.lineWidth = 2

      // Target crosshair
      ctx.beginPath()
      ctx.moveTo(targetPosition.x - 15, targetPosition.y)
      ctx.lineTo(targetPosition.x + 15, targetPosition.y)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(targetPosition.x, targetPosition.y - 15)
      ctx.lineTo(targetPosition.x, targetPosition.y + 15)
      ctx.stroke()

      // Target circle
      ctx.beginPath()
      ctx.arc(targetPosition.x, targetPosition.y, 20, 0, Math.PI * 2)
      ctx.stroke()

      // Draw satellite
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.rect(satellitePosition.x - 15, satellitePosition.y - 5, 30, 10)
      ctx.fill()

      // Satellite solar panels
      ctx.fillStyle = "#1d4ed8"
      ctx.beginPath()
      ctx.rect(satellitePosition.x - 25, satellitePosition.y - 2, 8, 4)
      ctx.fill()

      ctx.beginPath()
      ctx.rect(satellitePosition.x + 17, satellitePosition.y - 2, 8, 4)
      ctx.fill()

      // Draw scan beam if scanning
      if (isScanning) {
        ctx.strokeStyle = "rgba(34, 197, 94, 0.5)"
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(satellitePosition.x, satellitePosition.y)
        ctx.lineTo(targetPosition.x, targetPosition.y)
        ctx.stroke()
        ctx.setLineDash([])

        // Draw scan progress circle
        ctx.strokeStyle = "rgba(34, 197, 94, 0.8)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(targetPosition.x, targetPosition.y, 25, 0, Math.PI * 2 * (scanProgress / 100))
        ctx.stroke()
      }

      requestAnimationFrame(draw)
    }

    // Start animation
    draw()

    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [isScanning, scanProgress, satellitePosition, targetPosition, alerts])

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isScanning) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setTargetPosition({ x, y })
  }

  // Handle scan button click
  const handleScan = () => {
    if (isScanning) return

    setIsScanning(true)
    setScanProgress(0)
    setScanResult(null)

    // Animate satellite to target
    const startPosition = { ...satellitePosition }
    const targetX = targetPosition.x - 50
    const targetY = targetPosition.y - 50

    const animateSatellite = () => {
      setSatellitePosition((prev) => {
        const newX = prev.x + (targetX - prev.x) * 0.05
        const newY = prev.y + (targetY - prev.y) * 0.05

        return { x: newX, y: newY }
      })
    }

    const satelliteInterval = setInterval(animateSatellite, 50)

    // Animate scan progress
    const scanInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(scanInterval)
          clearInterval(satelliteInterval)

          // Check if target is near any alert
          const canvas = canvasRef.current
          if (canvas) {
            const nearbyAlert = alerts.find((alert) => {
              const dx = alert.position.x - targetPosition.x
              const dy = alert.position.y - targetPosition.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              return distance < 50
            })

            if (nearbyAlert) {
              setScanResult({
                type: nearbyAlert.type,
                severity: nearbyAlert.severity,
                description:
                  nearbyAlert.type === "deforestation"
                    ? "Forest loss detected in target area"
                    : "Mining activity detected in target area",
              })
            } else {
              setScanResult({
                type: "none",
                severity: "low",
                description: "No environmental threats detected in target area",
              })
            }
          }

          setTimeout(() => {
            setIsScanning(false)
            // Return satellite to original position
            const returnInterval = setInterval(() => {
              setSatellitePosition((prev) => {
                const newX = prev.x + (startPosition.x - prev.x) * 0.05
                const newY = prev.y + (startPosition.y - prev.y) * 0.05

                if (Math.abs(newX - startPosition.x) < 1 && Math.abs(newY - startPosition.y) < 1) {
                  clearInterval(returnInterval)
                  return startPosition
                }

                return { x: newX, y: newY }
              })
            }, 50)
          }, 2000)

          return 100
        }
        return prev + 2
      })
    }, 50)
  }

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" onClick={handleCanvasClick} />

      <div className="absolute top-4 left-4 text-xs text-primary/70 font-mono">INTERACTIVE DEMO</div>
      <div className="absolute top-4 right-4 text-xs text-primary/70 font-mono">CLICK TO TARGET</div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="text-xs text-primary/70 font-mono">
          TARGET: X:{Math.round(targetPosition.x)} Y:{Math.round(targetPosition.y)}
        </div>

        <Button
          onClick={handleScan}
          disabled={isScanning}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isScanning ? (
            <>
              <Satellite className="mr-2 h-4 w-4 animate-pulse" />
              Scanning... {scanProgress}%
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Scan Target Area
            </>
          )}
        </Button>
      </div>

      {scanResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background/90 border border-primary/30 p-4 rounded-md max-w-xs"
        >
          <div className="flex items-center mb-2">
            {scanResult.type === "none" ? (
              <Check className="h-5 w-5 text-primary mr-2" />
            ) : (
              <AlertTriangle
                className={`h-5 w-5 mr-2 ${
                  scanResult.severity === "high"
                    ? "text-destructive"
                    : scanResult.severity === "medium"
                      ? "text-orange-500"
                      : "text-yellow-500"
                }`}
              />
            )}
            <h3 className="font-bold">Scan Complete</h3>
            <button className="ml-auto text-muted-foreground hover:text-foreground" onClick={() => setScanResult(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm mb-2">{scanResult.description}</p>
          {scanResult.type !== "none" && (
            <div className="text-xs text-muted-foreground">
              Severity:{" "}
              <span
                className={`font-medium ${
                  scanResult.severity === "high"
                    ? "text-destructive"
                    : scanResult.severity === "medium"
                      ? "text-orange-500"
                      : "text-yellow-500"
                }`}
              >
                {scanResult.severity.toUpperCase()}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
