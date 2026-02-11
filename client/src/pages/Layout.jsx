import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";

import Sidebar from "../components/Sidebar";
import Loading from "../components/Loading";

const Layout = () => {
  // Clerk auth state
  const { isLoaded, isSignedIn } = useUser();

  // Mongo user from Redux
  const user = useSelector((state) => state.user.value);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);



  // 2️⃣ Not signed in → go to login
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ Signed in but Mongo user not loaded yet
  if (!user) {
    return <Loading />;
  }

  // 4️⃣ Everything is ready 🎉
  return (
    <div className="w-full flex h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 bg-gray-50">
        <Outlet />
      </div>

      {/* Mobile Menu Button */}
      {isMobile &&
        (sidebarOpen ? (
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 z-50 p-2.5 bg-white rounded-lg shadow-md sm:hidden"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        ) : (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 right-4 z-50 p-2.5 bg-white rounded-lg shadow-md sm:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        ))}
    </div>
  );
};

export default Layout;
