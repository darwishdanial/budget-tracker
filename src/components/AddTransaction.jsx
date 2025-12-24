import { useState, useEffect } from "react";
import { addTransaction, updateTransaction } from "../services/api";

export default function AddTransaction({ onAdded, editingTransaction, onCancelEdit }) {
  const [form, setForm] = useState({
    date: "",
    type: "expense",
    category: "",
    amount: "",
    note: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      // Format date for input (YYYY-MM-DD)
      const dateStr = editingTransaction.date ? new Date(editingTransaction.date).toISOString().split('T')[0] : "";
      setForm({
        date: dateStr,
        type: editingTransaction.type || "expense",
        category: editingTransaction.category || "",
        amount: editingTransaction.amount || "",
        note: editingTransaction.note || ""
      });
    } else {
      setForm({ date: "", type: "expense", category: "", amount: "", note: "" });
    }
    setIsLoading(false); // Reset loading when transaction changes
  }, [editingTransaction]);

  const submit = async () => {
    if (!form.date || !form.category || !form.amount) {
      alert("Please fill date, category, and amount.");
      return;
    }

    setIsLoading(true);
    try {
      if (editingTransaction) {
        // Update existing transaction
        const id = editingTransaction.id || editingTransaction.row || editingTransaction.rowNumber || editingTransaction.timestamp || editingTransaction.index;
        console.log("Updating transaction with ID:", id, editingTransaction);
        
        if (!id) {
          alert("Cannot update: Transaction ID not found. Please check the transaction data structure.");
          console.error("Transaction data:", editingTransaction);
          setIsLoading(false);
          return;
        }
        
        await updateTransaction(id, {
          ...form,
          amount: Number(form.amount)
        });
        onCancelEdit();
      } else {
        // Add new transaction
        await addTransaction({
          ...form,
          amount: Number(form.amount) // ensure amount is a number
        });
        setForm({ date: "", type: "expense", category: "", amount: "", note: "" });
      }
      
      onAdded();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
      <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingTransaction ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
          </svg>
          {editingTransaction ? "Edit Transaction" : "Add Transaction"}
        </span>
        {editingTransaction && (
          <button
            onClick={onCancelEdit}
            className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
            aria-label="Cancel edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </h2>

      <div className="space-y-3 md:space-y-4">
        {/* Type Selector */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "expense" })}
              disabled={isLoading}
              className={`px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-medium transition-all ${
                form.type === "expense"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "income" })}
              disabled={isLoading}
              className={`px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-medium transition-all ${
                form.type === "income"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            disabled={isLoading}
            className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isLoading ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
          />
        </div>

        {/* Category Input */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Category</label>
          <input
            type="text"
            placeholder="e.g., Food, Salary, Rent"
            disabled={isLoading}
            className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          />
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Amount (RM)</label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            disabled={isLoading}
            className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
          />
        </div>

        {/* Note Input */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Note (optional)</label>
          <input
            type="text"
            placeholder="Add a note..."
            disabled={isLoading}
            className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 ${isLoading ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-2 mt-2">
          {editingTransaction && (
            <button
              onClick={onCancelEdit}
              disabled={isLoading}
              className={`flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm md:text-base py-2.5 md:py-3 px-4 rounded-lg md:rounded-xl transition-all duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Cancel
            </button>
          )}
          <button
            onClick={submit}
            disabled={isLoading}
            className={`${editingTransaction ? 'flex-1' : 'w-full'} bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm md:text-base py-2.5 md:py-3 px-4 rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{editingTransaction ? "Updating..." : "Saving..."}</span>
              </>
            ) : (
              <span>{editingTransaction ? "Update Transaction" : "Add Transaction"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
