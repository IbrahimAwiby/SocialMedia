import React, { useState, useEffect } from "react";
import { Search, MessageCircle, X, Users, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";

const Messages = () => {
  const { connections } = useSelector((state) => state.connections);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [recentMessages, setRecentMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const navigate = useNavigate();
  const { getToken, userId } = useAuth();

  // Fetch unread message counts and recent messages
  useEffect(() => {
    const fetchMessagesData = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const { data } = await api.get("/api/user/recent-messages", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          const counts = {};
          const messagesMap = {};

          data.messages.forEach((msg) => {
            const otherUserId =
              msg.from_user_id?._id === userId
                ? msg.to_user_id?._id
                : msg.from_user_id?._id;

            if (otherUserId) {
              if (!msg.seen && msg.from_user_id?._id !== userId) {
                counts[otherUserId] = (counts[otherUserId] || 0) + 1;
              }

              if (
                !messagesMap[otherUserId] ||
                new Date(msg.createdAt) >
                  new Date(messagesMap[otherUserId].createdAt)
              ) {
                messagesMap[otherUserId] = {
                  content: msg.content,
                  createdAt: msg.createdAt,
                  seen: msg.seen,
                  senderId: msg.from_user_id?._id,
                  isOwn: msg.from_user_id?._id === userId,
                };
              }
            }
          });

          setUnreadCounts(counts);
          setRecentMessages(messagesMap);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (connections.length > 0) fetchMessagesData();
  }, [connections, getToken, userId]);

  // Filter connections
  useEffect(() => {
    let filtered = [...connections];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (c) =>
          c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.bio && c.bio.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    // Apply active filter
    if (activeFilter === "unread") {
      filtered = filtered.filter((c) => unreadCounts[c._id] > 0);
    }

    // Sort by last message time
    filtered.sort((a, b) => {
      const msgA = recentMessages[a._id]?.createdAt || 0;
      const msgB = recentMessages[b._id]?.createdAt || 0;
      return new Date(msgB) - new Date(msgA);
    });

    setFilteredConnections(filtered);
  }, [searchQuery, connections, activeFilter, unreadCounts, recentMessages]);

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${Math.floor(diffDays / 7)}w`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header - Styled like Discover page */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-xl shadow">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-1">
                Chat with your connections in real-time
              </p>
            </div>
          </div>
        </div>

        {/* Search Section - Styled like Discover page */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Search conversations
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, username, or message..."
                className="w-full pl-12 pr-10 py-3.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-gray-500">
                {filteredConnections.length} conversations
              </p>
              {Object.keys(unreadCounts).length > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {Object.keys(unreadCounts).length} unread
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {["all", "unread"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeFilter === filter
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {filter}
              {filter === "unread" && (
                <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {
                    Object.keys(unreadCounts).filter(
                      (id) => unreadCounts[id] > 0,
                    ).length
                  }
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Messages Grid - Changed to cards */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="py-20 text-center">
            <MessageCircle className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              No connections yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect with people to start chatting
            </p>
            <button
              onClick={() => navigate("/discover")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Discover People
            </button>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              No conversations found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : `No ${activeFilter} conversations`}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConnections.map((connection) => {
              const recentMessage = recentMessages[connection._id];
              const unreadCount = unreadCounts[connection._id] || 0;

              return (
                <div
                  key={connection._id}
                  className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all cursor-pointer ${
                    unreadCount > 0 ? "border-blue-500 border-2" : ""
                  }`}
                  onClick={() => navigate(`/messages/${connection._id}`)}
                >
                  {/* User info */}
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="relative mb-3">
                      <img
                        src={connection.profile_picture}
                        alt={connection.full_name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {connection.full_name}
                    </h3>

                    <p className="text-gray-500 text-sm mb-3">
                      @{connection.username}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 mb-4"></div>

                  {/* Message preview */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">
                        Last message
                      </span>
                      {recentMessage && (
                        <span className="text-xs text-gray-400">
                          {getTimeAgo(recentMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    {recentMessage ? (
                      <p
                        className={`text-sm line-clamp-2 ${
                          unreadCount > 0
                            ? "font-medium text-gray-900"
                            : "text-gray-600"
                        }`}
                      >
                        {recentMessage.isOwn && (
                          <span className="text-blue-600 font-medium">
                            You:{" "}
                          </span>
                        )}
                        {recentMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic text-center py-2">
                        No messages yet
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/messages/${connection._id}`);
                      }}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {recentMessage ? "Chat" : "Start Chat"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${connection._id}`);
                      }}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                      title="Profile"
                    >
                      <User className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New message button */}
        {connections.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/discover")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md"
            >
              Start New Conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
