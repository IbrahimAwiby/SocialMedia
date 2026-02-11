import {
  BadgeCheck,
  Heart,
  MessagesSquare,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import moment from "moment";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

// PostCardSkeleton Component
export const PostCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow p-4 space-y-4 w-full max-w-2xl">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-1">
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
      <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse" />
    <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
      <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
      <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
      <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const postWithHashtags =
    post.content?.replace(
      /(#\w+)/g,
      '<span class="text-indigo-600 font-medium">$1</span>',
    ) || "";
  const [likes, setLikes] = useState(post.likes_count || []);
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  const handleLike = async () => {
    try {
      const { data } = await api.post(
        `/api/post/like`,
        { postId: post._id },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );
      if (data.success) {
        toast.success(data.message);
        setLikes((prev) =>
          prev.includes(currentUser._id)
            ? prev.filter((id) => id !== currentUser._id)
            : [...prev, currentUser._id],
        );
      } else toast(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openImageModal = (img, index) => {
    setActiveImage(img);
    setCurrentImageIndex(index);
    setShowModal(true);
    setImageLoading(true);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (post.image_urls && currentImageIndex < post.image_urls.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setActiveImage(post.image_urls[newIndex]);
      setImageLoading(true);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (post.image_urls && currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setActiveImage(post.image_urls[newIndex]);
      setImageLoading(true);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(activeImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `post-image-${currentImageIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow p-4 space-y-4 w-full max-w-2xl hover:shadow-md transition-all duration-200 border border-gray-100">
        {/* User Info */}
        <div
          onClick={() => navigate(`/profile/${post.user._id}`)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={post.user.profile_picture}
            alt=""
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-indigo-200 transition-all"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition">
                {post.user.full_name}
              </span>
              {post.user.isVerified && (
                <BadgeCheck className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <span className="text-gray-500 text-sm">
              @{post.user.username} • {moment(post.createdAt).fromNow()}
            </span>
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <div
            className="text-gray-800 text-sm whitespace-pre-line leading-relaxed"
            dangerouslySetInnerHTML={{ __html: postWithHashtags }}
          />
        )}

        {/* Images */}
        {post.image_urls?.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.image_urls.length === 1
                ? "grid-cols-1"
                : post.image_urls.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2 md:grid-cols-2"
            }`}
          >
            {post.image_urls.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className={`relative cursor-pointer overflow-hidden rounded-lg ${
                  post.image_urls.length === 3 && idx === 0
                    ? "row-span-2 h-full"
                    : ""
                }`}
                onClick={() => openImageModal(img, idx)}
              >
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 z-10 flex items-center justify-center">
                  <span className="text-white opacity-0 hover:opacity-100 transform scale-0 hover:scale-100 transition-all duration-300">
                    <span className="bg-black/50 p-2 rounded-full">
                      <span className="sr-only">View image</span>
                      👁️
                    </span>
                  </span>
                </div>
                <img
                  src={img}
                  alt={`Post image ${idx + 1}`}
                  loading="lazy"
                  className={`w-full object-cover transition-all duration-500 hover:scale-105 ${
                    post.image_urls.length === 1
                      ? "h-64 sm:h-80"
                      : post.image_urls.length === 3 && idx === 0
                        ? "h-96"
                        : "h-48 sm:h-56"
                  }`}
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
                {post.image_urls.length > 4 && idx === 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg backdrop-blur-sm">
                    <span className="text-white font-bold text-lg">
                      +{post.image_urls.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-100">
          <button
            className="flex items-center gap-1.5 hover:text-red-500 transition group"
            onClick={handleLike}
          >
            <Heart
              className={`w-5 h-5 cursor-pointer transition-all group-hover:scale-110 ${
                likes.includes(currentUser._id)
                  ? "fill-red-500 text-red-500"
                  : "group-hover:text-red-500"
              }`}
            />
            <span
              className={
                likes.includes(currentUser._id)
                  ? "text-red-500 font-medium"
                  : ""
              }
            >
              {likes.length}
            </span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-indigo-600 transition group">
            <MessagesSquare className="w-5 h-5 group-hover:scale-110 transition" />
            <span>{post.comments_count || 0}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-green-600 transition group">
            <Share2 className="w-5 h-5 group-hover:scale-110 transition" />
            <span>{post.shares_count || 0}</span>
          </button>
        </div>
      </div>

      {/* Enhanced Image Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] w-screen h-screen min-h-screen flex items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full h-full flex items-center justify-center p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - mobile optimized */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all hover:scale-110 backdrop-blur-sm border border-white/20"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="absolute top-4 right-16 sm:top-6 sm:right-20 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all hover:scale-110 backdrop-blur-sm border border-white/20"
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Image counter */}
            {post.image_urls?.length > 1 && (
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm border border-white/20">
                {currentImageIndex + 1} / {post.image_urls.length}
              </div>
            )}

            {/* Navigation buttons - mobile optimized */}
            {post.image_urls?.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  disabled={currentImageIndex === 0}
                  className={`absolute left-2 sm:left-6 z-50 p-2 sm:p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all hover:scale-110 backdrop-blur-sm border border-white/20 ${
                    currentImageIndex === 0
                      ? "opacity-50 cursor-not-allowed hover:scale-100"
                      : ""
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={nextImage}
                  disabled={currentImageIndex === post.image_urls.length - 1}
                  className={`absolute right-2 sm:right-6 z-50 p-2 sm:p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all hover:scale-110 backdrop-blur-sm border border-white/20 ${
                    currentImageIndex === post.image_urls.length - 1
                      ? "opacity-50 cursor-not-allowed hover:scale-100"
                      : ""
                  }`}
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            {/* Image container */}
            <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
              {/* Loading skeleton */}
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Actual image */}
              <img
                src={activeImage}
                alt=""
                className={`max-w-full max-h-full w-auto h-auto object-contain rounded-lg transition-all duration-300 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                  setImageLoading(false);
                }}
              />
            </div>

            {/* Thumbnail preview for mobile */}
            {post.image_urls?.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 p-2 bg-black/50 backdrop-blur-sm rounded-full">
                {post.image_urls.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentImageIndex(idx);
                      setActiveImage(post.image_urls[idx]);
                      setImageLoading(true);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "bg-white w-4"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
