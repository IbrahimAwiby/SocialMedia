import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { dummyUserData } from "../assets/assets";
import Loading from "../components/Loading";

const Layout = () => {
  const user = dummyUserData;
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

  return user ? (
    <div className="w-full flex h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 bg-gray-50">
        <Outlet />
      </div>

      {/* Mobile Menu Button */}
      {sidebarOpen ? (
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 z-50 p-2.5 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-300 sm:hidden"
        >
          <X className="w-5 h-5 text-gray-600 cursor-pointer" />
        </button>
      ) : (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 right-4 z-50 p-2.5 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-300 sm:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600 cursor-pointer" />
        </button>
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default Layout;
