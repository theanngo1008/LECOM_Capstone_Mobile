import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    Pressable,
    RefreshControl,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProducts } from "../hooks/useProducts";

type ProductsStackParamList = {
  Products: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
};

export function ProductsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProductsStackParamList>>();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError, refetch, isRefetching } = useProducts({
    search: searchQuery || undefined,
    page,
    pageSize,
  });

  const productData = data?.result;

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1); // Reset to first page on new search
  };

  const handleLoadMore = () => {
    if (productData && page < productData.totalPages && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <Pressable
      className="bg-white dark:bg-dark-card rounded-2xl mb-4 overflow-hidden border border-beige/30 dark:border-dark-border/30"
      onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
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
                    Active
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1" numberOfLines={2}>
              {item.name}
            </Text>
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-2" numberOfLines={2}>
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
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                {item.shopAvatar ? (
                  <Image
                    source={{ uri: item.shopAvatar }}
                    className="w-5 h-5 rounded-full bg-beige/20 mr-2"
                  />
                ) : (
                  <View className="w-5 h-5 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
                    <FontAwesome name="shopping-bag" size={8} color="#ACD6B8" />
                  </View>
                )}
                <Text className="text-xs font-medium text-light-text dark:text-dark-text flex-1" numberOfLines={1}>
                  {item.shopName}
                </Text>
              </View>
              <View className="px-2 py-0.5 rounded bg-skyBlue/10 dark:bg-lavender/10">
                <Text className="text-[10px] text-skyBlue dark:text-lavender font-bold">
                  {item.stock} in stock
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 rounded-full bg-beige/20 dark:bg-dark-border/20 items-center justify-center mb-4">
        <FontAwesome name="shopping-bag" size={40} color="#ACD6B8" />
      </View>
      <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
        No Products Found
      </Text>
      <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center px-8">
        {searchQuery ? `No results for "${searchQuery}"` : "Try adjusting your search"}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View className="mb-4">
      {/* Stats */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
            {productData?.totalItems || 0} Products
          </Text>
          <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mt-1">
            Page {productData?.page || 1} of {productData?.totalPages || 1}
          </Text>
        </View>
        <Pressable
          className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center"
          onPress={() => navigation.navigate("Cart")}
        >
          <FontAwesome name="shopping-cart" size={20} color="#ACD6B8" />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white dark:bg-dark-card px-4 py-3 rounded-xl border border-beige/30 dark:border-dark-border/30">
        <FontAwesome name="search" size={16} color="#9CA3AF" />
        <TextInput
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search products..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-3 text-light-text dark:text-dark-text text-base"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => handleSearch("")}>
            <FontAwesome name="times-circle" size={16} color="#9CA3AF" />
          </Pressable>
        )}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || page === 1) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#ACD6B8" />
      </View>
    );
  };

  if (isLoading && page === 1) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
        <View className="items-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4 text-base">
            Loading products...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background px-6" edges={['top', 'bottom']}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="exclamation-triangle" size={40} color="#FF6B6B" />
          </View>
          <Text className="text-coral font-bold text-xl mb-2">Oops!</Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-4">
            Failed to load products
          </Text>
          <Pressable
            className="bg-mint dark:bg-gold px-6 py-3 rounded-xl"
            onPress={() => refetch()}
          >
            <Text className="text-white font-bold">Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30" style={{ paddingTop: Platform.OS === 'ios' ? 16 : 16 }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-light-text dark:text-dark-text">
                Products
              </Text>
              <View className="flex-row items-center mt-2">
                <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  Browse all products
                </Text>
              </View>
            </View>
            <View className="w-14 h-14 rounded-2xl bg-mint/10 dark:bg-gold/10 items-center justify-center">
              <FontAwesome name="shopping-bag" size={24} color="#ACD6B8" />
            </View>
          </View>
        </View>

        {/* Products List */}
        <FlatList
          data={productData?.items || []}
          renderItem={renderProductItem}
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