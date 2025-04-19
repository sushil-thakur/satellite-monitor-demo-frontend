"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, Layers, BarChart2, AlertTriangle, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Link from "next/link"

export default function Dashboard() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
      },
    }),
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading">Mission Control</h1>
          <p className="text-muted-foreground">
            Monitor environmental changes and real estate opportunities from space
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              animate={loaded ? "visible" : "hidden"}
              variants={cardVariants}
            >
              <Link href={card.href}>
                <Card className="h-full border border-border hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      <card.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 flex items-center justify-center bg-muted/30 rounded-md overflow-hidden">
                      <card.preview className="w-full h-full object-cover" />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      {card.action}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold font-heading mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={loaded ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="border border-border bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full mr-4 ${activityTypeStyles[activity.type]}`}>
                        {activityIcons[activity.type]}
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

const DashboardPreview = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center text-primary", className)}>
    <Globe className="h-16 w-16 opacity-70" />
  </div>
)

const DeforestationPreview = ({ className }: { className?: string }) => (
  <div className={cn("bg-destructive/20 flex items-center justify-center", className)}>
    <div className="relative">
      <div
        className="absolute inset-0 bg-destructive/30 rounded-full animate-ping"
        style={{ animationDuration: "3s" }}
      ></div>
      <MapPin className="h-12 w-12 text-destructive" />
    </div>
  </div>
)

const RealEstatePreview = ({ className }: { className?: string }) => (
  <div className={cn("bg-secondary/10 flex items-center justify-center", className)}>
    <BarChart2 className="h-16 w-16 text-secondary opacity-70" />
  </div>
)

const AlertsPreview = ({ className }: { className?: string }) => (
  <div className={cn("bg-warning/10 flex items-center justify-center", className)}>
    <AlertTriangle className="h-16 w-16 text-warning opacity-70" />
  </div>
)

const dashboardCards = [
  {
    title: "Global Overview",
    description: "Monitor global environmental changes",
    action: "View Map",
    icon: Globe,
    preview: DashboardPreview,
    href: "/dashboard",
  },
  {
    title: "Deforestation Tracking",
    description: "Detect forest loss and illegal activities",
    action: "Analyze Forests",
    icon: Layers,
    preview: DeforestationPreview,
    href: "/deforestation",
  },
  {
    title: "Real Estate Prediction",
    description: "Identify high-value growth areas",
    action: "View Predictions",
    icon: BarChart2,
    preview: RealEstatePreview,
    href: "/real-estate",
  },
  {
    title: "Alert System",
    description: "Real-time notifications and warnings",
    action: "Check Alerts",
    icon: AlertTriangle,
    preview: AlertsPreview,
    href: "/alerts",
  },
]

const activityTypeStyles = {
  alert: "bg-destructive/20 text-destructive",
  prediction: "bg-secondary/20 text-secondary",
  report: "bg-primary/20 text-primary",
}

const activityIcons = {
  alert: <AlertTriangle className="h-5 w-5" />,
  prediction: <BarChart2 className="h-5 w-5" />,
  report: <FileText className="h-5 w-5" />,
}

const recentActivity = [
  {
    type: "alert",
    title: "Illegal Mining Detected",
    description: "Suspicious activity detected in Amazon rainforest region.",
    time: "2 hours ago",
  },
  {
    type: "prediction",
    title: "Property Value Increase",
    description: "28% growth predicted in Austin, TX suburban areas.",
    time: "5 hours ago",
  },
  {
    type: "report",
    title: "Monthly Analysis Generated",
    description: "April 2025 environmental impact report is now available.",
    time: "Yesterday",
  },
  {
    type: "alert",
    title: "Deforestation Alert",
    description: "Rapid forest loss detected in Borneo, Indonesia.",
    time: "2 days ago",
  },
]

import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"
