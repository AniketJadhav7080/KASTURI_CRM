import { useEffect, useState } from "react";

import {
  FaBuilding,
  FaMoneyBillWave,
  FaUsers,
  FaChartLine,
  FaFileExcel,
  FaFilePdf,
  FaClipboardList,
  FaUserShield,
  FaTools,
  FaTruck,
} from "react-icons/fa";

import { supabase } from "../../config/supabase";

import AdminUsers from "./AdminUsers";
import AdminSupervisors from "./AdminSupervisors";
import AdminSales from "./AdminSales";
import AdminVendors from "./AdminVendors";
import AdminSites from "./AdminSites";

const AdminDashboard = () => {

  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [expenses, setExpenses] =
    useState<any[]>([]);

  const [leads, setLeads] =
    useState<any[]>([]);

  const [searchExpense, setSearchExpense] = useState("");
  const [selectedExpenses, setSelectedExpenses] = useState<any[]>([]);
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [createExpenseDate, setCreateExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [createExpenseTime, setCreateExpenseTime] = useState(new Date().toTimeString().split(" ")[0].slice(0, 5));
  const [createExpenseSupervisor, setCreateExpenseSupervisor] = useState("");
  const [createExpenseTitle, setCreateExpenseTitle] = useState("");
  const [createExpenseAmount, setCreateExpenseAmount] = useState("");
  const [supervisorList, setSupervisorList] = useState<any[]>([]);
  const [selectedSupervisorDeposit, setSelectedSupervisorDeposit] = useState(0);
  const [createExpenseSite, setCreateExpenseSite] = useState("");

  // FETCH EXPENSES

  const fetchExpenses = async () => {

    const { data, error } =
      await supabase

        .from("expenses")

        .select("*")

        .order(
          "created_at",
          { ascending: false }
        );

    if (!error && data) {

      setExpenses(data);

    }

  };

  const filteredExpenses = expenses.filter((e) => {
    const q = searchExpense.toLowerCase();
    return (
      (e.supervisor || "").toLowerCase().includes(q) ||
      (e.title || e.description || "").toLowerCase().includes(q) ||
      (e.site || "").toLowerCase().includes(q)
    );
  });

  // FETCH SUPERVISORS FOR CREATE MODAL
  const fetchSupervisors = async () => {
    const { data } = await supabase.from("users").select("*").eq("role", "supervisor");
    if (data) setSupervisorList(data);
  };

  // UPDATE DEPOSIT & SITE WHEN SUPERVISOR CHANGES
  useEffect(() => {
    const sup = supervisorList.find(
      (s) => (s.name || s.email?.split("@")[0]) === createExpenseSupervisor
    );
    if (sup) {
      const supExpenses = expenses
        .filter((e) => e.supervisor === createExpenseSupervisor)
        .reduce((t, e) => t + Number(e.amount), 0);
      setSelectedSupervisorDeposit(Number(sup.deposit || 0) - supExpenses);
      // Fetch assigned site for this supervisor
      supabase.from("supervisor_sites").select("site").eq("supervisor", createExpenseSupervisor).maybeSingle().then(({ data }) => {
        setCreateExpenseSite(data?.site || "");
      });
    } else {
      setSelectedSupervisorDeposit(0);
      setCreateExpenseSite("");
    }
  }, [createExpenseSupervisor, expenses, supervisorList]);

  // HANDLE CREATE EXPENSE
  const handleCreateExpense = async () => {
    if (!createExpenseSupervisor || !createExpenseAmount || !createExpenseTitle) {
      alert("Please fill all required fields");
      return;
    }
    const combinedDate = `${createExpenseDate}T${createExpenseTime}:00`;
    const { error } = await supabase.from("expenses").insert([
      {
        title: createExpenseTitle,
        amount: Number(createExpenseAmount),
        supervisor: createExpenseSupervisor,
        site: createExpenseSite,
        created_at: combinedDate,
        status: "Pending",
      },
    ]);
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Expense created successfully");
      setShowCreateExpense(false);
      setCreateExpenseTitle("");
      setCreateExpenseAmount("");
      setCreateExpenseSupervisor("");
      fetchExpenses();
    }
  };

  // FETCH LEADS

  const fetchLeads = async () => {

    const { data, error } =
      await supabase

        .from("leads")

        .select("*")

        .order(
          "created_at",
          { ascending: false }
        );

    if (!error && data) {

      setLeads(data);

    }

  };

  // REALTIME

  useEffect(() => {

    fetchExpenses();

    fetchLeads();

    fetchSupervisors();

    // EXPENSES REALTIME

    const expensesChannel =
      supabase

        .channel("expenses-channel")

        .on(

          "postgres_changes",

          {
            event: "*",
            schema: "public",
            table: "expenses",
          },

          () => {

            fetchExpenses();

          }

        )

        .subscribe();

    // LEADS REALTIME

    const leadsChannel =
      supabase

        .channel("leads-channel")

        .on(

          "postgres_changes",

          {
            event: "*",
            schema: "public",
            table: "leads",
          },

          () => {

            fetchLeads();

          }

        )

        .subscribe();

    return () => {

      supabase.removeChannel(
        expensesChannel
      );

      supabase.removeChannel(
        leadsChannel
      );

    };

  }, []);

  // TOTAL EXPENSE

  const totalExpense =
    expenses.reduce(

      (total, item) =>

        total +
        Number(item.amount),

      0

    );

  // TOTAL REVENUE

  const totalRevenue =
    leads.reduce(

      (total, item) =>

        total +
        Number(item.budget),

      0

    );

  const cards = [

    {
      title: "Total Projects",
      value: 24,
      icon: <FaBuilding />,
      color: "from-blue-500 to-indigo-500",
    },

    {
      title: "Total Expense",
      value: `₹${totalExpense}`,
      icon: <FaMoneyBillWave />,
      color: "from-green-500 to-emerald-500",
    },

    {
      title: "Employees",
      value: 58,
      icon: <FaUsers />,
      color: "from-orange-500 to-pink-500",
    },

    {
      title: "Sales Revenue",
      value: `₹${totalRevenue}`,
      icon: <FaChartLine />,
      color: "from-purple-500 to-indigo-500",
    },

  ];

  const sidebarButtons = [
    { key: "dashboard", icon: <FaBuilding />, label: "Dashboard" },
    { key: "expenses", icon: <FaMoneyBillWave />, label: "Supervisor Expenses" },
    { key: "supervisors", icon: <FaUsers />, label: "Supervisor Tracking" },
    { key: "sales", icon: <FaChartLine />, label: "Sales Tracking" },
    { key: "reports", icon: <FaClipboardList />, label: "Daily Reports" },
    { key: "analytics", icon: <FaTools />, label: "Site Analytics" },
    { key: "vendors", icon: <FaTruck />, label: "Vendor Management" },
    { key: "users", icon: <FaUserShield />, label: "Employee Management" },
  ];

  return (

    <div className="min-h-screen bg-gray-100 flex">

      {/* SIDEBAR */}

      <div className="w-[280px] bg-gradient-to-b from-indigo-700 to-blue-600 text-white p-6 shadow-2xl">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold leading-tight">KASTURI</h1>
          <h1 className="text-3xl font-bold leading-tight">ARCHITECTS</h1>
          <h1 className="text-3xl font-bold leading-tight">CRM</h1>
        </div>

        <div className="space-y-4">

          {sidebarButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() =>
                setActiveSection(btn.key)
              }
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition ${
                activeSection === btn.key
                  ? "bg-white/30 shadow-lg"
                  : "hover:bg-white/20"
              }`}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}

        </div>

      </div>

      {/* MAIN */}

      <div className="flex-1 p-8 overflow-y-auto">

        {/* ============ DASHBOARD ============ */}

        {activeSection === "dashboard" && (

          <div>

            {/* HEADER */}

            <div className="flex justify-between items-center mb-8">

              <div>

                <h1 className="text-4xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>

                <p className="text-gray-500 mt-2">
                  Construction Management System
                </p>

              </div>

              <div className="flex gap-4">

                <button className="flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition">

                  <FaFileExcel />

                  Excel Export

                </button>

                <button className="flex items-center gap-2 bg-red-500 text-white px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition">

                  <FaFilePdf />

                  PDF Report

                </button>

              </div>

            </div>

            {/* CARDS */}

            <div className="grid md:grid-cols-4 gap-6 mb-10">

              {cards.map((card, index) => (

                <div
                  key={index}
                  className={`bg-gradient-to-r ${card.color} p-6 rounded-[30px] shadow-2xl text-white hover:scale-105 transition`}
                >

                  <div className="flex justify-between items-center">

                    <div>

                      <h2 className="text-lg opacity-90">
                        {card.title}
                      </h2>

                      <h1 className="text-3xl font-bold mt-4">
                        {card.value}
                      </h1>

                    </div>

                    <div className="text-5xl opacity-80">

                      {card.icon}

                    </div>

                  </div>

                </div>

              ))}

            </div>

            {/* LIVE EXPENSES */}

            <div className="bg-white rounded-[30px] shadow-xl p-6 mb-8">

              <h2 className="text-2xl font-bold mb-6 text-gray-800">

                Live Expenses

              </h2>

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="bg-gray-100">

                      <th className="p-4 text-left rounded-l-2xl">
                        Title
                      </th>

                      <th className="p-4 text-left">
                        Amount
                      </th>

                      <th className="p-4 text-left">
                        Site
                      </th>

                      <th className="p-4 text-left">
                        Supervisor
                      </th>

                      <th className="p-4 text-left rounded-r-2xl">
                        Date
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {expenses.map((item) => (

                      <tr
                        key={item.id}
                        className="border-b hover:bg-gray-50"
                      >

                        <td className="p-4">
                          {item.title}
                        </td>

                        <td className="p-4 font-bold text-red-500">
                          ₹{item.amount}
                        </td>

                        <td className="p-4">
                          {item.site}
                        </td>

                        <td className="p-4">
                          {item.supervisor}
                        </td>

                        <td className="p-4">

                          {new Date(
                            item.created_at
                          ).toLocaleDateString()}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

            {/* LIVE LEADS */}

            <div className="bg-white rounded-[30px] shadow-xl p-6 mb-8">

              <h2 className="text-2xl font-bold mb-6 text-gray-800">

                Live Sales Leads

              </h2>

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="bg-gray-100">

                      <th className="p-4 text-left rounded-l-2xl">
                        Client
                      </th>

                      <th className="p-4 text-left">
                        Phone
                      </th>

                      <th className="p-4 text-left">
                        Project
                      </th>

                      <th className="p-4 text-left">
                        Budget
                      </th>

                      <th className="p-4 text-left rounded-r-2xl">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {leads.map((lead) => (

                      <tr
                        key={lead.id}
                        className="border-b hover:bg-gray-50"
                      >

                        <td className="p-4">
                          {lead.client_name}
                        </td>

                        <td className="p-4">
                          {lead.phone}
                        </td>

                        <td className="p-4">
                          {lead.project_type}
                        </td>

                        <td className="p-4 font-bold text-green-600">
                          ₹{lead.budget}
                        </td>

                        <td className="p-4">

                          <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm">

                            {lead.status}

                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

        {/* ============ SUPERVISOR EXPENSES ============ */}

        {activeSection === "expenses" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Supervisor Expenses</h1>
                <p className="text-gray-500 mt-2">Manage, create & approve supervisor expenses</p>
              </div>
              <button
                onClick={() => setShowCreateExpense(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
              >
                + Create Expense
              </button>
            </div>

            {/* SEARCH BAR */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by supervisor, title, site..."
                value={searchExpense}
                onChange={(e) => setSearchExpense(e.target.value)}
                className="w-full bg-white border border-gray-300 p-4 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* SELECTED COUNT + BULK ACTION */}
            {selectedExpenses.length > 0 && (
              <div className="mb-4 flex items-center gap-4 bg-indigo-50 p-4 rounded-2xl">
                <span className="text-sm font-medium text-indigo-700">{selectedExpenses.length} selected</span>
                <button
                  onClick={async () => {
                    for (const id of selectedExpenses) {
                      await supabase.from("expenses").update({ status: "Approved" }).eq("id", id);
                    }
                    setSelectedExpenses([]);
                    fetchExpenses();
                    alert(`Approved ${selectedExpenses.length} expenses`);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-600"
                >
                  Approve All
                </button>
                <button
                  onClick={async () => {
                    for (const id of selectedExpenses) {
                      await supabase.from("expenses").update({ status: "Rejected" }).eq("id", id);
                    }
                    setSelectedExpenses([]);
                    fetchExpenses();
                    alert(`Rejected ${selectedExpenses.length} expenses`);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-600"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setSelectedExpenses([])}
                  className="text-gray-500 text-sm hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="bg-white rounded-[30px] shadow-xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-4 text-left rounded-l-2xl w-10">
                        <input
                          type="checkbox"
                          checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0}
                          onChange={() => {
                            if (selectedExpenses.length === filteredExpenses.length) {
                              setSelectedExpenses([]);
                            } else {
                              setSelectedExpenses(filteredExpenses.map(e => e.id));
                            }
                          }}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="p-4 text-left">Title</th>
                      <th className="p-4 text-left">Amount</th>
                      <th className="p-4 text-left">Site</th>
                      <th className="p-4 text-left">Supervisor</th>
                      <th className="p-4 text-left">Date</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left rounded-r-2xl">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.length === 0 ? (
                      <tr><td colSpan={8} className="p-8 text-center text-gray-400">No expenses found</td></tr>
                    ) : (
                      filteredExpenses.map((item) => {
                        const status = item.status || "Pending";
                        return (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={selectedExpenses.includes(item.id)}
                                onChange={() => {
                                  setSelectedExpenses(prev =>
                                    prev.includes(item.id)
                                      ? prev.filter(id => id !== item.id)
                                      : [...prev, item.id]
                                  );
                                }}
                                className="w-4 h-4"
                              />
                            </td>
                            <td className="p-4 font-medium">{item.title || item.description}</td>
                            <td className="p-4 font-bold text-red-500">₹{item.amount}</td>
                            <td className="p-4">{item.site}</td>
                            <td className="p-4">
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{item.supervisor}</span>
                            </td>
                            <td className="p-4">{new Date(item.created_at).toLocaleDateString()}</td>
                            <td className="p-4">
                              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                status === "Approved"
                                  ? "bg-green-100 text-green-700"
                                  : status === "Rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="p-4">
                              {status === "Pending" && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={async () => {
                                      await supabase.from("expenses").update({ status: "Approved" }).eq("id", item.id);
                                      fetchExpenses();
                                    }}
                                    className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-600"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await supabase.from("expenses").update({ status: "Rejected" }).eq("id", item.id);
                                      fetchExpenses();
                                    }}
                                    className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-600"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {status !== "Pending" && (
                                <span className="text-gray-400 text-sm">{status}</span>
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

            {/* CREATE EXPENSE MODAL */}
            {showCreateExpense && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateExpense(false)}>
                <div className="bg-white rounded-[30px] p-8 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Supervisor Expense</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Date</label>
                      <input
                        type="date"
                        value={createExpenseDate}
                        onChange={(e) => setCreateExpenseDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Time</label>
                      <input
                        type="time"
                        value={createExpenseTime}
                        onChange={(e) => setCreateExpenseTime(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Supervisor Name</label>
                      <select
                        value={createExpenseSupervisor}
                        onChange={(e) => setCreateExpenseSupervisor(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-800"
                      >
                        <option value="">Select Supervisor</option>
                        {supervisorList.map((s) => (
                          <option key={s.id} value={s.name || s.email?.split("@")[0]}>{s.name || s.email?.split("@")[0]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Supervisor Deposit (Remaining)</label>
                      <p className={`text-lg font-bold ${selectedSupervisorDeposit < 0 ? "text-red-500" : "text-green-600"}`}>
                        ₹{selectedSupervisorDeposit}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Site <span className="text-gray-400 text-xs">(auto-filled from supervisor)</span></label>
                      <input
                        type="text"
                        value={createExpenseSite}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 p-3 rounded-xl text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Title</label>
                      <input
                        type="text"
                        value={createExpenseTitle}
                        onChange={(e) => setCreateExpenseTitle(e.target.value)}
                        placeholder="e.g. Material Purchase"
                        className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Expense Amount (₹)</label>
                      <input
                        type="number"
                        value={createExpenseAmount}
                        onChange={(e) => setCreateExpenseAmount(e.target.value)}
                        placeholder="0"
                        className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-800"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleCreateExpense}
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-medium hover:bg-indigo-700 transition"
                      >
                        Save Expense
                      </button>
                      <button
                        onClick={() => setShowCreateExpense(false)}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ SUPERVISORS ============ */}

        {activeSection === "supervisors" && <AdminSupervisors />}

        {/* ============ SALES ============ */}

        {activeSection === "sales" && <AdminSales />}

        {/* ============ REPORTS ============ */}

        {activeSection === "reports" && (
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Daily Reports</h1>
            <div className="bg-white rounded-[30px] shadow-xl p-6">
              <p className="text-gray-500 text-center py-10">Daily reports & site updates coming soon</p>
            </div>
          </div>
        )}

        {/* ============ ANALYTICS ============ */}

        {activeSection === "analytics" && <AdminSites />}

        {/* ============ VENDORS ============ */}

        {activeSection === "vendors" && <AdminVendors />}

        {/* ============ USERS ============ */}

        {activeSection === "users" && <AdminUsers />}

      </div>

    </div>

  );
};

export default AdminDashboard;
