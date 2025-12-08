import { useCart } from "@/features/cart/hooks/useCart";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLandingPage } from "../hooks/useLandingPage";
import { useBrowseProducts } from "../hooks/useBrowseProducts";
import { useBrowseCourses } from "../hooks/useBrowseCourses";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { Notifications } from "@/components/Notifications";
export function HomeScreen() {
  const { data: landingData, isLoading: isLoadingLanding, isError: isErrorLanding } = useLandingPage();
  const { data: productsData, isLoading: isLoadingProducts } = useBrowseProducts();
  const { data: coursesData, isLoading: isLoadingCourses } = useBrowseCourses();
  
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList> & DrawerNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Lấy giỏ hàng để đếm số lượng
  const { items: cartShopGroups } = useCart();
  
  // ✅ Tính tổng số lượng sản phẩm từ tất cả shop
  const cartItemCount = cartShopGroups.reduce((total, shopGroup) => {
    const shopTotal = shopGroup.items.reduce((sum, item) => sum + item.quantity, 0);
    return total + shopTotal;
  }, 0);

  const landing = landingData?.result;
  const products = productsData?.result;
  const courses = coursesData?.result;

  const isLoading = isLoadingLanding;
  const isError = isErrorLanding;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
        <View className="items-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4 text-base">
            Đang tải...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !landing) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background px-6" edges={['top', 'bottom']}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="exclamation-triangle" size={40} color="#FF6B6B" />
          </View>
          <Text className="text-coral font-bold text-xl mb-2">Oops!</Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
            Không thể tải dữ liệu
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-center justify-between mb-4">
          {/* Left - Menu Button */}
          <Pressable
            className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3"
            onPress={() => navigation.openDrawer()}
          >
            <FontAwesome name="bars" size={20} color="#ACD6B8" />
          </Pressable>

          {/* Center - Title */}
          <View className="flex-1">
            <Text className="text-3xl font-bold text-light-text dark:text-dark-text">
              Khám phá
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                Tìm yêu thích tiếp theo của bạn
              </Text>
            </View>
          </View>

          {/* Right - Action Buttons */}
          <View className="flex-row gap-2">
               <Notifications />
            <Pressable
              className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center"
              onPress={() => navigation.navigate("ChatList" as any)}
            >
              <FontAwesome name="comments" size={20} color="#ACD6B8" />
            </Pressable>
            <Pressable
              className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center relative"
              onPress={() => navigation.navigate("CartMain" as any)}
            >
              <FontAwesome name="shopping-cart" size={20} color="#ACD6B8" />
              {/* ✅ Cart Badge */}
              {cartItemCount > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-coral items-center justify-center border-2 border-white dark:border-dark-card">
                  <Text className="text-white text-[10px] font-bold">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <Pressable
          className="flex-row items-center bg-cream dark:bg-dark-background px-4 py-3 rounded-xl border border-beige/30 dark:border-dark-border/30"
        >
          <FontAwesome name="search" size={16} color="#9CA3AF" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary ml-3 flex-1">
            Tìm kiếm khóa học & sản phẩm...
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 🎯 RECOMMENDED COURSES */}
        {!isLoadingCourses && courses?.recommendedCourses && courses.recommendedCourses.length > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between px-6 mb-4">
              <View>
                <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                  Gợi ý dành cho bạn
                </Text>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                  Dựa trên sở thích của bạn
                </Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center">
                <FontAwesome name="magic" size={16} color="#ACD6B8" />
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {courses.recommendedCourses.map((course) => (
                <Pressable
                  key={course.id}
                  className="mr-4 bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-beige/30 dark:border-dark-border/30 w-72"
                  onPress={() => navigation.navigate("CourseDetail", { slug: course.slug })}
                >
                  <Image
                    source={{ uri: course.courseThumbnail }}
                    className="w-full h-40 bg-beige/20"
                    resizeMode="cover"
                  />
                  <View className="p-4">
                    <View className="flex-row items-center mb-2">
                      <View className="px-2 py-1 rounded bg-mint/10 dark:bg-gold/10 mr-2">
                        <Text className="text-[10px] text-mint dark:text-gold font-bold">
                          Gợi ý
                        </Text>
                      </View>
                      <View className="px-2 py-1 rounded bg-beige/30 dark:bg-dark-border/30">
                        <Text className="text-[10px] text-light-textSecondary dark:text-dark-textSecondary font-medium">
                          {course.categoryName}
                        </Text>
                      </View>
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

     
        {!isLoadingProducts && products?.recommendedProducts && products.recommendedProducts.length > 0 && (
          <View className="mt-6 px-6">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                  Sản phẩm dành cho bạn
                </Text>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                  Lựa chọn kỹ càng cho bạn
                </Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-skyBlue/10 dark:bg-lavender/10 items-center justify-center">
                <FontAwesome name="heart" size={16} color="#7DD3FC" />
              </View>
            </View>
            {products.recommendedProducts.slice(0, 3).map((product) => (
              <Pressable
                key={product.id}
                className="bg-white dark:bg-dark-card rounded-2xl mb-4 overflow-hidden border border-beige/30 dark:border-dark-border/30"
                onPress={() => navigation.navigate("ProductDetail", { slug: product.slug })}
              >
                <View className="p-4">
                  <View className="flex-row items-start">
                    <Image
                      source={{ uri: product.thumbnailUrl }}
                      className="w-24 h-24 rounded-xl bg-beige/20 mr-4"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1 flex-wrap">
                        <View className="px-2 py-0.5 rounded bg-skyBlue/10 dark:bg-lavender/10 mr-2 mb-1">
                          <Text className="text-[10px] text-skyBlue dark:text-lavender font-bold">
                            Gợi ý
                          </Text>
                        </View>
                        <View className="px-2 py-0.5 rounded bg-beige/30 dark:bg-dark-border/30 mb-1">
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
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {!isLoadingCourses && courses?.newArrivalCourses && courses.newArrivalCourses.length > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between px-6 mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Khóa học mới
              </Text>
              <FontAwesome name="bolt" size={20} color="#F59E0B" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {courses.newArrivalCourses.map((course) => (
                <Pressable
                  key={course.id}
                  className="mr-4 bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-beige/30 dark:border-dark-border/30 w-72"
                  onPress={() => navigation.navigate("CourseDetail", { slug: course.slug })}
                >
                  <Image
                    source={{ uri: course.courseThumbnail }}
                    className="w-full h-40 bg-beige/20"
                    resizeMode="cover"
                  />
                  <View className="absolute top-3 right-3 px-2 py-1 rounded-full bg-orange-500">
                    <Text className="text-[10px] text-white font-bold">MỚI</Text>
                  </View>
                  <View className="p-4">
                    <View className="flex-row items-center mb-2">
                      <View className="px-2 py-1 rounded bg-beige/30 dark:bg-dark-border/30">
                        <Text className="text-[10px] text-light-textSecondary dark:text-dark-textSecondary font-medium">
                          {course.categoryName}
                        </Text>
                      </View>
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

    
        {!isLoadingProducts && products?.trendingProducts && products.trendingProducts.length > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between px-6 mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Đang thịnh hành
              </Text>
              <FontAwesome name="fire" size={20} color="#FF6B6B" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {products.trendingProducts.map((product) => (
                <Pressable
                  key={product.id}
                  className="mr-4 bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-beige/30 dark:border-dark-border/30 w-56"
                  onPress={() => navigation.navigate("ProductDetail", { slug: product.slug })}
                >
                  <Image
                    source={{ uri: product.thumbnailUrl }}
                    className="w-full h-48 bg-beige/20"
                    resizeMode="cover"
                  />
                  <View className="absolute top-3 right-3 px-2 py-1 rounded-full bg-red-500">
                    <Text className="text-[10px] text-white font-bold">🔥 HOT</Text>
                  </View>
                  <View className="p-4">
                    <Text className="text-base font-bold text-light-text dark:text-dark-text mb-2" numberOfLines={2}>
                      {product.name}
                    </Text>
                    <View className="flex-row items-baseline mb-3">
                      <Text className="text-xl font-bold text-coral">
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
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

     
        {!isLoadingCourses && courses?.recommendedCategories && courses.recommendedCategories.length > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between px-6 mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Khám phá danh mục khóa học
              </Text>
              <FontAwesome name="compass" size={20} color="#ACD6B8" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {courses.recommendedCategories.map((category) => (
                <Pressable
                  key={category.id}
                  className="mr-3 bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30 w-40"
                >
                  <View className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center mb-3">
                    <FontAwesome name="graduation-cap" size={20} color="#ACD6B8" />
                  </View>
                  <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1" numberOfLines={1}>
                    {category.name}
                  </Text>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                    {category.courses.length} khóa học
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

  
        {!isLoadingProducts && products?.recommendedCategories && products.recommendedCategories.length > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between px-6 mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Khám phá danh mục sản phẩm
              </Text>
              <FontAwesome name="tags" size={20} color="#7DD3FC" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {products.recommendedCategories.map((category) => (
                <Pressable
                  key={category.id}
                  className="mr-3 bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30 w-40"
                >
                  <View className="w-12 h-12 rounded-xl bg-skyBlue/10 dark:bg-lavender/10 items-center justify-center mb-3">
                    <FontAwesome name="shopping-bag" size={20} color="#7DD3FC" />
                  </View>
                  <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1" numberOfLines={1}>
                    {category.name}
                  </Text>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                    {category.products.length} sản phẩm
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

   
        {landing.topCourseCategories.length > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between px-6 mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Chủ đề khóa học phổ biến
              </Text>
              <FontAwesome name="star" size={20} color="#F59E0B" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {landing.topCourseCategories.map((category) => (
                <Pressable
                  key={category.id}
                  className="mr-3 bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30 w-40"
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

        {/* 💎 BEST SELLERS FROM LANDING */}
        {landing.bestSellerProducts.length > 0 && (
          <View className="mt-6 px-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Bán chạy nhất
              </Text>
              <FontAwesome name="trophy" size={20} color="#F59E0B" />
            </View>
            {landing.bestSellerProducts.map((product) => (
              <Pressable
                key={product.id}
                className="bg-white dark:bg-dark-card rounded-2xl mb-4 overflow-hidden border border-beige/30 dark:border-dark-border/30"
                onPress={() => navigation.navigate("ProductDetail", { slug: product.slug })}
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
                        <View className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/20 mr-2">
                          <Text className="text-[10px] text-orange-600 dark:text-orange-400 font-bold">
                            🏆 Bán chạy
                          </Text>
                        </View>
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
                            Còn {product.stock}
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
    </SafeAreaView>
  );
}