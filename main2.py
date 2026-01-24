# ==========================================
# FRAUDGUARD AI: BACKEND FOR REACT FRONTEND
# ==========================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import math
from datetime import datetime
import os
import database as db

# INITIALIZE
db.init_db()
app = FastAPI(title="FraudGuard AI API", description="Backend for React Dashboard")

# --- 1. ENABLE CORS (Allow React to talk to Python) ---
origins = ["*"] # Allow all for Hackathon

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SMART CONFIGS ---
LIMIT_FOOD_BOOKS = 500.0      
LIMIT_ATM = 1000.0            
LIMIT_MEDICAL_HIGH = 5000.0   

# System Configs
MAX_SPEED_KMH = 800.0           
Z_SCORE_THRESHOLD = 3.0         
MIN_LEARNING_TXNS = 3           

CIRCADIAN_START_HOUR = 1        
CIRCADIAN_END_HOUR = 4          
CIRCADIAN_MIN_AMOUNT = 1000.0   

# Risk Scores
SCORE_CRITICAL = 50             
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

# --- DATA MODELS ---
class Transaction(BaseModel):
    user_id: str
    amount: float
    category: str
    timestamp: str
    lat: float
    long: float
    device_id: str
    v_features: list[float] = []

class UserLimit(BaseModel):
    user_id: str
    limit: float

# --- HELPERS ---
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# --- ENDPOINTS ---

@app.post("/reset_db")
def system_reset():
    db.reset_db()
    return {"status": "success", "message": "System memory wiped."}

@app.post("/set_limit")
def set_limit(data: UserLimit):
    db.set_user_limit(data.user_id, data.limit)
    return {"status": "success", "new_limit": data.limit}

@app.post("/predict")
async def predict_fraud(txn: Transaction):
    risk_score = 0
    reasons = []
    status = "GENUINE"
    
    current_time = datetime.strptime(txn.timestamp, "%Y-%m-%d %H:%M:%S")
    profile = db.get_user_profile(txn.user_id)

    # --- 1. CHECK USER CUSTOM LIMIT (FIXED LOGIC) ---
    if profile and profile['custom_limit'] > 0:
        # LOGIC FIX: Block only if amount > limit AND category is NOT medical
        if txn.amount > profile['custom_limit'] and txn.category.lower() != "medical":
            risk_score += SCORE_CRITICAL
            reasons.append(f"⛔ Limit Exceeded: User set limit ${int(profile['custom_limit'])}")
            status = "FRAUD"

    if status != "FRAUD":
        # --- 2. SMART CATEGORY LOGIC ---
        if txn.category.lower() == "medical":
            # Medical Verify logic runs here because we skipped the Block above
            if txn.amount > LIMIT_MEDICAL_HIGH: 
                status = "VERIFY_REQUIRED"
                reasons.append("⚠️ High Value Medical. OTP Sent.")
        
        elif txn.category.lower() == "atm":
            if txn.amount > LIMIT_ATM:
                risk_score += SCORE_CRITICAL
                reasons.append(f"🏧 ATM Limit Exceeded")

        elif txn.category.lower() in ["food", "books", "utilities"]:
            if txn.amount > LIMIT_FOOD_BOOKS:
                risk_score += SCORE_CRITICAL
                reasons.append(f"🍔 Suspiciously High Bill")
        
        else:
            if profile and txn.category not in profile['safe_categories']:
                risk_score += SCORE_MEDIUM
                reasons.append(f"🎭 New Category: {txn.category}")

        # --- 3. FRAUD RING (FIXED LOGIC) ---
        # Get list of ALL users who used this device before
        existing_users = db.get_device_users(txn.device_id)
        
        # If device has history AND current user is NOT one of them -> Instant Fraud
        if existing_users and txn.user_id not in existing_users:
            risk_score += SCORE_CRITICAL
            reasons.append(f"🕸️ Fraud Ring: Device previously owned by {existing_users[0]}")

        # --- 4. IMPOSSIBLE TRAVEL ---
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

        # --- 5. Z-SCORE ---
        if status != "VERIFY_REQUIRED" and profile and profile['txn_count'] >= MIN_LEARNING_TXNS:
            avg = profile['avg_amount']
            if avg > 0 and txn.amount > (avg * Z_SCORE_THRESHOLD):
                risk_score += SCORE_HIGH
                reasons.append(f"📈 Abnormal Spending (Avg: ${int(avg)})")

        # --- 6. CIRCADIAN RHYTHM ---
        hour = current_time.hour
        if CIRCADIAN_START_HOUR <= hour <= CIRCADIAN_END_HOUR:
            if txn.amount > CIRCADIAN_MIN_AMOUNT:
                risk_score += SCORE_CRITICAL
                reasons.append(f"🌙 Ghost Hour Transaction ({hour}:00)")

    # --- FINAL VERDICT ---
    if status == "GENUINE" and risk_score >= HIGH_RISK_THRESHOLD:
        status = "FRAUD"
    elif status == "VERIFY_REQUIRED" and risk_score >= SCORE_CRITICAL:
        status = "FRAUD"

    # LOGGING
    db.log_transaction(txn)
    if status == "GENUINE":
        db.update_user_profile(txn.user_id, txn.amount, txn.category)

    # --- 7. GENERATE JSON GRAPH DATA ---
    graph_nodes = []
    graph_links = []
    
    # 1. Current User Node
    graph_nodes.append({"id": txn.user_id, "group": "user", "status": status})
    # 2. Current Device Node
    graph_nodes.append({"id": txn.device_id, "group": "device", "status": "flagged" if status == "FRAUD" else "safe"})
    # Link
    graph_links.append({"source": txn.user_id, "target": txn.device_id, "type": "active"})

    # 3. Ghost Nodes (History)
    if existing_users:
        for prev_user in existing_users:
            if prev_user != txn.user_id:
                graph_nodes.append({"id": prev_user, "group": "history", "status": "unknown"})
                graph_links.append({"source": prev_user, "target": txn.device_id, "type": "history"})

    return {
        "status": status,
        "risk_score": min(risk_score, 100),
        "details": {
            "reasons": reasons,
            "debug_device_count": len(existing_users) + (1 if txn.user_id not in existing_users else 0),
            "user_stats": profile if profile else {}
        },
        "graph_data": {
            "nodes": graph_nodes,
            "links": graph_links
        }
    }