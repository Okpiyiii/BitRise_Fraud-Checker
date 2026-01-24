import React from 'react';

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-[20px] shadow-[0px_18px_40px_rgba(112,144,176,0.12)] p-6 ${className}`}>
        {children}
    </div>
);

export default Card;
