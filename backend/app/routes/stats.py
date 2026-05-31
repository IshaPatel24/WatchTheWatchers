import random
import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db, SurveillanceSystem

router = APIRouter(prefix="/stats", tags=["Differential Privacy Statistics"])

def draw_laplace(mean: float, scale: float) -> float:
    # Generates Laplace noise natively: Lap(mean, scale)
    # Uses Inverse Transform Sampling on U(-0.5, 0.5)
    u = random.random() - 0.5
    sgn = 1.0 if u >= 0 else -1.0
    return mean - scale * sgn * math.log(1.0 - 2.0 * abs(u))

@router.get("/summary")
def get_privacy_preserving_stats(
    epsilon: float = Query(0.5, gt=0.0, le=5.0, description="Privacy budget parameter (epsilon)"),
    db: Session = Depends(get_db)
):
    """
    Returns surveillance camera counts grouped by type with Laplace noise added.
    This demonstrates Differential Privacy (DP), shielding the exact count of cameras
    while giving aggregate statistics that reflect the true distribution.
    """
    # Fetch real counts from the database
    types = ["Facial Recognition", "Stingray", "ALPR", "CCTV"]
    results = {}
    
    # Sensitivity (L1 sensitivity of counting query is exactly 1)
    sensitivity = 1.0
    scale = sensitivity / epsilon

    for t in types:
        true_count = db.query(SurveillanceSystem).filter(SurveillanceSystem.type == t).count()
        
        # Draw noise from Laplace distribution centered at 0 with scale
        # scale = sensitivity / epsilon
        # PDF: f(x) = (1 / 2*scale) * e^(-|x|/scale)
        noise = draw_laplace(0.0, scale)
        
        # Ensure count doesn't fall below zero
        dp_count = max(0, int(round(true_count + noise)))

        
        results[t] = {
            "true_count": true_count,
            "dp_count": dp_count,
            "noise_added": float(round(noise, 3)),
            "epsilon": epsilon
        }

    # Add general statistics
    total_true = sum(r["true_count"] for r in results.values())
    total_dp = sum(r["dp_count"] for r in results.values())
    
    return {
        "metrics": results,
        "summary": {
            "total_true_count": total_true,
            "total_dp_count": total_dp,
            "global_epsilon": epsilon,
            "dp_level_rating": "HIGH PRIVACY" if epsilon <= 0.5 else "BALANCED" if epsilon <= 2.0 else "LOW PRIVACY"
        }
    }
