// src/components/WeeklySummary.jsx

import { useState } from 'react';

export default function WeeklySummary({ data }) {
  const balanceColor = data.balance >= 0 ? "text-emerald-600" : "text-red-600";
  const balanceBg = data.balance >= 0 ? "bg-emerald-50" : "bg-red-50";

  const [showIncome, setShowIncome] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
      {/* Income Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <p className="text-emerald-100 text-xs md:text-sm font-medium">Montly Income</p>
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-2xl md:text-3xl font-bold break-words">
            {showIncome ? `RM ${data.income.toFixed(2)}` : 'RM ••••••'}
          </p>
          <button
            onClick={() => setShowIncome(!showIncome)}
            className="flex-shrink-0 p-1.5 hover:bg-emerald-400/30 rounded-lg transition-colors"
            aria-label={showIncome ? "Hide income" : "Show income"}
          >
            {showIncome ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Expense Card */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <p className="text-red-100 text-xs md:text-sm font-medium">Weekly Expense</p>
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-2xl md:text-3xl font-bold break-words">
            {showExpense ? `RM ${data.expense.toFixed(2)}` : 'RM ••••••'}
          </p>
          <button
            onClick={() => setShowExpense(!showExpense)}
            className="flex-shrink-0 p-1.5 hover:bg-red-400/30 rounded-lg transition-colors"
            aria-label={showExpense ? "Hide expense" : "Show expense"}
          >
            {showExpense ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className={`${balanceBg} rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border-2 ${data.balance >= 0 ? "border-emerald-200" : "border-red-200"}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-600 text-xs md:text-sm font-medium">Monthly Balance</p>
          <svg className={`w-5 h-5 md:w-6 md:h-6 ${balanceColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-5m0 5h-6m6 0H9m0 0V7m0 0h6" />
          </svg>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={`text-2xl md:text-3xl font-bold break-words ${balanceColor}`}>
            {showBalance ? `RM ${data.balance.toFixed(2)}` : 'RM ••••••'}
          </p>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
              data.balance >= 0 ? 'hover:bg-emerald-200/50' : 'hover:bg-red-200/50'
            }`}
            aria-label={showBalance ? "Hide balance" : "Show balance"}
          >
            {showBalance ? (
              <svg className={`w-5 h-5 ${balanceColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className={`w-5 h-5 ${balanceColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
