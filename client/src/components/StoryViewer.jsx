// StoryViewer.jsx
import { BadgeCheck, X } from "lucide-react";
import React, { useEffect, useState } from "react";

const StoryViewer = ({ viewStory, setViewStory }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer, progressInterval;
    if (viewStory && viewStory.media_type !== "video") {
      setProgress(0);
      const duration = 10000;
      const setpTime = 100;
      let elapsed = 0;

      progressInterval = setInterval(() => {
        elapsed += setpTime;
        setProgress((elapsed / duration) * 100);
      }, setpTime);

      timer = setTimeout(() => {
        setViewStory(null);
      }, duration);
    }
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [viewStory, setViewStory]);

  const handleClose = () => {
    setViewStory(null);
  };

  if (!viewStory) return null;

  const renderContent = () => {
    switch (viewStory.media_type) {
      case "image":
        return (
          <img
            src={viewStory.media_url}
            className="max-w-[95vw] max-h-[85vh] object-contain"
            alt="Story"
          />
        );

      case "video":
        return (
          <video
            autoPlay
            controls
            onEnded={() => setViewStory(null)}
            src={viewStory.media_url}
            className="max-w-[95vw] max-h-[85vh]"
          />
        );

      case "text":
        return (
          <div className="max-w-[90vw] max-h-[80vh] p-6 sm:p-8 flex items-center justify-center text-white text-xl sm:text-2xl text-center">
            {viewStory.content}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{
        backgroundColor:
          viewStory.media_type === "text"
            ? viewStory.background_color
            : "#000000",
      }}
    >
      {/* Progress bar for non-video stories */}
      {viewStory.media_type !== "video" && (
        <div className="absolute top-4 left-4 right-4 h-1 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-100 linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* User Info */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center space-x-3 p-2 sm:p-3 backdrop-blur-xl rounded-xl bg-black/40">
        <img
          src={viewStory.user?.profile_picture}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-white/30"
          alt={viewStory.user?.full_name}
        />
        <div className="text-white font-medium flex items-center gap-2">
          <span className="text-sm sm:text-base">
            {viewStory.user?.full_name}
          </span>
          <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 text-white z-10"
      >
        <X className="w-6 h-6 sm:w-8 sm:h-8 hover:scale-110 transition-transform cursor-pointer" />
      </button>

      {/* Content */}
      <div className="w-full flex items-center justify-center">
        {renderContent()}
      </div>

      {/* Time info for non-video */}
      {viewStory.media_type !== "video" && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 text-white/70 text-xs sm:text-sm">
          {Math.round((100 - progress) / 10)}s
        </div>
      )}
    </div>
  );
};

export default StoryViewer;
