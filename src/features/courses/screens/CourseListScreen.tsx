import { CoursesStackScreenProps } from "@/navigation/types";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CourseCard } from "../components/CourseCard";

type Props = CoursesStackScreenProps<"CourseList">;

const COURSES = [
  {
    id: 1,
    title: "React Native Complete 2024",
    description:
      "Học React Native từ cơ bản đến nâng cao với các dự án thực tế",
    price: 990000,
    image: "📱",
    instructor: "Nguyễn Văn A",
    rating: 4.8,
    students: 1250,
  },
  {
    id: 2,
    title: "JavaScript Advanced",
    description: "Nắm vững JavaScript hiện đại và các kỹ thuật nâng cao",
    price: 790000,
    image: "⚡",
    instructor: "Trần Thị B",
    rating: 4.9,
    students: 2100,
  },
  {
    id: 3,
    title: "TypeScript Mastery",
    description: "Làm chủ TypeScript cho các dự án lớn",
    price: 890000,
    image: "💙",
    instructor: "Lê Văn C",
    rating: 4.7,
    students: 850,
  },
  {
    id: 4,
    title: "Node.js Backend",
    description: "Xây dựng API và Backend với Node.js và Express",
    price: 1190000,
    image: "🟢",
    instructor: "Phạm Văn D",
    rating: 4.6,
    students: 960,
  },
];

const CATEGORIES = ["Tất cả", "Mobile", "Web", "Backend", "DevOps"];

export function CourseListScreen({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
      {/* Categories Filter */}
      <View className="px-6 py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                className={`px-4 py-2 rounded-full border ${
                  selectedCategory === category
                    ? "bg-primary-light dark:bg-primary-dark border-primary-light dark:border-primary-dark"
                    : "bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border"
                }`}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  className={`font-semibold ${
                    selectedCategory === category
                      ? "text-white"
                      : "text-light-text dark:text-dark-text"
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Course List */}
      <ScrollView className="flex-1 px-6">
        <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary mb-4">
          {COURSES.length} khóa học
        </Text>

        {COURSES.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onPress={() =>
              navigation.navigate("CourseDetail", {
                courseId: course.id,
                courseName: course.title,
              })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
