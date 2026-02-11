import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MessageSquare,
  UserCheck,
  UserPlus,
  UserRoundPen,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { fetchConnections } from "../features/connections/connectionsSlice";
import api from "../api/axios";
import toast from "react-hot-toast";

const Connections = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { connections, followers, following, pendingConnections } = useSelector(
    (state) => state.connections,
  );

  const [currentTab, setCurrentTab] = useState("Connections");
  const [loading, setLoading] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    action: null,
    userId: null,
    userName: "",
    type: "", // "unfollow", "reject", "remove"
  });

  const dataArray = [
    {
      label: "Connections",
      value: connections,
      icon: UserPlus,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Followers",
      value: followers,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Following",
      value: following,
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Pending",
      value: pendingConnections,
      icon: UserRoundPen,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  const showConfirmationModal = (type, userId, userName, action) => {
    let title, message;

    switch (type) {
      case "unfollow":
        title = `Unfollow ${userName}?`;
        message = `You will no longer see ${userName}'s posts in your feed.`;
        break;
      case "reject":
        title = `Reject connection request?`;
        message = `${userName}'s connection request will be rejected.`;
        break;
      case "remove":
        title = `Remove ${userName}?`;
        message = `${userName} will no longer be able to see your posts.`;
        break;
      default:
        title = "Confirm action";
        message = "Are you sure you want to proceed?";
    }

    setModalConfig({
      title,
      message,
      action,
      userId,
      userName,
      type,
    });
    setShowModal(true);
  };

  const handleUnfollow = async (userId, userName) => {
    showConfirmationModal("unfollow", userId, userName, async () => {
      setLoading((prev) => ({ ...prev, [userId]: true }));
      try {
        const { data } = await api.post(
          "/api/user/unfollow",
          { id: userId },
          { headers: { Authorization: `Bearer ${await getToken()}` } },
        );

        if (data.success) {
          toast.success(`Unfollowed ${userName}`);
          dispatch(fetchConnections(await getToken()));
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Failed to unfollow");
      } finally {
        setLoading((prev) => ({ ...prev, [userId]: false }));
        setShowModal(false);
      }
    });
  };

  const acceptConnection = async (userId) => {
    setLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const { data } = await api.post(
        "/api/user/accept",
        { id: userId },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );

      if (data.success) {
        toast.success("Connection accepted");
        dispatch(fetchConnections(await getToken()));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to accept connection");
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const rejectConnection = async (userId, userName) => {
    showConfirmationModal("reject", userId, userName, async () => {
      setLoading((prev) => ({ ...prev, [userId]: true }));
      try {
        const { data } = await api.post(
          "/api/user/reject",
          { id: userId },
          { headers: { Authorization: `Bearer ${await getToken()}` } },
        );

        if (data.success) {
          toast.success("Request rejected");
          dispatch(fetchConnections(await getToken()));
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Failed to reject request");
      } finally {
        setLoading((prev) => ({ ...prev, [userId]: false }));
        setShowModal(false);
      }
    });
  };

  const removeFollower = async (userId, userName) => {
    showConfirmationModal("remove", userId, userName, async () => {
      setLoading((prev) => ({ ...prev, [userId]: true }));
      try {
        const { data } = await api.post(
          "/api/user/remove-follower", // Assuming you have this endpoint
          { id: userId },
          { headers: { Authorization: `Bearer ${await getToken()}` } },
        );

        if (data.success) {
          toast.success(`Removed ${userName}`);
          dispatch(fetchConnections(await getToken()));
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Failed to remove follower");
      } finally {
        setLoading((prev) => ({ ...prev, [userId]: false }));
        setShowModal(false);
      }
    });
  };

  const handleModalAction = () => {
    if (modalConfig.action) {
      modalConfig.action();
    }
  };

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchConnections(token));
    });
  }, []);

  const activeData =
    dataArray.find((item) => item.label === currentTab)?.value || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {modalConfig.title}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">{modalConfig.message}</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalAction}
                className={`flex-1 py-2.5 font-medium rounded-lg transition-colors ${
                  modalConfig.type === "unfollow" ||
                  modalConfig.type === "remove"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-900 hover:bg-black text-white"
                }`}
              >
                {modalConfig.type === "unfollow"
                  ? "Unfollow"
                  : modalConfig.type === "reject"
                    ? "Reject"
                    : modalConfig.type === "remove"
                      ? "Remove"
                      : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
              <p className="text-gray-600 mt-1">
                Manage your network and relationships
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
          {dataArray.map((item) => (
            <div
              key={item.label}
              onClick={() => setCurrentTab(item.label)}
              className={`bg-white rounded-lg border p-3 sm:p-4 md:p-5 cursor-pointer transition-all hover:shadow-sm ${
                currentTab === item.label
                  ? "ring-1 sm:ring-2 ring-blue-500"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`}
                  />
                </div>
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  {item.value.length}
                </span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs - Responsive layout */}
        <div className="mb-4 sm:mb-6">
          <div className="flex overflow-x-auto pb-2 sm:pb-0">
            {dataArray.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setCurrentTab(tab.label)}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  currentTab === tab.label
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span
                    className={`px-1.5 sm:px-2 py-0.5 text-xs rounded-full ${
                      currentTab === tab.label
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.value.length}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Users Grid - Fully responsive */}
        {activeData.length === 0 ? (
          <div className="bg-white rounded-lg border p-6 sm:p-8 md:p-12 text-center">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
              No {currentTab.toLowerCase()} yet
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base max-w-sm mx-auto">
              When you have {currentTab.toLowerCase()}, they will appear here
            </p>
            <button
              onClick={() => navigate("/discover")}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Find People
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {activeData.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-lg border p-4 sm:p-5 hover:shadow-sm transition-shadow"
              >
                {/* User Info */}
                <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                  <img
                    src={user.profile_picture}
                    alt={user.full_name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border flex-shrink-0"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/56";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {user.full_name}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm truncate">
                      @{user.username}
                    </p>
                    {user.mutualConnections > 0 && (
                      <p className="text-gray-400 text-xs mt-0.5">
                        {user.mutualConnections} mutual
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
                    {user.bio}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* View Profile Button */}
                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="w-full py-2 sm:py-2.5 text-xs sm:text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-black transition-colors"
                  >
                    View Profile
                  </button>

                  {/* Conditional Buttons */}
                  {currentTab === "Connections" && (
                    <button
                      onClick={() => navigate(`/messages/${user._id}`)}
                      className="w-full py-2 sm:py-2.5 text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Message
                    </button>
                  )}

                  {currentTab === "Following" && (
                    <button
                      onClick={() => handleUnfollow(user._id, user.full_name)}
                      disabled={loading[user._id]}
                      className="w-full py-2 sm:py-2.5 text-xs sm:text-sm font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading[user._id] ? "Processing..." : "Unfollow"}
                    </button>
                  )}

                  {currentTab === "Pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptConnection(user._id)}
                        disabled={loading[user._id]}
                        className="flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[user._id] ? "..." : "Accept"}
                      </button>
                      <button
                        onClick={() =>
                          rejectConnection(user._id, user.full_name)
                        }
                        disabled={loading[user._id]}
                        className="flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[user._id] ? "..." : "Reject"}
                      </button>
                    </div>
                  )}

                  {currentTab === "Followers" && (
                    <button
                      onClick={() => removeFollower(user._id, user.full_name)}
                      disabled={loading[user._id]}
                      className="w-full py-2 sm:py-2.5 text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading[user._id] ? "Processing..." : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* For mobile, show tab names at bottom for better UX */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 z-10">
          <div className="flex justify-around">
            {dataArray.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setCurrentTab(tab.label)}
                className={`flex flex-col items-center p-2 text-xs ${
                  currentTab === tab.label ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <tab.icon className="w-5 h-5 mb-1" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Add padding bottom for mobile tab bar */}
        <div className="pb-16 lg:pb-0"></div>
      </div>
    </div>
  );
};

export default Connections;
