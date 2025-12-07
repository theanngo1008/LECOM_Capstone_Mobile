import { useState } from "react";
import { useFeedbackByProduct } from "./useFeedbackByProduct";

export function useFeedbackFilter(productId: string) {
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);

  const query = useFeedbackByProduct(productId, page, 10, rating);

  return {
    ...query,
    rating,
    page,
    setRating,
    setPage,
  };
}
