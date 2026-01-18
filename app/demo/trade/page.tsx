"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, RefreshCw, Wallet, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { RatioChart } from "@/components/ratio-chart"
import { ModeToggle } from "@/components/mode-toggle"
import { AssetManager } from "@/components/demo/asset-manager"
import { GuidedTradeBuilder } from "@/components/demo/guided-trade-builder"
import { TradeTimeline } from "@/components/demo/trade-timeline"

export default function DemoTradePage() {
  const router = useRouter()
  const { demoWallet, initDemoWallet, resetDemoWallet, setMode } = useAppStore()

  const [showSidebar, setShowSidebar] = useState(true)

  useEffect(() => {
    initDemoWallet()
    setMode("demo")
  }, [initDemoWallet, setMode])

  if (!demoWallet) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-muted-foreground">Loading demo wallet...</div>
      </div>
    )
  }

  const isLowCredits = demoWallet.demoCredits < 20
  const isNoCredits = demoWallet.demoCredits === 0

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      {/* Demo mode banner */}
      <div className="border-b border-primary/30 bg-primary/10 px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary text-primary">
              DEMO MODE
            </Badge>
            <span className="text-sm text-muted-foreground">Fake Credits • Not Real Trades</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Wallet: </span>
              <span className="font-mono text-foreground">{demoWallet.demoAddress}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Credits: </span>
              <span className={`font-bold ${isLowCredits ? "text-warning" : "text-primary"}`}>
                {demoWallet.demoCredits}/{demoWallet.maxDemoCredits}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetDemoWallet}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Low credits warning */}
      {isLowCredits && !isNoCredits && (
        <div className="border-b border-warning/30 bg-warning/10 px-4 py-2">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Low credits remaining!</span>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Go Pro (Connect Wallet)
            </Button>
          </div>
        </div>
      )}

      {/* No credits modal */}
      {isNoCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-foreground">Demo Credits Exhausted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">{"You've used all 100 demo credits. Ready to trade for real?"}</p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => router.push("/")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Go Pro (Connect Wallet)
                </Button>
                <Button variant="outline" onClick={resetDemoWallet}>
                  Reset Demo Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Asset Manager */}
        {showSidebar && (
          <div className="w-72 shrink-0 border-r border-border bg-card p-4 overflow-y-auto">
            <AssetManager />
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
              {showSidebar ? "Hide" : "Show"} Asset Manager
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              Chart shows ratio of LONG/SHORT baskets
            </div>
          </div>
          <div className="flex-1">
            <RatioChart />
          </div>

          {/* Trade Timeline */}
          <div className="mt-4">
            <TradeTimeline />
          </div>
        </div>

        {/* Right sidebar - Guided Trade Builder */}
        <div className="w-80 shrink-0 border-l border-border bg-card p-4 overflow-y-auto">
          <GuidedTradeBuilder />
        </div>
      </div>

      <ModeToggle />
    </div>
  )
}
