from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import List
from ..database import get_db, CitizenReport, SurveillanceSystem
from ..limiter import rate_limit
from ..auth import get_current_admin

router = APIRouter(prefix="/reports", tags=["Citizen Reports"])

class ReportCreateSchema(BaseModel):
    name: str
    type: str
    location: str
    description: str
    zk_commitment: str

class ReportSchema(BaseModel):
    id: int
    name: str
    type: str
    location: str
    description: str
    zk_commitment: str
    timestamp: str
    status: str

@router.get("/", response_model=List[ReportSchema])
def get_all_reports(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    # Retrieve all citizen reports for administration
    return db.query(CitizenReport).all()

@router.post("/", status_code=status.HTTP_201_CREATED)
def submit_report(
    payload: ReportCreateSchema,
    request: Request,
    db: Session = Depends(get_db),
    client_ip: str = Depends(rate_limit)
):
    # Strip user-agent and IP details from database logs to maintain anonymity
    # We use client_ip solely for the rate limiter bucket check which runs in memory, NOT written to DB.
    
    if not payload.zk_commitment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ZK-PROOF FAILED: CITIZEN ACCESS KEYCARD SIGNATURE MISSING."
        )

    # In a real ZK application, we would run:
    # snarkjs.groth16.verify(verification_key, public_signals, proof)
    # Here we perform structural check on the commitment
    if len(payload.zk_commitment) < 32:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ZK-PROOF INVALID: COMMITMENT SIGNATURE MALFORMED."
        )

    new_report = CitizenReport(
        name=payload.name,
        type=payload.type,
        location=payload.location,
        description=payload.description,
        zk_commitment=payload.zk_commitment,
        timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        status="PENDING"
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return {"message": "TRANSMISSION RECEIVED. ANONYMOUS RECORD INTEGRATED IN PIPELINE.", "report_id": new_report.id}

@router.post("/{report_id}/verify", status_code=status.HTTP_200_OK)
def verify_citizen_report(report_id: int, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    report = db.query(CitizenReport).filter(CitizenReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="CITIZEN REPORT NOT FOUND.")
    
    if report.status == "VERIFIED":
        return {"message": "REPORT ALREADY MERGED ON-CHAIN."}
    
    # Merge citizen report into primary surveillance systems registry
    report.status = "VERIFIED"
    
    # Calculate screen x, y coordinates randomly for simulation or place near centers
    import random
    new_sys = SurveillanceSystem(
        id=f"SYS-CIT-{report.id}",
        name=report.name,
        type=report.type,
        x=random.randint(100, 700),
        y=random.randint(100, 450),
        threat_score=10 if report.type == "Facial Recognition" else 9 if report.type == "Stingray" else 7 if report.type == "ALPR" else 4,
        owner="Unknown (Citizen Flagged)",
        data_collected="Pending extraction analysis",
        retention="Unknown",
        status="ACTIVE",
        access_requests="0 queries/hr",
        location=report.location,
        description=report.description + " [Citizen Verified Submission]"
    )
    db.add(new_sys)
    db.commit()
    
    return {"message": "CITIZEN SUBMISSION APPROVED. MERGED INTO CENTRAL REGISTRY MAP."}

@router.delete("/{report_id}", status_code=status.HTTP_200_OK)
def delete_citizen_report(report_id: int, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    report = db.query(CitizenReport).filter(CitizenReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="REPORT RECORD NOT FOUND.")
    
    db.delete(report)
    db.commit()
    return {"message": "REPORT PURGED FROM INGESTION PIPELINE."}
