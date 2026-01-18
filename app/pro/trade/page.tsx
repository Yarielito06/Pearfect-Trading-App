"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, Info, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppStore } from "@/lib/store"
import { RatioChart } from "@/components/ratio-chart"
import { ModeToggle } from "@/components/mode-toggle"
import { WeightBuilder } from "@/components/pro/weight-builder"
import { ThesisBuilder } from "@/components/pro/thesis-builder"
import { TradeSlip } from "@/components/pro/trade-slip"
import { OpenPositions } from "@/components/pro/open-positions"

export default function ProTradePage() {
  const router = useRouter()
  const { wallet, setMode } = useAppStore()
  const [showSidebar, setShowSidebar] = useState(true)
  const [thesis, setThesis] = useState({
    a: "HYPE",
    b: "ETH",
    horizon: "1W",
    conviction: "Medium",
    type: "Relative performance",
  })

  useEffect(() => {
    setMode("pro")
  }, [setMode])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      {/* Pro mode banner */}
      <div className="border-b border-secondary/30 bg-secondary/10 px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-secondary text-secondary">
              PRO MODE
            </Badge>
            <span className="text-sm text-muted-foreground">Real Trades • Thesis-Driven</span>
          </div>
          {wallet.connected && wallet.address && (
            <div className="text-sm">
              <span className="text-muted-foreground">Wallet: </span>
              <span className="font-mono text-foreground">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Not connected warning */}
      {!wallet.connected && (
        <div className="border-b border-warning/30 bg-warning/10 px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">Connect your wallet to execute trades</span>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Weight Builder */}
        {showSidebar && (
          <div className="w-72 shrink-0 border-r border-border bg-card p-4 overflow-y-auto">
            <WeightBuilder thesis={thesis} />
          </div>
        )}

        {/* Center - Chart */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-muted-foreground"
            >
              {showSidebar ? "Hide" : "Show"} Weight Builder
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              Chart syncs with your thesis
            </div>
          </div>
          <div className="flex-1">
            <RatioChart />
          </div>

          {/* Open Positions */}
          <div className="mt-4">
            <OpenPositions />
          </div>
        </div>

        {/* Right sidebar - Thesis Builder + Trade Slip */}
        <div className="w-96 shrink-0 border-l border-border bg-card p-4 overflow-y-auto space-y-4">
          <ThesisBuilder thesis={thesis} setThesis={setThesis} />
          <TradeSlip thesis={thesis} />

          {/* Helper for new users */}
          <Alert className="border-primary/30 bg-primary/5">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <span className="font-medium text-foreground">Not sure where to start?</span>
              <Link href="/demo/trade" className="mt-1 block text-primary hover:underline">
                Try Demo Mode with fake credits
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <ModeToggle />
    </div>
  )
}
