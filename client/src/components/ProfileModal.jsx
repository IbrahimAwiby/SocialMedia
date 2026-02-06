import React, { useState, useEffect, useRef } from "react";
import { dummyUserData } from "../assets/assets";
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
} from "lucide-react";

const ProfileModal = ({ setShowEdit }) => {
  const user = dummyUserData;
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [editForm, setEditForm] = useState({
    full_name: user.full_name,
    username: user.username,
    bio: user.bio,
    location: user.location,
    profile_picture: null,
    cover_photo: null,
  });

  const [preview, setPreview] = useState({
    profile: user.profile_picture,
    cover: user.cover_photo,
  });

  // Handle file preview
  useEffect(() => {
    if (editForm.profile_picture) {
      const objectUrl = URL.createObjectURL(editForm.profile_picture);
      setPreview((prev) => ({ ...prev, profile: objectUrl }));
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [editForm.profile_picture]);

  useEffect(() => {
    if (editForm.cover_photo) {
      const objectUrl = URL.createObjectURL(editForm.cover_photo);
      setPreview((prev) => ({ ...prev, cover: objectUrl }));
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [editForm.cover_photo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!editForm.full_name.trim()) {
      errors.full_name = "Full name is required";
    } else if (editForm.full_name.length < 2) {
      errors.full_name = "Full name must be at least 2 characters";
    }

    if (!editForm.username.trim()) {
      errors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]+$/.test(editForm.username)) {
      errors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (editForm.bio.length > 200) {
      errors.bio = "Bio must be less than 200 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Here you would typically make an API call to save the data
      console.log("Saving profile data:", editForm);

      setSaveSuccess(true);
      setTimeout(() => {
        setShowEdit(false);
        setSaveSuccess(false);
      }, 1000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isSaving) {
      handleSave();
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange({ target: { files: [file] } }, type);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const characterCount = editForm.bio.length;
  const maxBioLength = 200;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      {/* Modal */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-slideUp"
        onKeyPress={handleKeyPress}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
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
          >
            <X className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
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
                      Upload cover photo
                    </span>
                  </div>
                </div>
              </div>
              <img
                src={preview.cover}
                alt="cover"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Cover Photo Upload Button */}
            <div className="absolute bottom-4 right-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-black/70 hover:bg-black/90 text-white rounded-full cursor-pointer transition-all duration-300 shadow-lg backdrop-blur-sm">
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">Change Cover</span>
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
                  <img
                    src={preview.profile}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
                    alt="profile"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <label className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform duration-300">
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
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-slate-500" />
                <label className="text-sm font-medium text-slate-700">
                  Full Name
                </label>
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
                />
                {formErrors.full_name && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    {formErrors.full_name}
                  </p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <label className="text-sm font-medium text-slate-700">
                  Username
                </label>
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
                />
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.username}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <label className="text-sm font-medium text-slate-700">
                  Location
                </label>
              </div>
              <input
                type="text"
                name="location"
                value={editForm.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Where are you based?"
              />
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
                />
                {formErrors.bio && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.bio}</p>
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
                  <img
                    src={preview.profile}
                    className="w-12 h-12 rounded-full object-cover"
                    alt="Preview"
                  />
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
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-sm max-sm:hidden text-slate-500">
            <ImageIcon className="w-4 h-4 inline mr-1" />
            Images are preview only. Save to apply changes.
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowEdit(false)}
              className="px-6 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-all duration-200 font-medium"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
              className={`px-8 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                saveSuccess
                  ? "bg-green-500 text-white"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
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
                "Save Changes"
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

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfileModal;
