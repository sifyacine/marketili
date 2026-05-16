import { useState, useEffect, useCallback } from "react";
import pitchService from "../services/pitchService";

export const usePitchesForPost = (postId, clientId) => {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPitches = useCallback(async () => {
    if (!postId || !clientId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await pitchService.getForPost(postId, clientId);
      setPitches(data.pitches || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur chargement");
    } finally {
      setLoading(false);
    }
  }, [postId, clientId]);

  useEffect(() => {
    fetchPitches();
  }, [fetchPitches]);

  return { pitches, loading, error, refetch: fetchPitches };
};

export const usePitchesForClient = (clientId) => {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchPitches = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await pitchService.getForClient(clientId);
      setPitches(data.pitches || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur chargement");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { fetchPitches(); }, [fetchPitches]);
  return { pitches, loading, error, refetch: fetchPitches };
};

export const useMyPitches = (senderId, senderType) => {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPitches = useCallback(async () => {
    if (!senderId || !senderType) return;

    setLoading(true);
    setError(null);

    try {
      const data = await pitchService.getMy(senderId, senderType);
      setPitches(data.pitches || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur chargement");
    } finally {
      setLoading(false);
    }
  }, [senderId, senderType]);

  useEffect(() => {
    fetchPitches();
  }, [fetchPitches]);

  return { pitches, loading, error, refetch: fetchPitches };
};