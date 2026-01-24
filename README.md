# 🛡️ FraudGuard AI Enterprise: Next-Gen Financial Security

> **Live Demo:** An Intelligent, Self-Learning Fraud Detection System capable of detecting Fraud Rings, Impossible Travel, and Behavioral Anomalies in Real-Time.

![Dashboard Preview](https://via.placeholder.com/800x400?text=FraudGuard+AI+Dashboard+Preview) 
*(Replace this link with a real screenshot of your Dashboard later)*

## 🚀 Key Innovations (Why this wins?)
Unlike static banking systems, **FraudGuard AI** uses "Smart Context" to reduce false alarms while catching sophisticated attacks.

### 1. 🧠 Smart Context Logic
* **🏥 Medical Emergency Mode:** High-value transactions at hospitals are **NOT blocked**. instead, they trigger a **"Verify Identity" (Yellow)** alert with OTP, preventing service denial during emergencies.
* **🍔 Lifestyle Tiers:** Differentiates between low-risk (Food/Books) and high-risk (Jewelry/Gambling) spending. Buying a $50 book is safe; buying $5000 jewelry for the first time is suspicious.
* **🏧 ATM Velocity Check:** Instantly flags high-value ATM withdrawals that exceed the user's safety limits.

### 2. 🕸️ Fraud Ring Visualization (Graph Forensics)
* **Digital Gang Detection:** If multiple users access the same Device ID, the system visualizes the connection as a **Network Graph**, identifying the device as a "Scam Hub."

### 3. ⚙️ User-Defined Security
* **Custom Limits:** Users can set their own "Max Spending Limit" via the dashboard. Any transaction exceeding this is **Auto-Blocked**, overriding all other rules.

### 4. 🌍 Geospatial & Physics Analysis
* **Impossible Travel:** Calculates the velocity between two transactions. If a user moves from Kolkata to London in 30 minutes (>800 km/hr), the system flags it as physical impossibility.

---

## 🛠️ Tech Stack
* **Frontend:** Streamlit (Python) - Interactive Command Center with Live Maps & Graphs.
* **Backend:** FastAPI - High-performance Async API.
* **Visualization:** Streamlit-Agraph & PyDeck - For interactive Network Graphs and Geospatial Mapping.
* **Database:** SQLite - Lightweight, persistent storage for behavioral profiles.
* **ML Core:** Scikit-Learn (Random Forest) + Statistical Z-Score.

---

## 📸 Feature Showcase

### 1. The "Investigation Report"
Automated generation of **SAR (Suspicious Activity Reports)** for banking analysts, explaining *why* a transaction was blocked.

### 2. Real-Time Debugging
Live telemetry showing exactly what the system "learned" about the user (e.g., *"Average Spend: $50, Current: $5000 -> 100x Deviation"*).

---

## ⚙️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/YourUsername/FraudGuard-AI-Enterprise.git](https://github.com/YourUsername/FraudGuard-AI-Enterprise.git)
    cd FraudGuard-AI-Enterprise
    ```

2.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the System**
    * **Backend (Brain):**
        ```bash
        uvicorn main:app --reload
        ```
    * **Frontend (Dashboard):**
        ```bash
        streamlit run dashboard.py
        ```

---

## 🧪 How to Test (Demo Scenarios)

| Test Case | Inputs to Try | Expected Result |
| :--- | :--- | :--- |
| **Fraud Ring** | User A, B, & C on `Device_X` | ⛔ **FRAUD** (Red) |
| **Medical Emergency** | Category: `Medical`, Amount: `$10,000` | ⚠️ **VERIFY** (Yellow) |
| **Custom Limit** | Set Limit `$200`, Spend `$300` | ⛔ **FRAUD** (User Limit Exceeded) |
| **Ghost Hours** | Time: `03:00:00`, Amount: `$5000` | ⛔ **FRAUD** (Circadian Anomaly) |

---
*Built for [Hackathon Name] by Debopam.*