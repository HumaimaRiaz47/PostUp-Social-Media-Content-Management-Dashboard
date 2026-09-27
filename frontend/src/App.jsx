import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import CreatePost from "./CreatePost";
import AllPosts from "./AllPosts";
import Signup from "./Signup";
import Login from "./Login";
import Home from "./Home";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        {/* Navbar */}
        <nav className="bg-white shadow mb-6">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-700">PostUp</h1>
            {isLoggedIn && (
              <div className="flex gap-4 items-center">
                <Link
                  to="/CreatePosts"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Create Post
                </Link>
                
                <Link
                  to="/posts"
                  className="text-green-600 font-medium hover:underline"
                >
                  All Posts
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Routes */}
        <div className="max-w-4xl mx-auto px-4">
          <Routes>
            <Route
              path="/"
              element={
                isLoggedIn ? <Home /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/CreatePosts"
              element={
                isLoggedIn ? <CreatePost /> : <Navigate to="/login" replace />
              }
            />

 <Route
    path="/edit/:id"
    element={
      isLoggedIn ? <CreatePost editMode={true} /> : <Navigate to="/login" replace />
    }
  />            <Route
              path="/posts"
              element={
                isLoggedIn ? <AllPosts /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/signup"
              element={
                isLoggedIn ? <Navigate to="/" replace /> : <Signup setIsLoggedIn={setIsLoggedIn} />
              }
            />
            <Route
              path="/login"
              element={
                isLoggedIn ? <Navigate to="/" replace /> : <Login setIsLoggedIn={setIsLoggedIn} />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
