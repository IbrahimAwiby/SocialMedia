import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="relative">
        {/* Double ring spinner */}
        <div className="w-22 h-22 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-22 h-22 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

        {/* Logo or text in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-blue-500 font-semibold text-md">
            Loading...
          </span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
