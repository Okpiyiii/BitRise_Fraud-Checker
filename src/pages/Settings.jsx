import React from 'react';
import Card from '../components/ui/Card';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { setUserLimit, resetSystem } from '../services/api';

import { User, Camera } from 'lucide-react';

const Settings = ({ isProtectionEnabled, setIsProtectionEnabled, user, setUser }) => {

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUser({ ...user, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="animate-fade-in-up max-w-3xl mx-auto space-y-6">

            {/* Account Settings */}
            <Card>
                <h3 className="text-[#1B2559] text-xl font-bold mb-6">Account Settings</h3>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden relative group">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <User size={40} />
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="text-white" size={24} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                            </label>
                        </div>
                        <p className="text-xs font-bold text-[#A3AED0]">Click to upload</p>
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 w-full space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#A3AED0] mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={user.name}
                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                    className="w-full bg-[#F4F7FE] rounded-xl px-4 py-3 text-sm font-bold text-[#1B2559] outline-none focus:ring-2 focus:ring-[#4318FF]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#A3AED0] mb-1">Role Title</label>
                                <input
                                    type="text"
                                    value={user.role}
                                    onChange={(e) => setUser({ ...user, role: e.target.value })}
                                    className="w-full bg-[#F4F7FE] rounded-xl px-4 py-3 text-sm font-bold text-[#1B2559] outline-none focus:ring-2 focus:ring-[#4318FF]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#A3AED0] mb-1">Email Address</label>
                            <input
                                type="email"
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                className="w-full bg-[#F4F7FE] rounded-xl px-4 py-3 text-sm font-bold text-[#1B2559] outline-none focus:ring-2 focus:ring-[#4318FF]"
                            />
                        </div>
                    </div>
                </div>
            </Card>
            <Card>
                <h3 className="text-[#1B2559] text-xl font-bold mb-6">Fraud Detection Preferences</h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F7FE]">
                        <div>
                            <p className="font-bold text-[#1B2559]">Real-time Engine</p>
                            <p className="text-xs font-medium text-[#A3AED0]">Scan transactions as they happen</p>
                        </div>
                        <ToggleSwitch enabled={isProtectionEnabled} setEnabled={setIsProtectionEnabled} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <p className="font-bold text-[#1B2559]">Sensitivity Level</p>
                            <span className="text-sm font-bold text-[#4318FF]">Medium</span>
                        </div>
                        <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4318FF]" />
                        <div className="flex justify-between text-xs font-bold text-[#A3AED0]">
                            <span>Low (Fewer Alerts)</span>
                            <span>High (Max Security)</span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-[#1B2559] text-xl font-bold mb-6">Custom User Limits</h3>
                <div className="space-y-4">
                    <p className="text-sm text-[#A3AED0] font-medium">Set a spending limit for a specific user. Transactions above this will be blocked.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="User ID (e.g., Debopam)"
                            id="limit-user-id"
                            className="bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1B2559] placeholder-[#A3AED0] focus:ring-2 focus:ring-[#4318FF] outline-none"
                        />
                        <input
                            type="number"
                            placeholder="Max Limit ($)"
                            id="limit-amount"
                            className="bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1B2559] placeholder-[#A3AED0] focus:ring-2 focus:ring-[#4318FF] outline-none"
                        />
                    </div>
                    <button
                        onClick={() => {
                            const user = document.getElementById('limit-user-id').value;
                            const limit = document.getElementById('limit-amount').value;
                            if (user && limit) {
                                setUserLimit(user, limit).then(() => alert('Limit Set!'));
                            }
                        }}
                        className="bg-[#4318FF] text-white w-full rounded-xl py-3 font-bold text-sm hover:bg-[#3311CC] transition-colors"
                    >
                        Save Limit
                    </button>
                </div>
            </Card>

            <Card>
                <h3 className="text-[#1B2559] text-xl font-bold mb-6">System Management</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-bold text-[#1B2559]">Reset Database</p>
                        <p className="text-xs font-medium text-[#A3AED0]">Clear all simulation memory and limits.</p>
                    </div>
                    <button
                        onClick={() => resetSystem().then(() => alert('System Reset!'))}
                        className="bg-[#FFF5F4] text-[#EE5D50] px-6 py-2 rounded-xl font-bold text-sm hover:bg-[#FFE5E5] transition-colors"
                    >
                        Reset System
                    </button>
                </div>
            </Card>

            <Card>
                <h3 className="text-[#1B2559] text-xl font-bold mb-6">Notification Channels</h3>
                <div className="space-y-4">
                    {['Push Notifications', 'Email Alerts', 'SMS Alerts'].map((label) => (
                        <div key={label} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-none">
                            <span className="font-bold text-[#1B2559] text-sm">{label}</span>
                            <ToggleSwitch enabled={true} setEnabled={() => { }} />
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Settings;
