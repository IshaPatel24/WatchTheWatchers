import os
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from pydantic import BaseModel
from ..database import get_db, EncryptedDocument
from ..auth import get_current_admin

router = APIRouter(prefix="/vault", tags=["Whistleblower Vault"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./encrypted_uploads")

# Ensure secure upload folder exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

class DocumentSchema(BaseModel):
    id: int
    original_name: str
    encrypted_hash: str
    uploaded_at: str

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Read file content for sanitization checks
    content = await file.read()
    
    # Check for raw EXIF/GPS metadata markers in standard image byte streams
    # This acts as a secondary server-side check in case client-side scrubbing was bypassed
    content_upper = content.upper()
    if b"EXIF" in content_upper or b"GPS" in content_upper or b"IPHONE" in content_upper:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TRANSMISSION REJECTED: EXIF METADATA DETECTED IN FILE STREAM. PURGE GEOLOCATION AND HARDWARE STRINGS BEFORE SUBMITTING."
        )

    # Secure hashing of the ciphertext payload
    sha256 = hashlib.sha256()
    sha256.update(content)
    file_hash = sha256.hexdigest()

    # Generate an anonymous randomized filename
    safe_filename = f"cipher_{file_hash[:20]}.enc"
    safe_filepath = os.path.join(UPLOAD_DIR, safe_filename)
    
    # Save the encrypted bytes on server disk
    with open(safe_filepath, "wb") as f:
        f.write(content)

    new_doc = EncryptedDocument(
        file_path=safe_filepath,
        original_name=file.filename,
        encrypted_hash=file_hash,
        uploaded_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    )
    
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    return {
        "message": "ENCRYPTED EVIDENCE SECURED IN OFF-GRID STORAGE.",
        "vault_id": new_doc.id,
        "payload_hash": file_hash
    }

@router.get("/files", response_model=List[DocumentSchema])
def list_vault_files(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    # Admin route to inspect locked whistleblower files
    return db.query(EncryptedDocument).all()
