import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShopStackParamList } from "../../../navigation/ShopStackNavigator";
import { useDeleteProduct } from "../hooks/useDeleteProduct";
import { useShopProducts } from "../hooks/useShopProducts";
import { useUpdateProductStatus } from "../hooks/useUpdateProductStatus";

export function ShopProductsScreen() {
  const { data, isLoading, isError } = useShopProducts();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateProductStatus();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

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
    { label: "Draft", color: "#F59E0B", icon: "edit", bgColor: "#FEF3C7", lightBg: "#FFFBEB" },
    { label: "Published", color: "#10B981", icon: "check-circle", bgColor: "#D1FAE5", lightBg: "#ECFDF5" },
    { label: "OutOfStock", color: "#EF4444", icon: "times-circle", bgColor: "#FEE2E2", lightBg: "#FEF2F2" },
    { label: "Archived", color: "#6B7280", icon: "archive", bgColor: "#E5E7EB", lightBg: "#F9FAFB" },
  ];

  const openStatusModal = (product: any) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleSelectStatus = (status: string) => {
    if (!selectedProduct) return;
    setShowModal(false);
    updateStatus(
      {
        productId: selectedProduct.id,
        status: status as "Draft" | "Published" | "OutOfStock" | "Archived",
      },
      {
        onSuccess: () => Alert.alert("Success", `Product updated to "${status}"`),
        onError: () => Alert.alert("Error", "Failed to update product status"),
      }
    );
  };

  const handleDeleteProduct = (productId: string, name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteProduct(productId, {
              onSuccess: () => Alert.alert("Deleted", "Product deleted successfully."),
              onError: () => Alert.alert("Error", "Failed to delete product."),
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
      bgColor: statusConfig?.bgColor || "#E5E7EB",
      lightBg: statusConfig?.lightBg || "#F9FAFB",
    };
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background" edges={['bottom']}>
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
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background px-6" edges={['bottom']}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="exclamation-triangle" size={40} color="#FF6B6B" />
          </View>
          <Text className="text-coral font-bold text-xl mb-2">Oops!</Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
            Failed to load product list
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
              My Products
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                {products.length} items in stock
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
      >
        {paginatedProducts.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 rounded-full bg-beige/20 dark:bg-dark-border/20 items-center justify-center mb-4">
              <FontAwesome name="inbox" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-base font-medium">
              No products found
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm mt-1">
              Add your first product to get started
            </Text>
          </View>
        ) : (
          paginatedProducts.map((item, index) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <Pressable
                key={item.id}
                className="bg-white dark:bg-dark-card rounded-2xl mb-4 overflow-hidden border border-beige/30 dark:border-dark-border/30"
                onPress={() =>
                  navigation.navigate("ShopProductDetail", { productId: item.id })
                }
                style={({ pressed }) => [
                  { 
                    opacity: pressed ? 0.95 : 1,
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
                      <View className="flex-row items-center mt-1.5">
                        <View className="px-2 py-0.5 rounded bg-beige/30 dark:bg-dark-border/30">
                          <Text className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary font-medium">
                            {item.categoryName}
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

                  {/* Divider */}
                  <View className="h-[0.5px] bg-beige/30 dark:bg-dark-border/30 my-3.5" />

                  {/* Actions */}
                  <View className="flex-row items-center justify-between">
                    {/* Status Button */}
                    <Pressable
                      className="flex-row items-center px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: statusStyle.lightBg,
                      }}
                      onPress={(e) => {
                        e.stopPropagation();
                        openStatusModal(item);
                      }}
                    >
                      <View 
                        className="w-1.5 h-1.5 rounded-full mr-2"
                        style={{ backgroundColor: statusStyle.color }}
                      />
                      <Text
                        className="text-xs font-semibold mr-1"
                        style={{ color: statusStyle.color }}
                      >
                        {item.status}
                      </Text>
                      <AntDesign
                        name="down"
                        size={9}
                        color={statusStyle.color}
                      />
                    </Pressable>

                    {/* Edit & Delete Buttons */}
                    <View className="flex-row gap-2">
                      <Pressable
                        className="px-3 py-2 rounded-lg bg-skyBlue/10 dark:bg-lavender/10 active:bg-skyBlue/20 dark:active:bg-lavender/20"
                        onPress={(e) => {
                          e.stopPropagation();
                          navigation.navigate("EditShopProduct", {
                            productId: item.id,
                          });
                        }}
                      >
                        <Text className="text-xs font-semibold text-skyBlue dark:text-lavender">
                          Edit
                        </Text>
                      </Pressable>

                      <Pressable
                        className="px-3 py-2 rounded-lg bg-coral/10 active:bg-coral/20"
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(item.id, item.name);
                        }}
                        disabled={isDeleting}
                      >
                        <Text className="text-xs font-semibold text-coral">
                          Delete
                        </Text>
                      </Pressable>
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
              Add New Product
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

      {/* Status Modal */}
      <Modal transparent visible={showModal} animationType="slide">
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setShowModal(false)}
        >
          <Pressable
            className="bg-white dark:bg-dark-card rounded-t-3xl p-6"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View className="items-center mb-6">
              <View className="w-12 h-1 rounded-full bg-beige dark:bg-dark-border mb-6" />
              <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
                Update Status
              </Text>
              <Text className="text-sm text-center text-light-textSecondary dark:text-dark-textSecondary px-4">
                Choose a new status for{" "}
                <Text className="font-semibold text-mint dark:text-gold">
                  {selectedProduct?.name}
                </Text>
              </Text>
            </View>

            {/* Status Options */}
            <View className="gap-2.5 mb-4">
              {statuses.map((s) => {
                const isSelected = s.label === selectedProduct?.status;
                return (
                  <Pressable
                    key={s.label}
                    className="flex-row items-center rounded-xl py-3.5 px-4"
                    style={{
                      backgroundColor: isSelected ? s.bgColor : s.lightBg,
                      borderWidth: 1.5,
                      borderColor: isSelected ? s.color : "transparent",
                    }}
                    onPress={() => handleSelectStatus(s.label)}
                    disabled={isUpdating}
                  >
                    <View
                      className="w-9 h-9 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${s.color}25` }}
                    >
                      <FontAwesome name={s.icon as any} size={16} color={s.color} />
                    </View>
                    <Text
                      className="flex-1 font-bold text-base"
                      style={{ color: s.color }}
                    >
                      {s.label}
                    </Text>
                    {isSelected && (
                      <FontAwesome name="check" size={18} color={s.color} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Cancel Button */}
            <Pressable
              onPress={() => setShowModal(false)}
              className="py-3.5 rounded-xl bg-beige/20 dark:bg-dark-border/20 items-center justify-center active:opacity-70"
            >
              <Text className="font-bold text-light-text dark:text-dark-text">
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}