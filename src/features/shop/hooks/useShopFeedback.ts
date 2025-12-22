import { feedbackApi } from "@/api/feedback";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export const useShopFeedback = (
  pageNumber: number, 
  pageSize: number = 10,
  rating?: number | null
) => {
  // Memoize queryKey to prevent unnecessary re-renders
  const queryKey = React.useMemo(
    () => ["shopFeedback", pageNumber, pageSize, rating],
    [pageNumber, pageSize, rating]
  );
  
  return useQuery({
    queryKey,
    queryFn: () => {
      return feedbackApi.getShopFeedback(pageNumber, pageSize, rating || undefined);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000, // Keep cache for 5 minutes
    enabled: true,
  });
};
