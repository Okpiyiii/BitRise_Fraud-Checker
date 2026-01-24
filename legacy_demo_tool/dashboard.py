import streamlit as st
import requests
import pandas as pd
from datetime import datetime
# NEW LIBRARY: Pure Python Graphing
from streamlit_agraph import agraph, Node, Edge, Config

# PAGE CONFIG
st.set_page_config(page_title="FraudGuard AI Enterprise Control", layout="wide", page_icon="🛡️")
st.title("🛡️ FraudGuard AI: Enterprise Command Center")

# --- 1. SIDEBAR: SYSTEM CONTROLS ---
st.sidebar.title("System Controls")
if st.sidebar.button("⚠️ RESET SYSTEM DATABASE"):
    try:
        requests.post("http://127.0.0.1:8000/reset_db")
        st.sidebar.success("Database Wiped. Memory Reset.")
        if 'frozen_time' in st.session_state: del st.session_state['frozen_time']
    except:
        st.sidebar.error("Backend Offline")

st.sidebar.markdown("---")

# --- 2. SIDEBAR: USER SETTINGS (CUSTOM LIMIT) ---
st.sidebar.header("⚙️ Card Configuration")
if 'user_limit_val' not in st.session_state: st.session_state.user_limit_val = 5000.0

user_id = st.sidebar.text_input("User ID", value="User_A", help="User Identity")
custom_limit = st.sidebar.number_input("Set Max Spending Limit ($)", value=st.session_state.user_limit_val, step=500.0)

if st.sidebar.button("💾 Update Limit"):
    try:
        requests.post("http://127.0.0.1:8000/set_limit", json={"user_id": user_id, "limit": custom_limit})
        st.sidebar.success(f"Limit set to ${custom_limit} for {user_id}")
        st.session_state.user_limit_val = custom_limit
    except:
        st.sidebar.error("Failed to update limit")

st.sidebar.markdown("---")

# --- 3. SIDEBAR: TRANSACTION INPUTS ---
st.sidebar.header("💳 Transaction Sim")

device_id = st.sidebar.text_input("Device ID", value="Device_X", help="Shared device ID for Fraud Ring")
amount = st.sidebar.number_input("Amount ($)", value=100.0, step=10.0)

category = st.sidebar.selectbox(
    "Category", 
    ("food", "travel", "jewelry", "electronics", "medical", "gambling", "atm", "books", "utilities")
)

st.sidebar.header("📍 Geolocation")
location_preset = st.sidebar.selectbox("Quick Select", ("Kolkata", "Mumbai", "London", "New York", "Tokyo"))
loc_map = {"Kolkata": (22.5726, 88.3639), "Mumbai": (19.0760, 72.8777), "London": (51.5074, -0.1278), "New York": (40.7128, -74.0060), "Tokyo": (35.6762, 139.6503)}
lat_val, lon_val = loc_map[location_preset]
lat = st.sidebar.number_input("Latitude", value=lat_val, format="%.4f")
long = st.sidebar.number_input("Longitude", value=lon_val, format="%.4f")

# Time Logic
if 'frozen_time' not in st.session_state: st.session_state.frozen_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
timestamp = st.sidebar.text_input("Timestamp (YYYY-MM-DD HH:MM:SS)", key="frozen_time")

# --- 4. MAIN ACTION ---
if st.sidebar.button("🚀 ANALYZE TRANSACTION"):
    
    payload = {
        "user_id": user_id, "amount": amount, "category": category, 
        "timestamp": timestamp, "lat": lat, "long": long, 
        "device_id": device_id, "v_features": [0.1]*28
    }

    try:
        response = requests.post("http://127.0.0.1:8000/predict", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            status = data['status']
            score = data['risk_score']
            reasons = data['details']['reasons']
            device_count = data['details'].get('debug_device_count', 0)
            user_stats = data['details'].get('user_stats', {})
            avg_spend = user_stats.get('avg_amount', 0)
            txn_count = user_stats.get('txn_count', 0)
            
            # --- LAYOUT ---
            col1, col2 = st.columns([2, 1])
            
            with col1:
                # TABS
                tab1, tab2, tab3 = st.tabs(["📍 Map", "🕸️ Interactive Graph", "📝 Report"])
                
                with tab1:
                    st.map(pd.DataFrame({'lat': [lat], 'lon': [long]}), zoom=4)

                with tab2:
                    st.subheader("Network Graph Analysis")
                    # --- NEW AGARPH LOGIC (No Graphviz needed) ---
                    nodes = []
                    edges = []
                    
                    # 1. Device Node
                    device_color = "#FF4B4B" if status == "FRAUD" else "#FFA726" if status == "VERIFY_REQUIRED" else "#00CC96"
                    nodes.append(Node(id=device_id, label=f"Device\n{device_id}", size=25, shape="diamond", color=device_color))
                    
                    # 2. Current User Node
                    nodes.append(Node(id=user_id, label=f"User\n{user_id}", size=20, shape="dot", color="#636EFA"))
                    edges.append(Edge(source=user_id, target=device_id, label="Active", color="black"))
                    
                    # 3. History Ghost Nodes
                    if device_count > 0:
                        for i in range(device_count):
                            ghost_id = f"History_{i}"
                            nodes.append(Node(id=ghost_id, label="Prev User", size=15, shape="dot", color="#d3d3d3"))
                            edges.append(Edge(source=ghost_id, target=device_id, label="Log", type="CURVE_SMOOTH", color="#d3d3d3"))

                    config = Config(width=500, height=300, directed=True, nodeHighlightBehavior=True, highlightColor="#F7A7A6")
                    
                    # Render Graph
                    agraph(nodes=nodes, edges=edges, config=config)

                with tab3:
                    st.subheader("Automated Report")
                    st.markdown(f"**Status:** {status}")
                    st.markdown(f"**Reasons:**")
                    for r in reasons: st.markdown(f"- {r}")

            with col2:
                st.subheader("🤖 AI Verdict")
                
                if status == "FRAUD":
                    st.error("⛔ FRAUD DETECTED")
                    st.metric("Risk Score", f"{score}/100", delta="-CRITICAL")
                elif status == "VERIFY_REQUIRED":
                    st.warning("⚠️ VERIFY IDENTITY")
                    st.metric("Risk Score", f"{score}/100", delta="off")
                    st.info("Medical limit exceeded. Check OTP.")
                else:
                    st.success("✅ SECURE")
                    st.metric("Risk Score", f"{score}/100", delta="SAFE")

                st.markdown("---")
                st.caption("📊 **Spending Behavior**")
                
                if amount > (avg_spend * 3) and avg_spend > 0:
                    delta_color = "inverse"
                else:
                    delta_color = "normal"

                c1, c2 = st.columns(2)
                with c1: st.metric("This Txn", f"${amount}")
                with c2: st.metric("Avg Spend", f"${int(avg_spend)}", delta=f"{txn_count} Txns")
                
                if avg_spend > 0:
                    deviation = amount / avg_spend
                    if deviation > 3.0:
                        st.error(f"⚠️ Spending is {int(deviation)}x higher than average!")
                    
        else:
            st.error("Server Error")

    except Exception as e:
        st.error(f"Connection Error: {e}")