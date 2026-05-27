import { useEffect, useState } from "react";
import { FaChartLine, FaUsers, FaMoneyCheckAlt, FaFileInvoiceDollar } from "react-icons/fa";
import { supabase } from "../../config/supabase";

const AdminSales = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setLeads(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const totalRevenue = leads.reduce((t, i) => t + Number(i.budget), 0);
  const closedDeals = leads.filter((l) => l.status === "Closed");
  const pendingLeads = leads.filter((l) => l.status === "Follow-up");

  if (loading) return <p className="text-gray-500 text-center mt-10">Loading sales data...</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Sales Tracking</h1>
        <p className="text-gray-500 mt-2">Monitor all leads, deals & revenue from sales team</p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-[30px] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <FaUsers className="text-4xl" />
            <div>
              <h2 className="text-lg opacity-90">Total Leads</h2>
              <h1 className="text-3xl font-bold mt-1">{leads.length}</h1>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-[30px] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <FaFileInvoiceDollar className="text-4xl" />
            <div>
              <h2 className="text-lg opacity-90">Closed Deals</h2>
              <h1 className="text-3xl font-bold mt-1">{closedDeals.length}</h1>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-pink-600 p-6 rounded-[30px] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <FaChartLine className="text-4xl" />
            <div>
              <h2 className="text-lg opacity-90">Revenue</h2>
              <h1 className="text-3xl font-bold mt-1">₹{totalRevenue}</h1>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-red-600 p-6 rounded-[30px] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <FaMoneyCheckAlt className="text-4xl" />
            <div>
              <h2 className="text-lg opacity-90">Pending Leads</h2>
              <h1 className="text-3xl font-bold mt-1">{pendingLeads.length}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* LEADS TABLE */}
      <div className="bg-white rounded-[30px] shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">All Sales Leads</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left rounded-l-2xl">Client</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Project</th>
                <th className="p-4 text-left">Budget</th>
                <th className="p-4 text-left">Sales Person</th>
                <th className="p-4 text-left rounded-r-2xl">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No leads recorded yet</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{lead.client_name}</td>
                    <td className="p-4">{lead.phone}</td>
                    <td className="p-4">{lead.project_type}</td>
                    <td className="p-4 font-bold text-green-600">₹{lead.budget}</td>
                    <td className="p-4">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {lead.sales_person || "Sales Team"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          lead.status === "Closed"
                            ? "bg-green-100 text-green-700"
                            : lead.status === "Follow-up"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSales;
