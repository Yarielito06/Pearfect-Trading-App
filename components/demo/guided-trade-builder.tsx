"use client"

import { useState } from "react"
import { ChevronRight, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"

const MATCHUPS = [
  { id: "ai-eth", name: "AI beats ETH", long: "AI Tokens", short: "ETH" },
  { id: "sol-btc", name: "SOL ecosystem beats BTC", long: "SOL", short: "BTC" },
  { id: "memes-eth", name: "Memes lose to ETH", long: "ETH", short: "Meme Coins" },
  { id: "l2-l1", name: "L2s outperform L1s", long: "L2 Tokens", short: "L1 Tokens" },
]

const STAKE_PRESETS = [10, 25, 50, 100]

type Step = "matchup" | "stake" | "review" | "confirm" | "done"

export function GuidedTradeBuilder() {
  const { demoWallet, deductDemoCredits, addDemoTransaction, addDemoPosition, addXP, triggerCoinShower, selectedPair } =
    useAppStore()

  const [step, setStep] = useState<Step>("matchup")
  const [selectedMatchup, setSelectedMatchup] = useState<string | null>(null)
  const [stake, setStake] = useState<number>(25)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [freePlay, setFreePlay] = useState(false)

  const matchup = MATCHUPS.find((m) => m.id === selectedMatchup)
  const canAfford = demoWallet && stake <= demoWallet.demoCredits

  const handleConfirmTrade = () => {
    if (!demoWallet || !matchup) return

    // Deduct credits
    deductDemoCredits(stake)

    // Add transaction
    addDemoTransaction({
      type: "trade",
      amount: stake,
      description: `Demo trade: ${matchup.name}`,
    })

    // Add position
    addDemoPosition({
      longAssets: [{ asset: matchup.long, weight: 100 }],
      shortAssets: [{ asset: matchup.short, weight: 100 }],
      stake,
      entryRatio: 1.5 + Math.random() * 0.5,
      matchup: matchup.name,
    })

    // Award XP
    addXP(10)

    // Trigger celebration
    triggerCoinShower()

    // Close modal and show success
    setShowConfirmModal(false)
    setStep("done")
  }

  const resetBuilder = () => {
    setStep("matchup")
    setSelectedMatchup(null)
    setStake(25)
  }

  const getStepNumber = (s: Step): number => {
    const steps: Step[] = ["matchup", "stake", "review", "confirm", "done"]
    return steps.indexOf(s) + 1
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Guided Trade Builder</h2>
        {freePlay && (
          <Badge variant="secondary" className="text-xs">
            Free Play
          </Badge>
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {["matchup", "stake", "review", "confirm"].map((s, i) => (
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
            {i < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === "matchup" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">1. Pick a Matchup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">Choose which thesis you believe in</p>
            <RadioGroup value={selectedMatchup || ""} onValueChange={setSelectedMatchup}>
              {MATCHUPS.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors ${
                    selectedMatchup === m.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                  }`}
                >
                  <RadioGroupItem value={m.id} id={m.id} />
                  <Label htmlFor={m.id} className="flex-1 cursor-pointer">
                    <span className="font-medium text-foreground">{m.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      Long {m.long} / Short {m.short}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button
              onClick={() => setStep("stake")}
              disabled={!selectedMatchup}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "stake" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">2. Choose Stake</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">How many credits do you want to stake?</p>
            <div className="grid grid-cols-4 gap-2">
              {STAKE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setStake(preset)}
                  disabled={demoWallet && preset > demoWallet.demoCredits}
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
            {!canAfford && <p className="text-center text-xs text-danger">Insufficient credits</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("matchup")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep("review")}
                disabled={!canAfford}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "review" && matchup && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">3. Review Risk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-3 text-sm text-foreground">
              <p>
                {"You're betting that "}
                <span className="font-semibold text-primary">{matchup.long}</span>
                {" will outperform "}
                <span className="font-semibold text-secondary">{matchup.short}</span>.
              </p>
              <p className="mt-2 text-muted-foreground">
                If the ratio increases, you profit. If it decreases, you lose credits.
              </p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Stake</span>
              <span className="font-medium text-foreground">{stake} credits</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Max Loss</span>
              <span className="font-medium text-danger">{stake} credits</span>
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

      {step === "done" && (
        <Card className="border-primary/50">
          <CardContent className="py-6 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-primary" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Position Opened!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You earned +10 XP. Track your position in the timeline below.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">{"Your PnL = stake × (currentRatio / entryRatio - 1)"}</p>
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
          {matchup && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thesis</span>
                    <span className="font-medium text-foreground">{matchup.name}</span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-muted-foreground">Long</span>
                    <Badge variant="outline" className="border-primary text-primary">
                      {matchup.long}
                    </Badge>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-muted-foreground">Short</span>
                    <Badge variant="outline" className="border-secondary text-secondary">
                      {matchup.short}
                    </Badge>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-muted-foreground">Stake</span>
                    <span className="font-bold text-foreground">{stake} credits</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This is a demo trade using fake credits. No real money is involved.
              </p>
            </div>
          )}
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
