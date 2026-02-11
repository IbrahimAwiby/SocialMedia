import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { MessageSquare, X, User, Clock, Check } from "lucide-react";
import moment from "moment";

const Notification = ({ t, message }) => {
  const navigate = useNavigate();

  // Get user info safely
  const user = message.from_user_id || {};
  const userName = user.full_name || "Someone";
  const userImage = user.profile_picture;
  const userId = user._id;
  const isVerified = user.isVerified;
  const username = user.username || "user";

  // Calculate time ago
  const timeAgo = message.createdAt
    ? moment(message.createdAt).fromNow()
    : "Just now";

  // Get initials for fallback
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const handleReply = () => {
    if (userId) {
      navigate(`/messages/${userId}`);
    }
    toast.dismiss(t.id);
  };

  const handleClose = () => {
    toast.dismiss(t.id);
  };

  const handleViewProfile = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
      toast.dismiss(t.id);
    }
  };

  // Get message preview
  const getMessagePreview = () => {
    if (!message.text) return "Sent you a message";

    if (message.message_type === "image") {
      return "📷 Sent an image";
    }

    if (message.text.length > 60) {
      return message.text.substring(0, 60) + "...";
    }

    return message.text;
  };

  return (
    <div className="w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-0.5">
                {userImage ? (
                  <img
                    src={userImage}
                    className="h-full w-full rounded-full object-cover border-2 border-white"
                    alt={userName}
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center border-2 border-white">
                    <span className="text-white font-bold text-sm">
                      {getInitials(userName)}
                    </span>
                  </div>
                )}
              </div>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full border-2 border-white">
                  <Check className="w-2.5 h-2.5 text-blue-500" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1">
                <p className="font-semibold text-gray-900 text-sm">
                  {userName}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Message Preview */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>

          <div className="flex-1">
            <p className="text-gray-700 text-sm">{getMessagePreview()}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReply}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Reply
          </button>

          {userId && (
            <button
              onClick={handleViewProfile}
              className="p-2.5 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              title="View Profile"
            >
              <User className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
