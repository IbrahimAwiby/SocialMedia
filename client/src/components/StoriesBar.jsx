import React, { useEffect, useState } from "react";
import { Plus, Camera, Clock, Image as ImageIcon, Video } from "lucide-react";
import moment from "moment";
import StoryModel from "./StoryModel";
import StoryViewer from "./StoryViewer";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

// StoriesSkeleton Component
const StoriesSkeleton = () => (
  <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4">
    <div className="flex gap-4 pb-5">
      <div className="rounded-lg min-w-30 max-w-30 max-h-40 aspect-3/4 bg-gray-200 animate-pulse" />
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="rounded-lg min-w-30 max-w-30 max-h-40 aspect-3/4 bg-gray-200 animate-pulse"
        />
      ))}
    </div>
  </div>
);

const StoriesBar = () => {
  const { getToken } = useAuth();
  const [stories, setStories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewStory, setViewStory] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await api.get("/api/story/get", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setStories(data.stories);
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  if (loading) {
    return <StoriesSkeleton />;
  }

  return (
    <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4">
      <div className="flex gap-4 pb-5">
        {/* Create Story Card */}
        <div
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 rounded-lg shadow-sm min-w-30 max-w-30 h-40 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white group active:scale-95"
        >
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-600 transition">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-700 text-center">
              Create Story
            </p>
          </div>
        </div>

        {/* Stories Cards */}
        {stories.length === 0 ? (
          <div className="flex-shrink-0 flex items-center justify-center min-w-[200px] h-40 bg-gray-50 rounded-lg p-6 border border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">
                No stories yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Stories disappear after 24 hours
              </p>
            </div>
          </div>
        ) : (
          stories.map((story, index) => (
            <div
              onClick={() => setViewStory(story)}
              className="relative flex-shrink-0 rounded-lg shadow min-w-30 max-w-30 h-40 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 group"
              key={story._id || index}
            >
              {/* User Avatar */}
              <img
                className="absolute w-8 h-8 top-3 left-3 z-10 rounded-full ring-2 ring-white shadow-md"
                src={story.user?.profile_picture || "/default-avatar.png"}
                alt={story.user?.username || "User"}
              />

              {/* User Name */}
              <p className="absolute top-12 left-3 text-white/90 text-sm font-medium truncate max-w-24 drop-shadow-md">
                {story.user?.full_name?.split(" ")[0] || "User"}
              </p>

              {/* Content Preview */}
              {story.content && (
                <p className="absolute bottom-8 left-3 right-2 text-white/70 text-xs truncate drop-shadow-md">
                  {story.content.length > 20
                    ? `${story.content.substring(0, 20)}...`
                    : story.content}
                </p>
              )}

              {/* Time Badge */}
              <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                <Clock className="w-3 h-3 text-white/80" />
                <p className="text-white/80 text-[10px] font-medium">
                  {moment(story.createdAt).fromNow(true)}
                </p>
              </div>

              {/* Media Content */}
              {story.media_type && story.media_type !== "text" ? (
                <div className="absolute inset-0 rounded-lg bg-black overflow-hidden">
                  {story.media_type === "image" ? (
                    <>
                      <img
                        src={story.media_url}
                        className="h-full w-full object-cover transition duration-500 opacity-80 group-hover:opacity-90 group-hover:scale-105"
                        alt=""
                      />
                      <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1 rounded-full">
                        <ImageIcon className="w-3 h-3 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <video
                        src={story.media_url}
                        className="h-full w-full object-cover transition duration-500 opacity-80 group-hover:opacity-90 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1 rounded-full">
                        <Video className="w-3 h-3 text-white" />
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
              ) : (
                story.media_type === "text" && (
                  <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg">
                    <p className="text-white text-xs font-medium text-center line-clamp-3">
                      {story.content}
                    </p>
                  </div>
                )
              )}
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <StoryModel setShowModal={setShowModal} fetchStories={fetchStories} />
      )}

      {viewStory && (
        <StoryViewer viewStory={viewStory} setViewStory={setViewStory} />
      )}
    </div>
  );
};

export default StoriesBar;
