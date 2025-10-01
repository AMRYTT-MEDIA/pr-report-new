"use client";

import { useState, useEffect } from "react";
import { X, Upload, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/user";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { getAvatarUrl } from "@/lib/utils";

const AVATAR_IMAGES = [
  // "woman5.png",
  // "znouser.png",
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

export const AvatarSelectionPopup = ({ isOpen, onClose, onSelectAvatar, currentAvatar, userName = "User" }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDeleteRequested, setIsDeleteRequested] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { setUser } = useAuth();

  // Helper: extract filename from a path or URL
  const extractFilename = (value) => {
    if (!value || typeof value !== "string") return null;
    return value.includes("/") ? value.split("/").pop() : value;
  };

  // Helper: if stored filename is a copied predefined avatar like
  // 1723456789012-woman4.png -> map back to base name "woman4.png"
  const mapToPredefinedBase = (filename) => {
    if (!filename) return null;
    // Already a direct predefined name
    if (AVATAR_IMAGES.includes(filename)) return filename;
    // Try removing first hyphen-delimited timestamp/prefix
    const dashIndex = filename.indexOf("-");
    if (dashIndex > 0) {
      const candidate = filename.slice(dashIndex + 1);
      if (AVATAR_IMAGES.includes(candidate)) return candidate;
    }
    return null;
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      const filename = extractFilename(currentAvatar);
      const basePredefined = mapToPredefinedBase(filename);
      setSelectedAvatar(basePredefined);
      setUploadedFile(null);
      setSelectedFile(null);
      setIsDeleteRequested(false);
      setIsDragging(false);
    }
  }, [isOpen, currentAvatar]);

  // Check if there are any changes made
  const hasChanges = () => {
    // Compare normalized predefined base of current vs selected
    const currentFilename = extractFilename(currentAvatar);
    const currentBase = mapToPredefinedBase(currentFilename);
    if (selectedAvatar !== currentBase) return true;

    // Check if file was uploaded
    if (uploadedFile || selectedFile) return true;

    // Check if delete was requested
    if (isDeleteRequested) return true;

    return false;
  };
  const handleAvatarSelect = (avatarPath) => {
    // Selecting a default avatar clears any staged upload and delete flag
    setSelectedAvatar(avatarPath);
    setUploadedFile(null);
    setSelectedFile(null);
    setIsDeleteRequested(false);
  };

  const handleFileUpload = (event) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFile(e.target.result);
        setSelectedAvatar(null);
        setSelectedFile(file);
        setIsDeleteRequested(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDivClick = () => {
    // Trigger the file input when clicking on the div
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type?.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFile(e.target.result);
        setSelectedAvatar(null);
        setSelectedFile(file);
        setIsDeleteRequested(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleSave = async () => {
    try {
      let newAvatar = null;

      // If user requested delete, delete (if existing) and send empty string to backend
      if (isDeleteRequested) {
        const current = currentAvatar;
        if (current) {
          const filename = typeof current === "string" && current.includes("/") ? current.split("/").pop() : current;
          if (filename) {
            // eslint-disable-next-line max-depth
            try {
              await fetch(`/api/profile/delete-avatar?filename=${encodeURIComponent(filename)}`, { method: "DELETE" });
            } catch {
              // Silently ignore deletion errors for cleanup
            }
          }
        }
        const response = await userService.updateProfile({ avatar: "" });
        newAvatar = "";
        onSelectAvatar("");

        // Update user context
        if (response.user) {
          setUser(response.user);
        }

        toast.success("Profile picture removed successfully!");
        onClose();
        return;
      }

      // If a new file was chosen, upload it first
      if (selectedFile) {
        const formData = new FormData();
        formData.append("avatar", selectedFile);
        formData.append("filename", selectedFile.name);
        if (currentAvatar) {
          formData.append("existingAvatar", currentAvatar);
        }

        const res = await fetch("/api/profile/upload-avatar", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data?.filename) {
          throw new Error(data?.error || "Upload failed");
        }
        // Persist to backend user profile, then update selection locally
        const response = await userService.updateProfile({
          avatar: data.filename,
        });
        newAvatar = data.filename;
        onSelectAvatar(data.filename);

        // Update user context
        if (response.user) {
          setUser(response.user);
        }

        toast.success("Profile picture updated successfully!");
      } else {
        // Picking from pre-defined list
        if (selectedAvatar) {
          // First copy the predefined avatar to user's profile directory
          const copyResponse = await fetch("/api/profile/copy-avatar", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ avatarName: selectedAvatar }),
          });

          const copyData = await copyResponse.json();
          if (!copyResponse.ok || !copyData?.filename) {
            throw new Error(copyData?.error || "Failed to copy avatar");
          }

          // Then update the user profile with the copied avatar filename
          const response = await userService.updateProfile({
            avatar: copyData.filename,
          });
          newAvatar = copyData.filename;

          // Update user context
          if (response.user) {
            setUser(response.user);
          }

          toast.success("Profile picture updated successfully!");
        }
        onSelectAvatar(newAvatar || null);
      }
      onClose();
    } catch (err) {
      console.error("Avatar upload/update error:", err);
      toast.error("Failed to update profile picture. Please try again.");
    }
  };

  const handleCancel = () => {
    const filename = extractFilename(currentAvatar);
    const basePredefined = mapToPredefinedBase(filename);
    setSelectedAvatar(basePredefined);
    setUploadedFile(null);
    setSelectedFile(null);
    setIsDeleteRequested(false);
    onClose();
  };

  const handleDelete = () => {
    // Mark delete intent; clear any staged choices
    setSelectedAvatar(null);
    setUploadedFile(null);
    setSelectedFile(null);
    setIsDeleteRequested(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-400 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] md:w-[620px] max-h-[90vh] overflow-hidden border-slate-300 border">
        {/* Header */}
        <div className="bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100">
                {currentAvatar ? (
                  <Image
                    src={
                      currentAvatar?.startsWith("http") || currentAvatar?.startsWith("data:")
                        ? currentAvatar
                        : getAvatarUrl(currentAvatar)
                    }
                    alt="Current Avatar"
                    className="w-full h-full object-cover"
                    width={110}
                    height={110}
                    unoptimized={true}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-lg font-semibold">
                    {userName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Edit Profile Image</h2>
            </div>
            <button
              onClick={handleCancel}
              className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <div className="w-full border-b-2 border-dashed border-slate-300 mt-5"></div>
        </div>

        {/* Avatar Grid */}
        <div className="p-5  border-2 border-t-0 border-slate-200 rounded-b-2xl">
          <div className="flex flex-wrap gap-4 justify-center w-full">
            {AVATAR_IMAGES.map((avatar, index) => (
              <div key={index} className="relative">
                <button
                  onClick={() => handleAvatarSelect(avatar)}
                  className={`w-[60px] h-[60px] rounded-full overflow-hidden transition-all duration-200 ${
                    selectedAvatar === avatar ? "ring-4 ring-indigo-500 " : "hover:scale-105"
                  }`}
                >
                  <Image
                    src={`/meek/${avatar}`}
                    alt={`Avatar ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={60}
                    height={60}
                    unoptimized={true}
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
          <div className="mt-5 flex flex-col md:flex-row gap-4 items-center justify-center">
            <div
              className={`flex-1 border-2 border-dashed w-full rounded-lg p-3 transition-colors cursor-pointer ${
                isDragging ? "border-indigo-400 bg-indigo-50" : "border-slate-300 hover:border-indigo-300"
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleDivClick}
            >
              <div className="flex flex-col md:flex-row  w-full items-center justify-between">
                <div className="flex flex-col w-full md:w-auto md:flex-row items-center gap-3">
                  <div className="w-8 h-8 rounded-md overflow-hidden">
                    {uploadedFile ? (
                      <Image
                        src={uploadedFile}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                        width={8}
                        height={80}
                        unoptimized={true}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Upload className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-600">
                    {uploadedFile
                      ? selectedFile?.name || "Image"
                      : isDragging
                        ? "Drop image to upload"
                        : "Drag & drop or click to upload"}
                  </span>
                </div>
                <label
                  className="bg-indigo-50 text-slate-600 px-3 py-2 rounded-md text-sm font-semibold cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Browse File
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
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
              disabled={!hasChanges()}
              className="rounded-full px-4 py-2 h-10 bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
