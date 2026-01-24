import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const EngagementCard = ({ icon: Icon, title, value, trend, colorClass, iconBgClass }) => {
    return (
        <div className="bg-[#F8F3EF] rounded-[24px] p-5 flex flex-col justify-between min-w-[160px] h-[180px] hover:-translate-y-1 transition-transform shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${iconBgClass} flex items-center justify-center text-white mb-4 shadow-md`}>
                <Icon size={20} fill="currentColor" />
            </div>
            <div>
                <p className="text-[#1B2559] font-bold text-sm mb-2">{title}</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-[#1B2559] text-3xl font-bold tracking-tight">{value}</h3>
                    {trend && (
                        <span className={`text-xs font-bold mb-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                            {trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EngagementCard;
