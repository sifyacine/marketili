import { useState, useEffect, useCallback } from "react";
import pitchService from "../services/pitchService";
import { getSocket } from "../services/socketService";

const usePitchSocket = (fetchPitches) => {
  useEffect(() => {
    const socket = getSocket();
    const refetch = () => fetchPitches();
    const onNotif = ({ notification }) => {
      if (notification?.category === "pitches") fetchPitches();
    };
    socket.on("pitch_update",      refetch);
    socket.on("new_notification",  onNotif);
    return () => {
      socket.off("pitch_update",     refetch);
      socket.off("new_notification", onNotif);
    };
  }, [fetchPitches]);
};

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

  usePitchSocket(fetchPitches);

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
  usePitchSocket(fetchPitches);
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

  usePitchSocket(fetchPitches);

  return { pitches, loading, error, refetch: fetchPitches };
};