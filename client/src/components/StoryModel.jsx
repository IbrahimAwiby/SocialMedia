// StoryModel.jsx
import { useAuth } from "@clerk/clerk-react";
import { X, Type, Image as ImageIcon, Send, Loader2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const StoryModel = ({ setShowModal, fetchStories }) => {
  const bgColors = [
    "#3B82F6",
    "#EC4899",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EF4444",
    "#06B6D4",
  ];
  const [mode, setMode] = useState("text");
  const [background, setBackground] = useState(bgColors[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const { getToken } = useAuth();

  const MAX_VIDEO_DURATION = 60;
  const MAX_VIDEO_SIZE = 5;

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video")) {
        if (file.size > MAX_VIDEO_SIZE * 1024 * 1024) {
          toast.error(`Video too large (max ${MAX_VIDEO_SIZE}MB)`);
          return;
        }
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > MAX_VIDEO_DURATION) {
            toast.error("Video must be under 1 minute");
          } else {
            setMedia(file);
            setPreviewUrl(URL.createObjectURL(file));
            setText("");
            setMode("media");
          }
        };
        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith("image")) {
        setMedia(file);
        setPreviewUrl(URL.createObjectURL(file));
        setText("");
        setMode("media");
      }
    }
  };

  const handleCreateStory = async () => {
    const media_type =
      mode === "media"
        ? media?.type.startsWith("image")
          ? "image"
          : "video"
        : "text";

    if (media_type === "text" && !text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    const formData = new FormData();
    formData.append("content", text);
    formData.append("media_type", media_type);
    formData.append("media", media);
    formData.append("background_color", background);

    setIsLoading(true); // Start loading

    try {
      const token = await getToken();
      const { data } = await api.post("api/story/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setShowModal(false);
        toast.success("Story created!");
        fetchStories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to create story");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <button
            onClick={() => !isLoading && setShowModal(false)} // Disable close while loading
            disabled={isLoading}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
          <h2 className="text-lg font-semibold text-white">Create Story</h2>
          <div className="w-10" />
        </div>

        {/* Preview */}
        <div className="p-6">
          <div
            className="rounded-xl h-64 flex items-center justify-center relative overflow-hidden mb-6"
            style={{ backgroundColor: background }}
          >
            {mode === "text" && (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
                className="w-full h-full bg-transparent text-white text-center text-xl p-6 resize-none focus:outline-none placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Type your story..."
                maxLength={150}
              />
            )}
            {mode === "media" &&
              previewUrl &&
              (media?.type.startsWith("image") ? (
                <img
                  src={previewUrl}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <video
                  src={previewUrl}
                  className="w-full h-full object-cover"
                  controls
                />
              ))}
          </div>

          {/* Color Picker */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-300 mb-3">
              Background Color
            </p>
            <div className="flex gap-2">
              {bgColors.map((color) => (
                <button
                  key={color}
                  onClick={() => !isLoading && setBackground(color)}
                  disabled={isLoading}
                  className={`w-8 h-8 rounded-full transition-all ${background === color ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""} ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => {
                if (!isLoading) {
                  setMode("text");
                  setMedia(null);
                  setPreviewUrl(null);
                }
              }}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                mode === "text"
                  ? "bg-white text-gray-900"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Type className="w-5 h-5" /> Text
            </button>
            <label
              className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                mode === "media"
                  ? "bg-white text-gray-900"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                disabled={isLoading}
                className="hidden"
              />
              <ImageIcon className="w-5 h-5" /> Media
            </label>
          </div>

          {/* Create Button with Loading State */}
          <button
            onClick={handleCreateStory}
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-blue-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sharing Story...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Share Story
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryModel;
