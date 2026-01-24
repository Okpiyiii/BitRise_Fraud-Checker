import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import ToggleSwitch from '../components/ui/ToggleSwitch';

const Header = ({ activeTab, setActiveTab, setSidebarOpen, isProtectionEnabled, setIsProtectionEnabled, transactions = [], setTransactionFilter }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Filter for alerts (Fraud transactions)
    const alerts = transactions.filter(t => t.status === 'Fraud').slice(0, 5);
    const hasUnread = alerts.length > 0;

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };

        if (isNotificationsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isNotificationsOpen]);

    return (
        <header className="px-6 py-4 flex justify-between items-center shrink-0 bg-[#F4F7FE]/90 backdrop-blur-sm z-30">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-[#1B2559] bg-white rounded-xl shadow-sm">
                    <Menu size={24} />
                </button>
                <div className="hidden md:flex flex-col">
                    <span className="text-xs font-bold text-[#A3AED0]">Pages / {activeTab}</span>
                    <h2 className="text-2xl font-bold text-[#1B2559]">{activeTab}</h2>
                </div>
            </div>

            <div className="bg-white p-2.5 rounded-[30px] shadow-[0px_10px_30px_rgba(112,144,176,0.1)] flex items-center gap-4 border border-white/50">
                <div className="hidden sm:flex items-center bg-[#F4F7FE] rounded-full px-4 py-2 w-48 transition-all focus-within:w-64 focus-within:ring-2 focus-within:ring-[#00AEEF]/20">
                    <Search size={16} className="text-[#1B2559]" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-xs ml-2 w-full text-[#1B2559] font-medium placeholder:text-[#A3AED0]"
                    />
                </div>

                <div className="flex items-center gap-3 px-2">
                    <ToggleSwitch enabled={isProtectionEnabled} setEnabled={setIsProtectionEnabled} />

                    {/* Notification Icon & Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <div
                            className="relative cursor-pointer"
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        >
                            <Bell size={20} className={`text-[#A3AED0] hover:text-[#4318FF] transition-colors ${isNotificationsOpen ? 'text-[#4318FF]' : ''}`} />
                            {hasUnread && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#EE5D50] border-2 border-white rounded-full"></span>
                            )}
                        </div>

                        {/* Dropdown Menu */}
                        {isNotificationsOpen && (
                            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-[0px_20px_40px_rgba(112,144,176,0.2)] border border-gray-100 py-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-5 pb-3 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-[#1B2559]">Notifications</h3>
                                    <span className="text-xs font-medium text-[#4318FF] cursor-pointer hover:underline">Mark all read</span>
                                </div>

                                <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                    {alerts.length > 0 ? (
                                        alerts.map((alert, index) => (
                                            <div key={index} className="px-5 py-3 hover:bg-gray-50 flex gap-3 cursor-pointer transition-colors border-b border-gray-50 last:border-none">
                                                <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#EE5D50]">
                                                    <AlertTriangle size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="text-sm font-bold text-[#1B2559]">Potential Fraud</h4>
                                                        <span className="text-[10px] text-[#A3AED0]">{alert.time}</span>
                                                    </div>
                                                    <p className="text-xs text-[#A3AED0] h-5 truncate mt-0.5">
                                                        Transaction of ${alert.amount.toLocaleString()} at {alert.merchant}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-5 py-8 text-center text-[#A3AED0]">
                                            <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No new notifications</p>
                                        </div>
                                    )}
                                </div>

                                <div className="px-5 pt-3 border-t border-gray-100">
                                    <button
                                        className="w-full py-2 text-xs font-bold text-white bg-[#4318FF] rounded-xl hover:bg-[#3311db] transition-colors"
                                        onClick={() => {
                                            setTransactionFilter('Alerts');
                                            setActiveTab('Transactions');
                                            setIsNotificationsOpen(false);
                                        }}
                                    >
                                        View All Alerts
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
