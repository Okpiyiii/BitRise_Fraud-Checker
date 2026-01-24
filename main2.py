# ==========================================
# FRAUDGUARD AI: ENTERPRISE BACKEND
# ==========================================

from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import math
from datetime import datetime
import os
import database as db

# Initialize
db.init_db()
app = FastAPI(title="FraudGuard AI Enterprise", description="Dynamic Fraud Detection API")

# --- 1. SMART THRESHOLDS (Configurable) ---
LIMIT_FOOD_BOOKS = 500.0      # Cap for low-risk items
LIMIT_ATM = 1000.0            # Cap for ATM withdrawals
LIMIT_MEDICAL_HIGH = 5000.0   # Trigger for verification, not block

# System Configs
MAX_SPEED_KMH = 800.0           
FRAUD_RING_LIMIT = 2            
Z_SCORE_THRESHOLD = 3.0         
MIN_LEARNING_TXNS = 3           

CIRCADIAN_START_HOUR = 1        
CIRCADIAN_END_HOUR = 4          
CIRCADIAN_MIN_AMOUNT = 1000.0   

# --- POINTS SYSTEM ---
SCORE_CRITICAL = 50             # Instant Block
SCORE_HIGH = 30                 
SCORE_MEDIUM = 20               

HIGH_RISK_THRESHOLD = 50        

# Load Models
model = None
scaler = None
if os.path.exists('fraud_model.pkl') and os.path.exists('scaler.pkl'):
    try:
        model = joblib.load('fraud_model.pkl')
        scaler = joblib.load('scaler.pkl')
    except: pass

class Transaction(BaseModel):
    user_id: str
    amount: float
    category: str
    timestamp: str
    lat: float
    long: float
    device_id: str
    v_features: list[float]

class UserLimit(BaseModel):
    user_id: str
    limit: float

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@app.post("/reset_db")
def system_reset():
    db.reset_db()
    return {"status": "Reset Successful"}

# --- NEW ENDPOINT: SET USER LIMIT ---
@app.post("/set_limit")
def set_limit(data: UserLimit):
    db.set_user_limit(data.user_id, data.limit)
    return {"status": "Limit Updated", "new_limit": data.limit}

@app.post("/predict")
async def predict_fraud(txn: Transaction):
    risk_score = 0
    reasons = []
    status = "GENUINE"
    
    current_time = datetime.strptime(txn.timestamp, "%Y-%m-%d %H:%M:%S")
    profile = db.get_user_profile(txn.user_id)

    # --- 0. CHECK USER DEFINED LIMIT (HIGHEST PRIORITY) ---
    if profile and profile['custom_limit'] > 0:
        if txn.amount > profile['custom_limit']:
            risk_score += SCORE_CRITICAL
            reasons.append(f"⛔ User Limit Exceeded: Limit is ${int(profile['custom_limit'])}, tried ${txn.amount}")
            status = "FRAUD" # Override everything

    # Proceed only if not already blocked by user limit
    if status != "FRAUD":

        # --- 1. SMART CATEGORY LOGIC ---
        # Case A: Medical (Verification, not Block)
        if txn.category.lower() == "medical":
            if txn.amount > LIMIT_MEDICAL_HIGH: 
                status = "VERIFY_REQUIRED"
                reasons.append(f"⚠️ High Value Medical: ${txn.amount}. OTP Verification Sent.")
        
        # Case B: ATM (Strict Limits)
        elif txn.category.lower() == "atm":
            if txn.amount > LIMIT_ATM:
                risk_score += SCORE_CRITICAL
                reasons.append(f"🏧 ATM Limit Exceeded: ${txn.amount}")

        # Case C: Low Risk (Food/Books - Lenient)
        elif txn.category.lower() in ["food", "books", "utilities"]:
            if txn.amount > LIMIT_FOOD_BOOKS:
                risk_score += SCORE_CRITICAL
                reasons.append(f"🍔 Suspiciously High Food/Bill: ${txn.amount}")
        
        # Case D: High Risk (Jewelry/Electronics - Strict on New)
        else:
            if profile and txn.category not in profile['safe_categories']:
                risk_score += SCORE_MEDIUM
                reasons.append(f"🎭 Unusual Category: First time '{txn.category}'")

        # --- 2. FRAUD RING ---
        previous_users_count = db.check_device_users(txn.device_id)
        if previous_users_count >= FRAUD_RING_LIMIT:
            risk_score += SCORE_CRITICAL
            reasons.append(f"🕸️ Fraud Ring: Device used by {previous_users_count} users")

        # --- 3. IMPOSSIBLE TRAVEL ---
        last_txn = db.get_last_transaction(txn.user_id)
        if last_txn:
            try:
                last_time = datetime.strptime(last_txn['timestamp'], "%Y-%m-%d %H:%M:%S")
                time_diff = (current_time - last_time).total_seconds() / 3600
                if time_diff > 0:
                    dist = calculate_distance(last_txn['lat'], last_txn['long'], txn.lat, txn.long)
                    speed = dist / time_diff
                    if speed > MAX_SPEED_KMH:
                        risk_score += SCORE_CRITICAL
                        reasons.append(f"🚀 Impossible Travel: {int(speed)} km/hr")
            except: pass

        # --- 4. Z-SCORE (If not verifying) ---
        if status != "VERIFY_REQUIRED" and profile and profile['txn_count'] >= MIN_LEARNING_TXNS:
            avg = profile['avg_amount']
            if avg > 0 and txn.amount > (avg * Z_SCORE_THRESHOLD):
                risk_score += SCORE_HIGH
                reasons.append(f"📈 Abnormal Spending: ${txn.amount} (Avg: ${int(avg)})")

        # --- 5. CIRCADIAN RHYTHM ---
        hour = current_time.hour
        if CIRCADIAN_START_HOUR <= hour <= CIRCADIAN_END_HOUR:
            if txn.amount > CIRCADIAN_MIN_AMOUNT:
                risk_score += SCORE_CRITICAL
                reasons.append(f"🌙 Circadian Anomaly: High value at {hour}:00")

    # --- FINAL VERDICT ---
    if status == "GENUINE": 
        if risk_score >= HIGH_RISK_THRESHOLD:
            status = "FRAUD"
    elif status == "VERIFY_REQUIRED":
        # Block anyway if the risk is CRITICAL (e.g. Fraud Ring + Medical = Fraud)
        if risk_score >= SCORE_CRITICAL: 
            status = "FRAUD"

    db.log_transaction(txn)
    if status == "GENUINE":
        db.update_user_profile(txn.user_id, txn.amount, txn.category)

    return {
        "status": status,
        "risk_score": min(risk_score, 100),
        "details": {
            "reasons": reasons,
            "debug_device_count": db.check_device_users(txn.device_id),
            "user_stats": profile if profile else {}
        }
    }