import { useAuth } from "@clerk/clerk-react";
import { ArrowLeft, Sparkle, TextIcon, Upload } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const StoryModel = ({ setShowModal, fetchStories }) => {
  const bgColors = [
    "#4f46e5",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
    "#8b5cf6",
    "#6366f1",
  ];

  const [mode, setMode] = useState("text");
  const [background, setBackground] = useState(bgColors[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { getToken } = useAuth();

  const MAX_VIDEO_DURATION = 60;
  const MAX_VIDEO_SIZE = 5;

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video")) {
        if (file.size > MAX_VIDEO_SIZE * 1024 * 1024) {
          toast.error(`video file size cannot exceed ${MAX_VIDEO_SIZE} MB.`);
          setMedia(null);
          setPreviewUrl(null);
          return;
        }
        const video = document.createElement("video");

        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > MAX_VIDEO_DURATION) {
            toast.error(`video duration cannot exceed 1 minute`);
            setMedia(null);
            setPreviewUrl(null);
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

    if (media_type === "text" && !text) {
      throw new Error("Please enter some text");
    }

    let formData = new FormData();
    formData.append("content", text);
    formData.append("media_type", media_type);
    formData.append("media", media);
    formData.append("background_color", background);

    const token = await getToken();

    try {
      const { data } = await api.post("api/story/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setShowModal(false);
        toast.success(data.message);
        fetchStories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowModal(false)}
            className="text-white p-2 cursor-pointer"
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Story</h2>
          <span className="w-10"></span>
        </div>

        <div
          className="rounded-lg h-96 flex items-center justify-center relative"
          style={{ backgroundColor: background }}
        >
          {mode === "text" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none"
              name=""
              id=""
              placeholder="What's on your mind?"
            />
          )}

          {mode === "media" &&
            previewUrl &&
            (media?.type.startsWith("image") ? (
              <img
                src={previewUrl}
                className="object-contain max-h-full"
                alt=""
              />
            ) : (
              <video className="object-contain max-h-full" src={previewUrl} />
            ))}
        </div>

        <div className="flex mt-4 gap-2">
          {bgColors.map((color) => (
            <button
              key={color}
              className="w-6 h-6 rounded-full ring cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setBackground(color)}
            />
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => {
              setMode("text");
              setMedia(null);
              setPreviewUrl(null);
            }}
            className={`flex-1 cursor-pointer flex items-center justify-center gap-2 p-2 rounded ${mode === "text" ? "bg-white text-black" : "bg-zinc-800"}`}
          >
            <TextIcon size={18} /> Text
          </button>
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${mode === "media" ? "bg-white text-black" : "bg-zinc-800"}`}
          >
            <input
              onChange={handleMediaUpload}
              className="hidden"
              type="file"
              accept="image/*, video/*"
            />
            <Upload size={18} /> Photo/Video
          </label>
        </div>

        <button
          onClick={() =>
            toast.promise(handleCreateStory(), {
              loading: "Saving...",
            })
          }
          className="flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded cursor-pointer bg-indigo-800"
        >
          <Sparkle size={18} /> Create Story
        </button>
      </div>
    </div>
  );
};

export default StoryModel;
