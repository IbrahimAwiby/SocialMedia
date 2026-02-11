import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, MessageSquare, Plus, UserPlus } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { fetchUser } from "../features/user/userSlice";

const UserCard = ({ user }) => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.value);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const isFollowing = currentUser?.following.includes(user._id);
  const isConnected = currentUser?.connections.includes(user._id);

  const handleFollow = async () => {
    if (followLoading) return;

    setFollowLoading(true);
    try {
      const endpoint = isFollowing ? "/api/user/unfollow" : "/api/user/follow";
      const { data } = await api.post(
        endpoint,
        { id: user._id },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchUser(await getToken()));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleConnectionRequest = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const token = await getToken();

      if (isConnected) {
        navigate(`/messages/${user._id}`);
        return;
      }

      const { data } = await api.post(
        "/api/user/connect",
        { id: user._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchUser(token));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <Link to={`/profile/${user._id}`}>
          <img
            src={user.profile_picture}
            alt={user.full_name}
            className="w-14 h-14 rounded-full object-cover border border-gray-300"
          />
        </Link>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${user._id}`}>
            <h3 className="font-semibold text-gray-900 text-md truncate">
              {user.full_name}
            </h3>
          </Link>
          <p className="text-gray-500 text-sm truncate">@{user.username}</p>

          {user.bio && (
            <p className="text-gray-600 text-xs mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            {user.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[80px]">{user.location}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{user.followers?.length || 0} followers</span>
              <span>•</span>
              <span>{user.following?.length || 0} following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
            isFollowing
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } ${followLoading ? "opacity-75 cursor-not-allowed" : ""}`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
        </button>

        <button
          onClick={handleConnectionRequest}
          disabled={loading}
          className={`py-2 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
            isConnected
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          } ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
        >
          {loading ? (
            "..."
          ) : isConnected ? (
            <>
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Message</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Connect</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
