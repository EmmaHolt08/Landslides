from datetime import datetime, timedelta
from typing import Optional
import hashlib
import base64 
import os      

SECRET_KEY = "your-super-secret-key-change-this-in-production-!!!!" 
ALGORITHM = "HS256" # Placeholder
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # Token valid for 30 minutes

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode["exp"] = expire.timestamp()
    
    random_bytes = os.urandom(16) 
    token_id = base64.urlsafe_b64encode(random_bytes).decode('utf-8').rstrip('=')

    payload_str = f"{token_id}.{base64.urlsafe_b64encode(str(to_encode).encode('utf-8')).decode('utf-8').rstrip('=')}"
    
    return payload_str

def decode_access_token(token: str) -> Optional[dict]:
    try:
        parts = token.split('.')
        if len(parts) != 2:
            return None 

        payload_encoded = parts[1] + '==' * ((4 - len(parts[1]) % 4) % 4)
        payload_str = base64.urlsafe_b64decode(payload_encoded).decode('utf-8')

        payload = eval(payload_str) 

        if "exp" in payload and datetime.utcnow().timestamp() > payload["exp"]:
            return None 

        return payload
    except Exception: 
        return None
