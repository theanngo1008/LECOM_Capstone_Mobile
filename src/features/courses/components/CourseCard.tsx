import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  instructor: string;
  rating: number;
  students: number;
}

interface Props {
  course: Course;
  onPress: () => void;
}

export function CourseCard({ course, onPress }: Props) {
  return (
    <TouchableOpacity
      className="bg-light-card dark:bg-dark-card rounded-xl border border-light-border dark:border-dark-border mb-4 overflow-hidden"
      onPress={onPress}
    >
      {/* Image */}
      <View className="aspect-video bg-light-surface dark:bg-dark-surface items-center justify-center">
        <Text className="text-6xl">{course.image}</Text>
      </View>

      {/* Content */}
      <View className="p-4">
        <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-2">
          {course.title}
        </Text>

        <Text
          className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-3"
          numberOfLines={2}
        >
          {course.description}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-primary-light dark:text-primary-dark">
            {course.price.toLocaleString("vi-VN")}đ
          </Text>

          <View className="flex-row items-center gap-2">
            <Text className="text-sm">⭐ {course.rating}</Text>
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              ({course.students})
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
