import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  ZoomIn,
  ZoomOut,
  BounceIn,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCartSelectionStore } from "@/store/cart-store";
import { useCart } from "../hooks/useCart";
import { useRemoveFromCart } from "../hooks/useRemoveFromCart";
import { useUpdateCartItem } from "../hooks/useUpdateCartItem";

export function CartScreen({ navigation }: any) {
  const { items, subtotal, isLoading, isError, refetch } = useCart();
  const removeFromCart = useRemoveFromCart();
  const updateCartItem = useUpdateCartItem();

  // Use Zustand store for cart selection
  const {
    selectedProductIds,
    toggleProduct,
    isSelected,
    clearSelection,
  } = useCartSelectionStore();

  const SHIPPING_FEE = 30000;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // ⭐ Chọn / bỏ chọn sản phẩm - sử dụng store
  const toggleSelectItem = (productId: string) => {
    toggleProduct(productId);
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert("Xóa sản phẩm", `Bạn có muốn xóa "${productName}" khỏi giỏ hàng không?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          removeFromCart.mutate(productId, {
            onSuccess: () => Alert.alert("Thành công", "Đã xóa sản phẩm khỏi giỏ hàng"),
            onError: (error: any) => {
              Alert.alert(
                "Lỗi",
                error.response?.data?.message || "Không thể xóa sản phẩm"
              );
            },
          });
        },
      },
    ]);
  };

  const handleQuickUpdate = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;

    if (newQuantity < 1) {
      Alert.alert("Số lượng không hợp lệ", "Số lượng phải lớn hơn 0");
      return;
    }

    updateCartItem.mutate(
      { productId, payload: { quantityChange: change } },
      {
        onError: (error: any) =>
          Alert.alert(
            "Lỗi",
            error.response?.data?.message || "Không thể cập nhật số lượng"
          ),
      }
    );
  };

  // ⭐ SUBTOTAL chỉ tính sản phẩm được chọn
  const calculateSelectedSubtotal = () => {
    if (!items) return 0;

    let total = 0;

    items.forEach((shop: any) => {
      shop.items.forEach((item: any) => {
        if (selectedProductIds.includes(item.productId)) {
          total += item.lineTotal;
        }
      });
    });

    return total;
  };

  const selectedSubtotal = calculateSelectedSubtotal();
const calculateShipping = () => {
  if (!items) return 0;

  let uniqueShopsCount = 0;

  items.forEach((shop: any) => {
    const hasSelected = shop.items.some((item: any) =>
      selectedProductIds.includes(item.productId)
    );
    if (hasSelected) {
      uniqueShopsCount++;
    }
  });

  return uniqueShopsCount * SHIPPING_FEE;
};

const shippingFee = calculateShipping();
const totalWithShipping = selectedSubtotal + shippingFee;


  // RENDER GIỎ HÀNG TRỐNG
  const renderEmptyCart = () => (
    <Animated.View entering={FadeIn} className="flex-1 items-center justify-center px-6">
      <View className="w-32 h-32 rounded-full bg-beige/30 dark:bg-dark-border/30 items-center justify-center mb-6">
        <FontAwesome name="shopping-cart" size={64} color="#D1D5DB" />
      </View>
      <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">
        Giỏ hàng trống
      </Text>
      <TouchableOpacity
        className="px-8 py-4 rounded-full bg-mint"
        onPress={() => navigation.navigate("ProductsList")}
      >
        <Text className="text-white text-base font-bold">Mua sắm ngay</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderLoading = () => (
    <Animated.View entering={FadeIn} className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#ACD6B8" />
      <Text className="mt-4 text-light-textSecondary dark:text-dark-textSecondary">
        Đang tải giỏ hàng...
      </Text>
    </Animated.View>
  );

  const renderError = () => (
    <Animated.View entering={FadeIn} className="flex-1 items-center justify-center px-6">
      <FontAwesome name="exclamation-circle" size={64} color="#FF6B6B" />
      <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
        Có lỗi xảy ra
      </Text>
      <TouchableOpacity
        className="px-6 py-3 rounded-full bg-mint"
        onPress={() => refetch()}
      >
        <Text className="text-white font-semibold">Thử lại</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // ⭐ RENDER ITEM
  const renderCartItem = (item: any, itemIndex: number) => (
    <Animated.View
      entering={FadeInUp.delay(itemIndex * 80)}
      exiting={FadeOut}
      key={item.productId}
      className="bg-white dark:bg-dark-card rounded-2xl mb-3 overflow-hidden border border-beige/30 dark:border-dark-border/30"
    >
      <View className="flex-row p-4">

        {/* CHECKBOX */}
        <TouchableOpacity
          onPress={() => toggleSelectItem(item.productId)}
          className="mr-3 mt-1"
        >
          <View
            className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
              isSelected(item.productId)
                ? "border-mint bg-mint"
                : "border-beige dark:border-dark-border"
            }`}
          >
            {isSelected(item.productId) && (
              <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                <FontAwesome name="check" size={14} color="white" />
              </Animated.View>
            )}
          </View>
        </TouchableOpacity>

        {/* HÌNH ẢNH */}
        <TouchableOpacity
          onPress={() =>
            item.productSlug &&
            navigation.navigate("ProductDetail", { slug: item.productSlug })
          }
          className="relative"
        >
          {item.productImage ? (
            <Image
              source={{ uri: item.productImage }}
              className="w-20 h-20 rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-20 h-20 rounded-xl bg-beige/30 items-center justify-center">
              <FontAwesome name="image" size={28} color="#D1D5DB" />
            </View>
          )}

          <View className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-mint items-center justify-center">
            <Text className="text-white text-xs font-bold">{itemIndex + 1}</Text>
          </View>
        </TouchableOpacity>

        {/* INFO */}
        <View className="flex-1 ml-3">
          <TouchableOpacity
            onPress={() =>
              item.productSlug &&
              navigation.navigate("ProductDetail", { slug: item.productSlug })
            }
          >
            <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-1" numberOfLines={2}>
              {item.productName}
            </Text>
          </TouchableOpacity>

          <Text className="text-base font-bold text-mint mb-2">
            {formatPrice(item.unitPrice)}
          </Text>

          {/* Quantity */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">

              {/* MINUS */}
              <TouchableOpacity
                className={`w-7 h-7 rounded-full items-center justify-center ${
                  item.quantity === 1
                    ? "bg-gray-200 dark:bg-gray-700"
                    : "bg-mint/20"
                }`}
                onPress={() => handleQuickUpdate(item.productId, item.quantity, -1)}
                disabled={item.quantity === 1 || updateCartItem.isPending}
              >
                <Animated.View entering={BounceIn}>
                  <FontAwesome
                    name="minus"
                    size={10}
                    color={item.quantity === 1 ? "#9CA3AF" : "#ACD6B8"}
                  />
                </Animated.View>
              </TouchableOpacity>

              <Text className="mx-3 text-sm font-bold">{item.quantity}</Text>

              {/* PLUS */}
              <TouchableOpacity
                className="w-7 h-7 rounded-full bg-mint/20 items-center justify-center"
                onPress={() => handleQuickUpdate(item.productId, item.quantity, 1)}
                disabled={updateCartItem.isPending}
              >
                <Animated.View entering={BounceIn}>
                  <FontAwesome name="plus" size={10} color="#ACD6B8" />
                </Animated.View>
              </TouchableOpacity>

            </View>

            <View className="items-end">
              <Text className="text-xs text-light-textSecondary">Tổng</Text>
              <Text className="text-sm font-bold text-light-text">
                {formatPrice(item.lineTotal)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Remove */}
      <View className="border-t border-beige/30">
        <TouchableOpacity
          className="flex-row items-center justify-center py-2.5"
          onPress={() => handleRemoveItem(item.productId, item.productName)}
          disabled={removeFromCart.isPending}
        >
          <FontAwesome name="trash-o" size={14} color="#FF6B6B" />
          <Text className="text-coral font-semibold ml-2 text-sm">Xóa</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // ❗ RENDER SHOP GROUP
  const renderShopGroup = (shop: any, shopIndex: number) => {
    let itemIndex = 0;
    for (let i = 0; i < shopIndex; i++) {
      itemIndex += items[i].items.length;
    }

    return (
      <Animated.View
        entering={FadeIn.delay(shopIndex * 120)}
        key={shop.shopId}
        className="mb-6"
      >
        {/* Shop Header */}
        <View className="flex-row items-center mb-3 px-1">
          {shop.shopAvatar ? (
            <Image
              source={{ uri: shop.shopAvatar }}
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-mint/10 items-center justify-center mr-3">
              <FontAwesome name="shopping-cart" size={18} color="#ACD6B8" />
            </View>
          )}

          <View className="flex-1">
            <Text className="text-base font-bold">{shop.shopName}</Text>
            <Text className="text-xs text-light-textSecondary">
              {shop.items.length} sản phẩm
            </Text>
          </View>
        </View>

        {shop.items.map((item: any) => {
          const currentIndex = itemIndex++;
          return renderCartItem(item, currentIndex);
        })}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      {/* Header */}
      <Animated.View
        entering={FadeInUp}
        className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30"
        style={{ paddingTop: Platform.OS === "ios" ? 12 : 10 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-beige/50 items-center justify-center"
        >
          <FontAwesome name="arrow-left" size={18} color="#ACD6B8" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-xl font-bold">Giỏ hàng</Text>
          <Text className="text-xs text-light-textSecondary">
            {selectedProductIds.length} đã chọn
          </Text>
        </View>

        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-beige/50 items-center justify-center"
          onPress={() => refetch()}
        >
          <FontAwesome name="refresh" size={18} color="#ACD6B8" />
        </TouchableOpacity>
      </Animated.View>

      {/* CONTENT */}
      {isLoading ? (
        renderLoading()
      ) : isError ? (
        renderError()
      ) : !items || items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
            showsVerticalScrollIndicator={false}
          >
            {items.map((shop, index) => renderShopGroup(shop, index))}
          </ScrollView>

          {/* BOTTOM SUMMARY */}
          <Animated.View
            entering={FadeInUp.duration(400)}
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t px-6 py-4"
          >
            {selectedSubtotal === 0 ? (
              <Text className="text-center text-light-textSecondary mb-3">
                Chọn sản phẩm để thanh toán
              </Text>
            ) : (
              <View className="mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-light-textSecondary">
                    Tạm tính ({selectedProductIds.length} sản phẩm)
                  </Text>
                  <Text className="text-light-text font-semibold">
                    {formatPrice(selectedSubtotal)}
                  </Text>
                </View>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-light-textSecondary">Phí vận chuyển</Text>
                  <Text className="text-light-text font-semibold">
                    {formatPrice(shippingFee)}
                  </Text>
                </View>

                <View className="h-px bg-beige/30 my-2" />

                <View className="flex-row justify-between">
                  <Text className="text-lg font-bold">Tổng cộng</Text>
                  <Text className="text-lg font-bold text-mint">
                    {formatPrice(totalWithShipping)}
                  </Text>
                </View>
              </View>
            )}

            {/* CHECKOUT */}
            <TouchableOpacity
              className={`rounded-full py-4 items-center ${
                selectedSubtotal === 0 ? "bg-gray-400" : "bg-mint"
              }`}
              onPress={() => {
                if (selectedSubtotal === 0) return;
                // selectedProductIds is already in store, no need to pass via params
                navigation.navigate("Checkout");
              }}
              disabled={selectedSubtotal === 0}
            >
              <View className="flex-row items-center">
                <FontAwesome name="credit-card" size={20} color="white" />
                <Text className="text-white text-base font-bold ml-2">
                  Thanh toán
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-3 py-3 items-center"
              onPress={() => navigation.navigate("Products")}
            >
              <Text className="text-mint font-semibold">Tiếp tục mua sắm</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}
