import { ProductsStackParamList } from "@/navigation/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShopDetail } from "../hooks/useShopDetail";

type Props = NativeStackScreenProps<ProductsStackParamList, "ShopDetail">;

type TabType = "products" | "courses";

export function ShopDetailScreen({ navigation, route }: Props) {
  const { shopId } = route.params;
  const { shopDetail, isLoading, isError, refetch } = useShopDetail(shopId);
  const [activeTab, setActiveTab] = useState<TabType>("products");

  const renderLoading = () => (
    <View className="flex-1 bg-cream dark:bg-dark-background">
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ACD6B8" />
        <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
          Đang tải thông tin cửa hàng...
        </Text>
      </View>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 bg-cream dark:bg-dark-background">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
          Đã xảy ra lỗi
        </Text>
        <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
          Không thể tải thông tin cửa hàng
        </Text>
        <View className="flex-row space-x-4">
          <TouchableOpacity
            className="px-6 py-3 rounded-full bg-beige/50 dark:bg-dark-border/50"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-light-text dark:text-dark-text font-semibold">
              Quay lại
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) return renderLoading();
  if (isError || !shopDetail) return renderError();

  const shop = shopDetail.shop;
  const products = shopDetail.products || [];
  const courses = shopDetail.courses || [];

  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white dark:bg-dark-card rounded-2xl mb-4 overflow-hidden border border-beige/30 dark:border-dark-border/30"
      onPress={() => navigation.navigate("ProductDetail", { slug: item.slug })}
    >
      <View className="p-4">
        <View className="flex-row items-start">
          <Image
            source={{ uri: item.thumbnailUrl }}
            className="w-28 h-28 rounded-xl bg-beige/20 mr-4"
            resizeMode="cover"
          />
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <View className="px-2 py-0.5 rounded bg-beige/30 dark:bg-dark-border/30 mr-2">
                <Text className="text-[10px] text-light-textSecondary dark:text-dark-textSecondary font-medium">
                  {item.categoryName}
                </Text>
              </View>
              {item.status === "Published" && (
                <View className="px-2 py-0.5 rounded bg-mint/10 dark:bg-gold/10">
                  <Text className="text-[10px] text-mint dark:text-gold font-bold">
                    Đang bán
                  </Text>
                </View>
              )}
            </View>
            <Text
              className="text-base font-bold text-light-text dark:text-dark-text mb-1"
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text
              className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-2"
              numberOfLines={2}
            >
              {item.description}
            </Text>
            <View className="flex-row items-baseline mb-2">
              <Text className="text-xl font-bold text-mint dark:text-gold">
                {item.price.toLocaleString()}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                ₫
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                Còn {item.stock} sản phẩm
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCourseItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white dark:bg-dark-card rounded-2xl mb-4 overflow-hidden border border-beige/30 dark:border-dark-border/30"
      onPress={() => {
        navigation.navigate("CourseDetail", { slug: item.slug });
      }}
    >
      <View className="p-4">
        <View className="flex-row items-start">
          <View className="relative">
            <Image
              source={{ uri: item.courseThumbnail }}
              className="w-28 h-28 rounded-xl bg-beige/20"
              resizeMode="cover"
            />
            {item.active === 1 && (
              <View className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-mint dark:bg-gold shadow-sm">
                <Text className="text-white text-[10px] font-bold">
                  Hoạt động
                </Text>
              </View>
            )}
          </View>
          <View className="flex-1 ml-4">
            <View className="px-2 py-0.5 rounded bg-beige/30 dark:bg-dark-border/30 mb-2 self-start">
              <Text className="text-[10px] text-light-textSecondary dark:text-dark-textSecondary font-medium">
                {item.categoryName}
              </Text>
            </View>
            <Text
              className="text-base font-bold text-light-text dark:text-dark-text mb-1"
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text
              className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-2"
              numberOfLines={2}
            >
              {item.summary}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
      }}
    >
      <View className="flex-1 bg-cream dark:bg-dark-background">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
          >
            <Text className="text-mint dark:text-gold font-bold">←</Text>
          </TouchableOpacity>

          <Text
            className="flex-1 text-xl font-bold text-light-text dark:text-dark-text text-center mx-4"
            numberOfLines={1}
          >
            {shop.name}
          </Text>

          <View className="w-10" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Shop Banner */}
          {shop.shopBanner ? (
            <Image
              source={{ uri: shop.shopBanner }}
              className="w-full h-48"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-48 bg-gradient-to-br from-mint to-skyBlue dark:from-gold dark:to-lavender" />
          )}

          {/* Shop Info Card */}
          <View className="px-6 py-6 -mt-16">
            <View className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-beige/30 dark:border-dark-border/30 shadow-sm">
              <View className="flex-row items-start mb-4">
                {shop.shopAvatar ? (
                  <Image
                    source={{ uri: shop.shopAvatar }}
                    className="w-20 h-20 rounded-full mr-4 border-4 border-white dark:border-dark-card"
                  />
                ) : (
                  <View className="w-20 h-20 rounded-full bg-mint/10 dark:bg-gold/10 mr-4 border-4 border-white dark:border-dark-card" />
                )}
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                    {shop.name}
                  </Text>
                  <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-2">
                    {shop.categoryName}
                  </Text>
                  {shop.status === "Approved" && (
                    <View className="px-3 py-1 rounded-full bg-mint/10 dark:bg-gold/10 self-start">
                      <Text className="text-xs text-mint dark:text-gold font-bold">
                        Đã duyệt
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {shop.description && (
                <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary mb-4">
                  {shop.description}
                </Text>
              )}

              {/* Shop Contact Info */}
              <View className="border-t border-beige/30 dark:border-dark-border/30 pt-4 mt-4">
                {shop.phoneNumber && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-sm text-light-text dark:text-dark-text">
                      {shop.phoneNumber}
                    </Text>
                  </View>
                )}
                {shop.address && (
                  <View className="flex-row items-start">
                    <Text className="text-sm text-light-text dark:text-dark-text flex-1">
                      {shop.address}, {shop.wardName}, {shop.districtName}, {shop.provinceName}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View className="px-6 mb-4">
            <View className="flex-row bg-white dark:bg-dark-card rounded-2xl p-1 border border-beige/30 dark:border-dark-border/30">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center ${
                  activeTab === "products"
                    ? "bg-mint dark:bg-gold"
                    : "bg-transparent"
                }`}
                onPress={() => setActiveTab("products")}
              >
                <Text
                  className={`font-bold ${
                    activeTab === "products"
                      ? "text-white"
                      : "text-light-textSecondary dark:text-dark-textSecondary"
                  }`}
                >
                  Sản phẩm ({products.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center ${
                  activeTab === "courses"
                    ? "bg-mint dark:bg-gold"
                    : "bg-transparent"
                }`}
                onPress={() => setActiveTab("courses")}
              >
                <Text
                  className={`font-bold ${
                    activeTab === "courses"
                      ? "text-white"
                      : "text-light-textSecondary dark:text-dark-textSecondary"
                  }`}
                >
                  Khóa học ({courses.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <View className="px-6 pb-6">
            {activeTab === "products" ? (
              products.length > 0 ? (
                <View>
                  {products.map((item) => (
                    <View key={item.id}>
                      {renderProductItem({ item })}
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-white dark:bg-dark-card rounded-2xl p-8 items-center border border-beige/30 dark:border-dark-border/30">
                  <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-2">
                    Chưa có sản phẩm
                  </Text>
                  <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center">
                    Cửa hàng này chưa có sản phẩm nào
                  </Text>
                </View>
              )
            ) : (
              courses.length > 0 ? (
                <View>
                  {courses.map((item) => (
                    <View key={item.id}>
                      {renderCourseItem({ item })}
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-white dark:bg-dark-card rounded-2xl p-8 items-center border border-beige/30 dark:border-dark-border/30">
                  <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-2">
                    Chưa có khóa học
                  </Text>
                  <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center">
                    Cửa hàng này chưa có khóa học nào
                  </Text>
                </View>
              )
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

