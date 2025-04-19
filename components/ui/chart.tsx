"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"
import type * as React from "react"

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "line" | "area" | "bar" | "pie"
  data: any[]
  index: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGridLines?: boolean
}

const CHART_TYPES = {
  line: LineChart,
  area: AreaChart,
  bar: BarChart,
  pie: PieChart,
}

export function Chart({
  className,
  type,
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGridLines = true,
  ...props
}: ChartProps) {
  const ChartType = CHART_TYPES[type as keyof typeof CHART_TYPES] || LineChart

  return (
    <ChartContainer className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartType data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <ChartStyle showGridLines={showGridLines}>
            {showXAxis && <XAxis dataKey={index} tickLine={false} axisLine={false} />}
            {showYAxis && <YAxis tickLine={false} axisLine={false} tickFormatter={valueFormatter} />}
            <ChartTooltip valueFormatter={valueFormatter} />
            {showLegend && <ChartLegend />}
            {type === "pie"
              ? data.map((entry, idx) => <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />)
              : categories.map((category, idx) => {
                  const color = colors[idx % colors.length]
                  switch (type) {
                    case "line":
                      return (
                        <Line
                          key={category}
                          dataKey={category}
                          stroke={color}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5 }}
                        />
                      )
                    case "area":
                      return (
                        <Area
                          key={category}
                          type="monotone"
                          dataKey={category}
                          stroke={color}
                          fill={color}
                          fillOpacity={0.3}
                        />
                      )
                    case "bar":
                      return <Bar key={category} dataKey={category} fill={color} />
                    default:
                      return null
                  }
                })}
          </ChartStyle>
        </ChartType>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function ChartContainer({ className, children }: ChartContainerProps) {
  return (
    <div className={cn("w-full rounded-md border border-border bg-card p-2 text-foreground", className)}>
      {children}
    </div>
  )
}

interface ChartStyleProps {
  children: React.ReactNode
  showGridLines: boolean
}

function ChartStyle({ children, showGridLines }: ChartStyleProps) {
  return (
    <>
      {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
      {children}
    </>
  )
}

interface ChartTooltipProps {
  valueFormatter?: (value: number) => string
}

function ChartTooltip({ valueFormatter }: ChartTooltipProps) {
  return (
    <Tooltip
      content={({ active, payload, label }) => {
        if (!active || !payload) {
          return null
        }
        return (
          <ChartTooltipContent label={label}>
            {payload.map((item, index) => (
              <div key={index} className="flex items-center space-x-1">
                <span style={{ color: item.color, fontSize: "1.2rem" }}>•</span>
                <span className="font-medium">{item.name}:</span>
                <span>{valueFormatter ? valueFormatter(item.value) : item.value}</span>
              </div>
            ))}
          </ChartTooltipContent>
        )
      }}
    />
  )
}

interface ChartTooltipContentProps {
  label: string
  children: React.ReactNode
}

function ChartTooltipContent({ label, children }: ChartTooltipContentProps) {
  return (
    <div className="rounded-md border border-border bg-popover p-4 text-foreground shadow-md">
      <div className="mb-2 text-sm font-bold">{label}</div>
      {children}
    </div>
  )
}

function ChartLegend() {
  return (
    <Legend
      content={({ payload }) => {
        if (!payload) {
          return null
        }
        return (
          <ChartLegendContent>
            {payload.map((item, index) => (
              <div key={index} className="flex items-center space-x-1">
                <span style={{ color: item.color, fontSize: "1.2rem" }}>•</span>
                <span>{item.value}</span>
              </div>
            ))}
          </ChartLegendContent>
        )
      }}
    />
  )
}

function ChartLegendContent({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-center space-x-4">{children}</div>
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle }
