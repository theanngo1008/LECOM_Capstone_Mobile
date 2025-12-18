import { feedbackApi } from "@/api/feedback";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";

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
  
  // #region agent log
  useEffect(() => {
    console.error('[DEBUG] useShopFeedback - queryKey changed:', { pageNumber, pageSize, rating });
  }, [pageNumber, pageSize, rating]);
  // #endregion
  
  const queryResult = useQuery({
    queryKey,
    queryFn: () => {
      // #region agent log
      console.error('[DEBUG] useShopFeedback queryFn called');
      // #endregion
      return feedbackApi.getShopFeedback(pageNumber, pageSize, rating || undefined);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000, // Keep cache for 5 minutes
    enabled: true,
  });

  // #region agent log
  useEffect(() => {
    // Don't use setTimeout - log directly in useEffect to avoid running after unmount
    if (queryResult.isError) {
      console.error('[DEBUG] useShopFeedback onError:', queryResult.error);
    }
    if (queryResult.isSuccess) {
      console.error('[DEBUG] useShopFeedback onSuccess');
    }
  }, [queryResult.isError, queryResult.isSuccess, queryResult.error]);
  // #endregion

  return queryResult;
};
