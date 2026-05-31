import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_PATH = os.getenv("DATABASE_URL", "sqlite:///./watchers.db")

engine = create_engine(DB_PATH, connect_args={"check_same_thread": False} if DB_PATH.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Models

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class SurveillanceSystem(Base):
    __tablename__ = "surveillance_systems"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    x = Column(Integer, nullable=False)
    y = Column(Integer, nullable=False)
    threat_score = Column(Integer, nullable=False)
    owner = Column(String, nullable=False)
    data_collected = Column(String, nullable=False)
    retention = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")
    access_requests = Column(String, nullable=False)
    location = Column(String, nullable=False)
    description = Column(String, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, index=True)
    timestamp = Column(String, nullable=False)
    agency = Column(String, nullable=False)
    target = Column(String, nullable=False)
    action = Column(String, nullable=False)
    status = Column(String, nullable=False)

class CitizenReport(Base):
    __tablename__ = "citizen_reports"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    location = Column(String, nullable=False)
    description = Column(String, nullable=False)
    zk_commitment = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    status = Column(String, default="PENDING")

class EncryptedDocument(Base):
    __tablename__ = "encrypted_documents"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    file_path = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    encrypted_hash = Column(String, nullable=False)
    uploaded_at = Column(String, nullable=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database initialization & seeding helper
def init_db():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Seed default admin user if not exists
        # default admin password is 'sovereign_citizen_2026'
        # Hashed password for 'sovereign_citizen_2026' using passlib bcrypt is:
        # '$2b$12$KkQcO1.jQ19T9tP/q6t4XOWfI5N66R.Z1xZq7V9u.pD9H8gP1442y' (will hardcode hash to avoid bcrypt slow calculation during startup)
        # Actually let's use passlib to generate it dynamically or seed a hardcoded bcrypt hash.
        # Hardcoded bcrypt hash is robust and fast.
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            import bcrypt
            salt = bcrypt.gensalt()
            hashed_pwd = bcrypt.hashpw("sovereign_citizen_2026".encode('utf-8'), salt).decode('utf-8')
            db.add(User(username="admin", hashed_password=hashed_pwd))
            db.commit()


        # Seed default surveillance systems if table is empty
        if db.query(SurveillanceSystem).count() == 0:
            systems = [
                SurveillanceSystem(
                    id='SYS-FR-701',
                    name='Sector 7 Bio-Metric Scanner',
                    type='Facial Recognition',
                    x=150,
                    y=180,
                    threat_score=10,
                    owner='Municipal Security Dept',
                    data_collected='Biometric face-templates, walking gait, thermal profile',
                    retention='30 Days',
                    status='ACTIVE',
                    access_requests='1,248 queries/hr',
                    location='District 7 Main Transit Hub',
                    description='Real-time AI camera analyzing pedestrian faces to match against federal databases.'
                ),
                SurveillanceSystem(
                    id='SYS-ALPR-402',
                    name='Highway 4 Transit Tracker',
                    type='ALPR',
                    x=340,
                    y=290,
                    threat_score=7,
                    owner='State Transit Bureau',
                    data_collected='License plate, vehicle profile, timestamp, speed',
                    retention='90 Days',
                    status='ACTIVE',
                    access_requests='450 queries/hr',
                    location='Highway 4 Interstate Interchange',
                    description='Automated License Plate Reader recording every vehicle entering and exiting city limits.'
                ),
                SurveillanceSystem(
                    id='SYS-CCTV-903',
                    name='Slums Sector 9 Junction Cam',
                    type='CCTV',
                    x=480,
                    y=120,
                    threat_score=4,
                    owner='CorpSec Private Patrol',
                    data_collected='Standard definition video feed',
                    retention='7 Days',
                    status='ACTIVE',
                    access_requests='12 queries/hr',
                    location='Sector 9 Industrial Corridor',
                    description='Corporation-owned street surveillance dome monitoring workers and residents.'
                ),
                SurveillanceSystem(
                    id='SYS-SR-101',
                    name='Govt Plaza IMSI Catcher',
                    type='Stingray',
                    x=220,
                    y=380,
                    threat_score=9,
                    owner='Federal Intelligence Agency',
                    data_collected='Mobile IMSI, IMEI, metadata, voice/SMS intercepts',
                    retention='Indefinite',
                    status='ACTIVE',
                    access_requests='3,120 queries/hr',
                    location='Federal Plaza Civic Center',
                    description='Cell site simulator intercepting local mobile traffic under the guise of municipal Wi-Fi.'
                ),
                SurveillanceSystem(
                    id='SYS-FR-102',
                    name='Sovereign Plaza Facial Tracker',
                    type='Facial Recognition',
                    x=280,
                    y=420,
                    threat_score=10,
                    owner='Municipal Security Dept',
                    data_collected='Biometric face-templates, gait tracking, group association profiles',
                    retention='30 Days',
                    status='ACTIVE',
                    access_requests='8,940 queries/hr',
                    location='Sovereign Shopping Galleria',
                    description='High-density crowd scanning terminal used for predictive threat profiling.'
                ),
                SurveillanceSystem(
                    id='SYS-CCTV-305',
                    name='District 3 Subway Camera 12',
                    type='CCTV',
                    x=600,
                    y=320,
                    threat_score=5,
                    owner='Transit Authority',
                    data_collected='HD Video feed, audio recording',
                    retention='14 Days',
                    status='ACTIVE',
                    access_requests='98 queries/hr',
                    location='District 3 Underground Station',
                    description='Stationary dome camera with audio collection capability monitoring train entry.'
                )
            ]
            db.bulk_save_objects(systems)
            db.commit()

        # Seed default audits if empty
        if db.query(AuditLog).count() == 0:
            audits = [
                AuditLog(id='AUD-001', timestamp='2026-05-31 16:01:22', agency='NSA-FEDERAL-GW', target='SYS-SR-101', action='Cellular Tower Dump Query', status='AUTHORIZED'),
                AuditLog(id='AUD-002', timestamp='2026-05-31 16:03:45', agency='CITY-POLICE-DEPT', target='SYS-FR-701', action='Biometric Match Scan', status='AUTHORIZED'),
                AuditLog(id='AUD-003', timestamp='2026-05-31 16:04:10', agency='CORPSEC-PRIVATE-UNIT', target='SYS-CCTV-903', action='Live Stream Feed Access', status='AUTHORIZED'),
                AuditLog(id='AUD-004', timestamp='2026-05-31 16:05:01', agency='INTERSTATE-INTEL-FED', target='SYS-FR-102', action='Predictive Riot Profiling Index', status='BYPASSED'),
                AuditLog(id='AUD-005', timestamp='2026-05-31 16:07:33', agency='TRANSIT-AUTHORITY', target='SYS-CCTV-305', action='Live Stream Feed Access', status='DENIED')
            ]
            db.bulk_save_objects(audits)
            db.commit()

    finally:
        db.close()
