const Navbar = () => {
  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">

      <h1 className="text-xl font-bold">
        SuperAdmin Dashboard
      </h1>

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
          A
        </div>

        <div>
          <h2 className="font-semibold">SUPERADMIN</h2>
        </div>

      </div>

    </div>
  );
};

export default Navbar;