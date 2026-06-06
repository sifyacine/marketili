












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
