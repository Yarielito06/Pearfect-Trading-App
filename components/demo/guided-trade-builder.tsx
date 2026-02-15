"use client"

import { useState } from "react"
import { ChevronRight, Check, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"

const STAKE_PRESETS = [10, 25, 50, 100]

type Step = "stake" | "review" | "confirm" | "done"

export function GuidedTradeBuilder() {
  const {
    demoWallet,
    deductDemoCredits,
    addDemoTransaction,
    addDemoPosition,
    addXP,
    triggerCoinShower,
    demoLongAssets,
    demoShortAssets,
  } = useAppStore()

  const [step, setStep] = useState<Step>("stake")
  const [stake, setStake] = useState<number>(25)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const canAfford = demoWallet && stake <= demoWallet.demoCredits

  const longTotal = demoLongAssets.reduce((sum, a) => sum + a.weight, 0)
  const shortTotal = demoShortAssets.reduce((sum, a) => sum + a.weight, 0)
  const basketsValid =
    demoLongAssets.length > 0 &&
    demoShortAssets.length > 0 &&
    longTotal === 100 &&
    shortTotal === 100

  const basketLabel = `${demoLongAssets.map((a) => a.symbol).join("+")} vs ${demoShortAssets.map((a) => a.symbol).join("+")}`

  const handleConfirmTrade = () => {
    if (!demoWallet) return

    deductDemoCredits(stake)

    addDemoTransaction({
      type: "trade",
      amount: stake,
      description: `Demo trade: ${basketLabel}`,
    })

    addDemoPosition({
      longAssets: demoLongAssets.map((a) => ({ asset: a.symbol, weight: a.weight })),
      shortAssets: demoShortAssets.map((a) => ({ asset: a.symbol, weight: a.weight })),
      stake,
      entryRatio: 1.5 + Math.random() * 0.5,
      matchup: basketLabel,
    })

    addXP(10)
    triggerCoinShower()

    setShowConfirmModal(false)
    setStep("done")
  }

  const resetBuilder = () => {
    setStep("stake")
    setStake(25)
  }

  const getStepNumber = (s: Step): number => {
    const steps: Step[] = ["stake", "review", "confirm", "done"]
    return steps.indexOf(s) + 1
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Guided Trade Builder</h2>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {["stake", "review", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                getStepNumber(step) > i + 1
                  ? "bg-primary text-primary-foreground"
                  : getStepNumber(step) === i + 1
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {getStepNumber(step) > i + 1 ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Basket summary (always visible during stake/review) */}
      {step !== "done" && (
        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Current Baskets (from Asset Manager)</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary text-primary text-[10px]">
                LONG
              </Badge>
              <span className="text-xs text-foreground">
                {demoLongAssets.map((a) => `${a.symbol} ${a.weight}%`).join(", ")}
              </span>
              {longTotal !== 100 && (
                <span className="text-[10px] text-orange-400">({longTotal}%)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-secondary text-secondary text-[10px]">
                SHORT
              </Badge>
              <span className="text-xs text-foreground">
                {demoShortAssets.map((a) => `${a.symbol} ${a.weight}%`).join(", ")}
              </span>
              {shortTotal !== 100 && (
                <span className="text-[10px] text-orange-400">({shortTotal}%)</span>
              )}
            </div>
          </div>
          {!basketsValid && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-orange-400">
              <AlertCircle className="h-3 w-3" />
              <span>Both baskets need at least 1 asset and weights must total 100%</span>
            </div>
          )}
        </div>
      )}

      {/* Step: Stake */}
      {step === "stake" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">1. Choose Stake</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">How many credits do you want to stake?</p>
            <div className="grid grid-cols-4 gap-2">
              {STAKE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setStake(preset)}
                  disabled={demoWallet != null && preset > demoWallet.demoCredits}
                  className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                    stake === preset
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:bg-muted disabled:opacity-50"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground">{stake}</span>
              <span className="text-muted-foreground"> credits</span>
            </div>
            {!canAfford && <p className="text-center text-xs text-destructive">Insufficient credits</p>}
            <Button
              onClick={() => setStep("review")}
              disabled={!canAfford || !basketsValid}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Review */}
      {step === "review" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">2. Review Risk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-3 text-sm text-foreground">
              <p>
                {"You're betting that "}
                <span className="font-semibold text-primary">
                  {demoLongAssets.map((a) => a.symbol).join(" + ")}
                </span>
                {" will outperform "}
                <span className="font-semibold text-secondary">
                  {demoShortAssets.map((a) => a.symbol).join(" + ")}
                </span>
                .
              </p>
              <p className="mt-2 text-muted-foreground">
                If the ratio increases, you profit. If it decreases, you lose credits.
              </p>
            </div>

            {/* Detailed breakdown */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Long Basket</div>
              {demoLongAssets.map((a) => (
                <div key={a.symbol} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{a.symbol}</span>
                  <span className="text-primary">{a.weight}%</span>
                </div>
              ))}
              <div className="text-xs font-medium text-muted-foreground pt-1">Short Basket</div>
              {demoShortAssets.map((a) => (
                <div key={a.symbol} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{a.symbol}</span>
                  <span className="text-secondary">{a.weight}%</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Stake</span>
              <span className="font-medium text-foreground">{stake} credits</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Max Loss</span>
              <span className="font-medium text-destructive">{stake} credits</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("stake")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => {
                  setStep("confirm")
                  setShowConfirmModal(true)
                }}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Confirm Trade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <Card className="border-primary/50">
          <CardContent className="py-6 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-primary" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Position Opened!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You earned +10 XP. Track your position in the timeline below.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">{"Your PnL = stake \u00D7 (currentRatio / entryRatio - 1)"}</p>
            <Button onClick={resetBuilder} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              New Trade
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Confirm Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Demo Trade</DialogTitle>
            <DialogDescription>Review your trade before confirming</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thesis</span>
                  <span className="font-medium text-foreground">{basketLabel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Long</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {demoLongAssets.map((a) => (
                      <Badge key={a.symbol} variant="outline" className="border-primary text-primary">
                        {a.symbol} {a.weight}%
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Short</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {demoShortAssets.map((a) => (
                      <Badge key={a.symbol} variant="outline" className="border-secondary text-secondary">
                        {a.symbol} {a.weight}%
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground">Stake</span>
                  <span className="font-bold text-foreground">{stake} credits</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              This is a demo trade using fake credits. No real money is involved.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmTrade} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Confirm (Demo Sign)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
