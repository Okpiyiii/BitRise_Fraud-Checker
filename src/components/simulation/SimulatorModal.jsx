import React, { useState } from 'react';
import { X, Activity } from 'lucide-react';
import SimulationForm from './SimulationForm';
import ResultCard from './ResultCard';

const SimulatorModal = ({ onClose }) => {
    const [result, setResult] = useState(null);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[30px] shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#4318FF] flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <Activity size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#1B2559]">Transaction Simulator</h2>
                            <p className="text-xs font-medium text-[#A3AED0]">Test the fraud detection engine</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {!result ? (
                        <SimulationForm onResult={setResult} />
                    ) : (
                        <ResultCard result={result} onReset={() => setResult(null)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimulatorModal;
