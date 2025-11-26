import { getMyVouchers } from "@/api/voucher";
import { useQuery } from "@tanstack/react-query";

export const useVouchers = () => {
  return useQuery({
    queryKey: ["vouchers", "my"],
    queryFn: getMyVouchers,
    staleTime: 1000 * 60 * 3,
  });
};
