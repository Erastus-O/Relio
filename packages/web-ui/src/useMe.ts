"use client";
import { useEffect, useState } from "react";
import { api, ApiError, type Me } from "./api";

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<Me>("/me")
      .then(setMe)
      .catch((e: ApiError) => setError(e.status === 401 ? "signin" : e.message))
      .finally(() => setLoading(false));
  }, []);
  return { me, error, loading };
}
