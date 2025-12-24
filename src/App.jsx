import { useEffect, useState } from "react";
import AddTransaction from "./components/AddTransaction";
import WeeklySummary from "./components/WeeklySummary";
import { fetchTransactions, deleteTransaction } from "./services/api";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [collapsedDays, setCollapsedDays] = useState({});

  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = dayjs();
    const monday = today.startOf('week').add(1, 'day');
    const sunday = monday.add(6, 'day');

    // If week crosses month, use first part
    if (monday.month() !== sunday.month()) {
      const endOfMonth = monday.endOf('month');
      return `${monday.format('YYYY-MM-DD')}_${endOfMonth.format('YYYY-MM-DD')}`;
    }

    return `${monday.format('YYYY-MM-DD')}_${sunday.format('YYYY-MM-DD')}`;
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load transactions");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ------------------ WEEK & MONTH HELPERS ------------------ */

  const toggleDay = (date) => {
    setCollapsedDays(prev => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  /* ------------------ WEEKLY TRANSACTIONS ------------------ */

  const getWeekRange = (weekKey) => {
    // weekKey is a date string representing the start of a week segment
    const startDate = dayjs(weekKey);

    // Check if this is the start of a month (likely the second part of a split week)
    if (startDate.date() === 1) {
      // This is a split week starting from the 1st of the month
      // We need to find the original week's Sunday
      const originalMonday = startDate.subtract(startDate.day() === 0 ? 0 : startDate.day() - 1, 'day');
      const originalWeekMonday = originalMonday.day() === 1 ? originalMonday : originalMonday.startOf('week').add(1, 'day');
      const sunday = originalWeekMonday.add(6, 'day');
      return { monday: startDate, sunday };
    } else {
      // Normal week or first part of split week
      let sunday = startDate.add(6, 'day');

      // If week crosses month boundary, limit to end of month
      if (startDate.month() !== sunday.month()) {
        sunday = startDate.endOf('month');
      }

      return { monday: startDate, sunday };
    }
  };

  const { monday, sunday } = getWeekRange(selectedWeek);

  const selectedMonth = monday.month();
  const selectedMonthYear = monday.year();

  const weekLabel = `${monday.format('MMM DD')} - ${sunday.format('MMM DD, YYYY')}`;

  // compute available weeks - split weeks that cross months
  const availableWeeks = (() => {
    const weekMap = new Map();

    transactions
      .filter(t => t.date)
      .forEach(t => {
        const d = dayjs(t.date);

        // Find the Monday of this transaction's week
        const transactionWeekMonday = d.startOf('week').add(1, 'day');
        const transactionWeekSunday = transactionWeekMonday.add(6, 'day');

        // If week crosses month boundary, split it
        if (transactionWeekMonday.month() !== transactionWeekSunday.month()) {
          // First part: Monday to end of month
          const firstPartEnd = transactionWeekMonday.endOf('month');
          const firstPartKey = transactionWeekMonday.format('YYYY-MM-DD');
          weekMap.set(firstPartKey, { monday: transactionWeekMonday, sunday: firstPartEnd });

          // Second part: Start of next month to the ORIGINAL Sunday
          const secondPartStart = firstPartEnd.add(1, 'day');
          const secondPartKey = secondPartStart.format('YYYY-MM-DD');
          // Use the original Sunday, not a recalculated one
          weekMap.set(secondPartKey, { monday: secondPartStart, sunday: transactionWeekSunday });
        } else {
          // Normal week within same month
          const weekKey = transactionWeekMonday.format('YYYY-MM-DD');
          weekMap.set(weekKey, { monday: transactionWeekMonday, sunday: transactionWeekSunday });
        }
      });

    // Convert to array and sort by Monday date (newest first)
    return Array.from(weekMap.keys()).sort((a, b) => b.localeCompare(a));
  })();

  // weekly transactions
  const weeklyTransactions = transactions.filter(t => {
    if (!t.date) return false;
    const d = dayjs(t.date);
    if (!d.isValid()) return false;

    return d.valueOf() >= monday.valueOf() && d.valueOf() <= sunday.valueOf();
  });

  /* ------------------ GROUP BY DAY ------------------ */

  const transactionsByDay = weeklyTransactions.reduce((acc, t) => {
    const d = dayjs(t.date.toString());
    const key = d.format("YYYY-MM-DD");

    if (!acc[key]) {
      acc[key] = {
        date: key,
        label: d.format("MMM DD, YYYY"),
        dayOfWeek: d.format("dddd"),
        transactions: [],
      };
    }

    acc[key].transactions.push(t);
    return acc;
  }, {});

  const daysArray = Object.values(transactionsByDay).sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
  );

  useEffect(() => {
    const initialState = {};
    daysArray.forEach(day => {
      initialState[day.date] = true;
    });
    setCollapsedDays(initialState);
  }, [selectedWeek, daysArray.length]);

  /* ------------------ CALCULATIONS ------------------ */

  const monthlyIncome = transactions
    .filter((t) => {
      if (!t.date || !t.type) return false;
      const d = dayjs(t.date.toString());
      return (
        t.type.toLowerCase() === "income" &&
        d.month() === selectedMonth &&
        d.year() === selectedMonthYear
      );
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const weeklyExpense = weeklyTransactions
    .filter((t) => t.type?.toLowerCase() === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyExpense = transactions
    .filter((t) => {
      if (!t.date || !t.type) return false;
      const d = dayjs(t.date.toString());
      return (
        t.type.toLowerCase() === "expense" &&
        d.month() === selectedMonth &&
        d.year() === selectedMonthYear
      );
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = monthlyIncome - monthlyExpense;

  const spentPercentage =
    monthlyIncome > 0
      ? Math.min((monthlyExpense / monthlyIncome) * 100, 100)
      : 0;

  /* ------------------ DELETE & EDIT ------------------ */

  const handleDelete = async (t) => {
    if (!window.confirm("Delete this transaction?")) return;

    const id =
      t.id || t.row || t.rowNumber || t.timestamp || t.index || t[0];

    if (!id) return alert("Transaction ID not found");

    try {
      setDeletingIds((s) => new Set(s).add(id));
      await deleteTransaction(id);
      await loadData();
    } catch (e) {
      alert("Delete failed");
    } finally {
      setDeletingIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  };

  const handleEdit = (t) => {
    setEditingTransaction(t);
    document
      .querySelector(".add-transaction-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  /* ------------------ UI ------------------ */

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">💰 Budget Tracker</h1>

        {/* WEEK SELECTOR */}
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          {availableWeeks.map((w) => {
            const { monday: weekStart, sunday: weekEnd } = getWeekRange(w);
            return (
              <option key={w} value={w}>
                {weekStart.format('MMM DD')} - {weekEnd.format('MMM DD, YYYY')}
              </option>
            );
          })}
        </select>

        {/* SUMMARY */}
        <WeeklySummary
          data={{
            income: monthlyIncome,
            expense: weeklyExpense,
            balance,
          }}
        />

        {/* PROGRESS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex justify-between mb-2 text-sm font-medium">
            <span>Monthly Spending</span>
            <span>{spentPercentage.toFixed(0)}%</span>
          </div>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                spentPercentage < 70
                  ? "bg-green-500"
                  : spentPercentage < 90
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${spentPercentage}%` }}
            />
          </div>
        </div>

        {/* FORM & LIST */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="add-transaction-form">
            <AddTransaction
              onAdded={loadData}
              editingTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransaction(null)}
            />
          </div>

          <div className="bg-white p-4 rounded-xl shadow space-y-3">
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : daysArray.length === 0 ? (
              <p className="text-center text-gray-400">No transactions</p>
            ) : (
              daysArray.map((day) => {
                const isCollapsed = collapsedDays[day.date];

                return (
                  <div key={day.date} className="space-y-2">
                    {/* Day Header */}
                    <button
                      onClick={() => toggleDay(day.date)}
                      className="w-full flex items-center justify-between text-left bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {day.dayOfWeek}
                        </h3>
                        <p className="text-xs text-gray-500">{day.label}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {day.transactions.length}
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            isCollapsed ? "rotate-0" : "rotate-180"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {/* Transactions */}
                    {!isCollapsed && (
                      <div className="pl-4 space-y-2">
                        {day.transactions.map((t, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center border-b py-2"
                          >
                            <div>
                              <p className="font-medium">{t.category}</p>
                              {t.note && (
                                <p className="text-xs text-gray-500 italic">
                                  "{t.note}"
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 text-sm font-semibold rounded-full flex-shrink-0 ${
                                  t.type === "income"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                RM {Number(t.amount).toFixed(2)}
                              </span>

                              <button
                                onClick={() => handleEdit(t)}
                                className="text-blue-500"
                              >
                                ✏️
                              </button>

                              <button
                                onClick={() => handleDelete(t)}
                                className="text-red-500"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}