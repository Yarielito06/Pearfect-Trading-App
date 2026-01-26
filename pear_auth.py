import requests
import os
from dotenv import load_dotenv

load_dotenv()


class PearAuth:
    def __init__(self):
        self.base_url = "https://hl-v2.pearprotocol.io"
        self.client_id = os.getenv("CLIENT_ID", "APITRADER")
        self.access_token = None
        self.refresh_token = None

    def get_signing_message(self, wallet_address: str):
        """Step 1: GET the EIP-712 message the user needs to sign"""
        url = f"{self.base_url}/auth/eip712-message"
        params = {
            "address": wallet_address,
            "clientId": self.client_id
        }
        
        response = requests.get(url, params=params)
        print(f"📝 EIP-712 Message: {response.status_code} - {response.text}")
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to get EIP-712 message: {response.text}")

    def authenticate(self, wallet_address: str, signature: str, timestamp: int = 0):
        """Step 3: POST to /auth/login to exchange signature for JWT"""
        url = f"{self.base_url}/auth/login"
        payload = {
            "method": "eip712",
            "address": wallet_address,
            "clientId": self.client_id,
            "details": {
                "signature": signature,
                "timestamp": timestamp
            }
        }
        
        response = requests.post(url, json=payload)
        print(f"🔐 Auth Response: {response.status_code} - {response.text}")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            self.access_token = data.get("accessToken")
            self.refresh_token = data.get("refreshToken")
            return data
        
        raise Exception(f"Authentication failed: {response.text}")


class PearBase:
    """Base class with authentication headers"""
    def __init__(self, access_token):
        self.base_url = "https://hl-v2.pearprotocol.io"
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }


class PearTrade(PearBase):
    def place_pair_trade(self, long_ticker, short_ticker, size_usd, leverage=1):
        """Open a pair trade via POST /positions"""
        url = f"{self.base_url}/positions"
        
        payload = {
            "slippage": 0.01,
            "executionType": "MARKET",  # Use MARKET for immediate execution
            "leverage": int(leverage),
            "usdValue": float(size_usd),
            "longAssets": [
                {"asset": long_ticker, "weight": 1}
            ],
            "shortAssets": [
                {"asset": short_ticker, "weight": 1}
            ]
        }
        
        print(f"SENDING TO PEAR: {payload}")
        print(f"Using token: {self.headers.get('Authorization', 'NO TOKEN')[:50]}...")
        
        response = requests.post(url, json=payload, headers=self.headers)
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        # Return the full response for error handling
        return response.json()
class PearPortfolio(PearBase):
    def get_active_positions(self):
        """Get all open positions via GET /positions"""
        url = f"{self.base_url}/positions"
        response = requests.get(url, headers=self.headers)
        print(f"📊 Positions Response: {response.status_code} - {response.text}")
        return response.json() if response.status_code == 200 else []