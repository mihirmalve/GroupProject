import React from "react";
import { useState } from "react";
import background from "./back1.jpg";

function LoginSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div
      className="h-screen bg-cover bg-center flex justify-center items-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* BROCODE text */}
      <div
        className="absolute top-4 left-6 text-red-600 text-4xl font-extrabold tracking-wider drop-shadow-lg"
        style={{
          fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
        }}
      >
        BROCODE
      </div>

      {/* Login Box */}
      <div className="bg-black bg-opacity-70 pt-16 p-10 rounded-lg w-[90%] max-w-md text-white h-[400px]">
        <h1 className="text-3xl font-bold mb-6">Sign In</h1>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
        />

        {/* Password Input with Show/Hide */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-2 mb-6 bg-gray-800 rounded pr-16"
          />
          <button
            type="button"
            className="absolute right-3 top-5 transform -translate-y-1/2 text-sm text-gray-300 hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Sign In Button */}
        <button className="w-full bg-red-600 hover:bg-red-700 py-2 rounded font-semibold">
          Sign IN
        </button>

        {/* Signup Link */}
        <div className="mt-4 text-sm text-gray-400">
          New to OurSite?{" "}
          <span className="text-white hover:underline cursor-pointer">
            Sign up now
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginSignupPage;
