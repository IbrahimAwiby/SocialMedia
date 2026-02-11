import React, { useEffect, useState } from "react";
import { Search, X, Users, Sparkles, TrendingUp, SearchIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/axios";
import { fetchUser } from "../features/user/userSlice";
import UserCard from "../components/UserCard";

const Discover = () => {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.value);

  const handleSearch = async (e) => {
    if (e.key === "Enter" && input.trim()) {
      try {
        setUsers([]);
        setLoading(true);
        const { data } = await api.post(
          "/api/user/discover",
          { input },
          {
            headers: { Authorization: `Bearer ${await getToken()}` },
          },
        );

        if (data.success) {
          setUsers(data.users);
          if (data.users.length === 0) {
            toast.error("No users found");
          } else {
            toast.success(`Found ${data.users.length} users`);
          }
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const clearSearch = () => {
    setInput("");
    setUsers([]);
  };

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchUser(token));
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow">
              <SearchIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Discover People
              </h1>
              <p className="text-gray-600 mt-1">
                Find and connect with amazing people
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Search for people
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyUp={handleSearch}
                type="text"
                className="w-full pl-12 pr-10 py-3.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by name, username, bio, or location..."
              />
              {input && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-gray-500">Press Enter to search</p>
              {users.length > 0 && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
            </div>
            <p className="text-gray-700 font-medium">Searching...</p>
            <p className="text-gray-500 text-sm mt-2">
              Looking for amazing people
            </p>
          </div>
        ) : users.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Search Results
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Found {users.length}{" "}
                    {users.length === 1 ? "person" : "people"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <UserCard key={user._id} user={user} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Start discovering
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Search for people to connect with and grow your network
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
