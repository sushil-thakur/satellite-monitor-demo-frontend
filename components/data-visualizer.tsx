"use client"

import { useEffect, useRef } from "react"

export default function DataVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    // Data points for visualization
    const dataPoints = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1,
      value: Math.random(),
      speed: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.7 ? "#22c55e" : Math.random() > 0.5 ? "#3b82f6" : "#f97316",
    }))

    // Draw function
    function draw() {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid lines
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

      // Draw data visualization
      dataPoints.forEach((point) => {
        // Update position
        point.y += point.speed
        if (point.y > canvas.height) {
          point.y = 0
          point.x = Math.random() * canvas.width
        }

        // Draw point
        ctx.fillStyle = point.color
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        ctx.fill()

        // Draw connection lines between nearby points
        dataPoints.forEach((otherPoint) => {
          const dx = point.x - otherPoint.x
          const dy = point.y - otherPoint.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 50 && distance > 0) {
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.1 * (1 - distance / 50)})`
            ctx.beginPath()
            ctx.moveTo(point.x, point.y)
            ctx.lineTo(otherPoint.x, otherPoint.y)
            ctx.stroke()
          }
        })
      })

      // Draw data bars on the bottom
      const barWidth = canvas.width / 20
      const barMaxHeight = canvas.height / 4

      for (let i = 0; i < 20; i++) {
        const height = Math.sin(Date.now() / 1000 + i) * 0.5 + 0.5
        const barHeight = height * barMaxHeight

        ctx.fillStyle = height > 0.7 ? "#22c55e" : height > 0.4 ? "#3b82f6" : "#f97316"
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight)
      }

      // Add scanning line effect
      const scanLineY = ((Date.now() % 3000) / 3000) * canvas.height
      ctx.strokeStyle = "rgba(34, 197, 94, 0.5)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, scanLineY)
      ctx.lineTo(canvas.width, scanLineY)
      ctx.stroke()

      // Request next frame
      requestAnimationFrame(draw)
    }

    // Start animation
    draw()

    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
      <div className="absolute top-2 left-2 text-xs text-primary/70 font-mono">DATA VISUALIZATION</div>
      <div className="absolute top-2 right-2 text-xs text-primary/70 font-mono">LIVE FEED</div>
      <div className="absolute bottom-2 left-2 text-xs text-primary/70 font-mono">PROCESSING...</div>
      <div className="absolute bottom-2 right-2 text-xs text-primary/70 font-mono">{new Date().toISOString()}</div>
    </div>
  )
}
