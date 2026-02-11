import React from "react";
import { assets, dummyUserData } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { CirclePlus, LogOut } from "lucide-react";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useSelector } from "react-redux";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.value);
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      await signOut();
      // Clerk will handle redirect to sign-in page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div
      className={`
            w-72 bg-white border-r border-gray-200
            flex flex-col justify-between items-center
            max-sm:absolute top-0 bottom-0 z-40
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "max-sm:-translate-x-full"}
        `}
    >
      <div className="w-full px-5">
        {/* Logo */}
        <img
          onClick={() => {
            navigate("/");
          }}
          src={assets.logo}
          className="w-26 ml-7 my-4.5 cursor-pointer hover:opacity-80 transition-opacity"
          alt="logo"
        />
        <hr className="border-gray-300 mb-8" />

        {/* Menu Items */}
        <MenuItems setSidebarOpen={setSidebarOpen} />

        {/* Create Post Button */}
        <Link
          to={"/create-post"}
          className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all duration-200 text-white font-medium cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        >
          <CirclePlus className="w-5 h-5" />
          Create Post
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div className="flex gap-3 items-center">
          {/* Clerk UserButton */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 border-2 border-white shadow-md",
                rootBox: "cursor-pointer",
              },
            }}
          />
          {/* Optional: Display user info if available */}
          <div className="">
            <h1 className="text-sm font-medium text-gray-800">
              {user.full_name}
            </h1>
            <p className="text-xs text-gray-500">@{user.username}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors group"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
