import React from 'react';
import Card from '../ui/Card';

const StatMetric = ({ title, value, icon: Icon, trend, colorClass }) => (
    <Card className="flex items-center justify-between relative overflow-hidden group">
        <div>
            <p className="text-[#A3AED0] text-sm font-bold mb-1">{title}</p>
            <h3 className="text-[#1B2559] text-2xl font-bold tracking-tight">{value}</h3>
            <div className="flex items-center gap-1 mt-2">
                <span className={`text-xs font-bold ${trend > 0 ? 'text-[#05CD99]' : 'text-[#EE5D50]'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
                <span className="text-xs text-[#A3AED0] font-medium">since last week</span>
            </div>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
            <Icon size={24} />
        </div>
    </Card>
);

export default StatMetric;
