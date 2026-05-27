import { useEffect, useState } from "react";
import {
  FaTruck, FaPlus, FaTimes, FaEdit, FaSave, FaSearch,
  FaMoneyBillWave, FaBoxes, FaCheckCircle, FaTimesCircle,
} from "react-icons/fa";
import { supabase } from "../../config/supabase";

const AdminVendors = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [vendorName, setVendorName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [address, setAddress] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  // Payment modal
  const [payModal, setPayModal] = useState<{ open: boolean; vendor: string }>({ open: false, vendor: "" });
  // Material modal
  const [matModal, setMatModal] = useState<{ open: boolean; vendor: string }>({ open: false, vendor: "" });

  // Add material form
  const [matFormOpen, setMatFormOpen] = useState(false);
  const [newMatSite, setNewMatSite] = useState("");
  const [newMatDate, setNewMatDate] = useState(new Date().toISOString().split("T")[0]);
  const [newMatQty, setNewMatQty] = useState("");
  const [newMatSupervisor, setNewMatSupervisor] = useState("");
  const [newMatBill, setNewMatBill] = useState<File | null>(null);
  const [newMatBillPreview, setNewMatBillPreview] = useState("");
  const [newMatName, setNewMatName] = useState("");
  const [newMatAmount, setNewMatAmount] = useState("");
  const [siteOptions, setSiteOptions] = useState<string[]>([]);
  const [supervisorOptions, setSupervisorOptions] = useState<{ name: string; id: string }[]>([]);



  const fetchAll = async () => {
    const [venData, matData, payData, siteData, userData] = await Promise.all([
      supabase.from("vendors").select("*").order("created_at", { ascending: false }),
      supabase.from("materials").select("*").order("created_at", { ascending: false }),
      supabase.from("vendor_payments").select("*").order("created_at", { ascending: false }),
      supabase.from("sites").select("site_name"),
      supabase.from("users").select("id, name, email").eq("role", "supervisor"),
    ]);

    if (!venData.error && venData.data) setVendors(venData.data);
    if (!matData.error && matData.data) setMaterials(matData.data);
    if (!payData.error && payData.data) setPayments(payData.data);
    if (!siteData.error && siteData.data) setSiteOptions(siteData.data.map((s: any) => s.site_name));
    if (!userData.error && userData.data) setSupervisorOptions(
      userData.data.map((u: any) => ({ name: u.name || u.email?.split("@")[0], id: u.id }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const addVendor = async () => {
    if (!vendorName || !phone) {
      alert("Vendor name & phone are required");
      return;
    }
    const { error } = await supabase.from("vendors").insert([
      { vendor_name: vendorName, contact_person: contactPerson, phone, email, service_type: serviceType, address, status: "active" },
    ]);
    if (error) { alert(error.message); return; }
    alert("Vendor added");
    setVendorName(""); setContactPerson(""); setPhone(""); setEmail(""); setServiceType(""); setAddress("");
    setShowForm(false);
    fetchAll();
  };

  const deleteVendor = async (id: string) => {
    if (!confirm("Delete this vendor?")) return;
    const { error } = await supabase.from("vendors").delete().eq("id", id);
    if (!error) fetchAll(); else alert(error.message);
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "inactive" : "active";
    await supabase.from("vendors").update({ status: newStatus }).eq("id", id);
    fetchAll();
  };

  const startEdit = (v: any) => {
    setEditingId(v.id);
    setEditData({ vendor_name: v.vendor_name, contact_person: v.contact_person, phone: v.phone, email: v.email, service_type: v.service_type, address: v.address });
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from("vendors").update(editData).eq("id", id);
    if (!error) { setEditingId(null); fetchAll(); } else alert(error.message);
  };

  const vendorMaterials = (vendorName: string) =>
    materials.filter((m) => m.vendor_name?.toLowerCase() === vendorName.toLowerCase());

  const vendorPayments = (vendorName: string) =>
    payments.filter((p) => p.vendor_name?.toLowerCase() === vendorName.toLowerCase());

  const totalPaid = (name: string) =>
    vendorPayments(name).reduce((t, p) => t + Number(p.paid_amount || 0), 0);

  const filteredVendors = vendors.filter((v) => {
    const matchSearch = !search || v.vendor_name?.toLowerCase().includes(search.toLowerCase()) || v.service_type?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Vendor Management</h1>
          <p className="text-gray-500 mt-2">{vendors.length} vendors registered</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          {showForm ? <><FaTimes /> Close</> : <><FaPlus /> Add Vendor</>}
        </button>
      </div>

      {/* ADD VENDOR FORM */}
      {showForm && (
        <div className="bg-white rounded-[30px] shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">New Vendor</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <input type="text" placeholder="Vendor Name *" value={vendorName} onChange={(e) => setVendorName(e.target.value)} className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800" />
            <input type="text" placeholder="Contact Person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800" />
            <input type="text" placeholder="Phone *" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800" />
            <input type="text" placeholder="Service Type (e.g. Steel, Cement)" value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800" />
            <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-gray-50 border border-gray-300 p-4 rounded-2xl text-gray-800" />
          </div>
          <button onClick={addVendor} className="mt-6 bg-green-600 text-white px-6 py-3 rounded-2xl hover:scale-105 transition">Add Vendor</button>
        </div>
      )}

      {/* SEARCH & FILTER */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex-1 min-w-[250px] relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or service type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 p-4 pl-12 rounded-2xl text-gray-800 shadow-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-300 p-4 rounded-2xl text-gray-800 shadow-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* VENDORS TABLE */}
      <div className="bg-white rounded-[30px] shadow-xl p-6">
        {loading ? (
          <p className="text-gray-500">Loading vendors...</p>
        ) : filteredVendors.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No vendors found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left rounded-l-2xl">Vendor Name</th>
                  <th className="p-4 text-left">Contact</th>
                  <th className="p-4 text-left">Phone</th>
                  <th className="p-4 text-left">Service Type</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Paid</th>
                  <th className="p-4 text-left">Due</th>
                  <th className="p-4 text-left">Materials</th>
                  <th className="p-4 text-left rounded-r-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((v) => {
                  const isEditing = editingId === v.id;
                  const paid = totalPaid(v.vendor_name);
                  const mats = vendorMaterials(v.vendor_name);
                  const totalMatCost = mats.reduce((t, m) => t + Number(m.amount || 0), 0);

                  return (
                    <tr key={v.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        {isEditing ? (
                          <input value={editData.vendor_name} onChange={(e) => setEditData({ ...editData, vendor_name: e.target.value })} className="bg-gray-50 border border-gray-300 p-2 rounded-xl w-full" />
                        ) : (
                          <span className="font-medium">{v.vendor_name}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <input value={editData.contact_person} onChange={(e) => setEditData({ ...editData, contact_person: e.target.value })} className="bg-gray-50 border border-gray-300 p-2 rounded-xl w-full" />
                        ) : (
                          <span>{v.contact_person || "-"}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="bg-gray-50 border border-gray-300 p-2 rounded-xl w-full" />
                        ) : (
                          <span>{v.phone}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">{v.service_type || "General"}</span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => toggleStatus(v.id, v.status)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${v.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {v.status === "active" ? <><FaCheckCircle /> Active</> : <><FaTimesCircle /> Inactive</>}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-green-600">₹{paid}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${totalMatCost - paid <= 0 ? "text-green-600" : "text-red-600"}`}>₹{totalMatCost - paid}</span>
                          <button onClick={() => setPayModal({ open: true, vendor: v.vendor_name })} className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-lg hover:bg-cyan-200">+ Pay</button>
                        </div>
                      </td>
                      <td className="p-4">
                        <button onClick={() => setMatModal({ open: true, vendor: v.vendor_name })} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm">
                          <FaBoxes /> {mats.length} items
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {isEditing ? (
                            <button onClick={() => saveEdit(v.id)} className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm"><FaSave /> Save</button>
                          ) : (
                            <button onClick={() => startEdit(v)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"><FaEdit /> Edit</button>
                          )}
                          <button onClick={() => { if (isEditing) setEditingId(null); else deleteVendor(v.id); }} className={`text-sm ${isEditing ? "text-gray-500" : "text-red-500 hover:text-red-700"}`}>{isEditing ? "Cancel" : "Delete"}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAYMENT MODAL */}
      {payModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPayModal({ open: false, vendor: "" })}>
          <div className="bg-white rounded-[30px] p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-2">Pay Due Amount</h2>
            <p className="text-gray-500 mb-2">Vendor: <span className="font-medium text-gray-800">{payModal.vendor}</span></p>
            {(() => {
              const mats = vendorMaterials(payModal.vendor);
              const totalMatCost = mats.reduce((t, m) => t + Number(m.amount || 0), 0);
              const paid = totalPaid(payModal.vendor);
              const due = totalMatCost - paid;
              return (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
                  <p className="text-sm text-gray-600">Total Material Cost: <span className="font-medium text-gray-800">₹{totalMatCost}</span></p>
                  <p className="text-sm text-gray-600">Already Paid: <span className="font-medium text-green-600">₹{paid}</span></p>
                  <p className="text-lg font-bold text-red-600">Due Amount: ₹{due}</p>
                  <button
                    onClick={async () => {
                      if (due <= 0) { alert("No due amount"); return; }
                      const { error } = await supabase.from("vendor_payments").insert([
                        { vendor_name: payModal.vendor, paid_amount: due },
                      ]);
                      if (!error) {
                        alert(`Payment of ₹${due} added successfully`);
                        setPayModal({ open: false, vendor: "" });
                        fetchAll();
                      } else alert(error.message);
                    }}
                    className="w-full bg-green-600 text-white py-3 rounded-2xl mt-4 hover:bg-green-700 transition font-medium"
                  >
                    Pay ₹{due}
                  </button>
                </div>
              );
            })()}
            <button onClick={() => setPayModal({ open: false, vendor: "" })} className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl hover:bg-gray-300 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* ADD MATERIAL TO VENDOR */}
      {matFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setMatFormOpen(false)}>
          <div className="bg-white rounded-[30px] p-8 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">Add Material for {matModal.vendor}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Material Name</label>
                <input type="text" value={newMatName} onChange={(e) => setNewMatName(e.target.value)} placeholder="e.g. Cement" className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Site Name</label>
                <select value={newMatSite} onChange={(e) => setNewMatSite(e.target.value)} className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-800">
                  <option value="">Select Site</option>
                  {siteOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Date</label>
                <input type="date" value={newMatDate} onChange={(e) => setNewMatDate(e.target.value)} className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Quantity</label>
                <input type="text" value={newMatQty} onChange={(e) => setNewMatQty(e.target.value)} placeholder="e.g. 50 bags" className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Amount (₹)</label>
                <input type="number" value={newMatAmount} onChange={(e) => setNewMatAmount(e.target.value)} placeholder="0" className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Supervisor Name</label>
                <select value={newMatSupervisor} onChange={(e) => setNewMatSupervisor(e.target.value)} className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-800">
                  <option value="">Select Supervisor</option>
                  {supervisorOptions.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Bill Photo</label>
                <label className="flex items-center gap-3 bg-gray-50 border border-gray-300 p-3 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  {newMatBillPreview ? (
                    <img src={newMatBillPreview} alt="Bill" className="h-12 w-12 object-cover rounded-lg" />
                  ) : (
                    <FaBoxes className="text-gray-400 text-xl" />
                  )}
                  <span className="text-gray-500 text-sm">{newMatBillPreview ? "Change" : "Upload Bill"}</span>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewMatBill(file);
                      const reader = new FileReader();
                      reader.onload = (ev) => setNewMatBillPreview(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" />
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={async () => {
                  if (!newMatName || !newMatSite || !newMatQty || !newMatAmount || !newMatSupervisor) {
                    alert("Please fill all required fields");
                    return;
                  }
                  let billUrl = "";
                  if (newMatBill) {
                    const fileExt = newMatBill.name.split(".").pop();
                    const fileName = `vendor_bills/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage.from("bills").upload(fileName, newMatBill);
                    if (uploadError) { alert("Upload failed: " + uploadError.message); return; }
                    const { data: urlData } = supabase.storage.from("bills").getPublicUrl(fileName);
                    billUrl = urlData?.publicUrl || "";
                  }
                  const { error } = await supabase.from("materials").insert([
                    { material_name: newMatName, site_name: newMatSite, quantity: newMatQty, amount: Number(newMatAmount), supervisor: newMatSupervisor, vendor_name: matModal.vendor, bill_photo: billUrl || null, created_at: newMatDate },
                  ]);
                  if (error) { alert(error.message); return; }
                  alert("Material added");
                  setNewMatName(""); setNewMatSite(""); setNewMatQty(""); setNewMatAmount(""); setNewMatSupervisor(""); setNewMatBill(null); setNewMatBillPreview("");
                  setMatFormOpen(false);
                  fetchAll();
                }} className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-medium hover:bg-indigo-700 transition">
                  Save Material
                </button>
                <button onClick={() => setMatFormOpen(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-300 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MATERIALS MODAL */}
      {matModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setMatModal({ open: false, vendor: "" })}>
          <div className="bg-white rounded-[30px] p-8 w-full max-w-3xl shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Materials from {matModal.vendor}</h2>
              <button onClick={() => { setMatFormOpen(true); setNewMatDate(new Date().toISOString().split("T")[0]); }} className="bg-indigo-600 text-white px-4 py-2 rounded-2xl text-sm hover:bg-indigo-700 transition flex items-center gap-2">
                <FaPlus /> Add Material
              </button>
            </div>

            {vendorMaterials(matModal.vendor).length === 0 ? (
              <p className="text-gray-500 text-center py-6">No materials linked to this vendor yet</p>
            ) : (
              <>
                {/* SUPERVISOR BREAKDOWN */}
                {(() => {
                  const grouped: Record<string, { materials: any[]; total: number }> = {};
                  vendorMaterials(matModal.vendor).forEach((m) => {
                    const sup = m.supervisor || "Unknown";
                    if (!grouped[sup]) grouped[sup] = { materials: [], total: 0 };
                    grouped[sup].materials.push(m);
                    grouped[sup].total += Number(m.amount || 0);
                  });

                  return (
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {Object.entries(grouped).map(([sup, data]) => {
                        const totalPaidToVendor = totalPaid(matModal.vendor);
                        const ratio = data.total / vendorMaterials(matModal.vendor).reduce((t, m) => t + Number(m.amount || 0), 0);
                        const supPaid = Math.round(totalPaidToVendor * ratio);
                        const supRemaining = data.total - supPaid;

                        return (
                          <div key={sup} className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{sup}</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-600">Materials: <span className="font-medium text-gray-800">{data.materials.length}</span></p>
                              <p className="text-gray-600">Total Cost: <span className="font-medium text-gray-800">₹{data.total}</span></p>
                              <p className="text-gray-600">Payment Done: <span className="font-medium text-green-600">₹{supPaid}</span></p>
                              <p className="text-gray-600">Remaining: <span className={`font-medium ${supRemaining <= 0 ? "text-green-600" : "text-red-600"}`}>₹{supRemaining}</span></p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* DETAILED TABLE */}
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left rounded-l-2xl">Material</th>
                      <th className="p-3 text-left">Qty</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Supervisor</th>
                      <th className="p-3 text-left">Site</th>
                      <th className="p-3 text-left rounded-r-2xl">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const allMats = vendorMaterials(matModal.vendor);
                      const totalVendorCost = allMats.reduce((t, m) => t + Number(m.amount || 0), 0);
                      const totalVendorPaid = totalPaid(matModal.vendor);
                      return allMats.map((m) => {
                        const ratio = totalVendorCost > 0 ? Number(m.amount || 0) / totalVendorCost : 0;
                        const materialPaid = Math.round(totalVendorPaid * ratio);
                        const materialDue = Number(m.amount || 0) - materialPaid;
                        return (
                          <tr key={m.id} className="border-b">
                            <td className="p-3">{m.material_name}</td>
                            <td className="p-3">{m.quantity}</td>
                            <td className="p-3 font-medium">₹{m.amount}</td>
                            <td className="p-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">{m.supervisor}</span></td>
                            <td className="p-3">{m.site_name || "-"}</td>
                            <td className="p-3">
                              <span className={`font-medium ${materialDue <= 0 ? "text-green-600" : "text-red-600"}`}>
                                ₹{materialDue}
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </>
            )}
            <button onClick={() => setMatModal({ open: false, vendor: "" })} className="mt-6 bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendors;
