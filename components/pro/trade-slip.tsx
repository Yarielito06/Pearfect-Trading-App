"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useWalletClient } from 'wagmi'
import { api } from '@/lib/api'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAppStore } from "@/lib/store"

interface Thesis {
  a: string
  b: string
  horizon: string
  conviction: string
  type: string
}

const STAKE_PRESETS = [25, 50, 100, 250]
const MIN_TRADE_AMOUNT = 22

type ErrorType = "network" | "api" | "validation" | "unknown"

interface TradeError {
  type: ErrorType
  message: string
  details?: string
}

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export function TradeSlip({ thesis }: { thesis: Thesis }) {
  // 1. Hooks & State
  const { wallet, addXP, triggerCoinShower } = useAppStore()
  const { data: walletClient } = useWalletClient()
  
  // walletClient from wagmi (may be undefined if not connected via wagmi)
  
  const [stake, setStake] = useState(25)
  const [leverage, setLeverage] = useState(1)
  const [slippage, setSlippage] = useState(1)
  const [acknowledged, setAcknowledged] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authorizing, setAuthorizing] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [error, setError] = useState<TradeError | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [lastReceipt, setLastReceipt] = useState<{
    tradeId: string
    timestamp: number
    txHash?: string
    status: "pending" | "success" | "failed"
  } | null>(null)

  // 2. Logic Checks
  const checks = {
    walletConnected: wallet.connected,
    authorized: isAuthorized,
    stakeValid: stake >= MIN_TRADE_AMOUNT,
    totalsValid: true,
    acknowledged,
  }

  const allChecksPass = Object.values(checks).every(Boolean)

  // 3. Handlers
  const handleAuthorizeBuilder = async () => {
    const provider = (window as any).ethereum || (window as any).phantom?.ethereum;
    if (!provider) {
      setError({ type: "validation", message: "Wallet Not Found", details: "Please install MetaMask or Phantom." });
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      setError({ type: "validation", message: "Config Error", details: "Backend URL not configured." });
      return;
    }

    setAuthorizing(true);
    setError(null);
    
    try {
      // 1. Ensure wallet is connected
      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
      const walletAddress = accounts[0];
      
      if (!walletAddress) {
        throw new Error("No account found");
      }

      // 2. Switch to Arbitrum network (required by Pear Protocol)
      const ARBITRUM_CHAIN_ID = "0xa4b1"; // 42161 in hex
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ARBITRUM_CHAIN_ID }],
        });
      } catch (switchError: any) {
        // If Arbitrum is not added to wallet, add it
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: ARBITRUM_CHAIN_ID,
              chainName: 'Arbitrum One',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://arb1.arbitrum.io/rpc'],
              blockExplorerUrls: ['https://arbiscan.io'],
            }],
          });
        } else {
          throw switchError;
        }
      }

      // 3. Fetch Pear's specific EIP-712 message from backend (which gets it from Pear API)
      const messageResponse = await fetch(`${backendUrl}/auth/message/${walletAddress}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      
      if (!messageResponse.ok) {
        const errorText = await messageResponse.text();
        throw new Error(`Failed to get signing message: ${errorText}`);
      }
      
      const pearMessage = await messageResponse.json();
      console.log("[v0] Pear message response:", JSON.stringify(pearMessage, null, 2));
      
      // Extract the timestamp from Pear's response
      const timestamp = pearMessage.timestamp;
      if (!timestamp) {
        throw new Error("No timestamp in Pear response");
      }
      
      // Pear returns the EIP-712 data directly - it should have domain, types, primaryType, message
      // The structure from Pear: { domain, types, primaryType, message, timestamp }
      // We need to add EIP712Domain to types for eth_signTypedData_v4
      const eip712Data = {
        domain: pearMessage.domain,
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" }
          ],
          ...pearMessage.types
        },
        primaryType: pearMessage.primaryType,
        message: pearMessage.message
      };
      
      console.log("[v0] EIP-712 data to sign:", JSON.stringify(eip712Data, null, 2));
      
      if (!eip712Data.domain || !eip712Data.types || !eip712Data.message) {
        throw new Error(`Invalid EIP-712 format. Keys: ${JSON.stringify(Object.keys(pearMessage))}`);
      }
      
      // Sign Pear's exact EIP-712 message - use checksummed address
      const signature = await provider.request({
        method: "eth_signTypedData_v4",
        params: [walletAddress, JSON.stringify(eip712Data)]
      }) as string;
      
      console.log("[v0] Signature:", signature.substring(0, 20) + "...");
      console.log("[v0] Sending to verify with wallet:", walletAddress, "timestamp:", timestamp);
      
      // 5. Send signature + timestamp to backend to exchange for JWT token
      const verifyResponse = await fetch(`${backendUrl}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          signature: signature,
          timestamp: timestamp,
        }),
      });
      
      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        throw new Error(`Auth failed: ${verifyResponse.status} - ${errorText}`);
      }
      
      const authResult = await verifyResponse.json();
      
      if (authResult.access_token || authResult.success) {
        setIsAuthorized(true);
      } else {
        throw new Error("No access token received from backend");
      }
    } catch (err: any) {
      setError({
        type: "validation",
        message: "Authorization Failed",
        details: err.message || "Could not sign approval request."
      });
    } finally {
      setAuthorizing(false);
    }
  };
  const getWalletProvider = (): EthereumProvider | null => {
    if (typeof window === "undefined") return null
    const win = window as unknown as {
      ethereum?: EthereumProvider // Standard for MetaMask
      phantom?: { ethereum?: EthereumProvider }
    }
    // Prioritize MetaMask/EVM providers
    return win?.ethereum || win?.phantom?.ethereum || null
  }

  const handleExecute = async () => {
    if (!wallet.address) {
      setError({ type: "validation", message: "No Wallet", details: "Please connect your wallet first." })
      return
    }

    setShowReviewModal(false)
    setExecuting(true)
    setError(null)

    const payload = {
      address: wallet.address,
      usdValue: stake,
      leverage,
      slippage,
      longAssets: [{ asset: thesis.a, weight: 100 }],
      shortAssets: [{ asset: thesis.b, weight: 100 }],
      thesisText: `${thesis.a} will outperform ${thesis.b} over ${thesis.horizon}`,
      horizon: thesis.horizon,
      conviction: thesis.conviction,
      thesisType: thesis.type,
    }

    console.log("[v0] Executing trade with payload:", payload)

    try {
      const { data, error: apiError } = await api.executeProTrade(payload)

      // Handle API errors - 500 from Pear typically means insufficient funds
      if (apiError) {
        if (apiError.status === 500) {
          setError({
            type: "api",
            message: "Insufficient Funds",
            details: "Trade sent successfully to Pear Protocol but rejected - your Hyperliquid account has no USDC balance. Deposit funds at app.hyperliquid.xyz to trade live."
          })
        } else {
          setError({
            type: "api",
            message: "Trade Failed",
            details: apiError.message || `Error ${apiError.status}`
          })
        }
        return
      }

      if (!data) {
        setError({
          type: "api",
          message: "No Response",
          details: "Backend returned no data"
        })
        return
      }

      // Check if Pear returned an error inside the data object
      if (data.data?.statusCode && data.data.statusCode >= 400) {
        const pearError = data.data.message || "Trade rejected by Pear Protocol"
        if (data.data.statusCode === 500) {
          setError({
            type: "api",
            message: "Insufficient Funds",
            details: "Trade sent successfully to Pear Protocol but rejected - your Hyperliquid account has no USDC balance. Deposit funds at app.hyperliquid.xyz to trade live."
          })
        } else {
          setError({
            type: "api", 
            message: "Trade Rejected",
            details: `Pear API: ${pearError} (${data.data.statusCode})`
          })
        }
        return
      }

      // Success case - trade was accepted
      setLastReceipt({
        tradeId: data.tradeId || data.data?.orderId || "pending",
        timestamp: Date.now(),
        txHash: data.tradeId,
        status: "success",
      })
      addXP(10, true)
      triggerCoinShower()
    } catch (err: any) {
      // Catch-all for unexpected errors
      if (err.message?.includes("500")) {
        setError({
          type: "api",
          message: "Insufficient Funds",
          details: "Trade sent successfully to Pear Protocol but rejected - your Hyperliquid account has no USDC balance. Deposit funds at app.hyperliquid.xyz to trade live."
        })
      } else {
        setError({
          type: "api",
          message: "Execution Failed",
          details: err.message || "Unknown error"
        })
      }
    } finally {
      setExecuting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-foreground">Trade Slip</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{error.message}</AlertTitle>
            <AlertDescription className="text-xs">{error.details}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Protocol Authorization Box */}
        <div className={`p-3 border rounded-lg transition-colors ${isAuthorized ? "bg-success/10 border-success/30" : "bg-secondary/20"}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium">1. Protocol Authorization</p>
            {isAuthorized && <ShieldCheck className="h-4 w-4 text-success" />}
          </div>
          <Button 
            size="sm" 
            variant={isAuthorized ? "ghost" : "outline"} 
            className="w-full text-xs"
            onClick={handleAuthorizeBuilder}
            disabled={authorizing || isAuthorized}
          >
            {authorizing ? "Signing..." : isAuthorized ? "Builder Authorized" : "Authorize Pear Builder"}
          </Button>
          {!isAuthorized && (
            <p className="mt-1 text-[10px] text-muted-foreground text-center">
              Required once to enable trade routing.
            </p>
          )}
        </div>
        {/* Step 2: Stake Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Trade Stake</Label>
            <span className="text-[10px] text-success font-medium">Min: ${MIN_TRADE_AMOUNT}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                className="pl-7 h-10 text-lg font-mono font-bold"
                min={MIN_TRADE_AMOUNT}
              />
            </div>
            <Badge variant="secondary" className="h-10 px-3">USDC</Badge>
          </div>

          {/* Quick Selection Presets */}
          <div className="grid grid-cols-4 gap-2">
            {STAKE_PRESETS.map((amount) => (
              <Button 
                key={amount} 
                variant={stake === amount ? "default" : "outline"} 
                size="sm"
                className="text-[10px] h-8"
                onClick={() => setStake(amount)}
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Step 3: Advanced Options (Leverage & Slippage) */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced} className="border rounded-lg p-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full flex justify-between text-[10px] h-6">
              Advanced Settings
              <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <Label>Leverage</Label>
                <span className="text-primary">{leverage}x</span>
              </div>
              <Input 
                type="range" min="1" max="20" step="1" 
                value={leverage} 
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="h-4"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
        

        {/* ... Rest of your UI (Stake, Advanced, Checklist) ... */}
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs font-medium text-foreground">Pre-flight Checklist</p>
          <div className="space-y-1">
            <CheckItem label="Wallet connected" passed={checks.walletConnected} />
            <CheckItem label="Builder authorized" passed={checks.authorized} />
            <CheckItem label="Stake valid (min $22)" passed={checks.stakeValid} />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
            />
            <Label htmlFor="acknowledge" className="text-xs text-muted-foreground">
              I understand this uses real funds
            </Label>
          </div>
        </div>

        <Button
          onClick={() => setShowReviewModal(true)}
          disabled={!allChecksPass || executing}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {executing ? "Executing..." : "Execute Thesis"}
        </Button>
      </CardContent>

      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Trade Execution</DialogTitle>
            <DialogDescription>
              Review your trade details before executing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Thesis</span>
              <span className="font-medium">{thesis.a} vs {thesis.b}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Direction</span>
              <span className="font-medium text-success">Long {thesis.a} / Short {thesis.b}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stake</span>
              <span className="font-medium">${stake} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Leverage</span>
              <span className="font-medium">{leverage}x</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Horizon</span>
              <span className="font-medium">{thesis.horizon}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conviction</span>
              <span className="font-medium">{thesis.conviction}</span>
            </div>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Real Funds Warning</AlertTitle>
            <AlertDescription className="text-xs">
              This trade will use real USDC from your connected wallet on Hyperliquid.
            </AlertDescription>
          </Alert>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleExecute} disabled={executing}>
              {executing ? "Sending to Hyperliquid..." : "Confirm & Execute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function CheckItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded-full ${passed ? "bg-success" : "bg-muted"}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
