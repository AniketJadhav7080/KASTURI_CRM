import { useEffect, useState } from "react";

import {
  FaUsers,
  FaPhoneAlt,
  FaFileInvoiceDollar,
  FaChartLine,
  FaMoneyCheckAlt,
  FaCalendarAlt,
  FaComments,
  FaHome,
  FaPlusCircle,
  FaClipboardList,
} from "react-icons/fa";

import { supabase } from "../../config/supabase";

const SalesDashboard = () => {

  // ================= ACTIVE SECTION =================

  const [activeSection, setActiveSection] =
    useState("dashboard");

  // ================= STATES =================

  const [clientName, setClientName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [projectType, setProjectType] =
    useState("");

  const [budget, setBudget] =
    useState("");

  const [status, setStatus] =
    useState("Follow-up");

  const [leads, setLeads] =
    useState<any[]>([]);

  // FOLLOWUP

  const [followupClient, setFollowupClient] =
    useState("");

  const [followupDate, setFollowupDate] =
    useState("");

  const [followupRemark, setFollowupRemark] =
    useState("");

  // QUOTATION

  const [quotationClient, setQuotationClient] =
    useState("");

  const [quotationAmount, setQuotationAmount] =
    useState("");

  const [quotationDesc, setQuotationDesc] =
    useState("");

  // DEAL STATUS

  const [dealClient, setDealClient] =
    useState("");

  const [dealStatus, setDealStatus] =
    useState("");

  // PAYMENT

  const [paymentClient, setPaymentClient] =
    useState("");

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentMode, setPaymentMode] =
    useState("");

  // SITE VISIT

  const [visitClient, setVisitClient] =
    useState("");

  const [visitDate, setVisitDate] =
    useState("");

  const [visitLocation, setVisitLocation] =
    useState("");

  // CLIENT REMARKS

  const [remarksClient, setRemarksClient] =
    useState("");

  const [remarksText, setRemarksText] =
    useState("");

  // ================= ADD LEAD =================

  const addLead = async () => {

    if (
      !clientName ||
      !phone ||
      !projectType ||
      !budget
    ) {

      alert("Fill all fields");

      return;

    }

    const { error } =
      await supabase

        .from("leads")

        .insert([

          {
            client_name: clientName,
            phone,
            project_type: projectType,
            budget,
            status,
            sales_person: "Sales Team",
          },

        ]);

    if (error) {

      alert(error.message);

    } else {

      alert("Lead Added");

      setClientName("");
      setPhone("");
      setProjectType("");
      setBudget("");

      fetchLeads();

    }

  };

  // ================= FETCH LEADS =================

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

  // ================= REALTIME =================

  useEffect(() => {

    fetchLeads();

    const channel =
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
        channel
      );

    };

  }, []);

  return (

    <div className="min-h-screen bg-[#0f172a] flex text-white">

      {/* ================= SIDEBAR ================= */}

      <div className="w-[300px] bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-r border-gray-800 p-6">

        <h1 className="text-3xl font-bold mb-10">
          SALES PANEL
        </h1>

        <div className="space-y-4">

          <button
            onClick={() =>
              setActiveSection("dashboard")
            }
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition ${
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
              setActiveSection("lead")
            }
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition ${
              activeSection === "lead"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >

            <FaUsers />

            Lead Management

          </button>

          <button
            onClick={() =>
              setActiveSection("followup")
            }
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition ${
              activeSection === "followup"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >

            <FaPhoneAlt />

            Client Follow-up

          </button>

          <button
            onClick={() =>
              setActiveSection("quotation")
            }
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition ${
              activeSection === "quotation"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >

            <FaFileInvoiceDollar />

            Quotation

          </button>

          <button
            onClick={() =>
              setActiveSection("deal")
            }
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition ${
              activeSection === "deal"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >

            <FaChartLine />

            Deal Status

          </button>

          <button
            onClick={() =>
              setActiveSection("payment")
            }
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition ${
              activeSection === "payment"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >

            <FaMoneyCheckAlt />

            Payment Tracking

          </button>

          <button
            onClick={() =>
              setActiveSection("visit")
            }
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition ${
              activeSection === "visit"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >

            <FaCalendarAlt />

            Site Visit Schedule

          </button>

          <button
            onClick={() =>
              setActiveSection("remarks")
            }
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition ${
              activeSection === "remarks"
                ? "bg-cyan-500"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >

            <FaComments />

            Client Remarks

          </button>

        </div>

      </div>

      {/* ================= MAIN ================= */}

      <div className="flex-1 p-8 overflow-y-auto">

        {/* ================= DASHBOARD ================= */}

        {activeSection ===
          "dashboard" && (

          <div>

            <h1 className="text-4xl font-bold mb-8">
              Sales Dashboard
            </h1>

            <div className="grid md:grid-cols-4 gap-6 mb-10">

              <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl">

                <h2 className="text-gray-400">
                  Total Leads
                </h2>

                <h1 className="text-4xl font-bold mt-4">
                  {leads.length}
                </h1>

              </div>

              <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl">

                <h2 className="text-gray-400">
                  Closed Deals
                </h2>

                <h1 className="text-4xl font-bold mt-4">
                  {
                    leads.filter(
                      (item) =>
                        item.status ===
                        "Closed"
                    ).length
                  }
                </h1>

              </div>

              <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl">

                <h2 className="text-gray-400">
                  Revenue
                </h2>

                <h1 className="text-4xl font-bold mt-4">
                  ₹
                  {
                    leads.reduce(
                      (
                        total,
                        item
                      ) =>
                        total +
                        Number(
                          item.budget
                        ),
                      0
                    )
                  }
                </h1>

              </div>

              <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl">

                <h2 className="text-gray-400">
                  Pending Leads
                </h2>

                <h1 className="text-4xl font-bold mt-4">
                  {
                    leads.filter(
                      (item) =>
                        item.status ===
                        "Follow-up"
                    ).length
                  }
                </h1>

              </div>

            </div>

            {/* QUICK ACTIONS */}

            <div className="grid md:grid-cols-4 gap-6">

              <div
                onClick={() =>
                  setActiveSection("lead")
                }
                className="bg-[#111827] border border-gray-800 p-6 rounded-3xl cursor-pointer hover:border-cyan-500"
              >

                <FaUsers className="text-4xl text-cyan-400 mb-4" />

                <h2 className="text-xl font-bold">
                  Add Lead
                </h2>

              </div>

              <div
                onClick={() =>
                  setActiveSection("followup")
                }
                className="bg-[#111827] border border-gray-800 p-6 rounded-3xl cursor-pointer hover:border-cyan-500"
              >

                <FaPhoneAlt className="text-4xl text-green-400 mb-4" />

                <h2 className="text-xl font-bold">
                  Follow-up
                </h2>

              </div>

              <div
                onClick={() =>
                  setActiveSection("quotation")
                }
                className="bg-[#111827] border border-gray-800 p-6 rounded-3xl cursor-pointer hover:border-cyan-500"
              >

                <FaFileInvoiceDollar className="text-4xl text-orange-400 mb-4" />

                <h2 className="text-xl font-bold">
                  Quotation
                </h2>

              </div>

              <div
                onClick={() =>
                  setActiveSection("payment")
                }
                className="bg-[#111827] border border-gray-800 p-6 rounded-3xl cursor-pointer hover:border-cyan-500"
              >

                <FaMoneyCheckAlt className="text-4xl text-red-400 mb-4" />

                <h2 className="text-xl font-bold">
                  Payments
                </h2>

              </div>

            </div>

          </div>

        )}

        {/* ================= LEAD MANAGEMENT ================= */}

        {activeSection ===
          "lead" && (

          <div>

            <h1 className="text-3xl font-bold mb-6">
              Lead Management
            </h1>

            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6">

              <div className="grid md:grid-cols-2 gap-6">

                <input
                  type="text"
                  placeholder="Client Name"
                  value={clientName}
                  onChange={(e) =>
                    setClientName(
                      e.target.value
                    )
                  }
                  className="bg-[#0f172a] border border-gray-700 p-4 rounded-2xl"
                />

                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  className="bg-[#0f172a] border border-gray-700 p-4 rounded-2xl"
                />

                <input
                  type="text"
                  placeholder="Project Type"
                  value={projectType}
                  onChange={(e) =>
                    setProjectType(
                      e.target.value
                    )
                  }
                  className="bg-[#0f172a] border border-gray-700 p-4 rounded-2xl"
                />

                <input
                  type="number"
                  placeholder="Budget"
                  value={budget}
                  onChange={(e) =>
                    setBudget(
                      e.target.value
                    )
                  }
                  className="bg-[#0f172a] border border-gray-700 p-4 rounded-2xl"
                />

              </div>

              <button
                onClick={addLead}
                className="mt-6 bg-cyan-500 px-6 py-3 rounded-2xl"
              >

                Add Lead

              </button>

            </div>

          </div>

        )}

        {/* ================= CLIENT FOLLOWUP ================= */}

        {activeSection ===
          "followup" && (

          <div>

            <h1 className="text-3xl font-bold mb-6">
              Client Follow-up
            </h1>

            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6">

              <div className="grid md:grid-cols-2 gap-6">

                <input
                  type="text"
                  placeholder="Client Name"
                  value={followupClient}
                  onChange={(e) =>
                    setFollowupClient(
                      e.target.value
                    )
                  }
                  className="bg-[#0f172a] border border-gray-700 p-4 rounded-2xl"
                />

                <input
                  type="date"
                  value={followupDate}
                  onChange={(e) =>
                    setFollowupDate(
                      e.target.value
                    )
                  }
                  className="bg-[#0f172a] border border-gray-700 p-4 rounded-2xl"
                />

              </div>

              <textarea
                placeholder="Follow-up Remarks"
                value={followupRemark}
                onChange={(e) =>
                  setFollowupRemark(
                    e.target.value
                  )
                }
                className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl mt-6 h-[120px]"
              />

              <button className="mt-6 bg-green-500 px-6 py-3 rounded-2xl">
                Save Follow-up
              </button>

            </div>

          </div>

        )}

      </div>

    </div>

  );
};

export default SalesDashboard;