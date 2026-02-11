import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import PostCardSkeleton from "../components/PostCardSkeleton";
import RecentMessages from "../components/RecentMessages";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Newspaper, RefreshCw } from "lucide-react";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getToken } = useAuth();

  const fetchFeeds = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get("api/post/feed", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setFeeds(data.posts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  if (loading) {
    return (
      <div className="h-full overflow-y-scroll no-scrollbar py-5 xl:pr-5 flex items-start justify-center xl:gap-8">
        <div className="">
          <StoriesBar />
          <div className="p-4 space-y-6">
            {[1, 2, 3].map((n) => (
              <PostCardSkeleton key={n} />
            ))}
          </div>
        </div>
        <div className="max-xl:hidden sticky top-0">
          <div className="max-w-xs bg-white p-4 rounded-md shadow">
            <div className="w-full h-40 bg-gray-200 rounded-md animate-pulse mb-3" />
            <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-scroll no-scrollbar py-5 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/* stories and post list */}
      <div className="w-full max-w-2xl">
        <StoriesBar />

        <div className="p-4 space-y-6">
          {refreshing && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Refreshing posts...</span>
              </div>
            </div>
          )}

          {feeds.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                  <Newspaper className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  No posts yet
                </h3>
                <p className="text-gray-500 max-w-sm">
                  When you or people you follow post something, it will appear
                  here.
                </p>
                <button
                  onClick={() => fetchFeeds(true)}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-full hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Feed
                </button>
              </div>
            </div>
          ) : (
            feeds.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="max-xl:hidden sticky top-0 w-80">
        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-slate-800 font-semibold mb-3">Sponsored</h3>
          <img
            src={assets.sponsored_img}
            className="w-full h-40 rounded-md object-cover"
            alt=""
          />
          <div className="mt-3">
            <p className="text-slate-600 font-medium">Email marketing</p>
            <p className="text-slate-400 text-xs mt-1">
              Supercharge your marketing with a powerful, easy-to-use platform
              built for results.
            </p>
          </div>
        </div>
        <RecentMessages />
      </div>
    </div>
  );
};

export default Feed;
