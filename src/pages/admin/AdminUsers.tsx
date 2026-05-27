import { useEffect, useState } from "react";
import { FaUserShield, FaUserTie, FaUserCheck, FaTrash, FaEdit } from "react-icons/fa";
import { supabase } from "../../config/supabase";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("email", { ascending: true });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id: string) => {
    if (!newRole) return;
    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", id);

    if (!error) {
      alert("Role updated successfully");
      setEditingUser(null);
      fetchUsers();
    } else {
      alert(error.message);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (!error) {
      alert("User removed");
      fetchUsers();
    } else {
      alert(error.message);
    }
  };

  const roleCount = (role: string) => users.filter((u) => u.role === role).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 mt-2">Manage Supervisors & Sales Team</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 rounded-[30px] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <FaUserShield className="text-4xl" />
            <div>
              <h2 className="text-lg opacity-90">Total Supervisors</h2>
              <h1 className="text-3xl font-bold mt-1">{roleCount("supervisor")}</h1>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-[30px] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <FaUserTie className="text-4xl" />
            <div>
              <h2 className="text-lg opacity-90">Total Sales</h2>
              <h1 className="text-3xl font-bold mt-1">{roleCount("sales")}</h1>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-[30px] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <FaUserCheck className="text-4xl" />
            <div>
              <h2 className="text-lg opacity-90">Total Admins</h2>
              <h1 className="text-3xl font-bold mt-1">{roleCount("admin")}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white rounded-[30px] shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">All Users</h2>
        {loading ? (
          <p className="text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left rounded-l-2xl">Email</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left rounded-r-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{user.email}</td>
                    <td className="p-4">
                      {editingUser === user.id ? (
                        <div className="flex gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="border border-gray-300 p-2 rounded-xl text-sm"
                          >
                            <option value="admin">Admin</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="sales">Sales</option>
                          </select>
                          <button
                            onClick={() => updateRole(user.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded-xl text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="bg-gray-400 text-white px-3 py-1 rounded-xl text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : user.role === "supervisor"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingUser(user.id);
                            setNewRole(user.role);
                          }}
                          className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        >
                          <FaEdit /> Edit Role
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
