import React, { createRef, useEffect, useState } from "react";
import { dummyMessagesData, dummyUserData } from "../assets/assets";
import { Image, Send, X } from "lucide-react";

const ChatBox = () => {
  const messages = dummyMessagesData;
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const user = dummyUserData;
  const messagesEndRef = createRef(null);

  const sendMessage = async () => {
    
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Header */}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.to_user_id === user._id;

          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm
                  ${
                    isMe
                      ? "bg-linear-to-br from-blue-600 to-indigo-600 text-white rounded-br-md"
                      : "bg-white text-slate-800 rounded-bl-md"
                  }
                `}
              >
                {/* Image message */}
                {msg.message_type === "image" && (
                  <img
                    src={msg.media_url}
                    alt=""
                    className="rounded-xl mb-2 max-h-64 object-cover shadow"
                  />
                )}

                {/* Text message */}
                {msg.text && <p>{msg.text}</p>}

                <span className="block text-[10px] mt-1 opacity-70 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {image && (
        <div className="px-4 pb-2">
          <div className="relative w-36 rounded-xl overflow-hidden shadow-md">
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              className="object-cover"
            />
            <button
              onClick={() => setImage(null)}
              className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white rounded-full p-1"
            >
              <X className="w-4 h-4 cursor-pointer" />
            </button>
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
            disabled={!text && !image}
            className={`p-2 cursor-pointer rounded-full transition active:scale-95
              ${
                text || image
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }
            `}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
