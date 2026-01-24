import React from 'react';

const ProgressRing = ({ percentage, color }) => {
    const radius = 30;
    const stroke = 5;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
                <circle stroke="#EFF4FB" strokeWidth={stroke} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
                <circle
                    stroke={color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <span className="absolute text-xs font-bold text-[#1B2559]">{percentage}%</span>
        </div>
    );
};

export default ProgressRing;
