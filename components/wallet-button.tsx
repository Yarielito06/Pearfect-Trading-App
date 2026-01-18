"use client"

import { useState } from "react"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"

export function WalletButton() {
  const { wallet, setWallet, mode } = useAppStore()
  const [connecting, setConnecting] = useState(false)

  const connectWallet = async () => {
    setConnecting(true)

    try {
      // Check for Phantom wallet
      const provider =
        (window as unknown as { phantom?: { ethereum?: { request: (args: { method: string }) => Promise<string[]> } } })
          ?.phantom?.ethereum ||
        (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } })?.ethereum

      if (!provider) {
        alert("Please install Phantom wallet to connect")
        setConnecting(false)
        return
      }

      const accounts = await provider.request({ method: "eth_requestAccounts" })

      if (accounts && accounts.length > 0) {
        setWallet({ connected: true, address: accounts[0] })
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      alert("Failed to connect wallet. Please try again.")
    }

    setConnecting(false)
  }

  const disconnectWallet = () => {
    setWallet({ connected: false, address: null })
  }

  if (wallet.connected && wallet.address) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={disconnectWallet}
        className="border-border text-foreground bg-transparent"
      >
        <Wallet className="mr-2 h-4 w-4" />
        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      onClick={connectWallet}
      disabled={connecting}
      className="bg-primary text-primary-foreground hover:bg-primary/90"
    >
      <Wallet className="mr-2 h-4 w-4" />
      {connecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
