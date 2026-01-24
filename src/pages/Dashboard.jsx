import React, { useState } from 'react';
import { Activity, Shield, Zap, AlertTriangle, CheckCircle, ChevronRight, Eye, ArrowUp, ArrowDown, ShoppingBag, Globe, Plane, Play } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import StatMetric from '../components/dashboard/StatMetric';
import ProgressRing from '../components/ui/ProgressRing';
import SimulatorModal from '../components/simulation/SimulatorModal';
import { MERCHANT_LOGOS } from '../utils/constants';

const Dashboard = ({ transactions, stats, setActiveTab, setSelectedTxn }) => {
    const [isSimulatorOpen, setSimulatorOpen] = useState(false);
    return (
        <div className="space-y-6 animate-fade-in-up max-w-[1600px] mx-auto">

            {/* METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatMetric
                    title="Total Transactions"
                    value={stats.total.toLocaleString()}
                    icon={Activity}
                    trend={12}
                    colorClass="bg-[#F4F7FE] text-[#4318FF]"
                />
                <StatMetric
                    title="Frauds Detected"
                    value={stats.fraud}
                    icon={Shield}
                    trend={-5}
                    colorClass="bg-[#FFF5F4] text-[#EE5D50]"
                />
                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-[#A3AED0] text-sm font-bold mb-1">Safety Score</p>
                        <h3 className="text-[#1B2559] text-2xl font-bold tracking-tight">{stats.safeRate}%</h3>
                        <p className="text-xs font-bold text-[#05CD99] mt-2">Excellent</p>
                    </div>
                    <div className="w-16 h-16">
                        <ProgressRing percentage={stats.safeRate} color="#05CD99" />
                    </div>
                </Card>
                <Card className="flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[#A3AED0] text-sm font-bold">Avg Risk</p>
                        <div className="bg-orange-50 text-orange-500 p-1.5 rounded-lg">
                            <Zap size={16} />
                        </div>
                    </div>
                    <h3 className="text-[#1B2559] text-2xl font-bold tracking-tight">Low</h3>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                        <div className="bg-orange-400 w-[23%] h-full rounded-full"></div>
                    </div>
                </Card>
            </div>

            {/* MAIN CHART & TRAFFIC */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* LINE CHART */}
                <div className="lg:col-span-2 min-h-[400px] bg-[#9FD9D9] rounded-[30px] p-8 relative overflow-hidden flex flex-col justify-between shadow-sm">
                    {/* Background decorative blob/gradient if needed, for now flat color */}

                    {/* Header */}
                    {/* Header */}
                    <div className="flex justify-between items-start z-10 relative">
                        <div className="flex gap-6 items-baseline">
                            <h3 className="text-[#1B2559] text-3xl font-bold border-b-4 border-[#FF5B14] pb-1">Activity</h3>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSimulatorOpen(true)}
                                className="bg-white/90 backdrop-blur text-[#1B2559] px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white transition-colors shadow-sm"
                            >
                                <Play size={16} fill="currentColor" /> Simulator
                            </button>
                            <button className="bg-[#1B2559] text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#151b42] transition-colors">
                                Week <ChevronRight size={16} className="rotate-90" />
                            </button>
                        </div>
                    </div>

                    {/* Context Text */}
                    <div className="mt-8 mb-4 z-10 relative">
                        <p className="text-[#1B2559] font-medium opacity-70 w-32 leading-tight">Your data updates every <span className="font-bold text-black">3 hours</span></p>
                    </div>

                    {/* Chart */}
                    <div className="flex-1 w-full min-h-[250px] relative z-0 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={transactions.slice(0, 7).map((t, i) => ({ ...t, day: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][i] || 'Su' }))}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    cursor={{ stroke: '#1B2559', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white rounded-2xl p-3 shadow-xl mb-4 relative flex items-center gap-3 transform -translate-y-full">
                                                    <div className="w-10 h-10 rounded-full bg-[#FF5B14] flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                                                        <Eye size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[#1B2559] text-xl font-bold leading-none">{payload[0].value}</p>
                                                        <p className="text-[#A3AED0] text-xs font-bold leading-none mt-1">Views / hr</p>
                                                    </div>
                                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-white border-r-[8px] border-r-transparent"></div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#FFFFFF"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorAmt)"
                                    activeDot={{ r: 8, strokeWidth: 0, fill: "#1B2559" }}
                                />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={({ x, y, payload }) => (
                                        <g transform={`translate(${x},${y})`}>
                                            {payload.value === 'We' ? (
                                                <rect x="-18" y="10" width="36" height="24" rx="12" fill="#1B2559" />
                                            ) : null}
                                            <text
                                                x={0}
                                                y={26}
                                                dy={0}
                                                textAnchor="middle"
                                                fill={payload.value === 'We' ? "#FFFFFF" : "#1B2559"}
                                                fontSize={12}
                                                fontWeight="bold"
                                            >
                                                {payload.value}
                                            </text>
                                        </g>
                                    )}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ALERTS FEED */}
                <Card className="lg:col-span-1">
                    <h3 className="text-[#1B2559] text-lg font-bold mb-6">Recent Alerts</h3>
                    <div className="space-y-4">
                        {transactions.filter(t => t.status === 'Fraud').slice(0, 5).map((txn, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedTxn(txn)}
                                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F4F7FE] transition-colors cursor-pointer group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-[#1B2559] truncate">{txn.merchant}</h4>
                                    <p className="text-xs text-[#A3AED0] font-medium truncate">{txn.location}</p>
                                </div>
                                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                                    ₹{txn.amount}
                                </span>
                            </div>
                        ))}
                        {transactions.filter(t => t.status === 'Fraud').length === 0 && (
                            <div className="text-center py-10 text-[#A3AED0]">
                                <CheckCircle size={40} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-bold">No threats detected</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* TRANSACTIONS / LIVE METRICS SECTION */}
            <div className="bg-[#E6D5C4] rounded-[30px] p-8 flex flex-col lg:flex-row gap-12 items-center">

                {/* Left Text */}
                <div className="lg:w-1/4 space-y-4">
                    <h3 className="text-[#1B2559] text-3xl font-bold">Transactions</h3>
                    <p className="text-[#1B2559] opacity-70 font-medium leading-relaxed">
                        Overview of your spending across different categories.
                    </p>
                </div>

                {/* Cards Scroll Container */}
                <div className="flex-1 min-w-0 w-full overflow-x-auto pb-4 lg:pb-0 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="flex gap-4 min-w-max">
                        {/* Online Spend Card */}
                        <div className="bg-white rounded-[24px] p-5 flex flex-col justify-between w-[150px] h-[170px] shadow-sm hover:-translate-y-1 transition-transform">
                            <div className="w-10 h-10 rounded-xl bg-[#00AEEF] flex items-center justify-center text-white shadow-blue-500/20 shadow-lg">
                                <Globe size={20} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-[#1B2559] font-bold text-xs mb-1">Online</p>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[#1B2559] text-2xl font-bold">₹12.5k</h3>
                                    <ArrowUp size={14} className="text-green-500" />
                                </div>
                            </div>
                        </div>

                        {/* In-Store Spend Card */}
                        <div className="bg-white rounded-[24px] p-5 flex flex-col justify-between w-[150px] h-[170px] shadow-sm hover:-translate-y-1 transition-transform">
                            <div className="w-10 h-10 rounded-xl bg-[#1B2559] flex items-center justify-center text-white shadow-slate-500/20 shadow-lg">
                                <ShoppingBag size={20} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-[#1B2559] font-bold text-xs mb-1">In-Store</p>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[#1B2559] text-2xl font-bold">₹8.2k</h3>
                                    <ArrowUp size={14} className="text-green-500" />
                                </div>
                            </div>
                        </div>

                        {/* Services Spend Card */}
                        <div className="bg-white rounded-[24px] p-5 flex flex-col justify-between w-[150px] h-[170px] shadow-sm hover:-translate-y-1 transition-transform">
                            <div className="w-10 h-10 rounded-xl bg-[#FF5B14] flex items-center justify-center text-white shadow-orange-500/20 shadow-lg">
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-[#1B2559] font-bold text-xs mb-1">Services</p>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[#1B2559] text-2xl font-bold">₹4.1k</h3>
                                    <ArrowDown size={14} className="text-red-500" />
                                </div>
                            </div>
                        </div>

                        {/* International Card */}
                        <div className="bg-white rounded-[24px] p-5 flex flex-col justify-between w-[150px] h-[170px] shadow-sm hover:-translate-y-1 transition-transform">
                            <div className="w-10 h-10 rounded-xl bg-[#FFB547] flex items-center justify-center text-white shadow-orange-400/20 shadow-lg">
                                <Plane size={20} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-[#1B2559] font-bold text-xs mb-1">Travel</p>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[#1B2559] text-2xl font-bold">₹15k</h3>
                                    <ArrowUp size={14} className="text-green-500" />
                                </div>
                            </div>
                        </div>

                        {/* Entertainment Card */}
                        <div className="bg-white rounded-[24px] p-5 flex flex-col justify-between w-[150px] h-[170px] shadow-sm hover:-translate-y-1 transition-transform">
                            <div className="w-10 h-10 rounded-xl bg-[#9854CB] flex items-center justify-center text-white shadow-purple-500/20 shadow-lg">
                                <Activity size={20} />
                            </div>
                            <div>
                                <p className="text-[#1B2559] font-bold text-xs mb-1">Fun</p>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[#1B2559] text-2xl font-bold">₹3.4k</h3>
                                    <ArrowUp size={14} className="text-green-500" />
                                </div>
                            </div>
                        </div>

                        {/* Insurance Card */}
                        <div className="bg-white rounded-[24px] p-5 flex flex-col justify-between w-[150px] h-[170px] shadow-sm hover:-translate-y-1 transition-transform">
                            <div className="w-10 h-10 rounded-xl bg-[#05CD99] flex items-center justify-center text-white shadow-teal-500/20 shadow-lg">
                                <Shield size={20} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-[#1B2559] font-bold text-xs mb-1">Health</p>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[#1B2559] text-2xl font-bold">₹2.1k</h3>
                                    <ArrowDown size={14} className="text-red-500" />
                                </div>
                            </div>
                        </div>

                        {/* Navigation Card */}
                        <div
                            onClick={() => setActiveTab('Transactions')}
                            className="bg-gradient-to-br from-[#9FD9D9] to-[#7BC0C0] rounded-[24px] p-6 flex flex-col justify-center items-start w-[150px] h-[170px] shadow-sm cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden"
                        >
                            <h3 className="text-[#1B2559] font-bold text-lg leading-tight mb-4 relative z-10">See Full Report</h3>
                            <div className="w-10 h-10 rounded-full bg-[#1B2559] flex items-center justify-center text-white group-hover:scale-110 transition-transform relative z-10">
                                <ChevronRight size={20} />
                            </div>
                            {/* Decorative */}
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
                        </div>
                    </div>
                </div>
            </div>

            {isSimulatorOpen && <SimulatorModal onClose={() => setSimulatorOpen(false)} />}
        </div>
    );
};

export default Dashboard;
