

import api from "./api";

const uploadService = {
  
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post("/upload", formData, {
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return response.data;
  },

  
  getUrl: (fileId) => {
    const base = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
    return `${base}/api/upload/${fileId}`;
  },

  getDownloadUrl: (fileId) => {
    const base = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
    return `${base}/api/upload/${fileId}`;
  },

  
  resolveUrl: (relOrAbsUrl) => {
    if (!relOrAbsUrl) return relOrAbsUrl;
    if (relOrAbsUrl.startsWith("http")) return relOrAbsUrl;
    const base = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
    return base + relOrAbsUrl;
  },

  
  
  
  
  
  
  toApiPath: (relOrAbsUrl) => {
    if (!relOrAbsUrl) return relOrAbsUrl;
    let path = relOrAbsUrl;
    if (/^https?:\/\//.test(path)) {
      try {
        const u = new URL(path);
        path = u.pathname + u.search;
      } catch {
        return relOrAbsUrl;
      }
    }
    
    return path.replace(/^\/api(\/|$)/, "/");
  },

  
  
  fetchBlob: async (relOrAbsUrl) => {
    const path = uploadService.toApiPath(relOrAbsUrl);
    const res = await api.get(path, { responseType: "blob" });
    return res.data;
  },

  
  
  
  downloadFile: async (relOrAbsUrl, filename) => {
    const blob = await uploadService.fetchBlob(relOrAbsUrl);
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
  },

  
  isVideo: (mimeType) => mimeType?.startsWith("video/"),

  
  isImage: (mimeType) => mimeType?.startsWith("image/"),
};

export default uploadService;