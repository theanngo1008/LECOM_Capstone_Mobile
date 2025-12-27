import { CourseItem } from "@/api/course";
import { useCourseCategories } from "@/hooks/useCourseCategories";
import { CoursesStackScreenProps } from "@/navigation/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import React, { useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCourses } from "../hooks/useCourses";

// Helper function to convert Vietnamese text to slug
const nameToSlug = (name: string): string => {
  // First, remove đ/Đ completely (not replace with d)
  let slug = name.replace(/[đĐ]/g, "");
  
  // Remove Vietnamese diacritics and convert to lowercase
  slug = slug
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  
  return slug;
};

type Props = CoursesStackScreenProps<"CoursesList">;

export function CoursesScreen({ navigation }: Props) {
  const drawerNavigation = navigation.getParent<DrawerNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCourseCategories();

  const {
    data: coursesData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useCourses({
    page,
    limit: 10,
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  });

  // ✅ FIX: Check if data is array or object
  const coursesList = Array.isArray(coursesData) 
    ? coursesData 
    : coursesData?.items || [];
  
  const totalItems = Array.isArray(coursesData)
    ? coursesData.length
    : coursesData?.totalItems || 0;
  
  const totalPages = Array.isArray(coursesData)
    ? 1
    : coursesData?.totalPages || 1;

  const categories = [
    { id: "", name: "Tất cả" },
    ...(categoriesData?.map((item: any) => ({
      id: item.id,
      name: item.name,
    })) || []),
  ];

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
  };

  const handleSelectCategory = (categoryName: string | undefined) => {
    setSelectedCategory(categoryName);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (totalPages && page < totalPages && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  const renderCourseCard = ({ item }: { item: CourseItem }) => (
    <TouchableOpacity
      className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden mb-4 shadow-sm border border-beige/30 dark:border-dark-border/30"
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate("CourseDetail", { slug: item.slug })
      }
    >
      {/* Thumbnail */}
      <View className="relative">
        {item.courseThumbnail ? (
          <Image
            source={{ uri: item.courseThumbnail }}
            className="w-full h-48"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-48 bg-gradient-to-br from-mint to-skyBlue dark:from-gold dark:to-lavender items-center justify-center">
            <FontAwesome name="book" size={48} color="white" />
          </View>
        )}

        {/* Active Badge */}
        {item.active === 1 && (
          <View className="absolute top-3 right-3 px-3 py-1 rounded-full bg-mint/90 dark:bg-gold/90">
            <Text className="text-white text-xs font-bold">Active</Text>
          </View>
        )}

        {/* Category Badge */}
        <View className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60">
          <Text className="text-white text-xs font-semibold">
            {item.categoryName}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Title */}
        <Text
          className="text-lg font-bold text-light-text dark:text-dark-text mb-2"
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {/* Summary */}
        <Text
          className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-3"
          numberOfLines={2}
        >
          {item.summary}
        </Text>

        {/* Shop Info */}
        <View className="flex-row items-center justify-between pt-3 border-t border-beige/30 dark:border-dark-border/30">
          <View className="flex-row items-center flex-1">
            {item.shopAvatar ? (
              <Image
                source={{ uri: item.shopAvatar }}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <View className="w-8 h-8 rounded-full bg-mint/20 dark:bg-gold/20 items-center justify-center mr-2">
                <FontAwesome name="user" size={14} color="#ACD6B8" />
              </View>
            )}
            <Text
              className="text-sm font-semibold text-light-text dark:text-dark-text flex-1"
              numberOfLines={1}
            >
              {item.shopName}
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center"
            // onPress={() =>
            //   navigation.navigate("CourseDetail", { courseId: item.id })
            // }
          >
            <FontAwesome name="arrow-right" size={14} color="#ACD6B8" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <FontAwesome name="search" size={64} color="#D1D5DB" />
      <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
        Không tìm thấy khóa học
      </Text>
      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center px-6">
        {searchQuery
          ? `Không có kết quả cho "${searchQuery}"`
          : "Chưa có khóa học nào"}
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <FontAwesome name="exclamation-circle" size={64} color="#FF6B6B" />
      <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
        Có lỗi xảy ra
      </Text>
      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
        Không thể tải danh sách khóa học. Vui lòng thử lại.
      </Text>
      <TouchableOpacity
        className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
        onPress={() => refetch()}
      >
        <Text className="text-white font-semibold">Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View className="mb-4">
      {/* Stats */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
            {totalItems} Khóa học
          </Text>
          <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mt-1">
            Trang {page} / {totalPages || 1}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white dark:bg-dark-card px-4 py-3 rounded-xl border border-beige/30 dark:border-dark-border/30 mb-3">
        <FontAwesome name="search" size={16} color="#9CA3AF" />
        <TextInput
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Tìm kiếm khóa học..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-3 text-light-text dark:text-dark-text text-base"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <FontAwesome name="times-circle" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      {categoriesData && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {isCategoriesLoading ? (
            <ActivityIndicator size="small" color="#ACD6B8" />
          ) : (
            <>
              <TouchableOpacity
                onPress={() => handleSelectCategory(undefined)}
                className={`px-3 py-1.5 mr-2 rounded-full border ${
                  !selectedCategory
                    ? "bg-mint/10 border-mint dark:bg-gold/10 dark:border-gold"
                    : "bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    !selectedCategory
                      ? "text-mint dark:text-gold"
                      : "text-light-textSecondary dark:text-dark-textSecondary"
                  }`}
                >
                  Tất cả
                </Text>
              </TouchableOpacity>

              {categoriesData.map((cat: any) => {
                const categorySlug = nameToSlug(cat.name);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => handleSelectCategory(categorySlug)}
                    className={`px-3 py-1.5 mr-2 rounded-full border ${
                      selectedCategory === categorySlug
                        ? "bg-mint/10 border-mint dark:bg-gold/10 dark:border-gold"
                        : "bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        selectedCategory === categorySlug
                          ? "text-mint dark:text-gold"
                          : "text-light-textSecondary dark:text-dark-textSecondary"
                      }`}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );

  const renderFooter = () => {
    const hasMore = totalPages && page < totalPages;

    return (
      <View className="py-6">
        {hasMore && (
          <TouchableOpacity
            className="py-3 rounded-full bg-white dark:bg-dark-card border border-mint/30 dark:border-gold/30"
            onPress={handleLoadMore}
            disabled={isLoading}
          >
            <Text className="text-center text-mint dark:text-gold font-semibold">
              {isLoading ? "Đang tải..." : "Xem thêm"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Pagination Info */}
        {totalPages > 1 && (
          <Text className="text-center text-sm text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Trang {page} / {totalPages}
          </Text>
        )}
      </View>
    );
  };

  if (isLoading && page === 1) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Đang tải khóa học...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30" style={{ paddingTop: Platform.OS === 'ios' ? 16 : 16 }}>
          <View className="flex-row items-center justify-between mb-4">
            {/* Left - Menu Button */}
            <TouchableOpacity
              className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3"
              onPress={() => drawerNavigation?.openDrawer()}
            >
              <FontAwesome name="bars" size={20} color="#ACD6B8" />
            </TouchableOpacity>

            {/* Center - Title */}
            <View className="flex-1">
              <Text className="text-3xl font-bold text-light-text dark:text-dark-text">
                Khóa học
              </Text>
              <View className="flex-row items-center mt-2">
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  Khám phá tất cả khóa học
                </Text>
              </View>
            </View>

            {/* Right - Icon */}
            <View className="w-14 h-14 rounded-2xl bg-mint/10 dark:bg-gold/10 items-center justify-center">
              <FontAwesome name="graduation-cap" size={24} color="#ACD6B8" />
            </View>
          </View>
        </View>

        {/* Courses List */}
        <FlatList
          data={coursesList}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#ACD6B8"
              colors={["#ACD6B8"]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}