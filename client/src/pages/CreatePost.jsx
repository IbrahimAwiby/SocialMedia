import React, { useState } from "react";
import {
  Image,
  X,
  Loader2,
  PenSquare,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const MAX_CHARS = 280;
const MAX_IMAGES = 4;

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    // Filter out non-image files
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length < files.length) {
      toast.error("Some files were not images and were skipped");
    }

    setImages((prev) => [...prev, ...imageFiles]);
    e.target.value = ""; // Reset file input
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header - Styled like other pages */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-blue-600 rounded-xl shadow">
              <PenSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Create Post
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Share your thoughts with the world
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            {/* User Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={user.profile_picture}
                  alt="profile"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow"
                />
                <div>
                  <h2 className="font-bold text-gray-900 text-base sm:text-lg">
                    {user.full_name}
                  </h2>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
              <div className="sm:ml-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    Posting to feed
                  </span>
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div className="mb-4">
              <textarea
                value={content}
                maxLength={MAX_CHARS}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Share your thoughts, ideas, or updates..."
                className="w-full resize-none h-32 text-base outline-none placeholder-gray-400 bg-transparent"
                rows={4}
              />
            </div>

            {/* Character Counter */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="text-sm text-gray-500">
                <span
                  className={
                    content.length > MAX_CHARS - 20 ? "text-amber-600" : ""
                  }
                >
                  {MAX_CHARS - content.length} characters remaining
                </span>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {content.length}/{MAX_CHARS}
              </div>
            </div>

            {/* Images Preview */}
            {images.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-700">Images</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      {images.length}/{MAX_IMAGES}
                    </span>
                  </div>
                  <button
                    onClick={() => setImages([])}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove all
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((image, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        className="h-24 sm:h-32 w-full object-cover rounded-lg shadow-sm"
                        alt=""
                      />
                      <button
                        onClick={() =>
                          setImages(images.filter((_, idx) => idx !== i))
                        }
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white truncate">
                          {image.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 mb-4 sm:mb-6"></div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                <label
                  htmlFor="images"
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg cursor-pointer transition-colors ${
                    images.length >= MAX_IMAGES
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  title={
                    images.length >= MAX_IMAGES
                      ? `Maximum ${MAX_IMAGES} images allowed`
                      : "Add images"
                  }
                >
                  <Image className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm font-medium">
                    Add images {images.length >= MAX_IMAGES && "(Max reached)"}
                  </span>
                </label>

                <input
                  id="images"
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={images.length >= MAX_IMAGES}
                />

                <button
                  onClick={() => navigate("/")}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || (!content.trim() && images.length === 0)}
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm sm:text-base">Publishing...</span>
                  </>
                ) : (
                  <span className="text-sm sm:text-base">Publish Post</span>
                )}
              </button>
            </div>

            {/* Image Limit Warning */}
            {images.length >= MAX_IMAGES && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-700">
                    Maximum {MAX_IMAGES} images allowed per post
                  </p>
                </div>
              </div>
            )}

            {/* Post Tips */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Tips for a great post
                    </p>
                    <ul className="text-xs sm:text-sm text-blue-600 space-y-1">
                      <li>• Be authentic and share your unique perspective</li>
                      <li>
                        • Add up to {MAX_IMAGES} images to make your post more
                        engaging
                      </li>
                      <li>• Keep it concise and to the point</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
