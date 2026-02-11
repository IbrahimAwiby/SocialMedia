import React, { createRef, useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Send,
  X,
  MoreVertical,
  Phone,
  Info,
  ChevronLeft,
  Copy,
  Palette,
  Settings,
  Eye,
  Calendar,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import {
  addMessage,
  fetchMessages,
  resetMessages,
} from "../features/messages/messagesSlice";
import toast from "react-hot-toast";
import moment from "moment";

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages);
  const { userId } = useParams();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingChat, setLoadingChat] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [chatBackground, setChatBackground] = useState("default");

  const messagesEndRef = createRef(null);
  const fileInputRef = createRef();
  const currentUser = useSelector((state) => state.user.value);
  const connections = useSelector((state) => state.connections.connections);

  // Background options
  const backgroundOptions = [
    {
      id: "default",
      name: "Default",
      class: "bg-gradient-to-b from-gray-50 to-white",
    },
    { id: "light", name: "Light", class: "bg-white" },
    {
      id: "blue",
      name: "Blue",
      class: "bg-gradient-to-b from-blue-50 to-white",
    },
    {
      id: "gray",
      name: "Gray",
      class: "bg-gradient-to-b from-gray-100 to-white",
    },
    {
      id: "pattern",
      name: "Pattern",
      class:
        'bg-gray-50 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')]',
    },
  ];

  const getBackgroundClass = () => {
    const bg = backgroundOptions.find((bg) => bg.id === chatBackground);
    return bg ? bg.class : backgroundOptions[0].class;
  };

  const resetTheme = () => {
    setChatBackground("default");
    toast.success("Theme reset to default");
  };

  const fetchUserMessages = async () => {
    try {
      setLoadingChat(true);
      const token = await getToken();
      await dispatch(fetchMessages({ token, userId })).unwrap();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingChat(false);
    }
  };

  const fetchUserStatus = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get(`/api/user/status/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setIsOnline(data.isOnline);
        setLastSeen(data.lastSeen);
      }
    } catch (error) {
      console.error("Failed to fetch user status:", error);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() && !image) return;

    try {
      setSending(true);
      const token = await getToken();
      const formData = new FormData();
      formData.append("to_user_id", userId);
      formData.append("text", text.trim());
      if (image) formData.append("image", image);

      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setText("");
        setImage(null);
        dispatch(addMessage(data.message));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  const copyMessage = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Message copied");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImage(file);
    }
  };

  useEffect(() => {
    if (!userId || !user) return;

    fetchUserMessages();
    fetchUserStatus();

    const interval = setInterval(() => {
      fetchUserStatus();
    }, 30000);

    return () => {
      clearInterval(interval);
      dispatch(resetMessages());
    };
  }, [userId, user]);

  useEffect(() => {
    if (connections.length > 0) {
      const foundUser = connections.find(
        (connection) => connection._id === userId,
      );
      setUser(foundUser);
    }
  }, [connections, userId]);

  useEffect(() => {
    if (!loadingChat) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, loadingChat]);

  const formatTime = (date) => {
    return moment(date).format("h:mm A");
  };

  const formatDate = (date) => {
    const messageDate = moment(date);
    const today = moment().startOf("day");

    if (messageDate.isSame(today, "day")) {
      return "Today";
    } else if (messageDate.isSame(today.subtract(1, "day"), "day")) {
      return "Yesterday";
    } else if (messageDate.isSame(today, "week")) {
      return messageDate.format("dddd"); // Day of week
    } else {
      return messageDate.format("MMM D, YYYY");
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((msg, index) => {
      const messageDate = formatDate(msg.createdAt);

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            messages: [...currentGroup],
          });
        }
        currentDate = messageDate;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }

      // Add the last group
      if (index === messages.length - 1) {
        groups.push({
          date: currentDate,
          messages: currentGroup,
        });
      }
    });

    return groups;
  };

  if (loadingChat) {
    return (
      <div className={`flex flex-col h-screen ${getBackgroundClass()}`}>
        <div className="flex items-center gap-4 px-6 py-4 bg-white border-b">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 lg:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex gap-3 ${i % 2 === 0 ? "justify-end" : ""}`}
            >
              {i % 2 !== 0 && (
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              )}
              <div
                className={`h-16 ${i % 2 === 0 ? "w-48" : "w-56"} bg-gray-200 rounded-2xl animate-pulse`}
              />
              {i % 2 === 0 && (
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate();

  return (
    <div
      className={`flex flex-col h-screen transition-colors duration-300 ${getBackgroundClass()}`}
    >
      {/* Header */}
      {user && (
        <div className="flex items-center gap-4 px-4 md:px-6 py-3 bg-white border-b shadow-sm sticky top-0 z-20">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors lg:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <img
              src={
                user.profile_picture ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
              }
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
              alt={user.full_name}
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
              }}
            />
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate">{user.full_name}</p>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  {lastSeen
                    ? `Last seen ${moment(lastSeen).fromNow()}`
                    : "Offline"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Chat settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => navigate(`/profile/${userId}`)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Profile"
            >
              <Info className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Chat Settings */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-white rounded-xl shadow-xl border border-gray-200 z-30 p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Chat Theme</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Choose Background
              </p>
              <div className="grid grid-cols-3 gap-2">
                {backgroundOptions.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setChatBackground(bg.id)}
                    className={`h-12 rounded-lg border-2 ${chatBackground === bg.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"} ${bg.class} flex items-center justify-center transition-all`}
                    title={bg.name}
                  >
                    <div
                      className={`w-6 h-6 rounded-full ${bg.id === "light" ? "bg-gray-200" : bg.id === "blue" ? "bg-blue-200" : bg.id === "gray" ? "bg-gray-300" : bg.id === "pattern" ? "bg-gray-400/30" : "bg-gray-100"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={resetTheme}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Reset to Default
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4">
        {messages.length === 0 && !loadingChat ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-4">
              <Send className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Start a conversation with {user?.full_name || "this user"} by
              sending your first message!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date separator */}
                <div className="flex justify-center mb-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      {group.date}
                    </span>
                  </div>
                </div>

                {/* Messages for this date */}
                {group.messages.map((msg) => {
                  const isMe = msg.from_user_id === currentUser?._id;
                  const time = formatTime(msg.createdAt);

                  return (
                    <div
                      key={msg._id}
                      className={`flex mb-3 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[75%] ${isMe ? "ml-auto" : ""}`}
                      >
                        {/* Message container */}
                        <div
                          className={`relative px-4 py-3 rounded-2xl ${
                            isMe
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                              : "bg-white text-gray-800 rounded-bl-md shadow"
                          }`}
                        >
                          {/* Image message - smaller size */}
                          {msg.message_type === "image" && msg.media_url && (
                            <div className="mb-2 overflow-hidden rounded-xl">
                              <img
                                src={msg.media_url}
                                alt=""
                                className="w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() =>
                                  window.open(msg.media_url, "_blank")
                                }
                                onError={(e) => {
                                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=image`;
                                }}
                              />
                            </div>
                          )}

                          {/* Text message */}
                          {msg.text && (
                            <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                              {msg.text}
                            </div>
                          )}

                          {/* Time and copy button */}
                          <div
                            className={`flex items-center justify-between mt-2 ${isMe ? "text-blue-100" : "text-gray-500"}`}
                          >
                            <span className="text-xs">{time}</span>
                            {msg.text && (
                              <button
                                onClick={() => copyMessage(msg.text)}
                                className="p-1 hover:opacity-80 transition-opacity"
                                title="Copy message"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Image Preview */}
      {image && (
        <div className="px-4 pb-3">
          <div className="relative inline-block">
            <div className="w-40 rounded-lg overflow-hidden shadow border-2 border-blue-200 bg-white">
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="w-full h-40 object-cover"
              />
              <button
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 pb-1 pt-2 bg-white border-t sticky bottom-0 z-10">
        <div className="flex items-end gap-2">
          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full hover:bg-gray-100 transition-colors mb-3"
            title="Send image"
          >
            <ImageIcon className="w-5 h-5 text-gray-600" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-gray-100 text-gray-800 placeholder-gray-500 outline-none resize-none py-3 px-4 rounded-2xl min-h-[44px] max-h-32 border border-gray-200 focus:border-blue-400 transition-colors"
              rows="1"
            />
          </div>

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={(!text.trim() && !image) || sending}
            className={`p-3 rounded-full transition-all mb-1 ${
              text.trim() || image
                ? "bg-blue-500 hover:bg-blue-600 text-white shadow"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            } ${sending ? "opacity-80" : ""}`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

      </div>

      {/* Close settings when clicking outside */}
      {showSettings && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default ChatBox;
