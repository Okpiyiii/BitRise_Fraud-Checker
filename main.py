# ==========================================
# FRAUDGUARD AI: ENTERPRISE BACKEND
# Author: Debopam (Terminator)
# ==========================================

from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import math
from datetime import datetime
import os
import database as db

# 1. INITIALIZE SYSTEM
db.init_db()
app = FastAPI(title="FraudGuard AI Enterprise", description="Dynamic Fraud Detection API")

# --- 2. SYSTEM CONFIGURATION (CONSTANTS) ---
# Change these values here to tune the system. No hardcoded logic below.
MAX_SPEED_KMH = 800.0           # Speed of a commercial plane
FRAUD_RING_LIMIT = 2            # Max users allowed per device
Z_SCORE_THRESHOLD = 3.0         # Statistical deviation limit
MIN_LEARNING_TXNS = 3           # Minimum txns to build a profile
CIRCADIAN_START_HOUR = 1        # 1 AM
CIRCADIAN_END_HOUR = 4          # 4 AM
CIRCADIAN_MIN_AMOUNT = 1000.0   # Minimum amount to flag during ghost hours
AI_CONFIDENCE_THRESHOLD = 0.7   # Model probability threshold (70%)
HIGH_RISK_SCORE = 50            # Score required to mark as FRAUD

# 3. LOAD AI MODELS
model = None
scaler = None
if os.path.exists('fraud_model.pkl') and os.path.exists('scaler.pkl'):
    try:
        model = joblib.load('fraud_model.pkl')
        scaler = joblib.load('scaler.pkl')
        print("✅ AI Models Loaded Successfully.")
    except Exception as e:
        print(f"❌ Model Load Error: {e}")

# 4. DATA SCHEMA
class Transaction(BaseModel):
    user_id: str
    amount: float
    category: str
    timestamp: str
    lat: float
    long: float
    device_id: str
    v_features: list[float]

# 5. HELPER: HAVERSINE DISTANCE
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# --- 6. RESET ENDPOINT (FOR DASHBOARD BUTTON) ---
@app.post("/reset_db")
def system_reset():
    db.reset_db()
    return {"status": "Database Reset Successful", "message": "System memory wiped."}

# --- 7. MAIN PREDICTION ENGINE ---
@app.post("/predict")
async def predict_fraud(txn: Transaction):
    risk_score = 0
    reasons = []
    
    current_time = datetime.strptime(txn.timestamp, "%Y-%m-%d %H:%M:%S")

    # --- LOGIC A: FRAUD RING (DEVICE GRAPH) ---
    previous_users_count = db.check_device_users(txn.device_id)
    if previous_users_count >= FRAUD_RING_LIMIT:
        risk_score += 50
        reasons.append(f"🕸️ Fraud Ring Alert: Device associated with {previous_users_count} different users.")

    # --- LOGIC B: IMPOSSIBLE TRAVEL (PHYSICS) ---
    last_txn = db.get_last_transaction(txn.user_id)
    if last_txn:
        try:
            last_time = datetime.strptime(last_txn['timestamp'], "%Y-%m-%d %H:%M:%S")
            time_diff = (current_time - last_time).total_seconds() / 3600 # Hours
            
            if time_diff > 0:
                dist = calculate_distance(last_txn['lat'], last_txn['long'], txn.lat, txn.long)
                speed = dist / time_diff
                if speed > MAX_SPEED_KMH:
                    risk_score += 50
                    reasons.append(f"🚀 Impossible Travel: Moving at {int(speed)} km/hr")
        except:
            pass

    # --- LOGIC C: BEHAVIORAL ANOMALY (Z-SCORE) ---
    profile = db.get_user_profile(txn.user_id)
    if profile and profile['txn_count'] >= MIN_LEARNING_TXNS:
        avg = profile['avg_amount']
        # Dynamic Check: Amount > Average * Threshold
        if avg > 0 and txn.amount > (avg * Z_SCORE_THRESHOLD):
            risk_score += 30
            reasons.append(f"📈 Abnormal Spending: ${txn.amount} (Avg: ${int(avg)})")

    # --- LOGIC D: CIRCADIAN RHYTHM (TIME CHECK) ---
    hour = current_time.hour
    # Dynamic Check: Is it between Start(1) and End(4) AND Amount > Min(1000)?
    if CIRCADIAN_START_HOUR <= hour <= CIRCADIAN_END_HOUR:
        if txn.amount > CIRCADIAN_MIN_AMOUNT:
            risk_score += 50     #20
            reasons.append(f"🌙 Circadian Anomaly: High value transaction at {hour}:00 hours")

    # --- LOGIC E: AI MODEL ---
    if model:
        try:
            scaled_amount = scaler.transform([[txn.amount]])
            features = np.array(txn.v_features + [scaled_amount[0][0]]).reshape(1, -1)
            prob = model.predict_proba(features)[0][1]
            if prob > AI_CONFIDENCE_THRESHOLD:
                risk_score += 35
                reasons.append(f"🤖 AI Model Confidence: {int(prob*100)}%")
        except:
            pass

    # --- FINAL VERDICT ---
    status = "GENUINE"
    if risk_score >= HIGH_RISK_SCORE:
        status = "FRAUD"

    # --- LOGGING & LEARNING ---
    db.log_transaction(txn)
    # Only update profile if transaction is GENUINE (Don't learn from fraud)
    if status == "GENUINE":
        db.update_user_profile(txn.user_id, txn.amount, txn.category)

    return {
        "status": status,
        "risk_score": min(risk_score, 100),
        "details": {
            "reasons": reasons,
            "debug_device_count": previous_users_count,
            "user_stats": profile if profile else {}
        }
    }