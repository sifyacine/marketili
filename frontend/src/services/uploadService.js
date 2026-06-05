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

  // Normalize a stored file url (e.g. "/api/upload/<id>" or an absolute url)
  // into a path relative to the axios baseURL, which already ends in "/api".
  // This guarantees the request flows through the same proxy/CORS/credentials
  // pipeline as every other API call — unlike letting the browser navigate to
  // the raw url, which the CRA dev proxy serves index.html for (it skips GETs
  // whose Accept header contains text/html, e.g. <iframe>/<a> navigations).
  toApiPath: (relOrAbsUrl) => {
    if (!relOrAbsUrl) return relOrAbsUrl;
    let path = relOrAbsUrl;
    if (/^https?:\/\//i.test(path)) {
      try {
        const u = new URL(path);
        path = u.pathname + u.search;
      } catch {
        return relOrAbsUrl;
      }
    }
    // baseURL already ends with /api → drop a leading /api to avoid /api/api
    return path.replace(/^\/api(\/|$)/, "/");
  },

  // Fetch a stored file as a Blob through the authenticated axios client.
  // Returns the Blob (its .type carries the server Content-Type).
  fetchBlob: async (relOrAbsUrl) => {
    const path = uploadService.toApiPath(relOrAbsUrl);
    const res = await api.get(path, { responseType: "blob" });
    return res.data;
  },

  // Trigger a browser download of a stored file. We fetch the bytes via axios
  // first (reliable through the proxy) then save via an object URL, instead of
  // navigating to "?download=1" which the dev proxy turns into index.html.
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

  // Check if a mimeType is a video
  isVideo: (mimeType) => mimeType?.startsWith("video/"),

  // Check if a mimeType is an image
  isImage: (mimeType) => mimeType?.startsWith("image/"),
};

export default uploadService;