// frontend/src/services/uploadService.js

import api from "./api";

const uploadService = {
  // Upload a file — returns { fileId, filename, url }
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    // Do NOT set Content-Type — axios auto-detects FormData and adds the boundary
    const response = await api.post("/upload", formData, {
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return response.data;
  },

  // Full URL for a stored file — uses the same base URL as the API
  getUrl: (fileId) => {
    const base = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
    return `${base}/api/upload/${fileId}`;
  },

  getDownloadUrl: (fileId) => {
    const base = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
    return `${base}/api/upload/${fileId}`;
  },

  // Convert a relative /api/upload/... path stored in the DB to an absolute URL
  resolveUrl: (relOrAbsUrl) => {
    if (!relOrAbsUrl) return relOrAbsUrl;
    if (relOrAbsUrl.startsWith("http")) return relOrAbsUrl;
    const base = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
    return base + relOrAbsUrl;
  },

  // Check if a mimeType is a video
  isVideo: (mimeType) => mimeType?.startsWith("video/"),

  // Check if a mimeType is an image
  isImage: (mimeType) => mimeType?.startsWith("image/"),
};

export default uploadService;