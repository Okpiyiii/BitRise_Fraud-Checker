import { MERCHANT_LOGOS, LOCATIONS } from './constants';

export const generateTransaction = () => {
    const merchants = Object.keys(MERCHANT_LOGOS);
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const isFraud = Math.random() > 0.88;
    const amount = Math.floor(Math.random() * 5000) + 100;

    return {
        id: `TXN-${Math.floor(Math.random() * 100000)}`,
        merchant,
        amount,
        date: new Date(),
        status: isFraud ? 'Fraud' : 'Safe',
        riskScore: isFraud ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30),
        location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
        velocity: isFraud ? 'High' : 'Normal',
        device: Math.random() > 0.5 ? 'Mobile' : 'Web'
    };
};
