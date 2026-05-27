import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { supabase } from "../config/supabase";

const Expenses = () => {

  const [expenses, setExpenses] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    site: "",
    type: "",
    amount: "",
    supervisor: "",
    date: "",
  });

  // FETCH EXPENSES

  const fetchExpenses = async () => {

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("id", { ascending: false });

    if (error) {

      console.log(error);

    } else {

      setExpenses(data);

    }
  };

  // LOAD DATA

  useEffect(() => {

    fetchExpenses();

  }, []);

  // HANDLE INPUT

  const handleChange = (e: any) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  // ADD EXPENSE

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (
      !formData.site ||
      !formData.type ||
      !formData.amount ||
      !formData.supervisor ||
      !formData.date
    ) {

      alert("Please Fill All Fields");

      return;

    }

    const { error } = await supabase
      .from("expenses")
      .insert([formData]);

    if (error) {

      console.log(error);

      alert("Error Adding Expense");

    } else {

      fetchExpenses();

      setFormData({
        site: "",
        type: "",
        amount: "",
        supervisor: "",
        date: "",
      });

      alert("Expense Added");

    }

  };

  // DELETE EXPENSE

  const deleteExpense = async (id: number) => {

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {

      console.log(error);

    } else {

      fetchExpenses();

    }

  };

  // TOTAL EXPENSE

  const totalExpense = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount),
    0
  );

  // FILTER

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.site
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      expense.type
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <MainLayout>

      <div>

        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-3xl font-bold">
            Expense Management
          </h1>

          <div className="bg-black text-white px-5 py-3 rounded-xl">
            Total: ₹{totalExpense}
          </div>

        </div>

        {/* SUMMARY */}

        <div className="grid md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white p-5 rounded-xl shadow-md">

            <h2 className="text-gray-500">
              Total Expenses
            </h2>

            <h1 className="text-3xl font-bold mt-2">
              ₹{totalExpense}
            </h1>

          </div>

          <div className="bg-white p-5 rounded-xl shadow-md">

            <h2 className="text-gray-500">
              Total Records
            </h2>

            <h1 className="text-3xl font-bold mt-2">
              {expenses.length}
            </h1>

          </div>

          <div className="bg-white p-5 rounded-xl shadow-md">

            <h2 className="text-gray-500">
              Supervisors
            </h2>

            <h1 className="text-3xl font-bold mt-2">
              5
            </h1>

          </div>

        </div>

        {/* FORM */}

        <div className="bg-white p-5 rounded-xl shadow-md mb-8">

          <h2 className="text-xl font-bold mb-5">
            Add Expense
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-5 gap-4"
          >

            <input
              type="text"
              name="site"
              placeholder="Site Name"
              value={formData.site}
              onChange={handleChange}
              className="border p-3 rounded-lg outline-none"
            />

            <input
              type="text"
              name="type"
              placeholder="Expense Type"
              value={formData.type}
              onChange={handleChange}
              className="border p-3 rounded-lg outline-none"
            />

            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              className="border p-3 rounded-lg outline-none"
            />

            <input
              type="text"
              name="supervisor"
              placeholder="Supervisor"
              value={formData.supervisor}
              onChange={handleChange}
              className="border p-3 rounded-lg outline-none"
            />

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="border p-3 rounded-lg outline-none"
            />

            <button
              type="submit"
              className="bg-black text-white p-3 rounded-lg md:col-span-5 cursor-pointer hover:bg-gray-800 transition-all"
            >
              Add Expense
            </button>

          </form>

        </div>

        {/* SEARCH */}

        <div className="mb-5">

          <input
            type="text"
            placeholder="Search by Site or Type"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border p-3 rounded-lg w-full outline-none"
          />

        </div>

        {/* TABLE */}

        <div className="bg-white p-5 rounded-xl shadow-md overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b bg-gray-100">

                <th className="p-3 text-left">
                  Date
                </th>

                <th className="p-3 text-left">
                  Site
                </th>

                <th className="p-3 text-left">
                  Type
                </th>

                <th className="p-3 text-left">
                  Amount
                </th>

                <th className="p-3 text-left">
                  Supervisor
                </th>

                <th className="p-3 text-left">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredExpenses.map((expense) => (

                <tr
                  key={expense.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-3">
                    {expense.date}
                  </td>

                  <td className="p-3">
                    {expense.site}
                  </td>

                  <td className="p-3">
                    {expense.type}
                  </td>

                  <td className="p-3">
                    ₹{expense.amount}
                  </td>

                  <td className="p-3">
                    {expense.supervisor}
                  </td>

                  <td className="p-3">

                    <button
                      onClick={() =>
                        deleteExpense(expense.id)
                      }
                      className="bg-red-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-red-600"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </MainLayout>
  );
};

export default Expenses;