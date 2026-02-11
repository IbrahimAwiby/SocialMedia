// StoryViewer.jsx
import {
  BadgeCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import moment from "moment"; // Add this import

const StoryViewer = ({
  viewStory,
  setViewStory,
  allStories = [],
  currentIndex = 0,
  onNext,
  onPrevious,
}) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Cleanup function
  const cleanup = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
  };

  useEffect(() => {
    if (!viewStory) return;

    cleanup();
    setProgress(0);
    setIsPaused(false);

    if (viewStory.media_type === "video") {
      // Handle video stories
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      // Handle image/text stories with progress bar
      const duration = 10000; // 10 seconds
      const stepTime = 50; // Update every 50ms for smooth progress
      let elapsed = 0;

      progressIntervalRef.current = setInterval(() => {
        if (!isPaused) {
          elapsed += stepTime;
          const newProgress = (elapsed / duration) * 100;
          setProgress(Math.min(newProgress, 100));

          if (newProgress >= 100) {
            cleanup();
            if (onNext) {
              onNext();
            } else {
              setViewStory(null);
            }
          }
        }
      }, stepTime);
    }

    // Auto-hide controls after 3 seconds
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return cleanup;
  }, [viewStory, isPaused, onNext, setViewStory]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewStory) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (onPrevious) onPrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          if (onNext) onNext();
          break;
        case "Escape":
          e.preventDefault();
          handleClose();
          break;
        case " ":
          e.preventDefault();
          if (viewStory.media_type === "video") {
            toggleVideoPlay();
          } else {
            togglePause();
          }
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewStory, onNext, onPrevious]);

  const handleClose = () => {
    cleanup();
    setViewStory(null);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoEnded = () => {
    if (onNext) {
      onNext();
    } else {
      setViewStory(null);
    }
  };

  const handleControlsShow = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleVideoClick = () => {
    toggleVideoPlay();
    handleControlsShow();
  };

  if (!viewStory) return null;

  const renderContent = () => {
    switch (viewStory.media_type) {
      case "image":
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={viewStory.media_url}
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
              alt="Story"
              onClick={togglePause}
            />
            {/* Pause/Play indicator */}
            {isPaused && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <div className="bg-black/60 rounded-full p-4">
                  <Play className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
              </div>
            )}
          </div>
        );

      case "video":
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
              onEnded={handleVideoEnded}
              onClick={handleVideoClick}
              src={viewStory.media_url}
              className="max-w-[95vw] max-h-[85vh] rounded-lg shadow-2xl"
            />

            {/* Video controls overlay */}
            <div
              className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
            >
              <button
                onClick={toggleVideoPlay}
                className="text-white hover:scale-110 transition-transform"
              >
                {isVideoPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={toggleMute}
                className="text-white hover:scale-110 transition-transform"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        );

      case "text":
        return (
          <div
            className="w-full h-full flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl text-center"
            style={{
              backgroundColor: viewStory.background_color || "#4F46E5",
            }}
          >
            <p className="leading-relaxed font-medium px-6">
              {viewStory.content}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleControlsShow}
      style={{
        backgroundColor:
          viewStory.media_type === "text"
            ? viewStory.background_color
            : "rgba(0, 0, 0, 0.95)",
      }}
    >
      {/* Progress bar for non-video stories */}
      {viewStory.media_type !== "video" && !isPaused && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800/50 z-50">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-100 ease-linear rounded-r-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 sm:p-6 z-40 bg-gradient-to-b from-black/60 to-transparent">
        {/* User Info */}
        <div className="flex items-center space-x-3 backdrop-blur-lg bg-black/40 rounded-full pl-2 pr-4 py-1.5 sm:py-2">
          <img
            src={viewStory.user?.profile_picture || "/default-avatar.png"}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white/50 shadow-lg"
            alt={viewStory.user?.full_name}
          />
          <div className="text-white font-medium flex items-center gap-1.5">
            <span className="text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px]">
              {viewStory.user?.full_name}
            </span>
            {viewStory.user?.isVerified && (
              <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            )}
            {/* Remove the moment line below or add conditional check */}
            {viewStory.createdAt && (
              <span className="text-white/60 text-xs sm:text-sm ml-1">
                {moment(viewStory.createdAt).fromNow()}
              </span>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="text-white z-10 bg-black/40 backdrop-blur-lg p-2 rounded-full hover:bg-black/60 transition-all hover:scale-110"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Navigation arrows - Desktop */}
      {onPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/40 backdrop-blur-lg p-2 sm:p-3 rounded-full hover:bg-black/60 transition-all hover:scale-110 hidden sm:block z-40"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/40 backdrop-blur-lg p-2 sm:p-3 rounded-full hover:bg-black/60 transition-all hover:scale-110 hidden sm:block z-40"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Mobile navigation tap zones */}
      <div className="absolute inset-0 flex sm:hidden">
        <div
          className="w-1/3 h-full"
          onClick={(e) => {
            e.stopPropagation();
            onPrevious?.();
          }}
        />
        <div
          className="w-1/3 h-full"
          onClick={(e) => {
            e.stopPropagation();
            togglePause();
          }}
        />
        <div
          className="w-1/3 h-full"
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
        />
      </div>

      {/* Content */}
      <div className="relative w-full h-full flex items-center justify-center p-4 z-30">
        {renderContent()}
      </div>

      {/* Story index indicator */}
      {allStories.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-40">
          {allStories.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Time remaining for non-video */}
      {viewStory.media_type !== "video" && !isPaused && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white/70 text-xs sm:text-sm bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full z-40">
          {Math.ceil((100 - progress) / 10)}s remaining
        </div>
      )}

      {/* Tap to pause hint - shows briefly */}
      {viewStory.media_type !== "video" && showControls && (
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 text-white/50 text-xs bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full animate-fade-in-out z-40">
          Tap to pause
        </div>
      )}
    </div>
  );
};

export default StoryViewer;
