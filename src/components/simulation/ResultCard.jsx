import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ResultCard = ({ result, onReset }) => {
    // result structure: { fraud_status, risk_score, reasons, graph_data: { nodes, links } }
    const { fraud_status, risk_score, reasons, graph_data } = result;

    const getStatusConfig = (status) => {
        switch (status) {
            case 'FRAUD': return { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle, label: 'BLOCKED' };
            case 'VERIFY_REQUIRED': return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Info, label: 'VERIFY' };
            default: return { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, label: 'SECURE' };
        }
    };

    const config = getStatusConfig(fraud_status);

    // Simple Graph Renderer
    const Graph = ({ nodes, links }) => (
        <svg viewBox="0 0 400 300" className="w-full h-full bg-slate-50 border border-slate-100 rounded-lg">
            {/* Links */}
            {links.map((link, i) => {
                const source = nodes.find(n => n.id === link.source);
                const target = nodes.find(n => n.id === link.target);
                if (!source || !target) return null;
                // Simple random layout mapping (in real app, use D3 force layout)
                // For demo, we just place them based on simple hashing or random if positions not provided
                // Assuming backend might not send x/y, we'll auto-layout in a circle for demo
                return (
                    <line
                        key={i}
                        x1={source.x || 200} y1={source.y || 150}
                        x2={target.x || 200} y2={target.y || 150}
                        stroke="#94a3b8" strokeWidth="1"
                    />
                );
            })}
            {/* Nodes */}
            {nodes.map((node, i) => {
                // Auto-layout in circle if x/y missing (mocking simple layout)
                const angle = (i / nodes.length) * 2 * Math.PI;
                const x = node.x || 200 + Math.cos(angle) * 100;
                const y = node.y || 150 + Math.sin(angle) * 100;
                // Assign to node object for links to use (mutation for render only)
                node.x = x; node.y = y;

                return (
                    <g key={node.id}>
                        <circle cx={x} cy={y} r={15} fill={node.type === 'User' ? '#4318FF' : '#00AEEF'} />
                        <text x={x} y={y + 25} fontSize="10" textAnchor="middle" fill="#333">{node.id}</text>
                    </g>
                );
            })}
        </svg>
    );

    return (
        <div className="space-y-6">
            {/* Status Header */}
            <div className={`p-6 rounded-2xl ${config.bg} flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center ${config.color} shadow-sm`}>
                    <config.icon size={24} />
                </div>
                <div>
                    <h3 className={`text-2xl font-bold ${config.color}`}>{config.label}</h3>
                    <p className="text-slate-600 font-medium text-sm">Transaction Analysis Complete</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Meter */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                    <h4 className="text-[#1B2559] font-bold mb-4">Risk Score</h4>
                    <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`absolute left-0 top-0 h-full transition-all duration-500 ${risk_score > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${risk_score}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                        <span>Safe (0)</span>
                        <span className="text-[#1B2559] text-base">{risk_score}/100</span>
                        <span>High (100)</span>
                    </div>
                </div>

                {/* Reasons */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                    <h4 className="text-[#1B2559] font-bold mb-2">Detection Logic</h4>
                    <ul className="space-y-2">
                        {reasons.length > 0 ? reasons.map((r, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                <AlertTriangle size={14} className="text-orange-500" />
                                {r}
                            </li>
                        )) : <li className="text-sm text-green-600 font-medium">No threats detected.</li>}
                    </ul>
                </div>
            </div>

            {/* Network Graph */}
            {graph_data && (
                <div className="h-64 border border-slate-100 rounded-2xl overflow-hidden relative">
                    <div className="absolute top-3 left-4 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-[#1B2559]">Network Graph</div>
                    <Graph nodes={graph_data.nodes || []} links={graph_data.links || []} />
                </div>
            )}

            <button onClick={onReset} className="w-full py-3 rounded-xl bg-[#F4F7FE] text-[#1B2559] font-bold hover:bg-slate-100 transition-colors">
                Run Another Simulation
            </button>
        </div>
    );
};

export default ResultCard;
