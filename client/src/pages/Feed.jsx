import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { MessageCircle, X } from "lucide-react";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const { getToken } = useAuth();

  const fetchFeeds = async () => {
    try {
      setLoading(true);
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
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-[100vw] overflow-x-hidden">
        <div className="py-5 px-3 sm:px-4 max-w-2xl mx-auto">
          <StoriesBar />
          <div className="mt-4 space-y-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl shadow p-4 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="py-5 px-3 sm:px-4 xl:px-0">
        {/* Desktop Layout */}
        <div className="xl:flex xl:gap-8 xl:justify-center xl:max-w-7xl xl:mx-auto">
          {/* Main Content - Stories and Posts */}
          <div className="w-full max-w-2xl mx-auto xl:mx-0">
            <StoriesBar />

            <div className="mt-4 space-y-6">
              {feeds.length === 0 ? (
                <div className="bg-white rounded-2xl shadow p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      No posts yet
                    </h3>
                    <p className="text-gray-500 max-w-sm">
                      When you or people you follow post something, it will
                      appear here.
                    </p>
                  </div>
                </div>
              ) : (
                feeds.map((post) => <PostCard key={post._id} post={post} />)
              )}
            </div>
          </div>

          {/* Desktop Sidebar - Only visible on xl screens */}
          <div className="hidden xl:block sticky top-0 w-80 flex-shrink-0">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h3 className="text-slate-800 font-semibold mb-4">Sponsored</h3>
              <img
                src={assets.sponsored_img}
                className="w-full h-40 rounded-lg object-cover"
                alt=""
              />
              <div className="mt-4">
                <p className="text-slate-700 font-medium">Email marketing</p>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Supercharge your marketing with a powerful, easy-to-use
                  platform built for results.
                </p>
              </div>
            </div>
            <RecentMessages />
          </div>
        </div>
      </div>

      {/* Mobile Messages Button - Only visible below xl */}
      <div className="xl:hidden">
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar - Slide from right */}
      <div
        className={`
          xl:hidden fixed top-0 right-0 h-full w-[85vw] max-w-[400px] z-50
          bg-white shadow-2xl
          transition-transform duration-300 ease-in-out
          ${showSidebar ? "translate-x-0" : "translate-x-full"}
          overflow-y-auto
        `}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Messages & Sponsors</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <h3 className="text-slate-800 font-semibold mb-3">Sponsored</h3>
            <img
              src={assets.sponsored_img}
              className="w-full h-32 rounded-lg object-cover"
              alt=""
            />
            <div className="mt-3">
              <p className="text-slate-700 font-medium">Email marketing</p>
              <p className="text-slate-500 text-xs mt-1">
                Supercharge your marketing with an easy-to-use platform.
              </p>
            </div>
          </div>
          <RecentMessages />
        </div>
      </div>

      {/* Mobile Overlay */}
      {showSidebar && (
        <div
          className="xl:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};

export default Feed;
