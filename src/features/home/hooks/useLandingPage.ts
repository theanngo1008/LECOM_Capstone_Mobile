import { useQuery } from "@tanstack/react-query";
import { homeApi } from "../../../api/home";

export const useLandingPage = () => {
  return useQuery({
    queryKey: ["landing-page"],
    queryFn: async () => {
      try {
        const response = await homeApi.getLandingPage();
        console.log("Fetched landing page data:", response);
        return response;
      } catch (error: any) {
        console.error("Failed to fetch landing page:", error);
        throw error;
      }
    },
  });
};