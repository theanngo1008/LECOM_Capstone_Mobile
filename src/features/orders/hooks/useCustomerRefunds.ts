import { useQuery } from "@tanstack/react-query";
import { refundApi } from "@/api/refund";

export const useCustomerRefunds = () => {
  const query = useQuery({
    queryKey: ["customer-refunds"],
    queryFn: refundApi.getMyRefunds,
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

