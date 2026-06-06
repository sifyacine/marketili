




import { useState, useEffect, useCallback } from "react";
import subscriptionService from "../services/subscriptionService";

export default function useSubscription() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refetch = useCallback(() => {
    setLoading(true);
    return subscriptionService
      .getMine()
      .then((res) => {
        setData(res);
        setError(false);
        return res;
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const sub = data?.subscription || null;

  return {
    loading,
    error,
    billed: data?.billed ?? false,
    subscription: sub,
    status: sub?.status || null,
    allowed: sub?.allowed ?? true,
    daysLeft: sub?.daysLeft ?? 0,
    refetch,
  };
}
