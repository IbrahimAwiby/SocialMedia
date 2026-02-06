import React, { useState } from "react";
import { dummyUserData } from "../assets/assets";
import { Image, X } from "lucide-react";
import toast from "react-hot-toast";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {};

  const user = dummyUserData;
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create Post
          </h1>
          <p className="text-slate-600">Share your thoughts with the world</p>
        </div>
        {/* form */}
        <div className="max-w-xl bg-white p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4">
          {/* header */}
          <div className="flex items-center gap-3">
            <img
              src={user.profile_picture}
              alt=""
              className="w-12 h-12 rounded-full shadow"
            />
            <div className="">
              <h2 className="font-semibold">{user.full_name}</h2>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>
          {/* textarea */}
          <textarea
            onChange={(e) => setContent(e.target.value)}
            value={content}
            className="w-full resize-none max-h-20 mt-4 text-sm outline-none placeholder-gray-400"
            placeholder="What's happening?"
          />
          {/* images */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {images.map((image, i) => (
                <div className="relative group" key={i}>
                  <img
                    src={URL.createObjectURL(image)}
                    className="h-20 rounded-md"
                    alt=""
                  />
                  <div
                    onClick={() =>
                      setImages(images.filter((_, index) => index !== i))
                    }
                    className="absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer"
                  >
                    <X className="w-6 h-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* bottom bar */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-300">
            <label
              htmlFor="images"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              <Image className="size-6" />
            </label>
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              id="images"
              onChange={(e) =>
                setImages((prev) => [...prev, ...Array.from(e.target.files)])
              }
            />
            <button
              onClick={() =>
                toast.promise(handleSubmit(), {
                  loading: "Publishing post...",
                  success: "Post published successfully!",
                  error: "Failed to publish post. Please try again.",
                })
              }
              disabled={
                loading || (content.trim() === "" && images.length === 0)
              }
              className="px-6 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md
              hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
            >
              Publish Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
