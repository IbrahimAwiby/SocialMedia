import React, { createRef, useEffect, useState } from "react";
import { dummyMessagesData, dummyUserData } from "../assets/assets";
import { Image, Send, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import {
  addMessage,
  fetchMessages,
  resetMessages,
} from "../features/messages/messagesSlice";
import toast from "react-hot-toast";

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages);
  const { userId } = useParams();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const messagesEndRef = createRef(null);

  const [loadingChat, setLoadingChat] = useState(true);

  const [sending, setSending] = useState(false);

  const currentUser = useSelector((state) => state.user.value);

  const connections = useSelector((state) => state.connections.connections);

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

  const sendMessage = async () => {
    if (!text && !image) return;

    try {
      setSending(true);

      const token = await getToken();
      const formData = new FormData();
      formData.append("to_user_id", userId);
      formData.append("text", text);
      image && formData.append("image", image);

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

  useEffect(() => {
    if (!userId || !user) return;

    fetchUserMessages();

    return () => {
      dispatch(resetMessages());
    };
  }, [userId, user]);

  useEffect(() => {
    if (connections.length > 0) {
      const user = connections.find((connection) => connection._id === userId);
      setUser(user);
    }
  }, [connections, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };
  useEffect(() => {
    if (!loadingChat) {
      scrollToBottom();
    }
  }, [messages, loadingChat]);

  if (loadingChat) {
    return (
      <div className="flex flex-col h-screen bg-slate-50">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 px-6 py-4 bg-white border-b">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Messages skeleton */}
        <div className="flex-1 px-4 py-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-14 w-2/3 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Header */}
      {user && (
        <div className="flex items-center gap-3 px-6 py-4 bg-white border-b shadow-sm">
          <img
            src={user.profile_picture}
            className="w-10 h-10 rounded-full ring-2 ring-blue-500/20"
            alt=""
          />
          <div>
            <p className="font-semibold text-slate-800">{user.full_name}</p>
            <p className="text-xs text-slate-500">@{user.username}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.from_user_id === currentUser?._id;

          const avatar = isMe
            ? currentUser?.imageUrl || currentUser?.profile_picture
            : user?.profile_picture;

          return (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {/* Receiver avatar */}
              {!isMe && (
                <img
                  src={avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}

              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm
          ${
            isMe
              ? "bg-linear-to-br from-blue-600 to-indigo-600 text-white rounded-br-md"
              : "bg-white text-slate-800 rounded-bl-md"
          }
        `}
              >
                {msg.message_type === "image" && (
                  <img
                    src={msg.media_url}
                    alt=""
                    className="rounded-xl mb-2 max-h-64 object-cover"
                  />
                )}

                {msg.text && <p>{msg.text}</p>}

                <span className="block text-[10px] mt-1 opacity-70 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Sender avatar */}
              {isMe && (
                <img
                  src={avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {image && (
        <div className="px-4 pb-3">
          <div className="relative w-40 aspect-square rounded-2xl overflow-hidden shadow-lg border bg-gray-100">
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              className="w-full h-full object-cover"
            />

            {/* remove button */}
            <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full p-1.5"
            >
              <X className="w-4 h-4" />
            </button>

            {/* label */}
            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-1">
              Image preview
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-2 bg-white border-t">
        <div className="flex items-center gap-3 bg-slate-100 rounded-full px-3 py-2">
          <label
            htmlFor="chat-image"
            className="p-2 rounded-full hover:bg-slate-200 cursor-pointer transition"
          >
            <Image className="w-5 h-5 text-slate-600" />
          </label>

          <input
            type="file"
            hidden
            id="chat-image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />

          <button
            onClick={sendMessage}
            disabled={(!text && !image) || sending}
            className={`p-2 rounded-full transition active:scale-95
    ${
      sending
        ? "bg-blue-400 cursor-not-allowed"
        : text || image
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "bg-slate-300 text-slate-500 cursor-not-allowed"
    }
  `}
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
