"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

const CATEGORIES = ["Food", "Travel", "Bills-(Grocery)", "Shopping-(Selfcare)", "Other"];

export default function Expense() {
  const { user } = useUser();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const finalCategoryName = category === "Other" ? customCategory.trim() : category;
  const isValid = Number(amount) > 0 && !!date && (category !== "Other" || customCategory.trim() !== "");

  const addExpense = async () => {
    if (!isValid || !user) return;
    setLoading(true); 
    setError(""); 
    setSuccess(false);

    try {
      const res = await fetch(`/api/transactions?clerkId=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
  clerkId: user.id,   // ✅ REQUIRED FIX
  name: finalCategoryName, 
  amount: Number(amount), 
  type: "expense",
  source: "general",
  date 
}),
      });

      if (!res.ok) throw new Error();

      setAmount(""); 
      setCustomCategory(""); 
      setCategory("Food");
      setSuccess(true); 
      setTimeout(() => setSuccess(false), 3000);

    } catch { 
      setError("Failed to save. Check database connection."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF6F9] p-4 flex justify-center">
      <div className="bg-white rounded-3xl shadow-xl border border-pink-50 p-8 w-full max-w-md h-fit">
        
        {/* Header */}
        <h1 className="text-2xl font-black bg-gradient-to-r from-[#FF7A18] via-[#FF3D77] to-[#7F00FF] bg-clip-text text-transparent mb-1">
          Add Expense
        </h1>
        <p className="text-sm text-gray-400 mb-6">Track your daily spending</p>
        
        <div className="space-y-4">
          
          {/* Amount */}
          <div>
            <label className="w-full border-2 border-pink-50 rounded-2xl p-4 outline-none bg-white text-[#1A1A2E] placeholder-gray-400 focus:border-[#FF3D77] focus:ring-4 focus:ring-pink-50">
              Amount (₹)
            </label>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full border-2 border-pink-50 rounded-2xl p-4 outline-none bg-white text-[#1A1A2E] placeholder-gray-400 focus:border-[#FF3D77] focus:ring-4 focus:ring-pink-50"
            />
          </div>

          <div>
  <label className="block text-xs text-gray-600 mb-1 uppercase font-bold">
    Date
  </label>
  <input
    type="date"
    value={date}
    onChange={(e) => setDate(e.target.value)}
    className="w-full border-2 border-pink-50 rounded-2xl p-4 outline-none bg-white text-[#1A1A2E] focus:border-[#FF7A18] focus:ring-4 focus:ring-orange-50 transition-all"
  />
</div>

          {/* Category */}
          <div>
            <label className="w-full border-2 border-pink-50 rounded-2xl p-4 outline-none bg-white text-[#1A1A2E] placeholder-gray-400 focus:border-[#FF3D77] focus:ring-4 focus:ring-pink-50">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border-2 border-pink-50 rounded-2xl p-4 outline-none bg-white text-[#1A1A2E] placeholder-gray-400 focus:border-[#FF3D77] focus:ring-4 focus:ring-pink-50"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Custom */}
          {category === "Other" && (
            <input
              type="text"
              placeholder="Specify category"
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              className="w-full border-2 border-pink-100 rounded-2xl p-4 outline-none bg-white focus:border-[#FF3D77]"
            />
          )}

          {/* Button */}
          <button
            onClick={addExpense}
            disabled={!isValid || loading}
            className="w-full bg-gradient-to-r from-[#FF7A18] via-[#FF3D77] to-[#7F00FF] hover:opacity-90 disabled:opacity-40 text-white font-black py-4 rounded-2xl shadow-lg shadow-pink-200 transition-all active:scale-95"
          >
            {loading ? "Saving..." : "Add Expense"}
          </button>

          {/* Status */}
          {success && (
            <p className="text-center text-[#FF3D77] text-sm font-medium">
              ✓ Saved to SpendIQ
            </p>
          )}
          {error && (
            <p className="text-center text-red-500 text-sm font-medium">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


// "use client";
// import { useState } from "react";
// import { useUser } from "@clerk/nextjs";

// const CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Other"];

// export default function Expense() {
//   const { user } = useUser();
//   const [amount, setAmount] = useState("");
//   const [category, setCategory] = useState("Food");
//   const [customCategory, setCustomCategory] = useState("");
//   const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);

//   const finalCategoryName = category === "Other" ? customCategory.trim() : category;
//   const isValid = Number(amount) > 0 && !!date && (category !== "Other" || customCategory.trim() !== "");

//   const addExpense = async () => {
//     if (!isValid || !user) return;
//     setLoading(true); 
//     setError(""); 
//     setSuccess(false);

//     try {
//       const res = await fetch("/api/transactions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           clerkId: user.id, // 👈 Essential for Neon/Prisma
//           name: finalCategoryName, 
//           amount: Number(amount), 
//           type: "expense",
//           source: "general", // Can be toggled if you track 'salary' vs 'pocket'
//           date 
//         }),
//       });

//       if (!res.ok) throw new Error();

//       setAmount(""); 
//       setCustomCategory(""); 
//       setCategory("Food");
//       setSuccess(true); 
//       setTimeout(() => setSuccess(false), 3000);

//     } catch { 
//       setError("Failed to save. Check database connection."); 
//     } finally { 
//       setLoading(false); 
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F8F9FF] p-4 flex justify-center">
//       <div className="bg-white rounded-3xl shadow-sm border border-indigo-50 p-8 w-full max-w-md h-fit">
//         <h1 className="text-2xl font-bold text-[#4B0082] mb-1">Add Expense</h1>
//         <p className="text-sm text-gray-400 mb-6">Track your daily spending</p>
        
//         <div className="space-y-4">
//           <div>
//             <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Amount (₹)</label>
//             <input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border-2 border-gray-50 rounded-2xl p-4 focus:border-indigo-400 outline-none bg-gray-50" />
//           </div>

//           <div>
//             <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Category</label>
//             <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border-2 border-gray-50 rounded-2xl p-4 outline-none bg-gray-50">
//               {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
//             </select>
//           </div>

//           {category === "Other" && (
//             <input type="text" placeholder="Specify category" value={customCategory} onChange={e => setCustomCategory(e.target.value)} className="w-full border-2 border-indigo-100 rounded-2xl p-4 outline-none bg-white" />
//           )}

//           <button onClick={addExpense} disabled={!isValid || loading} className="w-full bg-[#7F00FF] hover:bg-[#4B0082] disabled:opacity-40 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-100 transition-all">
//             {loading ? "Saving..." : "Add Expense"}
//           </button>
//           {success && <p className="text-center text-green-500 text-sm font-medium">✓ Saved to SpendIQ</p>}
//         </div>
//       </div>
//     </div>
//   );
// }