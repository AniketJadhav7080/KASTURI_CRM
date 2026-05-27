import { useEffect, useState } from "react";
import { FaUsers, FaMoneyBillWave, FaTools, FaUserCheck, FaRupeeSign } from "react-icons/fa";
import { supabase } from "../../config/supabase";

const AdminSupervisors = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [labors, setLabors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [supervisorCount, setSupervisorCount] = useState(0);
  const [supervisorSitesData, setSupervisorSitesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [payModal, setPayModal] = useState<{ open: boolean; materialId: string; vendorName: string; currentPaid: number; totalAmount: number }>({
    open: false, materialId: "", vendorName: "", currentPaid: 0, totalAmount: 0,
  });
  const [payAmount, setPayAmount] = useState("");

  const [supervisorUsers, setSupervisorUsers] = useState<any[]>([]);
  const [editDeposit, setEditDeposit] = useState<string | null>(null);
  const [depositValue, setDepositValue] = useState("");

  const fetchAll = async () => {
    const [expData, labData, matData, userData, siteData] = await Promise.all([
      supabase.from("expenses").select("*").order("created_at", { ascending: false }),
      supabase.from("labor").select("*").order("id", { ascending: false }),
      supabase.from("materials").select("*").order("id", { ascending: false }),
      supabase.from("users").select("*").eq("role", "supervisor"),
      supabase.from("supervisor_sites").select("*"),
    ]);

    if (!expData.error && expData.data) setExpenses(expData.data);
    if (!labData.error && labData.data) setLabors(labData.data);
    if (!matData.error && matData.data) setMaterials(matData.data);
    if (!userData.error && userData.data) {
      setSupervisorCount(userData.data.length);
      setSupervisorUsers(userData.data);
    }
    if (!siteData.error && siteData.data) setSupervisorSitesData(siteData.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const totalExpenseAmount = expenses.reduce((t, i) => t + Number(i.amount), 0);
  const totalLaborCost = labors.reduce((t, i) => t + Number(i.daily_wage || 0) * Number(i.total_workers || 0), 0);
  const totalMaterialCost = materials.reduce((t, i) => t + Number(i.amount || 0), 0);

  const totalPaidToVendors = materials.reduce((t, i) => t + Number(i.paid_amount || 0), 0);
  const totalRemaining = materials.reduce((t, i) => t + (Number(i.amount || 0) - Number(i.paid_amount || 0)), 0);

  const makePayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) { alert("Enter valid amount"); return; }
    const newPaid = payModal.currentPaid + Number(payAmount);
    await supabase.from("materials").update({ paid_amount: newPaid }).eq("id", payModal.materialId);
    await supabase.from("vendor_payments").insert([
      { vendor_name: payModal.vendorName, paid_amount: payAmount, material_name: "", site_name: "" },
    ]);
    setPayModal({ open: false, materialId: "", vendorName: "", currentPaid: 0, totalAmount: 0 });
    setPayAmount("");
    fetchAll();
  };

  if (loading) return <p className="text-gray-500 text-center mt-10">Loading supervisor data...</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Supervisor Tracking</h1>
        <p className="text-gray-500 mt-2">Monitor all site activities, expenses & labor</p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 rounded-[30px] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <FaUserCheck className="text-4xl" />
            <div>
              <h2 className="text-lg opacity-90">Active Supervisors</h2>
              <h1 className="text-3xl font-bold mt-1">{supervisorCount}</h1>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 rounded-[30px] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <FaMoneyBillWave className="text-4xl" />
            <div>
              <h2 className="text-lg opacity-90">Total Expenses</h2>
              <h1 className="text-3xl font-bold mt-1">₹{totalExpenseAmount}</h1>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 rounded-[30px] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <FaUsers className="text-4xl" />
            <div>
              <h2 className="text-lg opacity-90">Labor Cost</h2>
              <h1 className="text-3xl font-bold mt-1">₹{totalLaborCost}</h1>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 rounded-[30px] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <FaTools className="text-4xl" />
            <div>
              <h2 className="text-lg opacity-90">Material Cost</h2>
              <h1 className="text-3xl font-bold mt-1">₹{totalMaterialCost}</h1>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-cyan-500 to-teal-600 p-6 rounded-[30px] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <FaRupeeSign className="text-4xl" />
            <div>
              <h2 className="text-lg opacity-90">Due to Vendors</h2>
              <h1 className="text-3xl font-bold mt-1">₹{totalRemaining}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* EXPENSES TABLE */}
      <div className="bg-white rounded-[30px] shadow-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
          <FaMoneyBillWave className="text-red-500" /> Site Expenses
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left rounded-l-2xl">Title</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Site</th>
                <th className="p-4 text-left">Supervisor</th>
                <th className="p-4 text-left rounded-r-2xl">Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No expenses recorded yet</td></tr>
              ) : (
                expenses.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{item.title || item.description}</td>
                    <td className="p-4 font-bold text-red-500">₹{item.amount}</td>
                    <td className="p-4">{item.site}</td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{item.supervisor}</span>
                    </td>
                    <td className="p-4">{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LABOR TABLE */}
      <div className="bg-white rounded-[30px] shadow-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
          <FaUsers className="text-green-500" /> Labor Entries
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left rounded-l-2xl">Labor Name</th>
                <th className="p-4 text-left">Workers</th>
                <th className="p-4 text-left">Daily Wage</th>
                <th className="p-4 text-left rounded-r-2xl">Supervisor</th>
              </tr>
            </thead>
            <tbody>
              {labors.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">No labor entries yet</td></tr>
              ) : (
                labors.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{item.labor_name}</td>
                    <td className="p-4">{item.total_workers}</td>
                    <td className="p-4 font-medium">₹{item.daily_wage}</td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{item.supervisor}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MATERIALS TABLE */}
      <div className="bg-white rounded-[30px] shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
          <FaTools className="text-orange-500" /> Materials Taken from Vendors
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left rounded-l-2xl">Material</th>
                <th className="p-4 text-left">Qty</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Vendor</th>
                <th className="p-4 text-left">Payment Done</th>
                <th className="p-4 text-left">Remaining</th>
                <th className="p-4 text-left">Supervisor</th>
                <th className="p-4 text-left rounded-r-2xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400">No materials recorded yet</td></tr>
              ) : (
                materials.map((item) => {
                  const paid = Number(item.paid_amount || 0);
                  const total = Number(item.amount || 0);
                  const remaining = total - paid;
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{item.material_name}</td>
                      <td className="p-4">{item.quantity}</td>
                      <td className="p-4 font-medium">₹{total}</td>
                      <td className="p-4">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">{item.vendor_name || "-"}</span>
                      </td>
                      <td className="p-4 font-medium text-green-600">₹{paid}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          remaining <= 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          ₹{remaining}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{item.supervisor}</span>
                      </td>
                      <td className="p-4">
                        {remaining > 0 && (
                          <button
                            onClick={() => {
                              setPayModal({ open: true, materialId: item.id, vendorName: item.vendor_name, currentPaid: paid, totalAmount: total });
                              setPayAmount("");
                            }}
                            className="text-xs bg-green-100 text-green-700 px-3 py-2 rounded-xl hover:bg-green-200 font-medium"
                          >
                            + Pay ₹{remaining}
                          </button>
                        )}
                        {remaining <= 0 && (
                          <span className="text-xs text-green-600 font-medium">Paid</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {payModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPayModal({ open: false, materialId: "", vendorName: "", currentPaid: 0, totalAmount: 0 })}>
          <div className="bg-white rounded-[30px] p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-2">Make Payment</h2>
            <p className="text-gray-500 mb-1">Vendor: <span className="font-medium text-gray-800">{payModal.vendorName}</span></p>
            <p className="text-gray-500 mb-6">Total: <span className="font-medium text-gray-800">₹{payModal.totalAmount}</span> | Paid: <span className="font-medium text-green-600">₹{payModal.currentPaid}</span> | Remaining: <span className="font-medium text-red-600">₹{payModal.totalAmount - payModal.currentPaid}</span></p>
            <input type="number" placeholder="Payment Amount" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-full bg-gray-50 border border-gray-300 p-4 rounded-2xl mb-6 text-gray-800" />
            <div className="flex gap-4">
              <button onClick={makePayment} className="flex-1 bg-green-600 text-white py-3 rounded-2xl hover:scale-105 transition">Pay Now</button>
              <button onClick={() => setPayModal({ open: false, materialId: "", vendorName: "", currentPaid: 0, totalAmount: 0 })} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-2xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* SUPERVISOR DEPOSIT MANAGEMENT */}
      <div className="bg-white rounded-[30px] shadow-xl p-6 mt-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
          <FaRupeeSign className="text-green-500" /> Supervisor Deposit Management
        </h2>
        <p className="text-gray-500 mb-6">Set deposit amount for each supervisor. Expenses will be deducted from this deposit.</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left rounded-l-2xl">Supervisor</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Deposit Amount</th>
                <th className="p-4 text-left">Total Expenses</th>
                <th className="p-4 text-left">Remaining</th>
                <th className="p-4 text-left rounded-r-2xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {supervisorUsers.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No supervisors found</td></tr>
              ) : (
                supervisorUsers.map((user) => {
                  const deposit = Number(user.deposit || 0);
                  const totalExp = expenses
                    .filter((e) => e.supervisor?.toLowerCase() === (user.name || user.email?.split("@")[0])?.toLowerCase())
                    .reduce((t, e) => t + Number(e.amount), 0);
                  const remaining = deposit - totalExp;
                  return (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{user.name || user.email?.split("@")[0] || "-"}</td>
                      <td className="p-4 text-gray-500">{user.email}</td>
                      <td className="p-4">
                        {editDeposit === user.id ? (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={depositValue}
                              onChange={(e) => setDepositValue(e.target.value)}
                              className="bg-gray-50 border border-gray-300 p-2 rounded-xl w-28 text-gray-800"
                            />
                            <button
                              onClick={async () => {
                                await supabase.from("users").update({ deposit: depositValue }).eq("id", user.id);
                                setEditDeposit(null);
                                fetchAll();
                              }}
                              className="bg-green-500 text-white px-3 py-1 rounded-xl text-sm"
                            >
                              Save
                            </button>
                            <button onClick={() => setEditDeposit(null)} className="text-gray-500 text-sm">Cancel</button>
                          </div>
                        ) : (
                          <span className="font-bold text-gray-800">₹{deposit}</span>
                        )}
                      </td>
                      <td className="p-4 font-medium text-red-500">₹{totalExp}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          remaining < 0
                            ? "bg-red-100 text-red-700"
                            : remaining === 0
                            ? "bg-gray-100 text-gray-500"
                            : "bg-green-100 text-green-700"
                        }`}>
                          ₹{remaining}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setEditDeposit(user.id);
                            setDepositValue(String(deposit));
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          Set Deposit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUPERVISOR SITE HISTORY */}
      <div className="bg-white rounded-[30px] shadow-xl p-6 mt-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
          <FaUserCheck className="text-indigo-500" /> Supervisor Site History
        </h2>
        {(() => {
          const siteRecords = [
            ...expenses.map((e) => ({ supervisor: e.supervisor, site: e.site, date: e.created_at })),
            ...labors.map((l) => ({ supervisor: l.supervisor, site: l.site_name || "-", date: l.created_at })),
            ...materials.map((m) => ({ supervisor: m.supervisor, site: m.site_name || "-", date: m.created_at })),
            ...supervisorSitesData.map((s) => ({ supervisor: s.supervisor, site: s.site, date: s.created_at })),
          ].filter((r) => r.supervisor);

          const supervisorSites: Record<string, { sites: string[]; currentSite: string; lastActive: string }> = {};

          siteRecords.forEach((r) => {
            if (!supervisorSites[r.supervisor]) {
              supervisorSites[r.supervisor] = { sites: [], currentSite: "", lastActive: "" };
            }
            if (!supervisorSites[r.supervisor].sites.includes(r.site)) {
              supervisorSites[r.supervisor].sites.push(r.site);
            }
            if (!supervisorSites[r.supervisor].lastActive || r.date > supervisorSites[r.supervisor].lastActive) {
              supervisorSites[r.supervisor].lastActive = r.date;
              supervisorSites[r.supervisor].currentSite = r.site;
            }
          });

          const supervisorList = Object.entries(supervisorSites);

          return supervisorList.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No site activity recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-4 text-left rounded-l-2xl">Supervisor</th>
                    <th className="p-4 text-left">Sites Worked At</th>
                    <th className="p-4 text-left">Current Site</th>
                    <th className="p-4 text-left rounded-r-2xl">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {supervisorList.map(([name, info]) => (
                    <tr key={name} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{name}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {info.sites.map((site) => (
                            <span key={site} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              {site}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-medium">{info.currentSite}</td>
                      <td className="p-4">
                        {info.sites.length > 1 ? (
                          <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium">
                            Moved Sites ({info.sites.length} sites)
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                            Active at {info.currentSite}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default AdminSupervisors;
