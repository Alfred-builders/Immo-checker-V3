"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "src/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "src/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "src/components/ui/toggle-group"

export const description = "Activité des missions"

const chartData = [
  { date: "2024-04-01", entrees: 222, sorties: 150 },
  { date: "2024-04-02", entrees: 97, sorties: 180 },
  { date: "2024-04-03", entrees: 167, sorties: 120 },
  { date: "2024-04-04", entrees: 242, sorties: 260 },
  { date: "2024-04-05", entrees: 373, sorties: 290 },
  { date: "2024-04-06", entrees: 301, sorties: 340 },
  { date: "2024-04-07", entrees: 245, sorties: 180 },
  { date: "2024-04-08", entrees: 409, sorties: 320 },
  { date: "2024-04-09", entrees: 59, sorties: 110 },
  { date: "2024-04-10", entrees: 261, sorties: 190 },
  { date: "2024-04-11", entrees: 327, sorties: 350 },
  { date: "2024-04-12", entrees: 292, sorties: 210 },
  { date: "2024-04-13", entrees: 342, sorties: 380 },
  { date: "2024-04-14", entrees: 137, sorties: 220 },
  { date: "2024-04-15", entrees: 120, sorties: 170 },
  { date: "2024-04-16", entrees: 138, sorties: 190 },
  { date: "2024-04-17", entrees: 446, sorties: 360 },
  { date: "2024-04-18", entrees: 364, sorties: 410 },
  { date: "2024-04-19", entrees: 243, sorties: 180 },
  { date: "2024-04-20", entrees: 89, sorties: 150 },
  { date: "2024-04-21", entrees: 137, sorties: 200 },
  { date: "2024-04-22", entrees: 224, sorties: 170 },
  { date: "2024-04-23", entrees: 138, sorties: 230 },
  { date: "2024-04-24", entrees: 387, sorties: 290 },
  { date: "2024-04-25", entrees: 215, sorties: 250 },
  { date: "2024-04-26", entrees: 75, sorties: 130 },
  { date: "2024-04-27", entrees: 383, sorties: 420 },
  { date: "2024-04-28", entrees: 122, sorties: 180 },
  { date: "2024-04-29", entrees: 315, sorties: 240 },
  { date: "2024-04-30", entrees: 454, sorties: 380 },
  { date: "2024-05-01", entrees: 165, sorties: 220 },
  { date: "2024-05-02", entrees: 293, sorties: 310 },
  { date: "2024-05-03", entrees: 247, sorties: 190 },
  { date: "2024-05-04", entrees: 385, sorties: 420 },
  { date: "2024-05-05", entrees: 481, sorties: 390 },
  { date: "2024-05-06", entrees: 498, sorties: 520 },
  { date: "2024-05-07", entrees: 388, sorties: 300 },
  { date: "2024-05-08", entrees: 149, sorties: 210 },
  { date: "2024-05-09", entrees: 227, sorties: 180 },
  { date: "2024-05-10", entrees: 293, sorties: 330 },
  { date: "2024-05-11", entrees: 335, sorties: 270 },
  { date: "2024-05-12", entrees: 197, sorties: 240 },
  { date: "2024-05-13", entrees: 197, sorties: 160 },
  { date: "2024-05-14", entrees: 448, sorties: 490 },
  { date: "2024-05-15", entrees: 473, sorties: 380 },
  { date: "2024-05-16", entrees: 338, sorties: 400 },
  { date: "2024-05-17", entrees: 499, sorties: 420 },
  { date: "2024-05-18", entrees: 315, sorties: 350 },
  { date: "2024-05-19", entrees: 235, sorties: 180 },
  { date: "2024-05-20", entrees: 177, sorties: 230 },
  { date: "2024-05-21", entrees: 82, sorties: 140 },
  { date: "2024-05-22", entrees: 81, sorties: 120 },
  { date: "2024-05-23", entrees: 252, sorties: 290 },
  { date: "2024-05-24", entrees: 294, sorties: 220 },
  { date: "2024-05-25", entrees: 201, sorties: 250 },
  { date: "2024-05-26", entrees: 213, sorties: 170 },
  { date: "2024-05-27", entrees: 420, sorties: 460 },
  { date: "2024-05-28", entrees: 233, sorties: 190 },
  { date: "2024-05-29", entrees: 78, sorties: 130 },
  { date: "2024-05-30", entrees: 340, sorties: 280 },
  { date: "2024-05-31", entrees: 178, sorties: 230 },
  { date: "2024-06-01", entrees: 178, sorties: 200 },
  { date: "2024-06-02", entrees: 470, sorties: 410 },
  { date: "2024-06-03", entrees: 103, sorties: 160 },
  { date: "2024-06-04", entrees: 439, sorties: 380 },
  { date: "2024-06-05", entrees: 88, sorties: 140 },
  { date: "2024-06-06", entrees: 294, sorties: 250 },
  { date: "2024-06-07", entrees: 323, sorties: 370 },
  { date: "2024-06-08", entrees: 385, sorties: 320 },
  { date: "2024-06-09", entrees: 438, sorties: 480 },
  { date: "2024-06-10", entrees: 155, sorties: 200 },
  { date: "2024-06-11", entrees: 92, sorties: 150 },
  { date: "2024-06-12", entrees: 492, sorties: 420 },
  { date: "2024-06-13", entrees: 81, sorties: 130 },
  { date: "2024-06-14", entrees: 426, sorties: 380 },
  { date: "2024-06-15", entrees: 307, sorties: 350 },
  { date: "2024-06-16", entrees: 371, sorties: 310 },
  { date: "2024-06-17", entrees: 475, sorties: 520 },
  { date: "2024-06-18", entrees: 107, sorties: 170 },
  { date: "2024-06-19", entrees: 341, sorties: 290 },
  { date: "2024-06-20", entrees: 408, sorties: 450 },
  { date: "2024-06-21", entrees: 169, sorties: 210 },
  { date: "2024-06-22", entrees: 317, sorties: 270 },
  { date: "2024-06-23", entrees: 480, sorties: 530 },
  { date: "2024-06-24", entrees: 132, sorties: 180 },
  { date: "2024-06-25", entrees: 141, sorties: 190 },
  { date: "2024-06-26", entrees: 434, sorties: 380 },
  { date: "2024-06-27", entrees: 448, sorties: 490 },
  { date: "2024-06-28", entrees: 149, sorties: 200 },
  { date: "2024-06-29", entrees: 103, sorties: 160 },
  { date: "2024-06-30", entrees: 446, sorties: 400 },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  entrees: {
    label: "Entrées",
    color: "var(--primary)",
  },
  sorties: {
    label: "Sorties",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Activité missions</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-entrees)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-entrees)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-sorties)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-sorties)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="sorties"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-sorties)"
              stackId="a"
            />
            <Area
              dataKey="entrees"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-entrees)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
