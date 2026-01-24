import React, { useState } from 'react';
import { analyzeTransaction } from '../../services/api';

const SimulationForm = ({ onResult }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        user_id: 'User1',
        device_id: 'Device_A',
        amount: 500,
        category: 'Food',
        location: '40.71, -74.00', // NYC Default
        time: new Date().toISOString().slice(0, 16)
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Split location
            const [lat, long] = formData.location.split(',').map(s => parseFloat(s.trim()));

            const payload = {
                user_id: formData.user_id,
                device_id: formData.device_id,
                amount: parseFloat(formData.amount),
                category: formData.category,
                lat: lat || 0,
                long: long || 0,
                time: formData.time
            };

            const result = await analyzeTransaction(payload);
            onResult(result);
        } catch (error) {
            alert('Simulation Failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-[#A3AED0] mb-1">User ID</label>
                    <input
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleChange}
                        className="w-full bg-[#F4F7FE] rounded-lg px-4 py-3 text-sm font-bold text-[#1B2559] outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#A3AED0] mb-1">Device ID</label>
                    <input
                        name="device_id"
                        value={formData.device_id}
                        onChange={handleChange}
                        className="w-full bg-[#F4F7FE] rounded-lg px-4 py-3 text-sm font-bold text-[#1B2559] outline-none"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-[#A3AED0] mb-1">Amount ($)</label>
                    <input
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        className="w-full bg-[#F4F7FE] rounded-lg px-4 py-3 text-sm font-bold text-[#1B2559] outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#A3AED0] mb-1">Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-[#F4F7FE] rounded-lg px-4 py-3 text-sm font-bold text-[#1B2559] outline-none"
                    >
                        {['Food', 'Travel', 'Jewelry', 'Electronics', 'Medical', 'ATM'].map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-[#A3AED0] mb-1">Location (Lat, Long)</label>
                    <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="40.71, -74.00"
                        className="w-full bg-[#F4F7FE] rounded-lg px-4 py-3 text-sm font-bold text-[#1B2559] outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#A3AED0] mb-1">Time</label>
                    <input
                        name="time"
                        type="datetime-local"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full bg-[#F4F7FE] rounded-lg px-4 py-3 text-sm font-bold text-[#1B2559] outline-none"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-6 rounded-xl bg-[#4318FF] text-white font-bold text-lg hover:bg-[#3311CC] transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-70"
            >
                {loading ? 'Analyzing...' : 'Analyze Transaction'}
            </button>
        </form>
    );
};

export default SimulationForm;
