const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface ApiError {
  message: string
  status: number
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<{ data: T | null; error: ApiError | null }> {
  if (!BACKEND_URL) {
    return {
      data: null,
      error: { message: "Backend URL not configured. Set NEXT_PUBLIC_BACKEND_URL in environment variables.", status: 0 },
    }
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      let errorMessage = response.statusText
      try {
        const errorBody = await response.json()
        errorMessage = errorBody.message || errorBody.error || response.statusText
      } catch {
        // Use status text if body parsing fails
      }
      return {
        data: null,
        error: { message: errorMessage, status: response.status },
      }
    }

    const data = await response.json()
    return { data, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error"
    return {
      data: null,
      error: { message, status: 0 },
    }
  }
}

// API endpoints
export const api = {
  // Health check
  health: () => fetchApi<{ status: string }>("/api/health"),

  // Pairs
  suggestPairs: (query: string) =>
    fetchApi<{ pairs: { base: string; quote: string; name: string }[] }>(
      `/api/pairs/suggest?q=${encodeURIComponent(query)}`,
    ),

  // Market data
  getCandles: (base: string, quote: string, interval = "15m", limit = 200) =>
    fetchApi<{ candles: { time: number; open: number; high: number; low: number; close: number }[] }>(
      `/api/market/candles?base=${base}&quote=${quote}&interval=${interval}&limit=${limit}`,
    ),

  getMids: (base: string, quote: string) =>
    fetchApi<{ mid: number; timestamp: number }>(`/api/market/mids?base=${base}&quote=${quote}`),

  // Pro trading
  executeProTrade: (payload: {
    address: string
    usdValue: number
    leverage: number
    slippage: number
    longAssets: { asset: string; weight: number }[]
    shortAssets: { asset: string; weight: number }[]
    thesisText?: string
    horizon?: string
    conviction?: string
    thesisType?: string
  }) =>
    fetchApi<{
      success: boolean
      tradeId: string
      message: string
      // Optional: transaction data for client-side signing
      txData?: {
        to: string
        value: string
        data: string
        chainId: number
      }
    }>("/api/pro/execute", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getProPositions: (address: string) =>
    fetchApi<{ positions: { id: string; status: string; pnl: number }[] }>(`/api/pro/positions?address=${address}`),


  // Authorization for the Pear Protocol Builder Address
  approvePearBuilder: async (walletAddress: string) => {
    const builderAddress = "0xA47Dd499191db54A4829cdf3de2417E527c3b042";
    const nonce = Date.now();
    
    // EIP-712 typed data for Hyperliquid builder approval
    const domain = {
      name: "Exchange",
      version: "1",
      chainId: 1, // <--- CHANGE THIS FROM 1337 TO 1
      verifyingContract: "0x0000000000000000000000000000000000000000" as const
    };
    
    const types = {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ],
      ApproveBuilderFee: [
        { name: "builder", type: "address" },
        { name: "maxFeeRate", type: "string" },
        { name: "nonce", type: "uint64" }
      ]
    };
    
    const message = {
      builder: builderAddress,
      maxFeeRate: "0.01%",
      nonce: nonce
    };
    
    // Use window.ethereum directly since that's what's connected
    const provider = (window as any).ethereum || (window as any).phantom?.ethereum;
    if (!provider) {
      throw new Error("No wallet provider found. Please install Phantom or MetaMask.");
    }
    
    // Construct the typed data payload for eth_signTypedData_v4
    const typedData = JSON.stringify({
      types,
      primaryType: "ApproveBuilderFee",
      domain,
      message
    });
    
    const signature = await provider.request({
      method: "eth_signTypedData_v4",
      params: [walletAddress, typedData]
    });
    
    return { signature, nonce, builderAddress };
  },

  // Agent
  agentChat: (payload: {
    pair: { base: string; quote: string }
    messages: { role: "user" | "assistant"; content: string }[]
  }) =>
    fetchApi<{
      reply: string
      direction: "UP" | "DOWN"
      confidence: number
      asOf: string
    }>("/api/agent/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
}
