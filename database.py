import sqlite3
import json
import os

DB_NAME = "fraud_guard.db"

def init_db():
    """Initialize the database with users and transactions tables."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Users Table: Added 'custom_limit' (Default -1 means No Limit)
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                 user_id TEXT PRIMARY KEY,
                 avg_amount REAL DEFAULT 0,
                 txn_count INTEGER DEFAULT 0,
                 safe_categories TEXT DEFAULT '[]',
                 custom_limit REAL DEFAULT -1 
                 )''')

    # Transactions Table: Stores history for audits
    c.execute('''CREATE TABLE IF NOT EXISTS transactions (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id TEXT,
                 amount REAL,
                 category TEXT,
                 timestamp DATETIME,
                 lat REAL,
                 long REAL,
                 device_id TEXT
                 )''')
    
    conn.commit()
    conn.close()

def reset_db():
    """Wipes the database for testing/demo purposes."""
    if os.path.exists(DB_NAME):
        os.remove(DB_NAME)
    init_db()

def get_user_profile(user_id):
    """Fetch user profile and custom limits."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE user_id=?", (user_id,))
    data = c.fetchone()
    conn.close()
    
    if data:
        return {
            "avg_amount": data[1],
            "txn_count": data[2],
            "safe_categories": json.loads(data[3]),
            "custom_limit": data[4] 
        }
    return None

def set_user_limit(user_id, limit):
    """Set a custom spending limit for a user."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Check if user exists; if not, create a placeholder profile
    c.execute("SELECT * FROM users WHERE user_id=?", (user_id,))
    if not c.fetchone():
        c.execute("INSERT INTO users (user_id, avg_amount, txn_count, safe_categories, custom_limit) VALUES (?, 0, 0, '[]', ?)", (user_id, limit))
    else:
        c.execute("UPDATE users SET custom_limit=? WHERE user_id=?", (limit, user_id))
    
    conn.commit()
    conn.close()

def update_user_profile(user_id, amount, category):
    """Update behavioral profile (Self-Learning)."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE user_id=?", (user_id,))
    row = c.fetchone()
    
    if row:
        new_count = row[2] + 1
        new_avg = ((row[1] * row[2]) + amount) / new_count
        cats = json.loads(row[3])
        if category not in cats:
            cats.append(category)
        c.execute("UPDATE users SET avg_amount=?, txn_count=?, safe_categories=? WHERE user_id=?", 
                  (new_avg, new_count, json.dumps(cats), user_id))
    else:
        # Create new user (Default limit -1)
        c.execute("INSERT INTO users (user_id, avg_amount, txn_count, safe_categories, custom_limit) VALUES (?, ?, 1, ?, -1)", 
                  (user_id, amount, json.dumps([category])))
    conn.commit()
    conn.close()

def get_last_transaction(user_id):
    """Get last transaction for velocity checks."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT * FROM transactions WHERE user_id=? ORDER BY timestamp DESC LIMIT 1", (user_id,))
    row = c.fetchone()
    conn.close()
    if row:
        return {"timestamp": row[4], "lat": row[5], "long": row[6]}
    return None

def log_transaction(txn_data):
    """Log transaction details."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO transactions (user_id, amount, category, timestamp, lat, long, device_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
              (txn_data.user_id, txn_data.amount, txn_data.category, txn_data.timestamp, txn_data.lat, txn_data.long, txn_data.device_id))
    conn.commit()
    conn.close()

def check_device_users(device_id):
    """Count unique users on a device (Fraud Ring Detection)."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT COUNT(DISTINCT user_id) FROM transactions WHERE device_id=?", (device_id,))
    count = c.fetchone()[0]
    conn.close()
    return count