import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  PenBox,
  Verified,
  Image as ImageIcon,
  Heart,
  MessageSquare,
  MoreVertical,
  FileText,
  UserPlus,
  MessageCircle,
  X,
  Maximize2,
} from "lucide-react";
import Loading from "../components/Loading";
import ProfileModal from "../components/ProfileModal";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import moment from "moment";

const Profile = () => {
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const tabs = [
    { id: "posts", label: "Posts", icon: FileText },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "likes", label: "Likes", icon: Heart },
  ];

  const fetchUser = async (id) => {
    setLoading(true);
    const token = await getToken();
    try {
      const { data } = await api.post(
        "/api/user/profiles",
        { profileId: id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success) {
        setUser(data.profile);
        setPosts(data.posts || []);
        setIsFollowing(
          data.profile.followers?.includes(currentUser?._id) || false,
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts that this user has liked
  const fetchLikedPosts = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get(`/api/posts/liked-by/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setLikedPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Failed to fetch liked posts:", error);
    }
  };

  const handleFollow = async () => {
    if (loadingAction || !user) return;

    setLoadingAction(true);
    try {
      const token = await getToken();
      const endpoint = isFollowing ? "/api/user/unfollow" : "/api/user/follow";

      const { data } = await api.post(
        endpoint,
        { id: user._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success) {
        toast.success(data.message);
        setIsFollowing(!isFollowing);
        fetchUser(user._id);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to follow");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleMessage = () => {
    if (!user) return;
    navigate(`/messages/${user._id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (profileId || currentUser?._id) {
        await fetchUser(profileId || currentUser?._id);
      }
    };
    fetchData();
  }, [profileId, currentUser]);

  if (loading) return <Loading />;
  if (!user)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );

  const isOwnProfile = !profileId || profileId === currentUser?._id;
  const mediaPosts = posts.filter((post) => post.image_urls?.length > 0);

  return (
    <>
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => window.open(selectedImage, "_blank")}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Cover Photo - Increased height */}
          <div className="relative h-56 rounded-xl overflow-visible mb-20 bg-gradient-to-r from-blue-100 to-purple-100">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt="Cover"
                className="w-full h-full object-cover rounded-xl"
              />
            )}

            {/* Profile Picture - Increased size and fixed position */}
            <div className="absolute -bottom-16 left-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden">
                  <img
                    src={
                      user.profile_picture || "https://via.placeholder.com/150"
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                </div>
                {user.isVerified && (
                  <div className="absolute -bottom-1 -right-1 p-1.5 bg-blue-500 rounded-full border-2 border-white">
                    <Verified className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Info Section */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.full_name || "User"}
                  </h1>
                  {user.isVerified && (
                    <Verified className="w-5 h-5 text-blue-500" />
                  )}
                </div>

                <p className="text-gray-600 text-base mb-3">
                  @{user.username || "username"}
                </p>

                {user.bio && (
                  <p className="text-gray-700 mb-4 text-sm">{user.bio}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-gray-600 mb-5">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Joined {moment(user.createdAt).format("MMM YYYY")}
                    </span>
                  </div>
                </div>

                {/* Stats - Increased size */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">
                      {posts.length}
                    </p>
                    <p className="text-sm text-gray-500">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">
                      {user.followers?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">
                      {user.following?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500">Following</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Increased size */}
              <div className="flex gap-3">
                {isOwnProfile ? (
                  <button
                    onClick={() => setShowEdit(true)}
                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <PenBox className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      disabled={loadingAction}
                      className={`px-5 py-2.5 font-medium rounded-lg transition-colors flex items-center gap-2 ${
                        isFollowing
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      } ${loadingAction ? "opacity-75 cursor-not-allowed" : ""}`}
                    >
                      <UserPlus className="w-4 h-4" />
                      {loadingAction
                        ? "..."
                        : isFollowing
                          ? "Following"
                          : "Follow"}
                    </button>
                    <button
                      onClick={handleMessage}
                      className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      title="Message"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs - Increased size */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div>
            {activeTab === "posts" && (
              <div className="space-y-6">
                {posts.length > 0 ? (
                  posts.map((post) => <PostCard key={post._id} post={post} />)
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {isOwnProfile ? "No posts yet" : "No posts to show"}
                    </h3>
                    {isOwnProfile && (
                      <button
                        onClick={() => navigate("/create-post")}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Create post
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "media" && (
              <div>
                {mediaPosts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {mediaPosts.map((post) =>
                      post.image_urls.map((img, idx) => (
                        <div
                          key={post._id + "-" + idx}
                          onClick={() => setSelectedImage(img)}
                          className="relative group overflow-hidden rounded-lg aspect-square cursor-pointer"
                        >
                          {/* Image */}
                          <img
                            src={img}
                            alt="media"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                            <span className="text-xs text-white font-medium">
                              Created {moment(post.createdAt).fromNow()}
                            </span>
                          </div>
                        </div>
                      )),
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      No media yet
                    </h3>
                  </div>
                )}
              </div>
            )}

            {activeTab === "likes" && (
              <div>
                {isOwnProfile ? (
                  likedPosts.length > 0 ? (
                    <div className="space-y-6">
                      {likedPosts.map((post) => (
                        <PostCard key={post._id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        No liked posts yet
                      </h3>
                    </div>
                  )
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Likes are private
                    </h3>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && <ProfileModal setShowEdit={setShowEdit} />}
    </>
  );
};

// PostCard Component with increased sizes
const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();

  const [likes, setLikes] = useState(post.likes_count || []);
  const [isLiked, setIsLiked] = useState(
    post.likes_count?.includes(currentUser?._id) || false,
  );
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading || !currentUser) return;

    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await api.post(
        `/api/post/like`,
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success) {
        setIsLiked(!isLiked);
        setLikes((prev) =>
          isLiked
            ? prev.filter((id) => id !== currentUser._id)
            : [...prev, currentUser._id],
        );
      }
    } catch (error) {
      console.error("Failed to like post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          onClick={() => navigate(`/profile/${post.user?._id || post.user}`)}
          className="flex items-center gap-3 cursor-pointer flex-1"
        >
          <img
            src={post.user?.profile_picture || "https://via.placeholder.com/40"}
            alt={post.user?.full_name || "User"}
            className="w-10 h-10 rounded-full object-cover border"
          />
          <div>
            <div className="flex items-center gap-1">
              <p className="font-semibold text-gray-900">
                {post.user?.full_name || "User"}
              </p>
              {post.user?.isVerified && (
                <Verified className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>@{post.user?.username || "user"}</span>
              <span>•</span>
              <span>{moment(post.createdAt).fromNow()}</span>
            </div>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-gray-800 text-base mb-4 whitespace-pre-line">
          {post.content}
        </p>
      )}

      {/* Images - Increased height */}
      {post.image_urls?.length > 0 && (
        <div className="mb-4">
          {post.image_urls.length === 1 ? (
            <img
              src={post.image_urls[0]}
              alt=""
              className="w-full h-72 object-cover rounded-lg"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {post.image_urls.slice(0, 4).map((img, index) => (
                <div key={index} className="aspect-square">
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
        <button
          onClick={handleLike}
          disabled={loading}
          className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
          />
          <span className="text-base font-medium">{likes.length}</span>
        </button>
        <button className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors">
          <MessageSquare className="w-5 h-5" />
          <span className="text-base font-medium">0</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
