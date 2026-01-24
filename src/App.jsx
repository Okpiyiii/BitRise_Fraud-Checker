import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import TransactionModal from './components/dashboard/TransactionModal';
import { generateTransaction } from './utils/helpers';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isProtectionEnabled, setIsProtectionEnabled] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({
    name: "Jonathan Roy",
    email: "jonathan.roy@example.com",
    role: "Pro Member",
    avatar: null // null implies default placeholder
  });
  // New state for Transaction page filter
  const [transactionFilter, setTransactionFilter] = useState('All');

  // Initial Data Load
  useEffect(() => {
    const initialData = Array.from({ length: 8 }, generateTransaction);
    setTransactions(initialData);
  }, []);

  // Real-time Simulation
  useEffect(() => {
    if (!isProtectionEnabled) return;
    const interval = setInterval(() => {
      setTransactions(prev => [generateTransaction(), ...prev].slice(0, 50));
    }, 4000);
    return () => clearInterval(interval);
  }, [isProtectionEnabled]);

  // Calculations
  const stats = useMemo(() => {
    const total = transactions.length;
    const fraud = transactions.filter(t => t.status === 'Fraud').length;
    const rate = total > 0 ? Math.round((fraud / total) * 100) : 0;
    const safeRate = 100 - rate;
    return { total, fraud, rate, safeRate };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-[#1B2559] font-sans selection:bg-blue-100 flex overflow-hidden">

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isProtectionEnabled={isProtectionEnabled}
        user={user}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* TOP BAR */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setSidebarOpen={setSidebarOpen}
          isProtectionEnabled={isProtectionEnabled}
          setIsProtectionEnabled={setIsProtectionEnabled}
          transactions={transactions}
          setTransactionFilter={setTransactionFilter}
        />

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 scrollbar-thin scrollbar-thumb-slate-200">

          {activeTab === 'Dashboard' && (
            <Dashboard
              transactions={transactions}
              stats={stats}
              setActiveTab={setActiveTab}
              setSelectedTxn={setSelectedTxn}
            />
          )}

          {activeTab === 'Transactions' && (
            <Transactions
              transactions={transactions}
              setSelectedTxn={setSelectedTxn}
              activeFilter={transactionFilter}
              setActiveFilter={setTransactionFilter}
            />
          )}

          {activeTab === 'Settings' && (
            <Settings
              isProtectionEnabled={isProtectionEnabled}
              setIsProtectionEnabled={setIsProtectionEnabled}
              user={user}
              setUser={setUser}
            />
          )}

        </div>
      </main>

      {/* MODAL */}
      {selectedTxn && <TransactionModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} />}

      {/* GLOBAL STYLES FOR ANIMATIONS & SCROLLBAR */}
      {/* Styles moved to index.css */}
    </div>
  );
}
