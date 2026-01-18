"use client"

import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"

export function ModeToggle() {
  const router = useRouter()
  const { mode, setMode, wallet } = useAppStore()

  const handleModeChange = (newMode: "demo" | "pro") => {
    if (newMode === "pro" && !wallet.connected) {
      // Could trigger wallet connect here
      alert("Please connect your wallet first to use Pro Mode")
      return
    }
    setMode(newMode)
    router.push(newMode === "demo" ? "/demo/trade" : "/pro/trade")
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-lg">
        <button
          onClick={() => handleModeChange("demo")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            mode === "demo" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          DEMO
        </button>
        <button
          onClick={() => handleModeChange("pro")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            mode === "pro" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          PRO
        </button>
      </div>
    </div>
  )
}
