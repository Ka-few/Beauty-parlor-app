import requests
from requests.auth import HTTPBasicAuth
import os
from dotenv import load_dotenv

load_dotenv()

def get_mpesa_access_token():
    consumer_key = os.getenv("MPESA_CONSUMER_KEY")
    consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")
    if not consumer_key or not consumer_secret:
        return None, "MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET is missing"

    base_url = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke").rstrip("/")
    api_url = f"{base_url}/oauth/v1/generate?grant_type=client_credentials"

    try:
        response = requests.get(api_url, auth=HTTPBasicAuth(consumer_key, consumer_secret))
        response.raise_for_status()
        body = response.json()
        token = body.get("access_token")
        if not token:
            return None, f"Token response missing access_token: {body}"
        return token, None
    except requests.exceptions.RequestException as e:
        details = ""
        if e.response is not None:
            details = f" | status={e.response.status_code} body={e.response.text}"
        return None, f"Error getting M-Pesa access token: {e}{details}"
