"use client";

import { useState } from "react";
import { X, Upload, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const AVATAR_IMAGES = [
  "woman5.png",
  "znouser.png",
  "woman4.png",
  "panda.png",
  "teacher.png",
  "woman.png",
  "woman2.png",
  "woman3.png",
  "man.png",
  "man2.png",
  "man3.png",
  "girl2.png",
  "gamer.png",
  "girl.png",
  "boy2.png",
  "businessman.png",
  "chicken.png",
  "dog.png",
  "empathy.png",
  "boy.png",
];

export const AvatarSelectionPopup = ({
  isOpen,
  onClose,
  onSelectAvatar,
  currentAvatar,
  userName = "User",
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleAvatarSelect = (avatarPath) => {
    setSelectedAvatar(avatarPath);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFile(e.target.result);
        setSelectedAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSelectAvatar(selectedAvatar);
    onClose();
  };

  const handleCancel = () => {
    setSelectedAvatar(currentAvatar);
    setUploadedFile(null);
    onClose();
  };

  const handleDelete = () => {
    setSelectedAvatar(null);
    setUploadedFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[620px] max-h-[90vh] overflow-hidden border-gray-scale-30 border">
        {/* Header */}
        <div className="bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100">
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt="Current Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-lg font-semibold">
                    {userName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Edit Profile Image
              </h2>
            </div>
            <button
              onClick={handleCancel}
              className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <div className="w-full border-b-2 border-dashed border-gray-scale-30 mt-5"></div>
        </div>

        {/* Avatar Grid */}
        <div className="p-5  border-2 border-t-0 border-slate-200 rounded-b-2xl">
          <div className="flex flex-wrap gap-4 justify-center">
            {AVATAR_IMAGES.map((avatar, index) => (
              <div key={index} className="relative">
                <button
                  onClick={() => handleAvatarSelect(avatar)}
                  className={`w-[60px] h-[60px] rounded-full overflow-hidden transition-all duration-200 ${
                    selectedAvatar === avatar
                      ? "ring-4 ring-indigo-500 ring-offset-2"
                      : "hover:scale-105"
                  }`}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/profile/${avatar}`}
                    alt={`Avatar ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
                {selectedAvatar === avatar && (
                  <div className="absolute top-[-4px] right-[-4px] w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                    <Check strokeWidth={4} className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* File Upload Section */}
          <div className="mt-5 flex gap-4 items-center justify-center">
            <div className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-100">
                    {uploadedFile ? (
                      <img
                        src={uploadedFile}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Upload className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-600">
                    {uploadedFile ? "Uploaded Image" : "IMAGE.png"}
                  </span>
                </div>
                <label className="bg-indigo-50 text-slate-600 px-3 py-2 rounded-md text-sm font-semibold cursor-pointer hover:bg-indigo-100 transition-colors">
                  Browse File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="bg-blue-50 text-slate-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Delete Picture
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-5">
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="rounded-full px-4 py-2 h-10 border-slate-300 text-slate-600 hover:bg-slate-50 bg-white"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="rounded-full px-4 py-2 h-10 bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectionPopup;
