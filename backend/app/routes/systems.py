from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from ..database import get_db, SurveillanceSystem
from ..auth import get_current_admin

router = APIRouter(prefix="/systems", tags=["Surveillance Systems"])

class SystemSchema(BaseModel):
    id: str
    name: str
    type: str
    x: int
    y: int
    owner: str
    data_collected: str
    retention: str
    location: str
    description: str

class SystemUpdateSchema(BaseModel):
    status: str

def calculate_threat_score(sys_type: str) -> int:
    # Threat scoring algorithm: facial recognition = 10, IMSI catcher = 9, ALPR = 7, CCTV = 4/5
    t_type = sys_type.lower()
    if "facial" in t_type:
        return 10
    elif "stingray" in t_type or "imsi" in t_type:
        return 9
    elif "alpr" in t_type or "plate" in t_type:
        return 7
    elif "cctv" in t_type or "camera" in t_type:
        return 5
    return 4

@router.get("/", response_model=List[SystemSchema])
def get_systems(db: Session = Depends(get_db)):
    # Returns all systems that are approved / active
    return db.query(SurveillanceSystem).filter(SurveillanceSystem.status != "UNVERIFIED").all()

@router.get("/all", response_model=List[SystemSchema])
def get_all_systems(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    # Admin route to see unverified/pending systems too
    return db.query(SurveillanceSystem).all()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_system(payload: SystemSchema, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    # Check if exists
    existing = db.query(SurveillanceSystem).filter(SurveillanceSystem.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="SYSTEM ID ALREADY EXISTS.")
        
    threat_score = calculate_threat_score(payload.type)
    
    new_sys = SurveillanceSystem(
        id=payload.id,
        name=payload.name,
        type=payload.type,
        x=payload.x,
        y=payload.y,
        threat_score=threat_score,
        owner=payload.owner,
        data_collected=payload.data_collected,
        retention=payload.retention,
        status="ACTIVE",
        access_requests="0 queries/hr",
        location=payload.location,
        description=payload.description
    )
    db.add(new_sys)
    db.commit()
    return {"message": "SURVEILLANCE SENSOR LOGGED SUCCESSFULLY.", "threat_score": threat_score}

@router.put("/{sys_id}", status_code=status.HTTP_200_OK)
def update_system_status(sys_id: str, payload: SystemUpdateSchema, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    sys = db.query(SurveillanceSystem).filter(SurveillanceSystem.id == sys_id).first()
    if not sys:
        raise HTTPException(status_code=404, detail="SURVEILLANCE SENSOR NOT FOUND.")
    
    sys.status = payload.status
    db.commit()
    return {"message": f"SYSTEM STATUS UPDATED TO: {payload.status}"}

@router.delete("/{sys_id}", status_code=status.HTTP_200_OK)
def delete_system(sys_id: str, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    sys = db.query(SurveillanceSystem).filter(SurveillanceSystem.id == sys_id).first()
    if not sys:
        raise HTTPException(status_code=404, detail="SURVEILLANCE SENSOR NOT FOUND.")
    
    db.delete(sys)
    db.commit()
    return {"message": "SURVEILLANCE SENSOR PURGED FROM REGISTRY."}
