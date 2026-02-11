import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  X,
  Camera,
  User,
  MapPin,
  Globe,
  Edit2,
  Upload,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { updateUser } from "../features/user/userSlice";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

const ProfileModal = ({ setShowEdit }) => {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const formRef = useRef(null);

  // Initialize form with user data
  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
    profile_picture: user?.imageUrl || "",
    cover_photo: null,
  });

  const [preview, setPreview] = useState({
    profile: user?.profile_picture || "",
    cover: user?.cover_photo || "",
  });

  const [originalFiles, setOriginalFiles] = useState({
    profile: null,
    cover: null,
  });

  // Handle file preview
  useEffect(() => {
    let profileUrl = null;
    let coverUrl = null;

    if (editForm.profile_picture) {
      profileUrl = URL.createObjectURL(editForm.profile_picture);
      setPreview((prev) => ({ ...prev, profile: profileUrl }));
    }

    if (editForm.cover_photo) {
      coverUrl = URL.createObjectURL(editForm.cover_photo);
      setPreview((prev) => ({ ...prev, cover: coverUrl }));
    }

    return () => {
      profileUrl && URL.revokeObjectURL(profileUrl);
      coverUrl && URL.revokeObjectURL(coverUrl);
    };
  }, [editForm.profile_picture, editForm.cover_photo]);

  // Validate username availability
  const checkUsernameAvailability = useCallback(
    async (username) => {
      if (!username || username === user?.username) return true;

      // Add debouncing in production
      // For now, basic validation
      if (username.length < 3) return false;
      if (!/^[a-zA-Z0-9_]+$/.test(username)) return false;

      return true;
    },
    [user?.username],
  );

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    // Clear previous errors
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");

    // Special validation for username
    if (name === "username") {
      if (!/^[a-zA-Z0-9_]*$/.test(value)) {
        setFormErrors((prev) => ({
          ...prev,
          username: "Only letters, numbers, and underscores allowed",
        }));
        return;
      }

      // Check availability (simulated - implement actual API call)
      const isAvailable = await checkUsernameAvailability(value);
      if (!isAvailable && value !== user?.username) {
        setFormErrors((prev) => ({
          ...prev,
          username: "Username is already taken",
        }));
      }
    }

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    // Validate file type
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    // Validate dimensions for profile picture
    if (type === "profile_picture") {
      const img = new Image();
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          toast.error("Profile picture should be at least 100x100 pixels");
          return;
        }

        setEditForm((prev) => ({ ...prev, [type]: file }));
        setOriginalFiles((prev) => ({ ...prev, [type]: file }));
      };
      img.src = URL.createObjectURL(file);
    } else {
      setEditForm((prev) => ({ ...prev, [type]: file }));
      setOriginalFiles((prev) => ({ ...prev, [type]: file }));
    }
  };

  const removeImage = (type) => {
    setEditForm((prev) => ({ ...prev, [type]: null }));
    setPreview((prev) => ({
      ...prev,
      [type === "profile_picture" ? "profile" : "cover"]:
        type === "profile_picture"
          ? user?.profile_picture || ""
          : user?.cover_photo || "",
    }));
    setOriginalFiles((prev) => ({ ...prev, [type]: null }));
  };

  const validateForm = async () => {
    const errors = {};

    // Full name validation
    if (!editForm.full_name.trim()) {
      errors.full_name = "Full name is required";
    } else if (editForm.full_name.length < 2) {
      errors.full_name = "Full name must be at least 2 characters";
    } else if (editForm.full_name.length > 50) {
      errors.full_name = "Full name must be less than 50 characters";
    }

    // Username validation
    if (!editForm.username.trim()) {
      errors.username = "Username is required";
    } else if (editForm.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (editForm.username.length > 30) {
      errors.username = "Username must be less than 30 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(editForm.username)) {
      errors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Bio validation
    if (editForm.bio.length > 200) {
      errors.bio = "Bio must be less than 200 characters";
    }

    // Location validation
    if (editForm.location.length > 100) {
      errors.location = "Location must be less than 100 characters";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const element = formRef.current?.querySelector(`[name="${firstError}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      element?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!(await validateForm())) return;

    setIsSaving(true);
    setServerError("");

    try {
      const userData = new FormData();
      const {
        full_name,
        username,
        bio,
        location,
        profile_picture,
        cover_photo,
      } = editForm;

      // Only append changed fields
      if (full_name !== user?.full_name) {
        userData.append("full_name", full_name);
      }
      if (username !== user?.username) {
        userData.append("username", username);
      }
      if (bio !== user?.bio) {
        userData.append("bio", bio);
      }
      if (location !== user?.location) {
        userData.append("location", location);
      }

      // Append files if changed
      if (profile_picture) {
        userData.append("profile", profile_picture);
      }
      if (cover_photo) {
        userData.append("cover", cover_photo);
      }

      const token = await getToken();

      // Dispatch update user action
      const result = await dispatch(updateUser({ userData, token })).unwrap();

      // Show success message
      toast.success(result.message || "Profile updated successfully!");
      setSaveSuccess(true);

      // Close modal after success
      setTimeout(() => {
        setShowEdit(false);
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      setServerError(
        error.message || "Failed to update profile. Please try again.",
      );

      if (error.message?.includes("username")) {
        setFormErrors((prev) => ({
          ...prev,
          username: error.message,
        }));
      }

      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey && !isSaving) {
      handleSave();
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange({ target: { files: [file] } }, type);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const characterCount = editForm.bio?.length || 0;
  const maxBioLength = 200;

  const handleReset = () => {
    setEditForm({
      full_name: user?.full_name || "",
      username: user?.username || "",
      bio: user?.bio || "",
      location: user?.location || "",
      profile_picture: null,
      cover_photo: null,
    });
    setPreview({
      profile: user?.profile_picture || "",
      cover: user?.cover_photo || "",
    });
    setFormErrors({});
    setServerError("");
  };

  // Check if form has changes
  const hasChanges = () => {
    return (
      editForm.full_name !== user?.full_name ||
      editForm.username !== user?.username ||
      editForm.bio !== user?.bio ||
      editForm.location !== user?.location ||
      editForm.profile_picture !== null ||
      editForm.cover_photo !== null
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}
    >
      {/* Modal */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-slideUp"
        onKeyDown={handleKeyPress}
        ref={formRef}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Edit2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Edit Profile
              </h2>
              <p className="text-sm text-slate-500">
                Update your profile information
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowEdit(false)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors group"
            disabled={isSaving}
          >
            <X className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Server Error */}
          {serverError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          {/* Cover Photo */}
          <div className="relative h-48 bg-gradient-to-r from-blue-100 to-purple-100">
            <div
              className="w-full h-full relative group cursor-pointer"
              onClick={() => coverInputRef.current?.click()}
              onDrop={(e) => handleDrop(e, "cover_photo")}
              onDragOver={handleDragOver}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {preview.cover
                        ? "Change cover photo"
                        : "Upload cover photo"}
                    </span>
                  </div>
                </div>
              </div>
              {preview.cover ? (
                <img
                  src={preview.cover}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="w-12 h-12 text-slate-400" />
                </div>
              )}

              {/* Remove cover button */}
              {preview.cover && preview.cover !== user?.cover_photo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage("cover_photo");
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Cover Photo Upload Button */}
            <div className="absolute bottom-4 right-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-black/70 hover:bg-black/90 text-white rounded-full cursor-pointer transition-all duration-300 shadow-lg backdrop-blur-sm">
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {preview.cover ? "Change" : "Add"} Cover
                </span>
                <input
                  ref={coverInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "cover_photo")}
                />
              </label>
            </div>

            {/* Profile Image */}
            <div className="absolute -bottom-12 left-6">
              <div className="relative group">
                <div className="relative">
                  {preview.profile ? (
                    <img
                      src={preview.profile}
                      className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
                      alt="profile"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                {/* Remove profile button */}
                {preview.profile &&
                  preview.profile !== user?.profile_picture && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage("profile_picture");
                      }}
                      className="absolute -top-1 -right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}

                <label className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform duration-300 z-10">
                  <Camera className="w-4 h-4" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "profile_picture")}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="pt-16 px-6 pb-6 space-y-6">
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <label className="text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                </div>
                <span className="text-xs text-slate-500">
                  {editForm.full_name.length}/50
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="full_name"
                  value={editForm.full_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    formErrors.full_name ? "border-red-300" : "border-slate-200"
                  }`}
                  placeholder="Enter your full name"
                  maxLength={50}
                  disabled={isSaving}
                />
                {formErrors.full_name && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.full_name}
                  </p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <label className="text-sm font-medium text-slate-700">
                    Username
                  </label>
                </div>
                <span className="text-xs text-slate-500">
                  {editForm.username.length}/30
                </span>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                  @
                </div>
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  className={`w-full pl-8 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    formErrors.username ? "border-red-300" : "border-slate-200"
                  }`}
                  placeholder="username"
                  maxLength={30}
                  disabled={isSaving}
                />
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.username}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <label className="text-sm font-medium text-slate-700">
                    Location
                  </label>
                </div>
                <span className="text-xs text-slate-500">
                  {editForm.location.length}/100
                </span>
              </div>
              <input
                type="text"
                name="location"
                value={editForm.location}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  formErrors.location ? "border-red-300" : ""
                }`}
                placeholder="Where are you based?"
                maxLength={100}
                disabled={isSaving}
              />
              {formErrors.location && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.location}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-slate-500" />
                  <label className="text-sm font-medium text-slate-700">
                    Bio
                  </label>
                </div>
                <span
                  className={`text-xs ${
                    characterCount > maxBioLength
                      ? "text-red-500"
                      : characterCount > maxBioLength * 0.8
                        ? "text-amber-500"
                        : "text-slate-500"
                  }`}
                >
                  {characterCount}/{maxBioLength}
                </span>
              </div>
              <div className="relative">
                <textarea
                  name="bio"
                  rows={4}
                  value={editForm.bio}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 ${
                    formErrors.bio ? "border-red-300" : "border-slate-200"
                  }`}
                  placeholder="Tell us about yourself..."
                  maxLength={maxBioLength}
                  disabled={isSaving}
                />
                {formErrors.bio && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.bio}
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Share your interests, passions, or a brief introduction.
              </p>
            </div>

            {/* Preview Section */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-700 mb-3">
                Preview
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {preview.profile ? (
                      <img
                        src={preview.profile}
                        className="w-12 h-12 rounded-full object-cover"
                        alt="Preview"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {editForm.full_name || "Your Name"}
                    </p>
                    <p className="text-sm text-slate-500">
                      @{editForm.username || "username"}
                    </p>
                    {editForm.location && (
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {editForm.location}
                      </p>
                    )}
                  </div>
                </div>
                {editForm.bio && (
                  <p className="mt-3 text-sm text-slate-700">{editForm.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/50 sticky bottom-0">
          <div className="text-sm max-sm:hidden text-slate-500 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>Press Ctrl+Enter to save quickly</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving || !hasChanges()}
            >
              Reset
            </button>
            <button
              onClick={() => setShowEdit(false)}
              className="px-6 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-all duration-200 font-medium disabled:opacity-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || saveSuccess || !hasChanges()}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer min-w-20  justify-center ${
                saveSuccess
                  ? "bg-green-500 text-white"
                  : "bg-linear-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ProfileModal;
