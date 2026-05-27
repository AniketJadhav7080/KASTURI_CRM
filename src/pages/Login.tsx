import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../config/supabase";

import logo from "../assets/logo.jpeg";

const Login = () => {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  // LOGIN / SIGNUP

  const handleAuth = async () => {

    if (!email || !password) {

      alert("Please fill all fields");

      return;

    }

    setLoading(true);

    // LOGIN

      // CHECK USER

      const {
        data: userData,
        error,
      } = await supabase

        .from("users")

        .select("*")

        .eq("email", email)

        .eq("password", password)

        .maybeSingle();

      setLoading(false);

      if (error || !userData) {

        alert("Invalid Credentials");

        return;

      }

      // SAVE USER

      localStorage.setItem(
        "crm_user",
        JSON.stringify({
          email: userData.email,
          role: userData.role,
          employee_id:
            userData.employee_id ||
            "EMP-001",
          name:
            userData.name ||
            userData.email.split("@")[0],
        })
      );

      // ROLE BASED REDIRECT

      if (userData.role === "admin") {

        navigate("/admin");

      }

      else if (
        userData.role ===
        "supervisor"
      ) {

        navigate("/supervisor");

      }

      else if (
        userData.role === "sales"
      ) {

        navigate("/sales");

      }

      else {

        alert("Role not found");

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 overflow-hidden relative p-5">

      {/* BACKGROUND EFFECT */}

      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl"></div>

      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-pink-300/20 rounded-full blur-3xl"></div>

      {/* CARD */}

      <div className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 rounded-[35px] shadow-2xl p-8 relative z-10">

        {/* LOGO */}

        <div className="flex justify-center mb-6">

          <div className="w-32 h-32 rounded-[30px] bg-white p-2 shadow-2xl overflow-hidden">

            <img
              src={logo}
              alt="Kasturi Logo"
              className="w-full h-full object-cover rounded-[25px]"
            />

          </div>

        </div>

        {/* TITLE */}

        <h1 className="text-4xl font-bold text-center text-white">
          KASTURI CRM
        </h1>

        <p className="text-center text-white/80 mt-3 mb-8 text-lg">
          Construction Management System
        </p>

        {/* EMAIL */}

        <div className="mb-5">

          <label className="block text-white mb-2 font-medium">
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full p-4 rounded-2xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 outline-none"
          />

        </div>

        {/* PASSWORD */}

        <div className="mb-6">

          <label className="block text-white mb-2 font-medium">
            Password
          </label>

          <div className="relative">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full p-4 rounded-2xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 outline-none pr-16"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="absolute top-1/2 right-5 -translate-y-1/2 text-white text-xl"
            >

              {showPassword
                ? "🙈"
                : "👁️"}

            </button>

          </div>

        </div>

        {/* OPTIONS */}

        <div className="flex justify-between items-center mb-6">

          <div className="flex items-center gap-2">

            <input type="checkbox" />

            <span className="text-white text-sm">
              Remember Me
            </span>

          </div>

          <button className="text-white text-sm hover:underline">
            Forgot Password?
          </button>

        </div>

        {/* BUTTON */}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-white text-blue-600 font-bold p-4 rounded-2xl hover:scale-[1.02] transition-all duration-300 shadow-2xl"
        >

          {loading
            ? "Please Wait..."
            : "Login"}

        </button>

        {/* FOOTER */}

        <p className="text-center text-white/70 text-sm mt-8">
          Powered By YO YO JOB CARE PRIVATE LIMITED
        </p>

      </div>

    </div>

  );
};

export default Login;