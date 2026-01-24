import React from 'react';
import { LayoutDashboard, Receipt, Settings, User, LogOut, FileText, PieChart, HelpCircle } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setSidebarOpen, isProtectionEnabled, user }) => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Transactions', icon: Receipt },
        { name: 'Settings', icon: Settings },
    ];

    return (
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col border-r border-slate-100`}>
            {/* Logo Area */}
            <div className="p-8 pb-8 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00AEEF] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <span className="font-extrabold text-lg text-white">F</span>
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#1B2559]">Fraud<span className="text-[#00AEEF]">Guard</span></h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => {
                            setActiveTab(item.name);
                            setSidebarOpen(false);
                        }}
                        className={`flex items-center gap-4 w-full px-5 py-3.5 rounded-[12px] transition-all duration-200 font-medium text-sm group relative ${activeTab === item.name
                            ? 'text-[#00AEEF] bg-[#F4F7FE]'
                            : 'text-[#A3AED0] hover:text-[#1B2559] hover:bg-slate-50'
                            }`}
                    >
                        {activeTab === item.name && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#00AEEF] rounded-r-full"></div>
                        )}
                        <item.icon size={20} className={activeTab === item.name ? 'text-[#00AEEF]' : 'text-[#A3AED0] group-hover:text-[#1B2559] transition-colors'} />
                        {item.name}
                    </button>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 space-y-2 px-6 pb-8">

                <button className="flex items-center gap-4 w-full px-2 py-3 rounded-xl transition-all duration-200 font-medium text-sm text-[#EE5D50] hover:bg-[#FFF5F4]">
                    <LogOut size={20} />
                    <span>Log Out</span>
                </button>
            </div>


            {/* User Profile Mini */}
            <div
                onClick={() => setActiveTab('Settings')}
                className="mx-6 mb-6 p-4 rounded-2xl bg-[#F4F7FE] flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors"
            >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1B2559] border-2 border-white overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt="User" className="w-full h-full object-cover" /> : <User size={18} />}
                </div>
                <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-[#1B2559] truncate">{user.name}</h4>
                    <p className="text-xs text-[#A3AED0] font-medium truncate">{user.role}</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
