import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import time

from app.main import app
from app.database import Base, get_db
from app.limiter import limiter


# Setup in-memory SQLite DB for testing isolates test states
TEST_DATABASE_URL = "sqlite:///./test_watchers.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Hook in test DB override in FastAPI dependencies
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db_and_limiter():
    # Setup fresh tables
    Base.metadata.create_all(bind=engine)
    
    # Reset in-memory rate limiter buckets
    limiter.buckets = {}
    
    yield
    
    # Teardown tables
    Base.metadata.drop_all(bind=engine)

def test_rate_limiter_blocks_abuse():
    # Payload details
    payload = {
        "name": "Test Terminal Alert Sensor",
        "type": "Facial Recognition",
        "location": "Sector 9 Test Ave",
        "description": "Camera test coverage unit",
        "zk_commitment": "d04b3a7e9b2c8a7e6f3c7a98d0001234"
    }

    # Capacity is set to 3.0 tokens. We should be able to send 3 requests in quick succession.
    # Request 1: Should be processed successfully
    response1 = client.post("/api/reports/", json=payload)
    assert response1.status_code == 201
    
    # Request 2: Should be processed successfully
    response2 = client.post("/api/reports/", json=payload)
    assert response2.status_code == 201

    # Request 3: Should be processed successfully
    response3 = client.post("/api/reports/", json=payload)
    assert response3.status_code == 201

    # Request 4: Should exceed capacity and trigger 429 Too Many Requests
    response4 = client.post("/api/reports/", json=payload)
    assert response4.status_code == 429
    assert "RATE LIMIT EXCEEDED" in response4.json()["message"]
