import { useEffect, useState } from "react";

import {
  FaClipboardList,
  FaUsers,
  FaTools,
  FaMoneyBillWave,
  FaCamera,
  FaUserCheck,
  FaChartLine,
  FaExclamationTriangle,
  FaTruck,
  FaHome,
  FaTasks,
} from "react-icons/fa";

import { supabase } from "../../config/supabase";

const SupervisorDashboard = () => {

  // ================= ACTIVE SECTION =================

  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [showProfile, setShowProfile] =
    useState(false);

  // ================= STATIC INFO =================

  const employeeId = (() => {
    const stored = localStorage.getItem("crm_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.employee_id || "EMP-001";
    }
    return "EMP-001";
  })();

  const [assignedSite, setAssignedSite] =
    useState("Jaipur Site");

  const [showSitePicker, setShowSitePicker] =
    useState(false);

  const [depositAmount, setDepositAmount] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loadingDeposit, setLoadingDeposit] = useState(true);

  const siteOptions = [
    "Jaipur Site",
    "Delhi Site",
    "Mumbai Site",
    "Bangalore Site",
    "Pune Site",
    "Ahmedabad Site",
    "Chennai Site",
    "Kolkata Site",
    "Hyderabad Site",
    "Lucknow Site",
  ];

  const supervisorName = (() => {
    const stored = localStorage.getItem("crm_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.name || parsed.email?.split("@")[0] || "Supervisor";
    }
    return "Supervisor";
  })();

  // ================= EXPENSE =================

  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [expenses, setExpenses] =
    useState<any[]>([]);

  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [expenseTime, setExpenseTime] = useState(new Date().toTimeString().split(" ")[0].slice(0, 5));
  const [billPhoto, setBillPhoto] = useState<File | null>(null);
  const [billPhotoPreview, setBillPhotoPreview] = useState("");

  // ================= LABOR =================

  const [laborName, setLaborName] =
    useState("");

  const [totalWorkers, setTotalWorkers] =
    useState("");

  const [dailyWage, setDailyWage] =
    useState("");

  const [labors, setLabors] =
    useState<any[]>([]);

  // ================= MATERIAL =================

  const [materialName, setMaterialName] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [materialAmount, setMaterialAmount] =
    useState("");

  const [vendorName, setVendorName] =
    useState("");

  const [materials, setMaterials] =
    useState<any[]>([]);

  // ================= DAILY UPDATE =================

  const [todayWork, setTodayWork] =
    useState("");

  const [updates, setUpdates] =
    useState<any[]>([]);

  const [progress, setProgress] =
    useState("");

  // ================= ATTENDANCE =================

  const [workerName, setWorkerName] =
    useState("");

  const [attendance, setAttendance] =
    useState("");

  // ================= ISSUE =================

  const [issueText, setIssueText] =
    useState("");

  // ================= PHOTO =================

  const [photoDescription, setPhotoDescription] =
    useState("");

  // ================= SITE MANAGEMENT =================

  const fetchMySite = async () => {
    const { data } =
      await supabase
        .from("supervisor_sites")
        .select("site")
        .eq("supervisor", supervisorName)
        .maybeSingle();

    if (data?.site) {
      setAssignedSite(data.site);
    }
  };

  const saveMySite = async (site: string) => {
    setAssignedSite(site);
    setShowSitePicker(false);
    await supabase
      .from("supervisor_sites")
      .upsert(
        { supervisor: supervisorName, site },
        { onConflict: "supervisor" }
      );
  };

  // ================= FETCH UPDATES =================

  const fetchUpdates = async () => {
    const { data } =
      await supabase
        .from("daily_updates")
        .select("*")
        .eq("supervisor", supervisorName)
        .order("created_at", { ascending: false });

    if (data)
      setUpdates(data);
  };

  // ================= ADD UPDATE =================

  const addUpdate = async () => {

    if (!todayWork) {
      alert("Please enter today's work details");
      return;
    }

    const { error } =
      await supabase
        .from("daily_updates")
        .insert([
          {
            work_details: todayWork,
            site: assignedSite,
            supervisor: supervisorName,
          },
        ]);

    if (error) {

      alert("Error: " + error.message);

    } else {

      fetchUpdates();
      setTodayWork("");

      alert("Daily update submitted");

    }

  };

  // ================= DEPOSIT =================

  const fetchDeposit = async () => {
    setLoadingDeposit(true);
    const stored = localStorage.getItem("crm_user");
    if (!stored) { setLoadingDeposit(false); return; }
    const parsed = JSON.parse(stored);
    const { data } = await supabase.from("users").select("deposit").eq("id", parsed.id).single();
    if (data?.deposit) setDepositAmount(Number(data.deposit));
    const { data: expData } = await supabase.from("expenses").select("amount").eq("supervisor", supervisorName);
    if (expData) {
      const total = expData.reduce((t, e) => t + Number(e.amount), 0);
      setTotalExpense(total);
    }
    setLoadingDeposit(false);
  };

  // ================= FETCH =================

  const fetchExpenses = async () => {

    const { data } =
      await supabase
        .from("expenses")
        .select("*")
        .order(
          "id",
          { ascending: false }
        );

    if (data)
      setExpenses(data);

  };

  const fetchLabors = async () => {

    const { data } =
      await supabase
        .from("labor")
        .select("*")
        .order(
          "id",
          { ascending: false }
        );

    if (data)
      setLabors(data);

  };

  const fetchMaterials = async () => {

    const { data } =
      await supabase
        .from("materials")
        .select("*")
        .order(
          "id",
          { ascending: false }
        );

    if (data)
      setMaterials(data);

  };

  // ================= ADD EXPENSE =================

  const addExpense = async () => {

    try {

      if (!title || !amount) {
        alert("Please fill title and amount");
        return;
      }

      if (Number(amount) >= 150 && !billPhoto) {
        alert("Bill photo is required for expenses of ₹150 or more");
        return;
      }

      let billUrl = "";

      if (billPhoto) {
        const fileExt = billPhoto.name.split(".").pop();
        const fileName = `bills/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("bills")
          .upload(fileName, billPhoto);

        if (uploadError) {
          alert("Upload failed: " + uploadError.message);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("bills")
          .getPublicUrl(fileName);

        billUrl = urlData?.publicUrl || "";
      }

      const combinedDate = `${expenseDate}T${expenseTime}:00`;

      const { error } =
        await supabase
          .from("expenses")
          .insert([
            {
              title,
              amount: Number(amount),
              description,
              site: assignedSite,
              supervisor: supervisorName,
              created_at: combinedDate,
              bill_photo: billUrl || null,
            },
          ]);

      if (error) {
        alert("Error: " + error.message);
        return;
      }

      fetchExpenses();

      setTitle("");
      setAmount("");
      setDescription("");
      setBillPhoto(null);
      setBillPhotoPreview("");
      setExpenseDate(new Date().toISOString().split("T")[0]);
      setExpenseTime(new Date().toTimeString().split(" ")[0].slice(0, 5));

      alert("Expense Added");

    } catch (err: any) {
      alert("Something went wrong: " + (err.message || "Unknown error"));
    }

  };

  // ================= ADD LABOR =================

  const addLabor = async () => {

    const { error } =
      await supabase
        .from("labor")
        .insert([
          {
            labor_name:
              laborName,
            total_workers:
              totalWorkers,
            daily_wage:
              dailyWage,
            supervisor:
              supervisorName,
          },
        ]);

    if (!error) {

      fetchLabors();

      setLaborName("");
      setTotalWorkers("");
      setDailyWage("");

      alert("Labor Added");

    }

  };

  // ================= ADD MATERIAL =================

  const addMaterial = async () => {

    const { error } =
      await supabase
        .from("materials")
        .insert([
          {
            material_name:
              materialName,
            quantity,
            amount:
              materialAmount,
            vendor_name:
              vendorName,
            site_name:
              assignedSite,
            supervisor:
              supervisorName,
          },
        ]);

    if (!error) {

      fetchMaterials();

      setMaterialName("");
      setQuantity("");
      setMaterialAmount("");
      setVendorName("");

      alert("Material Added");

    }

  };

  useEffect(() => {

    fetchExpenses();

    fetchLabors();

    fetchMaterials();

    fetchUpdates();

    fetchMySite();

    fetchDeposit();

  }, []);

  return (

    <div className="min-h-screen bg-gray-100 flex">

      {/* ================= SIDEBAR ================= */}

      <div className="w-[300px] bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-r border-gray-800 p-6 text-white">

        <div className="mb-10">

          <h1 className="text-3xl font-bold">
            Supervisor Panel
          </h1>

          <p className="text-gray-400 mt-2">
            Construction Management
          </p>

        </div>

        <div className="space-y-3">

          <button
            onClick={() =>
              setActiveSection("dashboard")
            }
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition ${
              activeSection === "dashboard"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >
            <FaHome />
            Dashboard
          </button>

          <button
            onClick={() =>
              setActiveSection("daily")
            }
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition ${
              activeSection === "daily"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >
            <FaClipboardList />
            Daily Site Update
          </button>

          <button
            onClick={() =>
              setActiveSection("labor")
            }
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition ${
              activeSection === "labor"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >
            <FaUsers />
            Labor Entry
          </button>

          <button
            onClick={() =>
              setActiveSection("material")
            }
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition ${
              activeSection === "material"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >
            <FaTools />
            Material Used
          </button>

          <button
            onClick={() =>
              setActiveSection("expense")
            }
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition ${
              activeSection === "expense"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >
            <FaMoneyBillWave />
            Expense Add
          </button>

          <button
            onClick={() =>
              setActiveSection("photo")
            }
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition ${
              activeSection === "photo"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >
            <FaCamera />
            Photo Upload
          </button>

          <button
            onClick={() =>
              setActiveSection("attendance")
            }
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition ${
              activeSection === "attendance"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >
            <FaUserCheck />
            Attendance
          </button>

          <button
            onClick={() =>
              setActiveSection("progress")
            }
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition ${
              activeSection === "progress"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >
            <FaChartLine />
            Work Progress %
          </button>

          <button
            onClick={() =>
              setActiveSection("issue")
            }
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition ${
              activeSection === "issue"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >
            <FaExclamationTriangle />
            Issue Reporting
          </button>

        </div>

      </div>

      {/* ================= MAIN ================= */}

      <div className="flex-1 p-8 overflow-y-auto bg-white text-gray-800">

        {/* ================= DASHBOARD ================= */}

        {activeSection ===
          "dashboard" && (

          <div>

            <div className="flex items-center justify-between mb-8">

              <div>

                <h1 className="text-4xl font-bold">
                  Supervisor Dashboard
                </h1>

                <p className="text-gray-500 mt-2">
                  Welcome back,
                  {supervisorName}
                </p>

              </div>

              {/* PROFILE AVATAR */}

              <div className="relative">

                <button
                  onClick={() =>
                    setShowProfile(!showProfile)
                  }
                  className="w-14 h-14 rounded-full bg-cyan-500 text-white text-2xl font-bold flex items-center justify-center hover:scale-110 transition shadow-lg"
                >
                  {supervisorName.charAt(0)}
                </button>

                {showProfile && (

                  <div
                    className="absolute right-0 mt-3 w-72 bg-[#1e293b] border border-gray-700 rounded-3xl p-6 shadow-2xl z-50 text-white"
                    onClick={() =>
                      setShowProfile(false)
                    }
                  >

                    <div className="flex flex-col items-center mb-5">

                      <div className="w-16 h-16 rounded-full bg-cyan-500 text-white text-3xl font-bold flex items-center justify-center mb-3">
                        {supervisorName.charAt(0)}
                      </div>

                      <h2 className="text-xl font-bold">
                        {supervisorName}
                      </h2>

                      <p className="text-gray-400 text-sm">
                        Supervisor
                      </p>

                    </div>

                    <div className="space-y-4">

                      <div className="bg-[#0f172a] p-4 rounded-2xl">

                        <p className="text-gray-400 text-sm">
                          Employee ID
                        </p>

                        <p className="text-lg font-bold mt-1">
                          {employeeId}
                        </p>

                      </div>

                      <div className="bg-[#0f172a] p-4 rounded-2xl relative">

                        <p className="text-gray-400 text-sm">
                          Assigned Site
                        </p>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSitePicker(!showSitePicker);
                          }}
                          className="w-full flex items-center justify-between text-lg font-bold mt-1 hover:text-cyan-400 transition"
                        >
                          {assignedSite}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {showSitePicker && (
                          <div className="absolute left-0 right-0 mt-2 bg-[#1e293b] border border-gray-600 rounded-2xl shadow-2xl z-50 p-2 max-h-56 overflow-y-auto">
                            {siteOptions.map((site) => (
                              <button
                                key={site}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveMySite(site);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                                  assignedSite === site
                                    ? "bg-cyan-500/20 text-cyan-400 font-medium"
                                    : "hover:bg-gray-700 text-gray-300"
                                }`}
                              >
                                {site}
                              </button>
                            ))}
                          </div>
                        )}

                      </div>

                      <div className="bg-[#0f172a] p-4 rounded-2xl">
                        <p className="text-gray-400 text-sm">Deposit Balance</p>
                        <p className={`text-lg font-bold mt-1 ${depositAmount - totalExpense < 0 ? "text-red-400" : "text-green-400"}`}>
                          {loadingDeposit ? "..." : `₹${depositAmount - totalExpense}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Total Deposit: ₹{depositAmount} | Used: ₹{totalExpense}</p>
                      </div>

                    </div>

                  </div>

                )}

              </div>

            </div>

            {/* CLOSE DROPDOWN ON OUTSIDE CLICK */}

            {showProfile && (

              <div
                className="fixed inset-0 z-40"
                onClick={() =>
                  setShowProfile(false)
                }
              />

            )}

            {/* QUICK ACTIONS */}

            <div className="mt-10">

              <h1 className="text-2xl font-bold mb-6">
                Quick Actions
              </h1>

              <div className="grid md:grid-cols-4 gap-5">

                <div
                  onClick={() =>
                    setActiveSection("daily")
                  }
                  className="bg-white shadow-md p-6 rounded-3xl border border-gray-200 cursor-pointer hover:border-cyan-500"
                >
                  <FaClipboardList className="text-4xl text-cyan-400 mb-4" />

                  <h2 className="text-xl font-semibold">
                    Daily Update
                  </h2>
                </div>

                <div
                  onClick={() =>
                    setActiveSection("labor")
                  }
                  className="bg-white shadow-md p-6 rounded-3xl border border-gray-200 cursor-pointer hover:border-cyan-500"
                >
                  <FaUsers className="text-4xl text-green-400 mb-4" />

                  <h2 className="text-xl font-semibold">
                    Labor Entry
                  </h2>
                </div>

                <div
                  onClick={() =>
                    setActiveSection("expense")
                  }
                  className="bg-white shadow-md p-6 rounded-3xl border border-gray-200 cursor-pointer hover:border-cyan-500"
                >
                  <FaMoneyBillWave className="text-4xl text-red-400 mb-4" />

                  <h2 className="text-xl font-semibold">
                    Add Expense
                  </h2>
                </div>

                <div
                  onClick={() =>
                    setActiveSection("issue")
                  }
                  className="bg-white shadow-md p-6 rounded-3xl border border-gray-200 cursor-pointer hover:border-cyan-500"
                >
                  <FaExclamationTriangle className="text-4xl text-yellow-400 mb-4" />

                  <h2 className="text-xl font-semibold">
                    Report Issue
                  </h2>
                </div>

              </div>

            </div>

            {/* DEPOSIT INFO CARD */}
            <div className="mt-8 bg-white shadow-md p-6 rounded-3xl border border-gray-200">
              <div className="flex items-center gap-4">
                <FaMoneyBillWave className="text-3xl text-green-400" />
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Deposit Balance</h2>
                  <p className={`text-2xl font-bold mt-1 ${depositAmount - totalExpense < 0 ? "text-red-500" : "text-green-500"}`}>
                    {loadingDeposit ? "..." : `₹${depositAmount - totalExpense}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Total Deposit: ₹{depositAmount} | Expenses: ₹{totalExpense}</p>
                </div>
              </div>
            </div>

          </div>

        )}

        {/* ================= DAILY UPDATE ================= */}

        {activeSection === "daily" && (

          <div>

            <h1 className="text-3xl font-bold mb-6">
              Daily Site Update
            </h1>

            <div className="bg-white shadow-md p-6 rounded-3xl border border-gray-200">

              <textarea
                placeholder="Today Work Details"
                value={todayWork}
                onChange={(e) =>
                  setTodayWork(
                    e.target.value
                  )
                }
                className="w-full bg-gray-50 border border-gray-300 p-4 rounded-2xl h-[150px] text-gray-800"
              />

              <button
                onClick={addUpdate}
                className="mt-6 bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-2xl"
              >
                Submit Update
              </button>

            </div>

            {/* PREVIOUS UPDATES */}

            {updates.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  Previous Updates
                </h2>
                <div className="space-y-4">
                  {updates.map((u) => (
                    <div key={u.id} className="bg-white shadow-md p-6 rounded-3xl border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{u.site}</span>
                        <span className="text-gray-400 text-sm">{new Date(u.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700">{u.work_details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        )}

        {/* ================= LABOR ================= */}

        {activeSection ===
          "labor" && (

          <div>

            <h1 className="text-3xl font-bold mb-6">
              Labor Entry
            </h1>

            <div className="bg-white shadow-md p-6 rounded-3xl border border-gray-200">

              <div className="grid md:grid-cols-3 gap-6">

                <input
                  type="text"
                  placeholder="Labor Name"
                  value={laborName}
                  onChange={(e) =>
                    setLaborName(
                      e.target.value
                    )
                  }
                  className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800"
                />

                <input
                  type="number"
                  placeholder="Workers"
                  value={totalWorkers}
                  onChange={(e) =>
                    setTotalWorkers(
                      e.target.value
                    )
                  }
                  className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800"
                />

                <input
                  type="number"
                  placeholder="Daily Wage"
                  value={dailyWage}
                  onChange={(e) =>
                    setDailyWage(
                      e.target.value
                    )
                  }
                  className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800"
                />

              </div>

              <button
                onClick={addLabor}
                className="mt-6 bg-green-500 px-6 py-3 rounded-2xl"
              >

                Add Labor

              </button>

            </div>

          </div>

        )}

        {/* ================= MATERIAL ================= */}

        {activeSection ===
          "material" && (

          <div>

            <h1 className="text-3xl font-bold mb-6">
              Material Used
            </h1>

            <div className="bg-white shadow-md p-6 rounded-3xl border border-gray-200">

              <div className="grid md:grid-cols-2 gap-6">

                <input
                  type="text"
                  placeholder="Material Name"
                  value={materialName}
                  onChange={(e) =>
                    setMaterialName(
                      e.target.value
                    )
                  }
                  className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800"
                />

                <input
                  type="text"
                  placeholder="Vendor Name"
                  value={vendorName}
                  onChange={(e) =>
                    setVendorName(
                      e.target.value
                    )
                  }
                  className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800"
                />

                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value
                    )
                  }
                  className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800"
                />

                <input
                  type="number"
                  placeholder="Amount"
                  value={materialAmount}
                  onChange={(e) =>
                    setMaterialAmount(
                      e.target.value
                    )
                  }
                  className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800"
                />

              </div>

              <button
                onClick={addMaterial}
                className="mt-6 bg-orange-500 px-6 py-3 rounded-2xl"
              >

                Add Material

              </button>

            </div>

          </div>

        )}

        {/* ================= EXPENSE ================= */}

        {activeSection ===
          "expense" && (

          <div>

            <h1 className="text-3xl font-bold mb-6">
              Expense Add
            </h1>

            <div className="bg-white shadow-md p-6 rounded-3xl border border-gray-200">

              <div className="grid md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Time</label>
                  <input
                    type="time"
                    value={expenseTime}
                    onChange={(e) => setExpenseTime(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={assignedSite}
                    readOnly
                    className="w-full bg-gray-100 border border-gray-300 p-4 rounded-2xl text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Expense Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Material Purchase"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Amount (₹) {Number(amount) >= 150 ? <span className="text-red-500 text-xs">(Bill photo required)</span> : <span className="text-green-500 text-xs">(No photo needed)</span>}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (Number(e.target.value) < 150) {
                        setBillPhoto(null);
                        setBillPhotoPreview("");
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Bill Photo {Number(amount) >= 150 ? <span className="text-red-500">* Required</span> : <span className="text-green-500">Optional</span>}
                  </label>
                  <label className="flex items-center gap-3 bg-gray-50 border border-gray-300 p-4 rounded-2xl cursor-pointer hover:bg-gray-100 transition">
                    {billPhotoPreview ? (
                      <img src={billPhotoPreview} alt="Bill" className="h-12 w-12 object-cover rounded-lg" />
                    ) : (
                      <FaCamera className="text-gray-400 text-xl" />
                    )}
                    <span className="text-gray-500 text-sm">{billPhotoPreview ? "Change Photo" : "Upload Bill Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBillPhoto(file);
                          const reader = new FileReader();
                          reader.onload = (ev) => setBillPhotoPreview(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

              </div>

              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                className="w-full bg-gray-50 border border-gray-300 p-4 rounded-2xl mt-6 h-[120px] text-gray-800"
              />

              <button
                onClick={addExpense}
                className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl"
              >

                Add Expense

              </button>

            </div>

          </div>

        )}

      </div>

    </div>

  );

};

export default SupervisorDashboard;