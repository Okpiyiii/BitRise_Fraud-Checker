const API_BASE_URL = 'http://127.0.0.1:5000';

export const analyzeTransaction = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const setUserLimit = async (userId, limit) => {
    try {
        const response = await fetch(`${API_BASE_URL}/set_limit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, limit: parseFloat(limit) })
        });
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const resetSystem = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/reset_db`, {
            method: 'POST'
        });
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};
