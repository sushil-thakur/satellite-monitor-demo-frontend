"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, Download, Calendar, MapPin, Filter, Printer, Share2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import Navbar from "@/components/navbar"

export default function ReportsPage() {
  const [loaded, setLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [generatingReport, setGeneratingReport] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const handleGenerateReport = () => {
    setGeneratingReport(true)
    setGenerationProgress(0)

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setGeneratingReport(false)
          }, 500)
          return 100
        }
        return prev + 5
      })
    }, 150)
  }

  const filteredReports = mockReports.filter((report) => {
    if (activeTab !== "all" && report.type !== activeTab) return false
    if (regionFilter !== "all" && report.region !== regionFilter) return false
    return true
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading">Intelligence Reports</h1>
            <p className="text-muted-foreground">Generate and download detailed environmental analysis reports</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleGenerateReport} disabled={generatingReport}>
              <FileText className="h-4 w-4 mr-2" />
              New Report
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {generatingReport ? (
                <>
                  <div className="mr-2 relative h-4 w-4">
                    <svg className="progress-ring" width="16" height="16" viewBox="0 0 16 16">
                      <circle
                        className="progress-ring__circle"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        r="6"
                        cx="8"
                        cy="8"
                        style={{
                          strokeDasharray: `${2 * Math.PI * 6}`,
                          strokeDashoffset: `${2 * Math.PI * 6 * (1 - generationProgress / 100)}`,
                        }}
                      />
                    </svg>
                  </div>
                  Generating...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" />
                  Generate Intelligence Report
                </>
              )}
            </Button>
          </div>
        </div>

        {generatingReport && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <Card className="border border-primary/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-primary">Generating Intelligence Report...</p>
                  <span className="text-sm text-primary">{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Analyzing satellite data and compiling environmental insights
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="mb-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all">All Reports</TabsTrigger>
                <TabsTrigger value="environmental">Environmental</TabsTrigger>
                <TabsTrigger value="real-estate">Real Estate</TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="southeast-asia">Southeast Asia</SelectItem>
                    <SelectItem value="africa">Africa</SelectItem>
                    <SelectItem value="north-america">North America</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
              transition={{ duration: 0.5, delay: loaded ? 0.1 * index : 0 }}
            >
              <Card className="border border-border hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <div
                      className={`px-2 py-1 rounded-full text-xs ${
                        report.type === "environmental"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-blue-500/20 text-blue-500"
                      }`}
                    >
                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-2" />
                      Generated: {report.date}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-2" />
                      Region: {report.region}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border pt-4 flex justify-between">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}

interface Report {
  id: string
  title: string
  description: string
  type: "environmental" | "real-estate"
  region: string
  date: string
}

const mockReports: Report[] = [
  {
    id: "report-1",
    title: "Amazon Deforestation Analysis",
    description:
      "Comprehensive analysis of deforestation patterns and illegal logging activities in the Amazon rainforest.",
    type: "environmental",
    region: "amazon",
    date: "April 10, 2025",
  },
  {
    id: "report-2",
    title: "Southeast Asia Mining Impact",
    description:
      "Assessment of environmental impact from mining operations across Southeast Asia with focus on water pollution.",
    type: "environmental",
    region: "southeast-asia",
    date: "April 5, 2025",
  },
  {
    id: "report-3",
    title: "San Francisco Real Estate Forecast",
    description: "Predictive analysis of property value trends in the San Francisco Bay Area for the next 5 years.",
    type: "real-estate",
    region: "north-america",
    date: "April 3, 2025",
  },
  {
    id: "report-4",
    title: "Congo Basin Conservation Status",
    description: "Status report on conservation efforts and threats to biodiversity in the Congo Basin region.",
    type: "environmental",
    region: "africa",
    date: "March 28, 2025",
  },
  {
    id: "report-5",
    title: "Austin Real Estate Growth Zones",
    description:
      "Identification of high-potential growth areas in Austin metropolitan area based on infrastructure development.",
    type: "real-estate",
    region: "north-america",
    date: "March 25, 2025",
  },
  {
    id: "report-6",
    title: "Borneo Orangutan Habitat Analysis",
    description: "Assessment of remaining orangutan habitat in Borneo and threats from palm oil plantation expansion.",
    type: "environmental",
    region: "southeast-asia",
    date: "March 20, 2025",
  },
]
