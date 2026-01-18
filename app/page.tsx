"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Wallet, Play, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"

export default function LandingPage() {
  const router = useRouter()
  const { setMode, wallet, setWallet, initDemoWallet } = useAppStore()
  const [showModal, setShowModal] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initDemoWallet()
  }, [initDemoWallet])

  const handleDemoMode = () => {
    setMode("demo")
    router.push("/demo/trade")
  }

  const handleProMode = async () => {
    // Use the variable if it exists, otherwise use your ngrok link
    const BACKEND_URL = "https://2d1dd1c935a4.ngrok-free.app";
    if (!BACKEND_URL) {
      setError("Backend URL not configured. Please set NEXT_PUBLIC_BACKEND_URL environment variable.")
      return
    }

    if (wallet.connected) {
      setMode("pro")
      router.push("/pro/trade")
      return
    }

    setConnecting(true)
    setError(null)

    try {
      const provider = (window as any)?.phantom?.ethereum || (window as any)?.ethereum

      if (!provider) {
        setError("Please install Phantom wallet to connect")
        setConnecting(false)
        return
      }

      // A. Get Wallet Address
      const accounts = await provider.request({ method: "eth_requestAccounts" })
      const address = accounts[0]

      // B. STEP 1: Get the signing message from backend
     // B. STEP 1: Get the signing message from backend
     // B. STEP 1: Get the signing message from backend
      const msgResponse = await fetch(`${BACKEND_URL}/auth/message/${address}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' // <--- ADD THIS LINE
        },
        mode: 'cors'
      })

if (!msgResponse.ok) {
  const errorText = await msgResponse.text(); // Capture the actual error text
  throw new Error(`Backend error ${msgResponse.status}: ${errorText}`);
}

      const contentType = msgResponse.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend returned invalid response (not JSON). Check if the backend server is running.")
      }

      const msgData = await msgResponse.json()
      const messageToSign = msgData.message

      if (!messageToSign) {
        throw new Error("Backend did not return a message to sign")
      }

      // C. STEP 2: Ask user to sign the message
      const signature = await provider.request({
        method: "personal_sign",
        params: [messageToSign, address],
      })

      // D. STEP 3: Verify with backend
      const verifyResponse = await fetch(`${BACKEND_URL}/auth/verify`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          wallet_address: address,
          signature: signature,
        }),
      })
      
      if (!verifyResponse.ok) {
        // Try to get the actual error message from the backend
        let errorDetail = ""
        try {
          const errorData = await verifyResponse.json()
          errorDetail = errorData.detail || errorData.error || errorData.message || JSON.stringify(errorData)
        } catch {
          errorDetail = await verifyResponse.text().catch(() => "Unknown error")
        }
        throw new Error(`Verification failed (${verifyResponse.status}): ${errorDetail}`)
      }

      const verifyContentType = verifyResponse.headers.get("content-type")
      if (!verifyContentType || !verifyContentType.includes("application/json")) {
        throw new Error("Verification returned invalid response")
      }

      const authData = await verifyResponse.json()

     if (authData.access_token) {
      useAppStore.setState({ accessToken: authData.access_token })
      // CAMBIA ESTO:
      setWallet({ connected: true, address: "0x2332196069342e15Fc20E55d6B57f238ec743c1E" }) 
      setMode("pro")
      router.push("/pro/trade")
    } else {
        throw new Error(authData.error || "Verification failed - no access token received")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed"
      console.error("Failed to connect wallet:", message)
      setError(message)
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <Image
                src="/images/pear-20logo.png"
                alt="Pearfect logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <DialogTitle className="text-2xl text-foreground">Choose Your Mode</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Start learning with fake credits or trade for real
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <button
              onClick={handleDemoMode}
              className="group flex w-full items-start gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-left transition-all hover:border-primary hover:bg-primary/10"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Play className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Fake Wallet (Demo Mode)</h3>
                <p className="mt-1 text-sm text-muted-foreground">Learn pair trading with 100 fake credits.</p>
              </div>
            </button>

            <button
              onClick={handleProMode}
              disabled={connecting}
              className="group flex w-full items-start gap-4 rounded-xl border border-secondary/30 bg-secondary/5 p-4 text-left transition-all hover:border-secondary hover:bg-secondary/10 disabled:opacity-50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Connect Wallet (Pro Mode)</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {connecting ? "Waiting for signature..." : "Execute real trades with your connected wallet."}
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative z-0 text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Trade Ideas, <span className="text-primary">Not Just Tokens</span>
        </h1>
      </div>
    </div>
  )
}
