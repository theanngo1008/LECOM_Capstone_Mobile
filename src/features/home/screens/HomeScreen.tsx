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
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLandingPage } from "../hooks/useLandingPage";

type HomeStackParamList = {
  Home: undefined;
  CourseDetail: { courseId: string };
  ProductDetail: { productId: string };
  CategoryCourses: { categoryId: string; categoryName: string };
  CategoryProducts: { categoryId: string; categoryName: string };
  Search: undefined;
  Chat: undefined;
  Cart: undefined;
};

export function HomeScreen() {
  const { data, isLoading, isError } = useLandingPage();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [searchQuery, setSearchQuery] = useState("");

  const landingData = data?.result;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background" edges={['bottom']}>
        <View className="items-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4 text-base">
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !landingData) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background px-6" edges={['bottom']}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="exclamation-triangle" size={40} color="#FF6B6B" />
          </View>
          <Text className="text-coral font-bold text-xl mb-2">Oops!</Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
            Failed to load data
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-cream dark:bg-dark-background">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30" style={{ paddingTop: Platform.OS === 'ios' ? 50 : 16 }}>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-light-text dark:text-dark-text">
              Discover
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                Find your next favorite
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center"
              onPress={() => navigation.navigate("Chat")}
            >
              <FontAwesome name="comments" size={20} color="#ACD6B8" />
            </Pressable>
            <Pressable
              className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center"
              onPress={() => navigation.navigate("Cart")}
            >
              <FontAwesome name="shopping-cart" size={20} color="#ACD6B8" />
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <Pressable
          className="flex-row items-center bg-cream dark:bg-dark-background px-4 py-3 rounded-xl border border-beige/30 dark:border-dark-border/30"
          onPress={() => navigation.navigate("Search")}
        >
          <FontAwesome name="search" size={16} color="#9CA3AF" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary ml-3 flex-1">
            Search courses & products...
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Course Categories */}
        {landingData.topCourseCategories.length > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between px-6 mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Course Categories
              </Text>
              <FontAwesome name="graduation-cap" size={20} color="#ACD6B8" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {landingData.topCourseCategories.map((category, index) => (
                <Pressable
                  key={category.id}
                  className="mr-3 bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30 w-40"
                  onPress={() => navigation.navigate("CategoryCourses", { 
                    categoryId: category.id, 
                    categoryName: category.name 
                  })}
                >
                  <View className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center mb-3">
                    <FontAwesome name="book" size={20} color="#ACD6B8" />
                  </View>
                  <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1" numberOfLines={1}>
                    {category.name}
                  </Text>
                  {category.description && (
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary" numberOfLines={2}>
                      {category.description}
                    </Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top Product Categories */}
        {landingData.topProductCategories.length > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between px-6 mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Product Categories
              </Text>
              <FontAwesome name="cubes" size={20} color="#ACD6B8" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {landingData.topProductCategories.map((category) => (
                <Pressable
                  key={category.id}
                  className="mr-3 bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30 w-40"
                  onPress={() => navigation.navigate("CategoryProducts", { 
                    categoryId: category.id, 
                    categoryName: category.name 
                  })}
                >
                  <View className="w-12 h-12 rounded-xl bg-skyBlue/10 dark:bg-lavender/10 items-center justify-center mb-3">
                    <FontAwesome name="shopping-bag" size={20} color="#7DD3FC" />
                  </View>
                  <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1" numberOfLines={1}>
                    {category.name}
                  </Text>
                  {category.description && (
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary" numberOfLines={2}>
                      {category.description}
                    </Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Popular Courses */}
        {landingData.popularCourses.length > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between px-6 mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Popular Courses
              </Text>
              <FontAwesome name="fire" size={20} color="#FF6B6B" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {landingData.popularCourses.map((course) => (
                <Pressable
                  key={course.id}
                  className="mr-4 bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-beige/30 dark:border-dark-border/30 w-72"
                  onPress={() => navigation.navigate("CourseDetail", { courseId: course.id })}
                >
                  <Image
                    source={{ uri: course.courseThumbnail }}
                    className="w-full h-40 bg-beige/20"
                    resizeMode="cover"
                  />
                  <View className="p-4">
                    <View className="flex-row items-center mb-2">
                      <View className="px-2 py-1 rounded bg-beige/30 dark:bg-dark-border/30 mr-2">
                        <Text className="text-[10px] text-light-textSecondary dark:text-dark-textSecondary font-medium">
                          {course.categoryName}
                        </Text>
                      </View>
                      {course.active === 1 && (
                        <View className="px-2 py-1 rounded bg-mint/10 dark:bg-gold/10">
                          <Text className="text-[10px] text-mint dark:text-gold font-bold">
                            Active
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-base font-bold text-light-text dark:text-dark-text mb-2" numberOfLines={2}>
                      {course.title}
                    </Text>
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-3" numberOfLines={2}>
                      {course.summary}
                    </Text>
                    <View className="flex-row items-center">
                      {course.shopAvatar ? (
                        <Image
                          source={{ uri: course.shopAvatar }}
                          className="w-6 h-6 rounded-full bg-beige/20 mr-2"
                        />
                      ) : (
                        <View className="w-6 h-6 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
                          <FontAwesome name="shopping-bag" size={10} color="#ACD6B8" />
                        </View>
                      )}
                      <Text className="text-xs font-medium text-light-text dark:text-dark-text" numberOfLines={1}>
                        {course.shopName}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Best Seller Products */}
        {landingData.bestSellerProducts.length > 0 && (
          <View className="mt-6 px-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Best Sellers
              </Text>
              <FontAwesome name="star" size={20} color="#F59E0B" />
            </View>
            {landingData.bestSellerProducts.map((product) => (
              <Pressable
                key={product.id}
                className="bg-white dark:bg-dark-card rounded-2xl mb-4 overflow-hidden border border-beige/30 dark:border-dark-border/30"
                onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
              >
                <View className="p-4">
                  <View className="flex-row items-start">
                    <Image
                      source={{ uri: product.thumbnailUrl }}
                      className="w-24 h-24 rounded-xl bg-beige/20 mr-4"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <View className="px-2 py-0.5 rounded bg-beige/30 dark:bg-dark-border/30">
                          <Text className="text-[10px] text-light-textSecondary dark:text-dark-textSecondary font-medium">
                            {product.categoryName}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1" numberOfLines={2}>
                        {product.name}
                      </Text>
                      <View className="flex-row items-baseline mb-2">
                        <Text className="text-xl font-bold text-mint dark:text-gold">
                          {product.price.toLocaleString()}
                        </Text>
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                          ₫
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        {product.shopAvatar ? (
                          <Image
                            source={{ uri: product.shopAvatar }}
                            className="w-5 h-5 rounded-full bg-beige/20 mr-2"
                          />
                        ) : (
                          <View className="w-5 h-5 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
                            <FontAwesome name="shopping-bag" size={8} color="#ACD6B8" />
                          </View>
                        )}
                        <Text className="text-xs font-medium text-light-text dark:text-dark-text flex-1" numberOfLines={1}>
                          {product.shopName}
                        </Text>
                        <View className="px-2 py-0.5 rounded bg-mint/10 dark:bg-gold/10">
                          <Text className="text-[10px] text-mint dark:text-gold font-bold">
                            {product.stock} left
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}