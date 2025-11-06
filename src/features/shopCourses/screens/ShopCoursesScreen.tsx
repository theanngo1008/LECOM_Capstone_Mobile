import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCourseProducts } from "../hooks/useCourseProducts";

type ShopCoursesStackParamList = {
  ShopCourses: undefined;
  ShopCourseDetail: { courseId: string };
  CreateShopCourse: undefined;
  EditShopCourse: { courseId: string };
};

export function ShopCoursesScreen() {
  const { data, isLoading, isError } = useCourseProducts();
  const navigation = useNavigation<NativeStackNavigationProp<ShopCoursesStackParamList>>();
  const [currentPage, setCurrentPage] = useState(1);

  const courses = data?.result || [];

  // Pagination
  const PAGE_SIZE = 5;
  const totalPages = Math.ceil(courses.length / PAGE_SIZE);
  const paginatedCourses = courses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background" edges={['bottom']}>
        <View className="items-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4 text-base">
            Loading courses...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background px-6" edges={['bottom']}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="exclamation-triangle" size={40} color="#FF6B6B" />
          </View>
          <Text className="text-coral font-bold text-xl mb-2">Oops!</Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
            Failed to load courses
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-cream dark:bg-dark-background">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30" style={{ paddingTop: Platform.OS === 'ios' ? 50 : 16 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-light-text dark:text-dark-text">
              My Courses
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                {courses.length} courses available
              </Text>
            </View>
          </View>
          <View className="w-14 h-14 rounded-2xl bg-mint/10 dark:bg-gold/10 items-center justify-center">
            <FontAwesome name="graduation-cap" size={24} color="#ACD6B8" />
          </View>
        </View>
      </View>

      {/* Course List */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {paginatedCourses.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 rounded-full bg-beige/20 dark:bg-dark-border/20 items-center justify-center mb-4">
              <FontAwesome name="inbox" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-base font-medium">
              No courses found
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm mt-1">
              Create your first course to get started
            </Text>
          </View>
        ) : (
          paginatedCourses.map((course) => (
            <Pressable
              key={course.id}
              className="bg-white dark:bg-dark-card rounded-2xl mb-4 overflow-hidden border border-beige/30 dark:border-dark-border/30"
              onPress={() => navigation.navigate("ShopCourseDetail", { courseId: course.id })}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                },
              ]}
            >
              <View className="p-4">
                <View className="flex-row items-start">
                  {/* Course Thumbnail */}
                  <View className="relative">
                    <Image
                      source={{ uri: course.courseThumbnail }}
                      className="w-28 h-28 rounded-xl bg-beige/20"
                      resizeMode="cover"
                    />
                    {/* Active Badge */}
                    <View 
                      className={`absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full shadow-sm ${
                        course.active === 1 ? 'bg-mint dark:bg-gold' : 'bg-gray-400'
                      }`}
                    >
                      <Text className="text-white text-[10px] font-bold">
                        {course.active === 1 ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>

                  {/* Course Details */}
                  <View className="flex-1 ml-4">
                    <Text
                      className="text-base font-bold text-light-text dark:text-dark-text leading-5"
                      numberOfLines={2}
                    >
                      {course.title}
                    </Text>
                    
                    <View className="flex-row items-center mt-1.5">
                      <View className="px-2 py-0.5 rounded bg-beige/30 dark:bg-dark-border/30">
                        <Text className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary font-medium">
                          {course.categoryName}
                        </Text>
                      </View>
                    </View>

                    <Text
                      className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-2 leading-4"
                      numberOfLines={2}
                    >
                      {course.summary}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View className="h-[0.5px] bg-beige/30 dark:bg-dark-border/30 my-3.5" />

                {/* Shop Info & Actions */}
                <View className="flex-row items-center justify-between">
                  {/* Shop Info */}
                  <View className="flex-row items-center flex-1">
                    {course.shopAvatar ? (
                      <Image
                        source={{ uri: course.shopAvatar }}
                        className="w-8 h-8 rounded-full bg-beige/20 mr-2"
                      />
                    ) : (
                      <View className="w-8 h-8 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
                        <FontAwesome name={"store" as any} size={14} color="#ACD6B8" />
                      </View>
                    )}
                    <Text className="text-xs font-medium text-light-text dark:text-dark-text" numberOfLines={1}>
                      {course.shopName}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-2">
                    <Pressable
                      className="px-3 py-2 rounded-lg bg-skyBlue/10 dark:bg-lavender/10 active:bg-skyBlue/20 dark:active:bg-lavender/20"
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate("EditShopCourse", { courseId: course.id });
                      }}
                    >
                      <Text className="text-xs font-semibold text-skyBlue dark:text-lavender">
                        Edit
                      </Text>
                    </Pressable>

                    <Pressable
                      className="px-3 py-2 rounded-lg bg-mint/10 dark:bg-gold/10 active:bg-mint/20 dark:active:bg-gold/20"
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate("ShopCourseDetail", { courseId: course.id });
                      }}
                    >
                      <Text className="text-xs font-semibold text-mint dark:text-gold">
                        View
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Footer */}
      <View className="px-5 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
        {/* Add New Course Button */}
        <Pressable
          className="bg-mint dark:bg-gold py-3.5 rounded-xl items-center justify-center active:opacity-80 mb-3"
          onPress={() => navigation.navigate("CreateShopCourse")}
        >
          <View className="flex-row items-center">
            <FontAwesome name="plus" size={16} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              Add New Course
            </Text>
          </View>
        </Pressable>

        {/* Pagination */}
        {totalPages > 1 && (
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={goPrevPage}
              disabled={currentPage === 1}
              className={`flex-1 py-2.5 rounded-lg border border-beige/30 dark:border-dark-border/30 items-center justify-center ${
                currentPage === 1 ? "opacity-40" : "bg-cream dark:bg-dark-background"
              }`}
            >
              <View className="flex-row items-center">
                <FontAwesome
                  name="chevron-left"
                  size={12}
                  color={currentPage === 1 ? "#9CA3AF" : "#4A5568"}
                />
                <Text
                  className={`font-semibold text-sm ml-1.5 ${
                    currentPage === 1
                      ? "text-light-textSecondary dark:text-dark-textSecondary"
                      : "text-light-text dark:text-dark-text"
                  }`}
                >
                  Previous
                </Text>
              </View>
            </Pressable>

            <View className="px-4 py-2.5 rounded-lg bg-mint/10 dark:bg-gold/10">
              <Text className="font-bold text-sm text-mint dark:text-gold">
                {currentPage} / {totalPages}
              </Text>
            </View>

            <Pressable
              onPress={goNextPage}
              disabled={currentPage === totalPages}
              className={`flex-1 py-2.5 rounded-lg border border-beige/30 dark:border-dark-border/30 items-center justify-center ${
                currentPage === totalPages
                  ? "opacity-40"
                  : "bg-cream dark:bg-dark-background"
              }`}
            >
              <View className="flex-row items-center">
                <Text
                  className={`font-semibold text-sm mr-1.5 ${
                    currentPage === totalPages
                      ? "text-light-textSecondary dark:text-dark-textSecondary"
                      : "text-light-text dark:text-dark-text"
                  }`}
                >
                  Next
                </Text>
                <FontAwesome
                  name="chevron-right"
                  size={12}
                  color={currentPage === totalPages ? "#9CA3AF" : "#4A5568"}
                />
              </View>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}