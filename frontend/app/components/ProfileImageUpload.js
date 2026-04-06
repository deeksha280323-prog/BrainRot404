"use client";
import { useState } from "react";
import { uploadProfilePicture } from "../../lib/api";
import { motion } from "framer-motion";

export default function ProfileImageUpload({ initialImage, onUploadSuccess }) {
  const [image, setImage] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);
      const res = await uploadProfilePicture(formData);
      setImage(res.data.profilePicture);
      if (onUploadSuccess) onUploadSuccess(res.data.profilePicture);
    } catch (err) {
      alert("Failed to upload image");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-50 group">
        {preview || image ? (
          <img 
            src={preview || image} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all cursor-pointer">
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
          <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold uppercase tracking-widest transition-opacity mt-10">Upload</span>
        </label>
      </div>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Profile Identity</p>
    </div>
  );
}
