import { BadgeCheck, Heart, MessagesSquare, Share2, X } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const postWithHashtags =
    post.content?.replace(
      /(#\w+)/g,
      '<span class="text-indigo-600">$1</span>',
    ) || "";
  const [likes, setLikes] = useState(post.likes_count || []);
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [activeImage, setActiveImage] = useState("");

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

  return (
    <>
      <div className="bg-white rounded-2xl shadow p-4 space-y-4 w-full max-w-2xl hover:shadow-md transition">
        {/* User Info */}
        <div
          onClick={() => navigate(`/profile/${post.user._id}`)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src={post.user.profile_picture}
            alt=""
            className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-900">
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
            className="text-gray-800 text-sm whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: postWithHashtags }}
          />
        )}

        {/* Images */}
        {post.image_urls?.length > 0 && (
          <div
            className={`grid gap-2 ${post.image_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
          >
            {post.image_urls.map((img, idx) => (
              <div key={idx} className="relative cursor-pointer">
                <img
                  src={img}
                  alt=""
                  className={`w-full object-cover rounded-lg ${
                    post.image_urls.length === 1
                      ? "h-64 sm:h-80"
                      : "h-48 sm:h-56"
                  }`}
                  onClick={() => {
                    setActiveImage(img);
                    setShowModal(true);
                  }}
                />
                {post.image_urls.length > 4 && idx === 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
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
        <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-200">
          <button className="flex items-center gap-1" onClick={handleLike}>
            <Heart
              className={`w-5 h-5 cursor-pointer ${likes.includes(currentUser._id) ? "fill-red-500 text-red-500" : ""}`}
            />
            <span>{likes.length}</span>
          </button>
          <button className="flex items-center gap-1">
            <MessagesSquare className="w-5 h-5" />
            <span>{post.comments_count || 0}</span>
          </button>
          <button className="flex items-center gap-1">
            <Share2 className="w-5 h-5" />
            <span>{post.shares_count || 0}</span>
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {showModal && (
        <div className="fixed inset-0 h-screen z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-w-3xl w-full">
            <X
              className="absolute border p-2 bg-amber-300 rounded-full top-3 right-3 w-8 h-8 text-black cursor-pointer"
              onClick={() => setShowModal(false)}
            />
            <img
              src={activeImage}
              alt=""
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
