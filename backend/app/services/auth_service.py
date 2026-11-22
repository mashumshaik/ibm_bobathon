import os
import re
import random
import time
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.database import get_db
from app.models.models import User

SECRET_KEY = os.getenv("JWT_SECRET", "changeme-secret-key")
ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# In-memory OTP store: phone -> {otp, expires_at}
_otp_store: dict = {}

PHONE_REGEX = re.compile(r"^[6-9]\d{9}$")

bearer_scheme = HTTPBearer(auto_error=False)


def validate_phone(phone: str) -> bool:
    return bool(PHONE_REGEX.match(phone))


def send_otp(phone: str) -> str:
    otp = str(random.randint(100000, 999999))
    _otp_store[phone] = {"otp": otp, "expires_at": time.time() + 300}
    if DEBUG:
        print(f"[OTP DEBUG] Phone: {phone}  OTP: {otp}")
    return otp


def verify_otp(phone: str, otp: str) -> bool:
    record = _otp_store.get(phone)
    if not record:
        return False
    if time.time() > record["expires_at"]:
        del _otp_store[phone]
        return False
    if record["otp"] != otp:
        return False
    del _otp_store[phone]
    return True


def create_jwt(user_id: int, phone: str, ward_id: Optional[int]) -> str:
    payload = {
        "sub": str(user_id),
        "phone": phone,
        "ward_id": ward_id,
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
