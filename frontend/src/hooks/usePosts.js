import { useState, useEffect, useCallback } from "react";
import postService from "../services/postService";









export const usePosts = (initialFilters = {}, autoFetch = true) => {
  const [posts,      setPosts]      = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [filters,    setFilters]    = useState({ page: 1, limit: 12, ...initialFilters });

  const fetch = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getAll(params || filters);
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoFetch) fetch();
    
  }, [filters, autoFetch]);

  
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const nextPage = useCallback(() =>
    setFilters(prev => ({ ...prev, page: prev.page + 1 })), []);
  const prevPage = useCallback(() =>
    setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) })), []);

  return { posts, pagination, loading, error, filters, setFilters, applyFilters, nextPage, prevPage, refetch: fetch };
};




export const useMyPosts = (clientId, initialFilters = {}) => {
  const [posts,      setPosts]      = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [filters,    setFilters]    = useState({ status: "all", page: 1, limit: 20, ...initialFilters });

  const fetch = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getMy(clientId, filters);
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [clientId, filters]);

  useEffect(() => { fetch(); }, [fetch]);

  return { posts, pagination, loading, error, filters, setFilters, refetch: fetch };
};