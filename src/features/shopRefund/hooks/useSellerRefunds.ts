import { useQuery } from "@tanstack/react-query";
import { refundApi } from "@/api/refund";

export const useSellerRefunds = () => {
  const query = useQuery({
    queryKey: ["seller-refunds"],
    queryFn: refundApi.getSellerRefunds,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    refunds: query.data?.result ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
