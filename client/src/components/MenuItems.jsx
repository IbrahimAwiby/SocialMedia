import React from "react";
import { menuItemsData } from "../assets/assets";
import { NavLink } from "react-router-dom";

const MenuItems = ({ setSidebarOpen, collapsed = false }) => {
  return (
    <div
      className={`${collapsed ? "px-1" : "px-6"} text-gray-600 space-y-2 font-medium`}
    >
      {menuItemsData.map(({ to, label, Icon }) => (
        <NavLink
          to={to}
          key={to}
          end={to === "/"}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `px-4 py-3 flex items-center gap-3 rounded-xl transition-all duration-200
            ${collapsed ? "justify-center" : ""}
            ${
              isActive
                ? "bg-linear-to-r from-blue-50 to-indigo-50 text-blue-600 border-l-4 border-blue-500"
                : "hover:bg-gray-100 hover:text-gray-900"
            }`
          }
          title={collapsed ? label : ""}
        >
          <div
            className={`p-1.5 rounded-lg ${({ isActive }) => (isActive ? "bg-blue-100" : "")}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          {!collapsed && <span>{label}</span>}
        </NavLink>
      ))}
    </div>
  );
};

export default MenuItems;
