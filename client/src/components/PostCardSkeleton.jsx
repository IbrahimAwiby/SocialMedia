import React from "react";

const PostCardSkeleton = () => (
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

export default PostCardSkeleton;
