import requests
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from pear_auth import PearTrade, PearPortfolio 
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PEAR_API_URL = "https://hl-v2.pearprotocol.io"
CLIENT_ID = "APITRADER"


class PearAuthService:
    def __init__(self):
        self.access_token = None
        self.refresh_token = None

    def get_eip712_message(self, wallet_address: str):
        """Step 1: GET EIP-712 message from Pear Protocol (GET request with query params)"""
        url = f"{PEAR_API_URL}/auth/eip712-message"
        params = {
            "address": wallet_address,
            "clientId": CLIENT_ID
        }
        print(f"📝 Getting EIP-712 message for {wallet_address}")
        response = requests.get(url, params=params)  # GET not POST!
        print(f"📝 EIP-712 Response: {response.status_code} - {response.text}")
        return response.json()

    def authenticate(self, wallet_address: str, signature: str, timestamp: int = None):
        """Step 3: POST to /auth/login to exchange signature for JWT tokens"""
        url = f"{PEAR_API_URL}/auth/login"  # CORRECT ENDPOINT
        
        payload = {
            "method": "eip712",
            "address": wallet_address,
            "clientId": CLIENT_ID,
            "details": {
                "signature": signature,
                "timestamp": timestamp or 0
            }
        }
        
        print(f"🔐 Authenticating with Pear: {url}")
        print(f"🔐 Payload: {payload}")
        response = requests.post(url, json=payload)
        print(f"🔐 Auth Response: {response.status_code} - {response.text}")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            self.access_token = data.get("accessToken")
            self.refresh_token = data.get("refreshToken")
            print(f"✅ Got access token: {self.access_token[:20]}..." if self.access_token else "❌ No token received")
            return data
            
        raise Exception(f"Pear API Error: {response.status_code} - {response.text}")


auth_service = PearAuthService()


# --- Data Models ---
class TradeRequest(BaseModel):
    address: str
    usdValue: float
    leverage: int
    longAssets: list
    shortAssets: list

class AuthVerifyRequest(BaseModel):
    wallet_address: str
    signature: str
    timestamp: int = None

class CloseRequest(BaseModel):
    position_id: str
    access_token: str = None


# --- Endpoints ---

@app.get("/api/health")
async def health():
    return {"status": "ok", "has_token": auth_service.access_token is not None}


@app.get("/auth/message/{address}")
async def get_auth_message(address: str):
    """Step 1: Get Pear's specific EIP-712 message for the user to sign"""
    try:
        result = auth_service.get_eip712_message(address)
        return result
    except Exception as e:
        print(f"❌ Get message error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/auth/verify")
async def verify_signature(auth_data: AuthVerifyRequest):
    """Step 3: Exchange signature for real JWT token from Pear Protocol"""
    try:
        result = auth_service.authenticate(
            auth_data.wallet_address, 
            auth_data.signature,
            auth_data.timestamp
        )
        return {
            "access_token": result.get("accessToken"),
            "refresh_token": result.get("refreshToken"),
            "success": True
        }
    except Exception as e:
        print(f"❌ Auth Fail: {e}")
        raise HTTPException(status_code=401, detail=str(e))


@app.post("/api/pro/execute")
async def execute_trade(trade_data: TradeRequest):
    """Step 4: Place the trade using the real JWT token"""
    try:
        if not auth_service.access_token:
            print("No token found. User must authorize first.")
            raise HTTPException(status_code=401, detail="Not authorized with Pear Protocol. Click 'Authorize Pear Builder' first.")
        
        trader = PearTrade(auth_service.access_token)
        
        long_asset = trade_data.longAssets[0]["asset"]
        short_asset = trade_data.shortAssets[0]["asset"]
        
        print(f"SENDING TO PEAR: Long {long_asset} / Short {short_asset} (${trade_data.usdValue})")
        
        result = trader.place_pair_trade(
            long_ticker=long_asset,
            short_ticker=short_asset,
            size_usd=trade_data.usdValue,
            leverage=trade_data.leverage
        )
        
        print(f"PEAR RESPONSE: {result}")
        
        # Check if Pear returned an error
        if "statusCode" in result and result["statusCode"] >= 400:
            error_msg = result.get("message", "Unknown error from Pear")
            raise HTTPException(status_code=result["statusCode"], detail=f"Pear API Error: {error_msg}")
        
        return {"success": True, "tradeId": result.get("orderId", "unknown"), "data": result}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Execution Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
@app.get("/portfolio/positions")
async def get_positions(access_token: str = None):
    try:
        token = access_token or auth_service.access_token
        if not token:
            raise HTTPException(status_code=401, detail="No access token")
        portfolio = PearPortfolio(token)
        return portfolio.get_active_positions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/trade/close")
async def close_position(data: CloseRequest):
    try:
        token = data.access_token or auth_service.access_token
        if not token:
            raise HTTPException(status_code=401, detail="No access token")
        trader = PearTrade(token)
        return trader.close_trade(data.position_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Close failed: {str(e)}")


@app.get("/market/prices")
async def get_live_prices():
    url = "https://hl-v2.pearprotocol.io/market-data/prices"
    try:
        response = requests.get(url)
        all_prices = response.json()
        return {
            ticker: all_prices[ticker] 
            for ticker in ["HYPE", "SOL", "ETH", "BTC"] 
            if ticker in all_prices
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch market data")