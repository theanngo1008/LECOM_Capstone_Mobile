import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface RatingFilterProps {
  selectedRating: number | null;
  onFilterAll: () => void;
  onFilterByRating: (rating: number) => void;
}

export const RatingFilter = React.memo<RatingFilterProps>(({
  selectedRating,
  onFilterAll,
  onFilterByRating,
}) => {
  return (
    <View className="px-6 pb-4">
      <Text className="text-xs font-semibold text-light-text dark:text-dark-text mb-2.5 uppercase tracking-wide">
        Lọc theo đánh giá
      </Text>

      <View className="flex-row gap-2">
        {/* ALL */}
        <Pressable
          onPress={onFilterAll}
          className={`px-4 py-2.5 rounded-xl border-2 items-center justify-center ${
            selectedRating === null
              ? "bg-gold border-gold shadow-lg shadow-gold/20"
              : "bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              selectedRating === null
                ? "text-white"
                : "text-light-textSecondary dark:text-dark-textSecondary"
            }`}
          >
            Tất cả
          </Text>
        </Pressable>

        {[5, 4, 3, 2, 1].map((rating) => (
          <Pressable
            key={rating}
            onPress={() => onFilterByRating(rating)}
            className={`flex-1 px-3 py-2.5 rounded-xl border-2 items-center justify-center ${
              selectedRating === rating
                ? "bg-gold border-gold shadow-lg shadow-gold/20"
                : "bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30"
            }`}
          >
            <View className="flex-row items-center gap-1">
              <Text
                className={`text-xs font-bold ${
                  selectedRating === rating
                    ? "text-white"
                    : "text-light-textSecondary dark:text-dark-textSecondary"
                }`}
              >
                {rating}
              </Text>
              <FontAwesome
                name="star"
                size={10}
                color={selectedRating === rating ? "#FFFFFF" : "#FFCB66"}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

RatingFilter.displayName = "RatingFilter";



