import { Calendar, MapPin, PenBox, Verified } from "lucide-react";
import moment from "moment";
import React from "react";

const UserProfileInfo = ({ user, posts, profileId, setShowEdit }) => {
  return (
    <div className="relative bg-white pt-20 px-4 sm:px-6 md:px-8 pb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Profile Picture */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-white shadow-lg rounded-full relative flex-shrink-0 -mt-16 md:mt-0">
          <img
            src={user.profile_picture}
            alt="Profile"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        {/* User Info */}
        <div className="w-full text-center md:text-left md:pl-6 pt-4 md:pt-0">
          {/* Name + Verified + Edit Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.full_name}
                </h1>
                <Verified className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-gray-600 text-sm mt-1">
                {user.username ? `@${user.username}` : "Add a username"}
              </p>
            </div>

            {/* Edit Button (only on own profile) */}
            {!profileId && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 text-white rounded-md text-sm font-medium active:scale-95 transition"
              >
                <PenBox className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 text-sm mt-3 max-w-full md:max-w-md mx-auto md:mx-0">
              {user.bio}
            </p>
          )}

          {/* Location & Joined */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-gray-500 mt-3">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {user.location || "Add Location"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Joined{" "}
              <span className="font-medium">
                {moment(user.createdAt).fromNow()}
              </span>
            </span>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4 border-t border-gray-200 pt-3 text-gray-900">
            <div className="text-center md:text-left">
              <span className="font-bold text-lg sm:text-xl">
                {posts.length}
              </span>
              <span className="ml-1 text-sm text-gray-500">Posts</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-bold text-lg sm:text-xl">
                {user.followers.length}
              </span>
              <span className="ml-1 text-sm text-gray-500">Followers</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-bold text-lg sm:text-xl">
                {user.following.length}
              </span>
              <span className="ml-1 text-sm text-gray-500">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
