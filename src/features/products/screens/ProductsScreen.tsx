import { useCart } from "@/features/cart/hooks/useCart";
import { useProductCategories } from "@/hooks/useProductCategories";
import { ProductsStackParamList } from "@/navigation/ProductsStackNavigator";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProducts } from "../hooks/useProducts";

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

export function ProductsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProductsStackParamList> & DrawerNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined); 
  const [allItems, setAllItems] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 6;

  const { data: categories } = useProductCategories();

  const { items: cartShopGroups } = useCart();
  
  const cartItemCount = cartShopGroups.reduce((total, shopGroup) => {
    const shopTotal = shopGroup.items.reduce((sum, item) => sum + item.quantity, 0);
    return total + shopTotal;
  }, 0);

  // Reset page when search or category changes
  React.useEffect(() => {
    setPage(1);
    setAllItems([]);
  }, [searchQuery, selectedCategory]);

  const productsParams = React.useMemo(() => {
    const params: any = {
      page,
      pageSize,
    };
    if (searchQuery) {
      params.search = searchQuery;
    }
    if (selectedCategory) {
      params.category = selectedCategory;
    }
    return params;
  }, [searchQuery, page, pageSize, selectedCategory]);

  const { data, isLoading, refetch, isRefetching } = useProducts(productsParams);

  // Update items when data changes
  React.useEffect(() => {
    const productData = data?.result;
    if (productData) {
      // Only update if we're on page 1 (fresh search/category) or appending pages
      if (page === 1) {
        setAllItems(productData.items || []);
      } else {
        setAllItems((prev) => {
          // Avoid duplicates - check if items already exist
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = (productData.items || []).filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
      setTotalPages(productData.totalPages || 1);
      setTotalItems(productData.totalItems || 0);
    }
  }, [data, page]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !isLoading && !isRefetching) {
      setPage((prev) => prev + 1);
    }
  };

  const handleSelectCategory = (categoryName: string | undefined) => {
    setSelectedCategory(categoryName);
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <Pressable
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
                  Còn {item.stock}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderHeader = () => (
    <View className="mb-4">
      {/* Stats */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
            {totalItems} Sản phẩm
          </Text>
          <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mt-1">
            Đã tải {allItems.length} / {totalItems} sản phẩm
          </Text>
        </View>
        <Pressable
          className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center relative"
          onPress={() => navigation.navigate("CartMain")}
        >
          <FontAwesome name="shopping-cart" size={20} color="#ACD6B8" />
          {cartItemCount > 0 && (
            <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-coral items-center justify-center border-2 border-white dark:border-dark-card">
              <Text className="text-white text-[10px] font-bold">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white dark:bg-dark-card px-4 py-3 rounded-xl border border-beige/30 dark:border-dark-border/30 mb-3">
        <FontAwesome name="search" size={16} color="#9CA3AF" />
        <TextInput
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-3 text-light-text dark:text-dark-text text-base"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => handleSearch("")}>
            <FontAwesome name="times-circle" size={16} color="#9CA3AF" />
          </Pressable>
        )}
      </View>

      {categories && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <Pressable
            onPress={() => handleSelectCategory(undefined)}
            className={`px-3 py-1.5 mr-2 rounded-full border ${
              !selectedCategory
                ? "bg-mint/10 border-mint dark:bg-gold/10 dark:border-gold"
                : "bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                !selectedCategory ? "text-mint dark:text-gold" : "text-light-textSecondary dark:text-dark-textSecondary"
              }`}
            >
              Tất cả
            </Text>
          </Pressable>

          {categories.map((cat: any) => {
            const categorySlug = nameToSlug(cat.name);
            return (
              <Pressable
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
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30" style={{ paddingTop: Platform.OS === 'ios' ? 16 : 16 }}>
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
                Sản phẩm
              </Text>
              <View className="flex-row items-center mt-2">
               
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  Khám phá tất cả sản phẩm
                </Text>
              </View>
            </View>

            {/* Right - Icon */}
            <View className="w-14 h-14 rounded-2xl bg-mint/10 dark:bg-gold/10 items-center justify-center">
              <FontAwesome name="shopping-bag" size={24} color="#ACD6B8" />
            </View>
          </View>
        </View>

        {/* Products List */}
        <FlatList
          data={allItems}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            isLoading ? null : (
              <View className="flex-1 items-center justify-center py-20">
                <View className="w-20 h-20 rounded-full bg-beige/20 dark:bg-dark-border/20 items-center justify-center mb-4">
                  <FontAwesome name="shopping-bag" size={40} color="#ACD6B8" />
                </View>
                <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
                  Không tìm thấy sản phẩm
                </Text>
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center px-8">
                  {searchQuery ? `Không có kết quả cho "${searchQuery}"` : "Thử điều chỉnh tìm kiếm hoặc danh mục"}
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            isLoading && page > 1 ? (
              <View className="py-4 items-center">
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  Đang tải thêm...
                </Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && page === 1}
              onRefresh={() => {
                setPage(1);
                setAllItems([]);
                refetch();
              }}
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