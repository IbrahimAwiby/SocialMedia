import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-8">
        {/* 404 */}
        <h1 className="text-8xl font-extrabold text-slate-800 mb-2">404</h1>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">
          Page not found
        </h2>

        {/* Description */}
        <p className="text-slate-500 mb-6">
          Oops! The page you’re looking for doesn’t exist or was moved.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Footer hint */}
        <p className="mt-8 text-xs text-slate-400">© 2026 Your Social App</p>
      </div>
    </div>
  );
};

export default NotFound;
