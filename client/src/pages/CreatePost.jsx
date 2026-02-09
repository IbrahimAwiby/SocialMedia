import React, { useState } from "react";
import { Image, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const MAX_CHARS = 280;

const CreatePost = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const user = useSelector((state) => state.user.value);

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    if (loading) return;

    if (!content.trim() && images.length === 0) {
      toast.error("Please add text or at least one image");
      return;
    }

    setLoading(true);

    try {
      const postType =
        images.length && content
          ? "text_with_image"
          : images.length
            ? "image"
            : "text";

      const formData = new FormData();
      formData.append("content", content.trim());
      formData.append("post_type", postType);

      images.forEach((image) => {
        formData.append("images", image);
      });

      const token = await getToken();

      const { data } = await api.post("/api/post/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!data.success) throw new Error(data.message);

      toast.success("Post published successfully 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create Post</h1>
          <p className="text-slate-600">Share your thoughts with the world</p>
        </div>

        {/* Card */}
        <div className="max-w-xl bg-white p-6 rounded-xl shadow-md space-y-4 relative">
          {/* Header */}
          <div className="flex items-center gap-3">
            <img
              src={user.profile_picture}
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold">{user.full_name}</h2>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={content}
            maxLength={MAX_CHARS}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full resize-none h-24 text-sm outline-none placeholder-gray-400"
          />

          {/* Counter */}
          <div className="text-right text-xs text-gray-400">
            {content.length}/{MAX_CHARS}
          </div>

          {/* Images Preview */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((image, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    className="h-20 w-20 object-cover rounded-lg"
                    alt=""
                  />
                  <button
                    onClick={() =>
                      setImages(images.filter((_, idx) => idx !== i))
                    }
                    className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-lg"
                  >
                    <X className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Bar */}
          <div className="flex items-center justify-between pt-3 border-t">
            <label
              htmlFor="images"
              className="cursor-pointer text-gray-500 hover:text-gray-700"
            >
              <Image className="w-6 h-6" />
            </label>

            <input
              id="images"
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={(e) =>
                setImages((prev) => [...prev, ...Array.from(e.target.files)])
              }
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold
              hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
