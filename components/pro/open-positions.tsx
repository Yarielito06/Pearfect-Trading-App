"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Copy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"

interface Position {
  id: string
  thesis: string
  longAsset: string
  shortAsset: string
  stake: number
  pnl: number
  pnlPct: number
  status: "open" | "closed"
  timestamp: number
}

export function OpenPositions() {
  const { wallet } = useAppStore()
  const [positions, setPositions] = useState<Position[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Simulate positions
  useEffect(() => {
    if (wallet.connected) {
      // Demo positions
      setPositions([
        {
          id: "pos_1",
          thesis: "AI beats ETH",
          longAsset: "HYPE",
          shortAsset: "ETH",
          stake: 50,
          pnl: 3.42,
          pnlPct: 6.84,
          status: "open",
          timestamp: Date.now() - 3600000,
        },
      ])
    }
  }, [wallet.connected])

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!wallet.connected) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground">Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">Connect wallet to view positions</p>
        </CardContent>
      </Card>
    )
  }

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground">Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            No open positions. Execute a trade to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-foreground">Open Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {positions.map((position) => {
            const isPositive = position.pnl >= 0

            return (
              <div
                key={position.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{position.thesis}</span>
                    <Badge variant="outline" className="text-xs">
                      {position.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      <Badge variant="outline" className="mr-1 border-primary text-primary text-xs">
                        L
                      </Badge>
                      {position.longAsset}
                    </span>
                    <span>
                      <Badge variant="outline" className="mr-1 border-secondary text-secondary text-xs">
                        S
                      </Badge>
                      {position.shortAsset}
                    </span>
                    <span>Stake: ${position.stake}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{position.id}</span>
                    <button onClick={() => copyId(position.id)} className="text-muted-foreground hover:text-foreground">
                      {copiedId === position.id ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${isPositive ? "text-success" : "text-danger"}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-bold">
                      {isPositive ? "+" : ""}
                      {position.pnlPct.toFixed(2)}%
                    </span>
                  </div>
                  <div className={`text-sm ${isPositive ? "text-success" : "text-danger"}`}>
                    {isPositive ? "+" : ""}${position.pnl.toFixed(2)}
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
