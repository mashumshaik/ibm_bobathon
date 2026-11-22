from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User
from app.services.auth_service import validate_phone, send_otp, verify_otp, create_jwt, get_current_user

router = APIRouter()


class SendOTPRequest(BaseModel):
    phone: str


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    name: str = ""


class SetWardRequest(BaseModel):
    ward_id: int


@router.post("/send-otp")
def send_otp_route(req: SendOTPRequest):
    if not validate_phone(req.phone):
        raise HTTPException(status_code=400, detail="Invalid Indian phone number")
    send_otp(req.phone)
    return {"message": "OTP sent"}


@router.post("/verify-otp")
def verify_otp_route(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    if not validate_phone(req.phone):
        raise HTTPException(status_code=400, detail="Invalid phone number")
    if not verify_otp(req.phone, req.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.phone == req.phone).first()
    if not user:
        user = User(phone=req.phone, name=req.name or None, is_verified=True)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.is_verified = True
        db.commit()

    token = create_jwt(user.id, user.phone, user.ward_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "phone": user.phone,
            "name": user.name,
            "ward_id": user.ward_id,
            "points": user.points,
        },
    }


@router.post("/set-ward")
def set_ward(req: SetWardRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.ward_id = req.ward_id
    db.commit()
    db.refresh(current_user)
    token = create_jwt(current_user.id, current_user.phone, current_user.ward_id)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "phone": current_user.phone,
        "name": current_user.name,
        "ward_id": current_user.ward_id,
        "points": current_user.points,
        "badges": [{"badge_type": b.badge_type.value, "awarded_at": b.awarded_at.isoformat()} for b in current_user.badges],
        "issues_posted": len(current_user.issues),
        "issues_resolved": sum(1 for i in current_user.issues if i.status and i.status.value == "resolved"),
    }
