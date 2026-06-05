// frontend/src/hooks/useFileBlob.js
//
// Loads a stored file (image, PDF, …) through the authenticated axios client
// and exposes a local object URL that <img>/<iframe> can render reliably.
//
// Why not just point the tag at the file url directly?
//   In development the CRA dev server proxies /api to the backend, but it does
//   NOT proxy GET requests whose Accept header contains "text/html" — which is
//   exactly what <iframe> and link navigations send. Those requests fall back
//   to index.html, so PDFs/images never load. Fetching via axios (Accept:
//   application/json) goes through the proxy correctly; the resulting Blob is
//   served from a same-origin blob: URL that always renders.

import { useEffect, useState } from "react";
import uploadService from "../services/uploadService";

export default function useFileBlob(url) {
  const [state, setState] = useState({
    blobUrl: null,
    type: null,
    loading: !!url,
    error: !url,
  });

  useEffect(() => {
    if (!url) {
      setState({ blobUrl: null, type: null, loading: false, error: true });
      return;
    }

    let cancelled = false;
    let objectUrl = null;
    setState({ blobUrl: null, type: null, loading: true, error: false });

    uploadService
      .fetchBlob(url)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ blobUrl: objectUrl, type: blob.type, loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled) {
          setState({ blobUrl: null, type: null, loading: false, error: true });
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return state;
}
