import os
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .database import get_db, init_db, User
from .auth import verify_password, create_access_token
from .routes import systems, reports, vault, stats


# Initialize database schemas and seed records on startup
init_db()

app = FastAPI(
    title="WatchTheWatchers API",
    description="Decentralized surveillance registry, accountability audits, and whistleblower vault API.",
    version="1.0.0"
)

# CORS configurations for local React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema for admin logins
class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # Query database for admin credentials
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="HANDSHAKE REJECTED: INVALID ACCESS DECRYPTION KEY CORRELATION."
        )

    # Generate JWT
    access_token = create_access_token(
        data={"sub": user.username, "role": "admin"}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": "HANDSHAKE GRANTED. AUTHENTICATION LEVEL: ADMIN."
    }

# Register individual sub-routers
app.include_router(systems.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(vault.router, prefix="/api")
app.include_router(stats.router, prefix="/api")

# Global Exception Handlers for 404, 500, and ValidationError
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": "API_EXC_ERROR",
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error_code": "VALIDATION_FAILED",
            "message": "PAYLOAD VALIDATION FAILURE: FIELD CONSTRAINTS MALFORMED.",
            "details": exc.errors(),
            "status_code": 422
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "UNCAUGHT ENGINE EXCEPTION: CRITICAL SYSTEM FAULT DETECTED.",
            "details": str(exc) if os.getenv("DEBUG") else "Internal server error",
            "status_code": 500
        }
    )

@app.get("/health")
def health_check():
    return {"status": "ONLINE", "timestamp": str(datetime.utcnow())}
