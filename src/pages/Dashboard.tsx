import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { supabase } from "../config/supabase";

import {
  FaBuilding,
  FaMoneyBillWave,
  FaUsers,
  FaTools,
  FaSearch,
} from "react-icons/fa";

const Dashboard = () => {

  const [expenses, setExpenses] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const [showSiteExpense, setShowSiteExpense] =
    useState(false);

  const [
    showSupervisorExpense,
    setShowSupervisorExpense,
  ] = useState(false);

  const [siteSearch, setSiteSearch] =
    useState("");

  const [
    supervisorSearch,
    setSupervisorSearch,
  ] = useState("");

  // FETCH EXPENSES

  const fetchExpenses = async () => {

    const { data, error } = await supabase
      .from("expenses")
      .select("*");

    if (!error) {

      setExpenses(data || []);

    }

  };

  // FETCH PROJECTS

  const fetchProjects = async () => {

    const { data, error } = await supabase
      .from("projects")
      .select("*");

    if (!error) {

      setProjects(data || []);

    }

  };

  useEffect(() => {

    fetchExpenses();
    fetchProjects();

  }, []);

  // TOTAL EXPENSE

  const totalExpense = expenses.reduce(
    (total, item) =>
      total + Number(item.amount),
    0
  );

  // RUNNING PROJECTS

  const runningProjects = projects.filter(
    (project) =>
      project.status === "Running"
  );

  // SITE WISE

  const siteWiseExpense: any = {};

  expenses.forEach((item) => {

    if (siteWiseExpense[item.site]) {

      siteWiseExpense[item.site] +=
        Number(item.amount);

    } else {

      siteWiseExpense[item.site] =
        Number(item.amount);

    }

  });

  // SUPERVISOR WISE

  const supervisorWiseExpense: any = {};

  expenses.forEach((item) => {

    if (
      supervisorWiseExpense[item.supervisor]
    ) {

      supervisorWiseExpense[
        item.supervisor
      ] += Number(item.amount);

    } else {

      supervisorWiseExpense[
        item.supervisor
      ] = Number(item.amount);

    }

  });

  return (
    <MainLayout>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3">

        {/* HEADER */}

        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-8 rounded-[30px] shadow-2xl mb-8 text-white">

          <h1 className="text-4xl font-bold">
            Construction CRM Dashboard
          </h1>

          <p className="mt-3 text-blue-100 text-lg">
            Real Time Project & Expense Analytics
          </p>

        </div>

        {/* TOP CARDS */}

        <div className="grid md:grid-cols-4 gap-6 mb-8">

          {/* TOTAL EXPENSE */}

          <div className="bg-white/70 backdrop-blur-lg border border-white rounded-[30px] p-6 shadow-xl hover:scale-105 transition-all duration-300">

            <div className="flex justify-between items-center">

              <div>

                <h2 className="text-gray-500 font-medium">
                  Total Expense
                </h2>

                <h1 className="text-3xl font-bold mt-3 text-gray-800">
                  ₹{totalExpense}
                </h1>

              </div>

              <div className="bg-blue-100 text-blue-600 p-5 rounded-[25px]">
                <FaMoneyBillWave size={30} />
              </div>

            </div>

          </div>

          {/* PROJECTS */}

          <div className="bg-white/70 backdrop-blur-lg border border-white rounded-[30px] p-6 shadow-xl hover:scale-105 transition-all duration-300">

            <div className="flex justify-between items-center">

              <div>

                <h2 className="text-gray-500 font-medium">
                  Total Projects
                </h2>

                <h1 className="text-3xl font-bold mt-3 text-gray-800">
                  {projects.length}
                </h1>

              </div>

              <div className="bg-orange-100 text-orange-500 p-5 rounded-[25px]">
                <FaBuilding size={30} />
              </div>

            </div>

          </div>

          {/* RUNNING */}

          <div className="bg-white/70 backdrop-blur-lg border border-white rounded-[30px] p-6 shadow-xl hover:scale-105 transition-all duration-300">

            <div className="flex justify-between items-center">

              <div>

                <h2 className="text-gray-500 font-medium">
                  Running Projects
                </h2>

                <h1 className="text-3xl font-bold mt-3 text-gray-800">
                  {runningProjects.length}
                </h1>

              </div>

              <div className="bg-green-100 text-green-600 p-5 rounded-[25px]">
                <FaTools size={30} />
              </div>

            </div>

          </div>

          {/* SUPERVISORS */}

          <div className="bg-white/70 backdrop-blur-lg border border-white rounded-[30px] p-6 shadow-xl hover:scale-105 transition-all duration-300">

            <div className="flex justify-between items-center">

              <div>

                <h2 className="text-gray-500 font-medium">
                  Supervisors
                </h2>

                <h1 className="text-3xl font-bold mt-3 text-gray-800">
                  {
                    [
                      ...new Set(
                        expenses.map(
                          (item) =>
                            item.supervisor
                        )
                      ),
                    ].length
                  }
                </h1>

              </div>

              <div className="bg-purple-100 text-purple-600 p-5 rounded-[25px]">
                <FaUsers size={30} />
              </div>

            </div>

          </div>

        </div>

        {/* SITE WISE */}

        <div className="bg-white/70 backdrop-blur-lg border border-white rounded-[30px] shadow-xl p-6 mb-8">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-2xl font-bold text-gray-800">
              Site Wise Expense
            </h2>

            <button
              onClick={() =>
                setShowSiteExpense(
                  !showSiteExpense
                )
              }
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
            >
              <FaSearch />
              {showSiteExpense
                ? "Hide"
                : "Search"}
            </button>

          </div>

          {showSiteExpense && (

            <div>

              <input
                type="text"
                placeholder="Search Site Name..."
                value={siteSearch}
                onChange={(e) =>
                  setSiteSearch(
                    e.target.value
                  )
                }
                className="border border-gray-200 p-4 rounded-2xl w-full mb-5 outline-none bg-white"
              />

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="bg-blue-50">

                      <th className="p-4 text-left rounded-l-2xl">
                        Site Name
                      </th>

                      <th className="p-4 text-left rounded-r-2xl">
                        Total Expense
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {Object.entries(
                      siteWiseExpense
                    )

                      .filter(([site]) =>
                        site
                          .toLowerCase()
                          .includes(
                            siteSearch.toLowerCase()
                          )
                      )

                      .map(
                        (
                          [site, amount]: any
                        ) => (

                          <tr
                            key={site}
                            className="border-b hover:bg-blue-50 transition-all"
                          >

                            <td className="p-4">
                              {site}
                            </td>

                            <td className="p-4 font-bold text-blue-600">
                              ₹{amount}
                            </td>

                          </tr>

                        )
                      )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </div>

        {/* SUPERVISOR */}

        <div className="bg-white/70 backdrop-blur-lg border border-white rounded-[30px] shadow-xl p-6 mb-8">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-2xl font-bold text-gray-800">
              Supervisor Wise Expense
            </h2>

            <button
              onClick={() =>
                setShowSupervisorExpense(
                  !showSupervisorExpense
                )
              }
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
            >
              <FaSearch />
              {showSupervisorExpense
                ? "Hide"
                : "Search"}
            </button>

          </div>

          {showSupervisorExpense && (

            <div>

              <input
                type="text"
                placeholder="Search Supervisor..."
                value={supervisorSearch}
                onChange={(e) =>
                  setSupervisorSearch(
                    e.target.value
                  )
                }
                className="border border-gray-200 p-4 rounded-2xl w-full mb-5 outline-none bg-white"
              />

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="bg-purple-50">

                      <th className="p-4 text-left rounded-l-2xl">
                        Supervisor
                      </th>

                      <th className="p-4 text-left rounded-r-2xl">
                        Total Expense
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {Object.entries(
                      supervisorWiseExpense
                    )

                      .filter(
                        ([supervisor]) =>
                          supervisor
                            .toLowerCase()
                            .includes(
                              supervisorSearch.toLowerCase()
                            )
                      )

                      .map(
                        (
                          [
                            supervisor,
                            amount,
                          ]: any
                        ) => (

                          <tr
                            key={supervisor}
                            className="border-b hover:bg-purple-50 transition-all"
                          >

                            <td className="p-4">
                              {supervisor}
                            </td>

                            <td className="p-4 font-bold text-purple-600">
                              ₹{amount}
                            </td>

                          </tr>

                        )
                      )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </div>

        {/* RUNNING PROJECTS */}

        <div className="bg-white/70 backdrop-blur-lg border border-white rounded-[30px] shadow-xl p-6">

          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Running Projects
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="bg-green-50">

                  <th className="p-4 text-left rounded-l-2xl">
                    Project
                  </th>

                  <th className="p-4 text-left">
                    Site
                  </th>

                  <th className="p-4 text-left">
                    Supervisor
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

                {runningProjects.map(
                  (project) => (

                    <tr
                      key={project.id}
                      className="border-b hover:bg-green-50 transition-all"
                    >

                      <td className="p-4 font-semibold">
                        {project.project_name}
                      </td>

                      <td className="p-4">
                        {project.site_name}
                      </td>

                      <td className="p-4">
                        {project.supervisor}
                      </td>

                      <td className="p-4 font-bold text-green-600">
                        ₹{project.budget}
                      </td>

                      <td className="p-4">

                        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                          {project.status}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </MainLayout>
  );
};

export default Dashboard;