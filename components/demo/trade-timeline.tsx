"use client"

import { useEffect, useState } from "react"
import { Clock, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"

export function TradeTimeline() {
  const { demoPositions } = useAppStore()
  const [currentRatios, setCurrentRatios] = useState<Record<string, number>>({})

  // Simulate ratio updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newRatios: Record<string, number> = {}
      demoPositions.forEach((pos) => {
        const change = (Math.random() - 0.5) * 0.02
        const currentRatio = currentRatios[pos.id] || pos.entryRatio
        newRatios[pos.id] = currentRatio * (1 + change)
      })
      setCurrentRatios((prev) => ({ ...prev, ...newRatios }))
    }, 5000)

    return () => clearInterval(interval)
  }, [demoPositions])

  const calculatePnL = (position: { entryRatio: number; stake: number; id: string }) => {
    const currentRatio = currentRatios[position.id] || position.entryRatio
    const pnlPct = (currentRatio / position.entryRatio - 1) * 100
    const pnlCredits = position.stake * (pnlPct / 100)
    return { pnlPct, pnlCredits }
  }

  if (demoPositions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-foreground">
            <Clock className="h-4 w-4" />
            Trade Timeline / Journal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            No positions yet. Complete a trade to see your history.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-foreground">
          <Clock className="h-4 w-4" />
          Trade Timeline / Journal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {demoPositions.map((position) => {
            const { pnlPct, pnlCredits } = calculatePnL(position)
            const isPositive = pnlPct >= 0

            return (
              <div
                key={position.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary text-primary text-xs">
                      LONG
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {position.longAssets.map((a) => a.asset).join(", ")}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <Badge variant="outline" className="border-secondary text-secondary text-xs">
                      SHORT
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {position.shortAssets.map((a) => a.asset).join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Stake: {position.stake} credits</span>
                    <span>Entry: {position.entryRatio.toFixed(4)}</span>
                    <span>{new Date(position.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${isPositive ? "text-success" : "text-danger"}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-bold">
                      {isPositive ? "+" : ""}
                      {pnlPct.toFixed(2)}%
                    </span>
                  </div>
                  <div className={`text-sm ${isPositive ? "text-success" : "text-danger"}`}>
                    {isPositive ? "+" : ""}
                    {pnlCredits.toFixed(2)} credits
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
