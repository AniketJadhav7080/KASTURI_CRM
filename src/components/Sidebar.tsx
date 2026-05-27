import {
  FaHome,
  FaProjectDiagram,
  FaMoneyBill,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";

import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-[250px] h-screen bg-black text-white p-5">

      <h1 className="text-2xl font-bold mb-10">
        KASTURI CRM
      </h1>

      <ul className="space-y-5">

        <Link
          to="/dashboard"
          className="flex items-center gap-3 hover:text-yellow-400"
        >
          <FaHome />
          Dashboard
        </Link>

        <Link
          to="/projects"
          className="flex items-center gap-3 hover:text-yellow-400"
        >
          <FaProjectDiagram />
          Projects
        </Link>

        <Link
          to="/expenses"
          className="flex items-center gap-3 hover:text-yellow-400"
        >
          <FaMoneyBill />
          Expenses
        </Link>

        <Link
          to="/supervisors"
          className="flex items-center gap-3 hover:text-yellow-400"
        >
          <FaUsers />
          Supervisors
        </Link>

        <Link
          to="/sales"
          className="flex items-center gap-3 hover:text-yellow-400"
        >
          <FaChartLine />
          Sales
        </Link>

      </ul>

    </div>
  );
};

export default Sidebar;