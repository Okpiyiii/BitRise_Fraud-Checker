import React from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

const TransactionModal = ({ txn, onClose }) => {
    if (!txn) return null;
    const isFraud = txn.status === 'Fraud';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    <X size={20} />
                </button>

                <div className={`h-32 ${isFraud ? 'bg-gradient-to-br from-[#EE5D50] to-[#ff8f85]' : 'bg-gradient-to-br from-[#05CD99] to-[#6adfb7]'} p-6 flex flex-col justify-end`}>
                    <div className="flex items-center gap-3 text-white">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                            {isFraud ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{isFraud ? 'Fraud Detected' : 'Safe Transaction'}</h2>
                            <p className="opacity-90 font-medium text-sm">{txn.id}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Merchant</p>
                            <p className="text-[#1B2559] font-bold text-lg">{txn.merchant}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Location</p>
                            <p className="text-[#1B2559] font-bold text-lg">{txn.location || 'Unknown'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Amount</p>
                            <p className="text-[#1B2559] font-bold text-lg">₹{txn.amount}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-[#1B2559]">Risk Factors Analysis</h4>
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-500">Risk Score</span>
                                <span className={`text-sm font-bold px-2 py-0.5 rounded ${isFraud ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{txn.riskScore}/100</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-500">Location Match</span>
                                <span className="text-sm font-bold text-[#1B2559]">{txn.location}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-500">Velocity Check</span>
                                <span className={`text-sm font-bold ${txn.velocity === 'High' ? 'text-orange-500' : 'text-[#1B2559]'}`}>{txn.velocity}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-500">Device Fingerprint</span>
                                <span className="text-sm font-bold text-[#1B2559]">{txn.device}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Close</button>
                        <button className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transition-transform active:scale-95 ${isFraud ? 'bg-[#EE5D50] shadow-red-500/30' : 'bg-[#00AEEF]'}`}>
                            {isFraud ? 'Block Sender' : 'Mark Suspicious'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionModal;
