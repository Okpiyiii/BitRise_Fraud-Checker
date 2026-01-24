import React, { useState } from 'react';
import { Filter, Calendar, ChevronDown, MoreHorizontal } from 'lucide-react';
import Card from '../components/ui/Card';
import { MERCHANT_LOGOS } from '../utils/constants';

const Transactions = ({ transactions, setSelectedTxn, activeFilter, setActiveFilter }) => {
    // const [activeTab, setActiveTab] = useState('All'); // Lifted to App.jsx
    const tabs = ['All', 'Received', 'Transfer', 'Payment', 'Withdraw', 'Alerts'];

    // Mock data enrichment for the table
    const enrichedTransactions = transactions.map(txn => ({
        ...txn,
        invoiceId: `OP${Math.floor(Math.random() * 100000000)}`,
        // Preserve 'Fraud' status for filtering, otherwise mock based on amount
        status: txn.status === 'Fraud' ? 'Fraud' : (txn.amount > 1000 ? 'Withdraw' : 'Received'),
    }));

    // We need to handle filtering so 'Alerts' tab shows Fraud transactions
    const filteredTransactions = activeFilter === 'All'
        ? enrichedTransactions
        : enrichedTransactions.filter(t => {
            if (activeFilter === 'Alerts') {
                // The 'Alerts' tab should show transactions with 'Fraud' status
                return t.status === 'Fraud';
            }
            // For other tabs, filter by the enriched status
            return t.status === activeFilter;
        });

    return (
        <div className="animate-fade-in-up max-w-[1600px] mx-auto space-y-6">

            {/* Page Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[#1B2559] text-2xl font-bold">Transactions</h2>
                    <p className="text-[#A3AED0] text-sm font-medium">Manage and view your transaction history</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-bold text-[#A3AED0] uppercase">Balance:</span>
                    <span className="text-[#1B2559] font-bold text-lg">$5,382.36 USD</span>
                </div>
            </div>

            <Card className="p-0 overflow-hidden">
                {/* Tabs & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-slate-100 gap-4">
                    <div className="flex gap-8 overflow-x-auto w-full md:w-auto scrollbar-hide pb-2 md:pb-0">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className={`text-sm font-bold relative pb-2 transition-colors whitespace-nowrap ${activeFilter === tab
                                    ? 'text-[#FFB547]'
                                    : 'text-[#A3AED0] hover:text-[#1B2559]'
                                    }`}
                            >
                                {tab}
                                {activeFilter === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFB547] rounded-full"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-[#A3AED0] text-xs font-bold hover:bg-slate-50 transition-colors">
                            <Calendar size={14} />
                            Past 90 Days
                            <ChevronDown size={14} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="bg-[#F9FAFC] text-left">
                                <th className="py-4 px-6 text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Name/Business</th>
                                <th className="py-4 px-6 text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Date</th>
                                <th className="py-4 px-6 text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Invoice ID</th>
                                <th className="py-4 px-6 text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Amount</th>
                                <th className="py-4 px-6 text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-bold text-[#A3AED0] uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTransactions.map((txn) => (
                                <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${MERCHANT_LOGOS[txn.merchant.split(' ')[0]] || 'bg-gray-100'}`}>
                                                {txn.merchant[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#1B2559] text-sm">{txn.merchant}</h4>
                                                <p className="text-xs font-bold text-[#A3AED0]">ID: {txn.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-[#1B2559] text-sm">{txn.date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        <p className="text-xs font-bold text-[#A3AED0]">At {txn.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-medium text-[#A3AED0] text-sm">{txn.invoiceId}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-extrabold text-[#1B2559] text-sm">₹{txn.amount} USD</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`font-bold text-xs ${txn.status === 'Received' ? 'text-green-500' :
                                            txn.status === 'Withdraw' ? 'text-red-500' :
                                                txn.status === 'Transfer' ? 'text-orange-500' :
                                                    txn.status === 'Payment' ? 'text-orange-400' : 'text-red-500'
                                            }`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => setSelectedTxn(txn)}
                                            className="px-4 py-1.5 rounded-lg border border-slate-100 text-[#1B2559] font-bold text-xs hover:bg-[#F4F7FE] transition-colors"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Transactions;
