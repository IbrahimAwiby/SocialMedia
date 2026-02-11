import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  MessageCircle,
  Check,
  CheckCheck,
  Image,
  Video,
  Music,
  File,
  MoreVertical,
  Search,
  Clock,
  User,
  X,
  Loader2,
  Send,
} from "lucide-react";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const { user } = useUser();
  const { getToken } = useAuth();
  const prevMessagesCount = useRef(0);

  // Memoized fetch function
  const fetchRecentMessages = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const token = await getToken();
      const { data } = await api.get("/api/user/recent-messages", {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 20 }, // Limit to 20 recent messages
      });

      if (data.success) {
        // Group messages by sender and get the latest message for each sender
        const groupedMessages = data.messages.reduce((acc, message) => {
          const senderId = message.from_user_id._id;
          if (
            !acc[senderId] ||
            new Date(message.createdAt) > new Date(acc[senderId].createdAt)
          ) {
            acc[senderId] = message;
          }
          return acc;
        }, {});

        // Convert to array and sort by date (newest first)
        const sortedMessages = Object.values(groupedMessages).sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setMessages(sortedMessages);
        setFilteredMessages(sortedMessages);

        // Check for new messages notification
        const unreadCount = sortedMessages.filter((msg) => !msg.seen).length;
        if (unreadCount > 0 && prevMessagesCount.current < unreadCount) {
          setHasNewMessages(true);
          // Auto-hide notification after 5 seconds
          setTimeout(() => setHasNewMessages(false), 5000);
        }
        prevMessagesCount.current = unreadCount;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load messages");
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, getToken]);

  // Search and filter messages
  useEffect(() => {
    if (!searchQuery.trim() && !showUnreadOnly) {
      setFilteredMessages(messages);
      return;
    }

    const filtered = messages.filter((msg) => {
      const matchesSearch = searchQuery.trim()
        ? msg.from_user_id.full_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesUnreadFilter = showUnreadOnly ? !msg.seen : true;

      return matchesSearch && matchesUnreadFilter;
    });

    setFilteredMessages(filtered);
  }, [searchQuery, showUnreadOnly, messages]);

  // Handle message seen status
  const markAsRead = useCallback(
    async (messageId) => {
      try {
        const token = await getToken();
        await api.put(
          `/api/messages/${messageId}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // Update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, seen: true } : msg,
          ),
        );
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    },
    [getToken],
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = await getToken();
      await api.put(
        "/api/messages/mark-all-read",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Update local state
      setMessages((prev) => prev.map((msg) => ({ ...msg, seen: true })));
      setHasNewMessages(false);
      toast.success("All messages marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  }, [getToken]);

  // Get message icon based on type
  const getMessageIcon = (message) => {
    if (message.media_url) {
      const fileType = message.media_type;
      switch (fileType) {
        case "image":
          return <Image className="w-3 h-3 text-blue-500" />;
        case "video":
          return <Video className="w-3 h-3 text-purple-500" />;
        case "audio":
          return <Music className="w-3 h-3 text-green-500" />;
        default:
          return <File className="w-3 h-3 text-gray-500" />;
      }
    }
    return null;
  };

  // Get truncated message text
  const getMessagePreview = (text) => {
    if (!text) return "Media";
    if (text.length > 40) return text.substring(0, 40) + "...";
    return text;
  };

  // Format time
  const formatTime = (date) => {
    const now = moment();
    const messageDate = moment(date);

    if (now.diff(messageDate, "days") < 1) {
      return messageDate.format("h:mm A");
    } else if (now.diff(messageDate, "days") < 7) {
      return messageDate.format("ddd");
    }
    return messageDate.format("MMM D");
  };

  // Polling interval setup
  useEffect(() => {
    if (user) {
      fetchRecentMessages();

      // Set up polling every 30 seconds
      const interval = setInterval(fetchRecentMessages, 30000);
      setRefreshInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [user, fetchRecentMessages]);

  // Manual refresh
  const handleRefresh = () => {
    fetchRecentMessages();
    toast.success("Refreshing messages...");
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  if (!user) {
    return (
      <div className="bg-white max-w-xs mt-4 p-6 rounded-xl shadow-lg">
        <div className="flex flex-col items-center justify-center text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-2">
            Sign in to view messages
          </h3>
          <p className="text-gray-500 text-sm">
            Please sign in to see your recent conversations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white max-w-xs mt-4 rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-800">Recent Messages</h3>
            {hasNewMessages && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                New
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <Loader2
                className={`w-4 h-4 text-gray-500 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={markAllAsRead}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages or users..."
            className="w-full pl-10 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => setShowUnreadOnly(false)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${!showUnreadOnly ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-100"}`}
          >
            All
          </button>
          <button
            onClick={() => setShowUnreadOnly(true)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${showUnreadOnly ? "bg-red-100 text-red-700" : "text-gray-500 hover:bg-gray-100"}`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            {searchQuery || showUnreadOnly ? (
              <>
                <Search className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium mb-1">
                  No messages found
                </p>
                <p className="text-gray-500 text-sm">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : "No unread messages"}
                </p>
                {(searchQuery || showUnreadOnly) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowUnreadOnly(false);
                    }}
                    className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View all messages
                  </button>
                )}
              </>
            ) : (
              <>
                <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium mb-1">
                  No messages yet
                </p>
                <p className="text-gray-500 text-sm">
                  Start a conversation with someone!
                </p>
                <Link
                  to="/messages"
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Go to Messages
                </Link>
              </>
            )}
          </div>
        ) : (
          filteredMessages.map((message) => (
            <Link
              to={`/messages/${message.from_user_id._id}`}
              key={message._id}
              onClick={() => markAsRead(message._id)}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors group"
            >
              {/* Avatar with Status Indicator */}
              <div className="relative flex-shrink-0">
                <img
                  src={message.from_user_id.profile_picture}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  alt={message.from_user_id.full_name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/40";
                  }}
                />
                {!message.seen && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {message.from_user_id.full_name}
                    </p>
                    {message.from_user_id.isVerified && (
                      <Check className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {message.seen ? (
                      <CheckCheck className="w-3 h-3 text-indigo-500" />
                    ) : (
                      <Clock className="w-3 h-3 text-gray-400" />
                    )}
                    <span className="text-[10px] text-gray-400">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getMessageIcon(message)}
                  <p
                    className={`text-xs truncate ${!message.seen ? "font-medium text-gray-800" : "text-gray-600"}`}
                  >
                    {getMessagePreview(message.text)}
                  </p>
                </div>
              </div>

              {/* Unread Badge */}
              {!message.seen && (
                <div className="flex-shrink-0">
                  <span className="bg-indigo-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                    new
                  </span>
                </div>
              )}
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <Link
          to="/messages"
          className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
          View All Messages
        </Link>
      </div>

      {/* Stats */}
      {!isLoading && messages.length > 0 && (
        <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100 bg-gray-50 flex justify-between">
          <span>
            {filteredMessages.length} conversation
            {filteredMessages.length !== 1 ? "s" : ""}
          </span>
          <span>{messages.filter((m) => !m.seen).length} unread</span>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default RecentMessages;
