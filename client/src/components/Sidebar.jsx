import React, { useState } from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { CirclePlus, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useSelector } from "react-redux";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.value);
  const { signOut } = useClerk();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={`
            bg-white border-r border-gray-200
            flex flex-col justify-between items-center
            max-sm:absolute top-0 bottom-0 z-40
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "max-sm:-translate-x-full"}
            ${collapsed ? "w-20" : "w-72"}
        `}
    >
      <div className={`w-full ${collapsed ? "px-2" : "px-5"}`}>
        {/* Logo and Collapse Button */}
        <div
          className={`flex items-center ${collapsed ? "justify-center py-4" : "ml-7 my-4.5"} relative`}
        >
          {!collapsed && (
            <img
              onClick={() => {
                navigate("/");
              }}
              src={assets.logo}
              className="w-26 cursor-pointer hover:opacity-80 transition-opacity"
              alt="logo"
            />
          )}
          {collapsed && (
            <div
              onClick={() => navigate("/")}
              className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              <span className="text-white font-bold text-xl">S</span>
            </div>
          )}

          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
            )}
          </button>
        </div>

        {!collapsed && <hr className="border-gray-300 mb-8" />}
        {collapsed && <div className="h-6" />}

        {/* Menu Items */}
        <MenuItems setSidebarOpen={setSidebarOpen} collapsed={collapsed} />

        {/* Create Post Button */}
        {!collapsed ? (
          <Link
            to={"/create-post"}
            className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all duration-200 text-white font-medium cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <CirclePlus className="w-5 h-5" />
            Create Post
          </Link>
        ) : (
          <Link
            to={"/create-post"}
            className="flex items-center justify-center py-2.5 mt-6 mx-2 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all duration-200 text-white cursor-pointer"
            onClick={() => setSidebarOpen(false)}
            title="Create Post"
          >
            <CirclePlus className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* User Profile Section */}
      <div
        className={`w-full border-t border-gray-200 p-4 ${collapsed ? "px-2" : "px-7"} flex items-center justify-between`}
      >
        <div
          className={`flex ${collapsed ? "justify-center w-full" : "gap-3 items-center"}`}
        >
          {/* Clerk UserButton */}
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-10 h-10 border-2 border-white shadow-md flex-shrink-0",
                rootBox: "cursor-pointer",
              },
            }}
          />

          {/* Optional: Display user info if available */}
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-medium text-gray-800 truncate">
                {user?.full_name}
              </h1>
              <p className="text-xs text-gray-500 truncate">
                @{user?.username}
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        {!collapsed && (
          <button
            onClick={handleLogout}
            className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors group flex-shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
          </button>
        )}
      </div>

      {/* Collapsed Logout Button */}
      {collapsed && (
        <div className="w-full border-t border-gray-200 p-4 flex justify-center">
          <button
            onClick={handleLogout}
            className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors group"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
