import React from 'react';

const ToggleSwitch = ({ enabled, setEnabled, label }) => (
    <div className="flex items-center gap-3">
        {label && <span className="text-sm font-bold text-slate-500">{label}</span>}
        <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${enabled ? 'bg-[#00AEEF]' : 'bg-slate-200'
                }`}
        >
            <span
                className={`${enabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm`}
            />
        </button>
    </div>
);

export default ToggleSwitch;
