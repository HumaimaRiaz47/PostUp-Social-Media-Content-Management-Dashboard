import React, { useState } from "react";
import { createPost, updatePost, getPosts, deletePost } from './api'; 
import { useNavigate, Link } from "react-router-dom";
import api from './api.js'

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email.endsWith("@inventivtechnology.com")) {
      return setError("Only company email addresses are allowed");
    }

    try {
      await api.post("/api/auth/signup", { email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSignup}>
        <input
          type="email"
          className="w-full p-2 border rounded mb-4"
          placeholder="Company Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-2 border rounded mb-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account? <Link to="/login" className="text-blue-700 underline">Login</Link>
      </p>
    </div>
  );
};

export default Signup;
