import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import UserProfileInfo from "../components/UserProfileInfo";
import PostCard from "../components/PostCard";
import ProfileModal from "../components/ProfileModal";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import moment from "moment";

const tabs = ["posts", "media", "likes"];

const Profile = () => {
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const { profileId } = useParams();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);

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
        setPosts(data.posts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true; // prevent state update if unmounted
    if (isMounted) {
      fetchUser(profileId || currentUser?._id);
    }
    return () => (isMounted = false);
  }, [profileId, currentUser]);

  if (loading || !user) return <Loading />;

  const mediaPosts = posts.filter((post) => post.image_urls?.length > 0);

  return (
    <div className="relative min-h-screen bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {/* Cover Photo */}
          <div className="h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 relative">
            {user.cover_photo ? (
              <img
                src={user.cover_photo}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Cover Photo
              </div>
            )}
          </div>

          {/* User Info */}
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow p-1 flex max-w-md mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab
                  ? "bg-indigo-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Posts */}
        {activeTab === "posts" && (
          <div className="flex flex-col gap-6">
            {posts.length ? (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <p className="text-gray-500 text-center py-6">No posts yet</p>
            )}
          </div>
        )}

        {/* Media */}
        {activeTab === "media" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mediaPosts.length ? (
              mediaPosts.map((post) =>
                post.image_urls.map((img, idx) => (
                  <Link
                    to={img}
                    key={post._id + "-" + idx}
                    target="_blank"
                    className="relative group overflow-hidden rounded-lg"
                  >
                    <img
                      src={img}
                      alt="media"
                      className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 right-1 text-xs p-1 px-2 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition duration-300 rounded">
                      {moment(post.createdAt).fromNow()}
                    </span>
                  </Link>
                )),
              )
            ) : (
              <p className="text-gray-500 text-center py-6">No media yet</p>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {showEdit && <ProfileModal setShowEdit={setShowEdit} />}
      </div>
    </div>
  );
};

export default Profile;
