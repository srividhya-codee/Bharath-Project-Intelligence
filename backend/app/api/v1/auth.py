import datetime
import hashlib
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from backend.app.config import settings
from backend.app.db.session import get_db
from backend.app.db.models import User, Ministry, State
from backend.app.services.audit_service import log_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])
security = HTTPBearer(auto_error=False)

# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict

class RefreshRequest(BaseModel):
    refresh_token: str

class UserCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # Super Admin | Government Officer | Project Authority | Senior Decision Maker
    ministry_id: Optional[int] = None
    state_id: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    ministry_id: Optional[int] = None
    ministry_name: Optional[str] = None
    state_id: Optional[int] = None
    state_name: Optional[str] = None
    is_active: bool


# -------------------------------------------------------------
# PASSWORD & JWT HELPERS
# -------------------------------------------------------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies password against stored hash (supports SHA-256 for demo seeding and bcrypt)."""
    # Check sha256 demo seed
    sha_hash = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    if sha_hash == hashed_password:
        return True
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)
    except Exception:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()


def create_jwt_token(data: dict, expires_delta: datetime.timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


# -------------------------------------------------------------
# RBAC DEPENDENCY GUARDS
# -------------------------------------------------------------
def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired or invalid signature")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account inactive or not found")
    return user


def require_roles(allowed_roles: List[str]):
    def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires one of roles {allowed_roles}. Current role: {user.role}"
            )
        return user
    return role_checker


# -------------------------------------------------------------
# API ROUTES
# -------------------------------------------------------------
@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Use demo accounts (e.g. decisionmaker@demo.gov / DemoGovPass@2026)"
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    access_token = create_jwt_token(
        {"sub": str(user.id), "role": user.role, "email": user.email},
        datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_jwt_token(
        {"sub": str(user.id), "type": "refresh"},
        datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )

    log_audit_event(
        db=db,
        action="USER_LOGIN_SUCCESS",
        user_id=user.id,
        entity_type="User",
        entity_id=str(user.id),
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "ministry_id": user.ministry_id,
            "ministry_name": user.ministry.short_name if user.ministry else None,
            "state_id": user.state_id,
            "state_name": user.state.name if user.state else None,
        }
    )


@router.post("/refresh")
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        decoded = jwt.decode(payload.refresh_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if decoded.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Invalid token type")
        user_id = decoded.get("sub")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or invalid")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not active")

    new_access_token = create_jwt_token(
        {"sub": str(user.id), "role": user.role, "email": user.email},
        datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": new_access_token, "token_type": "bearer", "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60}


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        ministry_id=user.ministry_id,
        ministry_name=user.ministry.short_name if user.ministry else None,
        state_id=user.state_id,
        state_name=user.state.name if user.state else None,
        is_active=user.is_active
    )


@router.get("/users", response_model=List[UserResponse])
def list_users(
    admin: User = Depends(require_roles(["Super Admin"])),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return [
        UserResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            ministry_id=u.ministry_id,
            ministry_name=u.ministry.short_name if u.ministry else None,
            state_id=u.state_id,
            state_name=u.state.name if u.state else None,
            is_active=u.is_active
        )
        for u in users
    ]


@router.post("/users", response_model=UserResponse)
def create_user(
    payload: UserCreateRequest,
    admin: User = Depends(require_roles(["Super Admin"])),
    db: Session = Depends(get_db)
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="User email already exists")

    new_user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        ministry_id=payload.ministry_id,
        state_id=payload.state_id,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_audit_event(
        db=db,
        action="USER_CREATED",
        user_id=admin.id,
        entity_type="User",
        entity_id=str(new_user.id),
        after={"email": new_user.email, "role": new_user.role}
    )

    return UserResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role,
        ministry_id=new_user.ministry_id,
        state_id=new_user.state_id,
        is_active=new_user.is_active
    )
