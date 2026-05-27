import { useEffect, useState } from "react";
import {
  FaPlus, FaTimes, FaBuilding, FaMoneyBillWave, FaUsers, FaTools,
  FaClipboardList, FaExchangeAlt, FaCalendarAlt, FaCheckCircle,
} from "react-icons/fa";
import { supabase } from "../../config/supabase";

const AdminSites = () => {
  const [mode, setMode] = useState<"view" | "create">("view");
  const [sites, setSites] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [labors, setLabors] = useState<any[]>([]);
  const [dailyUpdates, setDailyUpdates] = useState<any[]>([]);
  const [supervisorSites, setSupervisorSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [siteName, setSiteName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");

  const fetchAll = async () => {
    const [s, e, m, l, d, ss] = await Promise.all([
      supabase.from("sites").select("*").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").order("created_at", { ascending: false }),
      supabase.from("materials").select("*").order("created_at", { ascending: false }),
      supabase.from("labor").select("*").order("created_at", { ascending: false }),
      supabase.from("daily_updates").select("*").order("created_at", { ascending: false }),
      supabase.from("supervisor_sites").select("*"),
    ]);
    if (!s.error && s.data) setSites(s.data);
    if (!e.error && e.data) setExpenses(e.data);
    if (!m.error && m.data) setMaterials(m.data);
    if (!l.error && l.data) setLabors(l.data);
    if (!d.error && d.data) setDailyUpdates(d.data);
    if (!ss.error && ss.data) setSupervisorSites(ss.data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const createSite = async () => {
    if (!siteName) { alert("Site name is required"); return; }
    const { error } = await supabase.from("sites").insert([
      { site_name: siteName, location: siteLocation, status: "running" },
    ]);
    if (error) { alert(error.message); return; }
    alert("Site created");
    setSiteName(""); setSiteLocation(""); setMode("view");
    fetchAll();
  };

  const siteExpenses = (site: string) => expenses.filter((e) => e.site === site);
  const siteMaterials = (site: string) => materials.filter((m) => m.site_name === site);
  const siteUpdates = (site: string) => dailyUpdates.filter((d) => d.site === site);

  const siteSupervisors = (site: string) => {
    const sups = new Set<string>();
    siteExpenses(site).forEach((e) => e.supervisor && sups.add(e.supervisor));
    siteMaterials(site).forEach((m) => m.supervisor && sups.add(m.supervisor));
    siteUpdates(site).forEach((d) => d.supervisor && sups.add(d.supervisor));
    supervisorSites.filter((s) => s.site === site).forEach((s) => s.supervisor && sups.add(s.supervisor));
    return Array.from(sups);
  };

  const siteTotalExpense = (site: string) =>
    siteExpenses(site).reduce((t, i) => t + Number(i.amount), 0);

  const siteTotalMaterialCost = (site: string) =>
    siteMaterials(site).reduce((t, i) => t + Number(i.amount), 0);

  const siteTotalPaid = (site: string) =>
    siteExpenses(site).reduce((t, i) => t + Number(i.paid_amount || 0), 0);

  if (loading) return <p className="text-gray-500 text-center mt-10">Loading site data...</p>;

  const selected = sites.find((s) => s.site_name === selectedSite);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Site Analytics</h1>
          <p className="text-gray-500 mt-2">Manage & monitor construction sites</p>
        </div>
        <button
          onClick={() => { setMode(mode === "create" ? "view" : "create"); setSelectedSite(null); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition ${
            mode === "create" ? "bg-gray-500 text-white" : "bg-indigo-600 text-white"
          }`}
        >
          {mode === "create" ? <><FaTimes /> Cancel</> : <><FaPlus /> Create Site</>}
        </button>
      </div>

      {/* CREATE SITE */}
      {mode === "create" && (
        <div className="bg-white rounded-[30px] shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">New Site</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <input type="text" placeholder="Site Name *" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800" />
            <input type="text" placeholder="Location" value={siteLocation} onChange={(e) => setSiteLocation(e.target.value)} className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800" />
          </div>
          <button onClick={createSite} className="mt-6 bg-green-600 text-white px-6 py-3 rounded-2xl hover:scale-105 transition">Create Site</button>
        </div>
      )}

      {/* RUNNING SITES */}
      {mode === "view" && (
        <div>
          {/* SITE CARDS */}
          {!selectedSite && (
            <div className="grid md:grid-cols-3 gap-6">
              {sites.length === 0 ? (
                <div className="col-span-3 text-center py-16">
                  <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No sites created yet</p>
                  <button onClick={() => setMode("create")} className="mt-4 text-indigo-600 hover:underline">Create your first site</button>
                </div>
              ) : (
                sites.map((site) => {
                  const supervisors = siteSupervisors(site.site_name);
                  const totalExp = siteTotalExpense(site.site_name);
                  const totalMat = siteTotalMaterialCost(site.site_name);
                  return (
                    <div
                      key={site.id}
                      onClick={() => setSelectedSite(site.site_name)}
                      className="bg-white rounded-[30px] shadow-xl p-6 cursor-pointer hover:scale-[1.02] transition border border-gray-100"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <FaBuilding className="text-3xl text-indigo-500" />
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">{site.site_name}</h2>
                          <p className="text-gray-400 text-sm">{site.location || "No location"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-green-50 p-3 rounded-2xl">
                          <p className="text-gray-500">Expenses</p>
                          <p className="font-bold text-gray-800">₹{totalExp}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-2xl">
                          <p className="text-gray-500">Materials</p>
                          <p className="font-bold text-gray-800">₹{totalMat}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-2xl col-span-2">
                          <p className="text-gray-500">Supervisors</p>
                          <p className="font-bold text-gray-800">{supervisors.length > 0 ? supervisors.join(", ") : "None assigned"}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className={`text-xs px-3 py-1 rounded-full ${site.status === "running" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {site.status === "running" ? "● Running" : "Completed"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* SITE DETAILS */}
          {selectedSite && selected && (
            <div>
              <button onClick={() => setSelectedSite(null)} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6">
                <FaTimes /> Back to all sites
              </button>

              <div className="bg-white rounded-[30px] shadow-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">{selected.site_name}</h2>
                    <p className="text-gray-500">{selected.location || "No location"}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${selected.status === "running" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {selected.status === "running" ? "● Running" : "Completed"}
                  </span>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-red-50 p-4 rounded-2xl">
                    <p className="text-gray-500 text-sm">Total Expense</p>
                    <p className="text-2xl font-bold text-red-600">₹{siteTotalExpense(selectedSite)}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-2xl">
                    <p className="text-gray-500 text-sm">Material Cost</p>
                    <p className="text-2xl font-bold text-orange-600">₹{siteTotalMaterialCost(selectedSite)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl">
                    <p className="text-gray-500 text-sm">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">₹{siteTotalPaid(selectedSite)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl">
                    <p className="text-gray-500 text-sm">Supervisors</p>
                    <p className="text-2xl font-bold text-blue-600">{siteSupervisors(selectedSite).length}</p>
                  </div>
                </div>
              </div>

              {/* DATE-WISE MATERIALS */}
              <div className="bg-white rounded-[30px] shadow-xl p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <FaTools className="text-orange-500" /> Date-wise Materials
                </h2>
                {siteMaterials(selectedSite).length === 0 ? (
                  <p className="text-gray-400 text-center py-6">No materials recorded at this site</p>
                ) : (
                  (() => {
                    const grouped: Record<string, any[]> = {};
                    siteMaterials(selectedSite).forEach((m) => {
                      const d = m.material_date || m.created_at?.split("T")[0] || "Unknown";
                      if (!grouped[d]) grouped[d] = [];
                      grouped[d].push(m);
                    });
                    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([date, items]) => (
                      <div key={date} className="mb-6 last:mb-0">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <FaCalendarAlt className="text-indigo-400" /> {date}
                        </h3>
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="p-3 text-left rounded-l-2xl text-sm">Material</th>
                              <th className="p-3 text-left text-sm">Qty</th>
                              <th className="p-3 text-left text-sm">Amount</th>
                              <th className="p-3 text-left text-sm">Vendor</th>
                              <th className="p-3 text-left rounded-r-2xl text-sm">Supervisor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((m) => (
                              <tr key={m.id} className="border-b">
                                <td className="p-3">{m.material_name}</td>
                                <td className="p-3">{m.quantity}</td>
                                <td className="p-3 font-medium">₹{m.amount}</td>
                                <td className="p-3">{m.vendor_name || "-"}</td>
                                <td className="p-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{m.supervisor}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ));
                  })()
                )}
              </div>

              {/* DATE-WISE LABOR */}
              <div className="bg-white rounded-[30px] shadow-xl p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <FaUsers className="text-green-500" /> Date-wise Labor with Payment
                </h2>
                {labors.filter((l) => siteSupervisors(selectedSite).includes(l.supervisor)).length === 0 ? (
                  <p className="text-gray-400 text-center py-6">No labor entries for supervisors at this site</p>
                ) : (
                  (() => {
                    const siteLabors = labors.filter((l) => siteSupervisors(selectedSite).includes(l.supervisor));
                    const grouped: Record<string, any[]> = {};
                    siteLabors.forEach((l) => {
                      const d = l.created_at?.split("T")[0] || "Unknown";
                      if (!grouped[d]) grouped[d] = [];
                      grouped[d].push(l);
                    });
                    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([date, items]) => (
                      <div key={date} className="mb-6 last:mb-0">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <FaCalendarAlt className="text-indigo-400" /> {date}
                        </h3>
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="p-3 text-left rounded-l-2xl text-sm">Labor</th>
                              <th className="p-3 text-left text-sm">Workers</th>
                              <th className="p-3 text-left text-sm">Wage/Worker</th>
                              <th className="p-3 text-left text-sm">Total Payment</th>
                              <th className="p-3 text-left rounded-r-2xl text-sm">Supervisor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((l) => {
                              const totalPayment = Number(l.daily_wage || 0) * Number(l.total_workers || 0);
                              return (
                                <tr key={l.id} className="border-b">
                                  <td className="p-3">{l.labor_name}</td>
                                  <td className="p-3">{l.total_workers}</td>
                                  <td className="p-3">₹{l.daily_wage}</td>
                                  <td className="p-3 font-medium text-green-600">₹{totalPayment}</td>
                                  <td className="p-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{l.supervisor}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ));
                  })()
                )}
              </div>

              {/* SUPERVISOR ATTENDANCE DATE-WISE */}
              <div className="bg-white rounded-[30px] shadow-xl p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <FaClipboardList className="text-cyan-500" /> Date-wise Supervisor Attendance
                </h2>
                {siteUpdates(selectedSite).length === 0 && siteExpenses(selectedSite).length === 0 && siteMaterials(selectedSite).length === 0 ? (
                  <p className="text-gray-400 text-center py-6">No supervisor activity at this site</p>
                ) : (
                  (() => {
                    const records: { date: string; supervisor: string; activity: string }[] = [
                      ...siteUpdates(selectedSite).map((d) => ({ date: d.created_at?.split("T")[0] || "", supervisor: d.supervisor, activity: "Daily Update" })),
                      ...siteExpenses(selectedSite).map((e) => ({ date: e.created_at?.split("T")[0] || "", supervisor: e.supervisor, activity: "Expense: ₹" + e.amount })),
                      ...siteMaterials(selectedSite).map((m) => ({ date: m.created_at?.split("T")[0] || "", supervisor: m.supervisor, activity: "Material: " + m.material_name })),
                    ].filter((r) => r.date && r.supervisor);

                    const grouped: Record<string, { supervisor: string; activities: string[] }> = {};
                    records.forEach((r) => {
                      const key = r.date + "|" + r.supervisor;
                      if (!grouped[key]) grouped[key] = { supervisor: r.supervisor, activities: [] };
                      grouped[key].activities.push(r.activity);
                    });

                    const dates = [...new Set(records.map((r) => r.date))].sort().reverse();

                    return (
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-3 text-left rounded-l-2xl">Date</th>
                            <th className="p-3 text-left">Supervisor</th>
                            <th className="p-3 text-left rounded-r-2xl">Activity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dates.map((date) => {
                            const dayRecords = records.filter((r) => r.date === date);
                            const sups = [...new Set(dayRecords.map((r) => r.supervisor))];
                            return sups.map((sup, i) => {
                              const supRecords = dayRecords.filter((r) => r.supervisor === sup);
                              return (
                                <tr key={date + sup} className="border-b">
                                  {i === 0 && <td className="p-3 font-medium" rowSpan={sups.length}>{date}</td>}
                                  <td className="p-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{sup}</span></td>
                                  <td className="p-3">
                                    <div className="flex flex-wrap gap-1">
                                      {supRecords.map((r, idx) => (
                                        <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs">{r.activity}</span>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })}
                        </tbody>
                      </table>
                    );
                  })()
                )}
              </div>

              {/* SUPERVISOR REPLACEMENT HISTORY */}
              <div className="bg-white rounded-[30px] shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <FaExchangeAlt className="text-purple-500" /> Site Supervisor Replacement History
                </h2>
                {(() => {
                  const supHistory = supervisorSites
                    .filter((s) => s.site === selectedSite)
                    .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));

                  const activityHistory = [
                    ...siteExpenses(selectedSite).map((e) => ({ supervisor: e.supervisor, date: e.created_at, type: "expense" as const })),
                    ...siteMaterials(selectedSite).map((m) => ({ supervisor: m.supervisor, date: m.created_at, type: "material" as const })),
                    ...siteUpdates(selectedSite).map((d) => ({ supervisor: d.supervisor, date: d.created_at, type: "update" as const })),
                  ].filter((r) => r.supervisor && r.date)
                    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

                  const supTimeline: { supervisor: string; from: string; to: string }[] = [];
                  let currentSup = "";
                  let startDate = "";

                  const allEntries = [
                    ...supHistory.map((s) => ({ supervisor: s.supervisor, date: s.created_at, source: "assigned" as const })),
                    ...activityHistory.map((a) => ({ supervisor: a.supervisor, date: a.date, source: "activity" as const })),
                  ].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

                  allEntries.forEach((entry) => {
                    if (entry.supervisor !== currentSup) {
                      if (currentSup && startDate) {
                        supTimeline.push({ supervisor: currentSup, from: startDate.split("T")[0], to: entry.date?.split("T")[0] || "Present" });
                      }
                      currentSup = entry.supervisor;
                      startDate = entry.date || "";
                    }
                  });
                  if (currentSup && startDate) {
                    supTimeline.push({ supervisor: currentSup, from: startDate.split("T")[0], to: "Present" });
                  }

                  return supTimeline.length === 0 ? (
                    <p className="text-gray-400 text-center py-6">No supervisor changes recorded at this site</p>
                  ) : (
                    <div className="relative pl-8 border-l-4 border-indigo-200 space-y-6">
                      {supTimeline.map((entry, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[2.35rem] mt-1 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                            <FaCheckCircle className="text-white text-xs" />
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{entry.supervisor}</span>
                              <span className="text-gray-400 text-xs">{entry.from} → {entry.to}</span>
                            </div>
                            {i > 0 && (
                              <p className="text-xs text-gray-500">
                                Replaced {supTimeline[i - 1].supervisor}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSites;
