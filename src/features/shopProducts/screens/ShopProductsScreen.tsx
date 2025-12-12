import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShopStackParamList } from "../../../navigation/types";
import { useDeleteProduct } from "../hooks/useDeleteProduct";
import { useShopProducts } from "../hooks/useShopProducts";

export function ShopProductsScreen() {
  const { data, isLoading, isError, refetch } = useShopProducts();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  const products = data?.result || [];

  // ---------- Phân trang ----------
  const PAGE_SIZE = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  // ---------- /Phân trang ----------

  const statuses = [
    { label: "Draft", displayName: "Nháp", color: "#F59E0B", bgColor: "#FFFBEB" },
    { label: "Published", displayName: "Đã xuất bản", color: "#10B981", bgColor: "#ECFDF5" },
    { label: "OutOfStock", displayName: "Hết hàng", color: "#EF4444", bgColor: "#FEF2F2" },
    { label: "Archived", displayName: "Đã lưu trữ", color: "#6B7280", bgColor: "#F9FAFB" },
  ];

  const approvalStatuses = {
    Pending: { label: "Chờ duyệt", color: "#F59E0B", icon: "clock-o", bgColor: "#FEF3C7" },
    Approved: { label: "Đã duyệt", color: "#10B981", icon: "check-circle", bgColor: "#D1FAE5" },
    Rejected: { label: "Từ chối", color: "#EF4444", icon: "times-circle", bgColor: "#FEE2E2" },
  };

  const handleDeleteProduct = (productId: string, name: string) => {
    Alert.alert(
      "Xác nhận lưu trữ",
      `Bạn có chắc chắn muốn lưu trữ "${name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Lưu trữ",
          style: "default",
          onPress: () => {
            deleteProduct(productId, {
              onSuccess: () => Alert.alert("Đã lưu trữ", "Sản phẩm đã được lưu trữ thành công."),
              onError: () => Alert.alert("Lỗi", "Không thể lưu trữ sản phẩm."),
            });
          },
        },
      ]
    );
  };

  const getStatusStyle = (status: string) => {
    const statusConfig = statuses.find((s) => s.label === status);
    return {
      color: statusConfig?.color || "#6B7280",
      bgColor: statusConfig?.bgColor || "#F9FAFB",
      displayName: statusConfig?.displayName || status,
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background">
        <View className="items-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4 text-base">
            Đang tải sản phẩm...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background px-6">
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="exclamation-triangle" size={40} color="#FF6B6B" />
          </View>
          <Text className="text-coral font-bold text-xl mb-2">Oops!</Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
            Không thể tải danh sách sản phẩm
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-light-text dark:text-dark-text">
              Sản phẩm của tôi
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                {products.length} sản phẩm trong kho
              </Text>
            </View>
          </View>
          <View className="w-14 h-14 rounded-2xl bg-mint/10 dark:bg-gold/10 items-center justify-center">
            <FontAwesome name="cubes" size={24} color="#ACD6B8" />
          </View>
        </View>
      </View>

      {/* Product List */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ACD6B8"]}
            tintColor="#ACD6B8"
            title="Đang tải..."
            titleColor="#9CA3AF"
          />
        }
      >
        {paginatedProducts.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 rounded-full bg-beige/20 dark:bg-dark-border/20 items-center justify-center mb-4">
              <FontAwesome name="inbox" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-base font-medium">
              Không tìm thấy sản phẩm
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm mt-1">
              Thêm sản phẩm đầu tiên để bắt đầu
            </Text>
          </View>
        ) : (
          paginatedProducts.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            const approvalConfig = approvalStatuses[item.approvalStatus as keyof typeof approvalStatuses];
            const isArchived = item.status === "Archived";
            const isRejected = item.approvalStatus === "Rejected";
            
            return (
              <Pressable
                key={item.id}
                className="bg-white dark:bg-dark-card rounded-2xl mb-4 overflow-hidden border border-beige/30 dark:border-dark-border/30"
                onPress={() => {
                  if (!isArchived) {
                    navigation.navigate("ShopProductDetail", { productId: item.id });
                  }
                }}
                disabled={isArchived}
                style={({ pressed }) => [
                  { 
                    opacity: pressed ? 0.95 : isArchived ? 0.6 : 1,
                    transform: [{ scale: pressed ? 0.99 : 1 }]
                  }
                ]}
              >
                {/* Product Info */}
                <View className="p-4">
                  <View className="flex-row items-start">
                    {/* Product Image */}
                    <View className="relative">
                      <Image
                        source={{ uri: item.thumbnailUrl }}
                        className="w-24 h-24 rounded-xl bg-beige/20"
                      />
                      {/* Stock Badge */}
                      <View className="absolute -top-1.5 -right-1.5 bg-mint dark:bg-gold px-2 py-0.5 rounded-full shadow-sm">
                        <Text className="text-white text-[10px] font-bold">
                          {item.stock}
                        </Text>
                      </View>
                    </View>

                    {/* Product Details */}
                    <View className="flex-1 ml-4">
                      <Text
                        className="text-base font-bold text-light-text dark:text-dark-text leading-5"
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      <View className="flex-row items-center mt-1.5 gap-2">
                        <View className="px-2 py-0.5 rounded bg-beige/30 dark:bg-dark-border/30">
                          <Text className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary font-medium">
                            {item.categoryName}
                          </Text>
                        </View>
                        {/* Approval Status Badge */}
                        <View 
                          className="flex-row items-center px-2 py-0.5 rounded"
                          style={{ backgroundColor: approvalConfig.bgColor }}
                        >
                          <FontAwesome 
                            name={approvalConfig.icon as any} 
                            size={10} 
                            color={approvalConfig.color}
                          />
                          <Text 
                            className="text-[10px] font-bold ml-1"
                            style={{ color: approvalConfig.color }}
                          >
                            {approvalConfig.label}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-baseline mt-2.5">
                        <Text className="text-xl font-bold text-mint dark:text-gold">
                          {item.price.toLocaleString()}
                        </Text>
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                          ₫
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Moderator Note (if rejected) */}
                  {isRejected && item.moderatorNote && (
                    <View className="mt-3 p-3 rounded-lg bg-coral/10 border border-coral/20">
                      <View className="flex-row items-start">
                        <FontAwesome name="info-circle" size={14} color="#EF4444" />
                        <View className="flex-1 ml-2">
                          <Text className="text-xs font-bold text-coral mb-1">
                            Lý do từ chối:
                          </Text>
                          <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary leading-4">
                            {item.moderatorNote}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Divider */}
                  <View className="h-[0.5px] bg-beige/30 dark:bg-dark-border/30 my-3.5" />

                  {/* Actions */}
                  <View className="flex-row items-center justify-between">
                    {/* Status Display Only */}
                    <View 
                      className="flex-row items-center px-2.5 py-1.5 rounded-lg flex-shrink"
                      style={{ backgroundColor: statusStyle.bgColor }}
                    >
                      <View 
                        className="w-1.5 h-1.5 rounded-full mr-1.5"
                        style={{ backgroundColor: statusStyle.color }}
                      />
                      <Text
                        className="text-[11px] font-semibold"
                        style={{ color: statusStyle.color }}
                        numberOfLines={1}
                      >
                        {statusStyle.displayName}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-1.5 flex-shrink-0">
                      {isRejected ? (
                        // Show "Cập nhật" button for rejected products
                        <Pressable
                          className="px-2.5 py-1.5 rounded-lg bg-mint/10 dark:bg-gold/10 active:bg-mint/20 dark:active:bg-gold/20"
                          onPress={(e) => {
                            e.stopPropagation();
                            navigation.navigate("EditShopProduct", {
                              productId: item.id,
                            });
                          }}
                        >
                          <View className="flex-row items-center gap-1">
                            <FontAwesome name="refresh" size={10} color="#ACD6B8" />
                            <Text className="text-[11px] font-semibold text-mint dark:text-gold">
                              Cập nhật
                            </Text>
                          </View>
                        </Pressable>
                      ) : !isArchived ? (
                        // Show "Sửa" and "Lưu trữ" for other products
                        <>
                          <Pressable
                            className="px-2.5 py-1.5 rounded-lg bg-skyBlue/10 dark:bg-lavender/10 active:bg-skyBlue/20 dark:active:bg-lavender/20"
                            onPress={(e) => {
                              e.stopPropagation();
                              navigation.navigate("EditShopProduct", {
                                productId: item.id,
                              });
                            }}
                          >
                            <Text className="text-[11px] font-semibold text-skyBlue dark:text-lavender">
                              Sửa
                            </Text>
                          </Pressable>

                          <Pressable
                            className="px-2.5 py-1.5 rounded-lg bg-beige/20 dark:bg-dark-border/20 active:bg-beige/30 dark:active:bg-dark-border/30"
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(item.id, item.name);
                            }}
                            disabled={isDeleting}
                          >
                            <View className="flex-row items-center gap-1">
                              <FontAwesome name="archive" size={10} color="#6B7280" />
                              <Text className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                                Lưu trữ
                              </Text>
                            </View>
                          </Pressable>
                        </>
                      ) : null}
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Footer */}
      <View className="px-5 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
        {/* Add New Product Button */}
        <Pressable
          className="bg-mint dark:bg-gold py-3.5 rounded-xl items-center justify-center active:opacity-80 mb-3"
          onPress={() => navigation.navigate("CreateShopProduct")}
        >
          <View className="flex-row items-center">
            <FontAwesome name="plus" size={16} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              Thêm sản phẩm mới
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
                  Trước
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
                  Sau
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
    </SafeAreaView>
  );
}