import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useCart } from "../hooks/useCart";
import { useRemoveFromCart } from "../hooks/useRemoveFromCart";

export function CartScreen({ navigation }: any) {
  const { items, subtotal, isLoading, isError, refetch } = useCart();
  const removeFromCart = useRemoveFromCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert(
      "Remove Item",
      `Remove "${productName}" from cart?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeFromCart.mutate(productId, {
              onSuccess: () => {
                Alert.alert("Success", "Product removed from cart");
              },
              onError: (error: any) => {
                Alert.alert(
                  "Error",
                  error.response?.data?.message || "Failed to remove product"
                );
              },
            });
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert("Empty Cart", "Please add items to cart before checkout");
      return;
    }
    Alert.alert("Checkout", "Checkout feature coming soon");
  };

  const renderEmptyCart = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-32 h-32 rounded-full bg-beige/30 dark:bg-dark-border/30 items-center justify-center mb-6">
        <FontAwesome name="shopping-cart" size={64} color="#D1D5DB" />
      </View>
      <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">
        Your Cart is Empty
      </Text>
      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-8">
        Add products to your cart to see them here
      </Text>
      <TouchableOpacity
        className="px-8 py-4 rounded-full bg-mint dark:bg-gold"
        onPress={() => navigation.navigate("ProductsList")}
      >
        <Text className="text-white text-base font-bold">Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#ACD6B8" />
      <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
        Loading cart...
      </Text>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 items-center justify-center px-6">
      <FontAwesome name="exclamation-circle" size={64} color="#FF6B6B" />
      <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
        Something went wrong
      </Text>
      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
        Unable to load your cart
      </Text>
      <TouchableOpacity
        className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
        onPress={() => refetch()}
      >
        <Text className="text-white font-semibold">Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = ({ item, index }: { item: any; index: number }) => (
    <View className="bg-white dark:bg-dark-card rounded-2xl mb-4 overflow-hidden border border-beige/30 dark:border-dark-border/30">
      <View className="flex-row p-4">
        {/* Product Image */}
        <TouchableOpacity
          onPress={() => {
            if (item.productSlug) {
              navigation.navigate("ProductDetail", { slug: item.productSlug });
            }
          }}
          className="relative"
        >
          {item.productImage ? (
            <Image
              source={{ uri: item.productImage }}
              className="w-24 h-24 rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-24 h-24 rounded-xl bg-beige/30 dark:bg-dark-border/30 items-center justify-center">
              <FontAwesome name="image" size={32} color="#D1D5DB" />
            </View>
          )}
          {/* Index Badge */}
          <View className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-mint dark:bg-gold items-center justify-center">
            <Text className="text-white text-xs font-bold">{index + 1}</Text>
          </View>
        </TouchableOpacity>

        {/* Product Info */}
        <View className="flex-1 ml-4">
          <TouchableOpacity
            onPress={() => {
              if (item.productSlug) {
                navigation.navigate("ProductDetail", { slug: item.productSlug });
              }
            }}
          >
            <Text
              className="text-base font-bold text-light-text dark:text-dark-text mb-1"
              numberOfLines={2}
            >
              {item.productName}
            </Text>
          </TouchableOpacity>

          {/* Category */}
          {item.categoryName && (
            <View className="flex-row items-center mb-2">
              <View className="px-2 py-1 rounded bg-mint/10 dark:bg-gold/10">
                <Text className="text-mint dark:text-gold text-xs font-semibold">
                  {item.categoryName}
                </Text>
              </View>
            </View>
          )}

          {/* Price & Quantity */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-mint dark:text-gold">
                {formatPrice(item.unitPrice)}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                Quantity: {item.quantity}
              </Text>
            </View>

            {/* Subtotal */}
            <View className="items-end">
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Subtotal
              </Text>
              <Text className="text-base font-bold text-light-text dark:text-dark-text">
                {formatPrice(item.lineTotal)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row border-t border-beige/30 dark:border-dark-border/30">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center py-3 border-r border-beige/30 dark:border-dark-border/30"
          onPress={() => {
            Alert.alert("Update Quantity", "Update quantity feature coming soon");
          }}
        >
          <FontAwesome name="edit" size={16} color="#ACD6B8" />
          <Text className="text-mint dark:text-gold font-semibold ml-2">
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center py-3"
          onPress={() => handleRemoveItem(item.productId, item.productName)}
          disabled={removeFromCart.isPending}
        >
          {removeFromCart.isPending ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <>
              <FontAwesome name="trash-o" size={16} color="#FF6B6B" />
              <Text className="text-coral font-semibold ml-2">Remove</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-cream dark:bg-dark-background">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30"
        style={{ paddingTop: Platform.OS === "ios" ? 50 : 16 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
        >
          <FontAwesome name="arrow-left" size={18} color="#ACD6B8" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-light-text dark:text-dark-text">
            Shopping Cart
          </Text>
          {items.length > 0 && (
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              {items.length} {items.length === 1 ? "item" : "items"}
            </Text>
          )}
        </View>

        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
          onPress={() => refetch()}
        >
          <FontAwesome name="refresh" size={18} color="#ACD6B8" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        renderLoading()
      ) : isError ? (
        renderError()
      ) : items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.productId}
            contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom Summary */}
          <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30 px-6 py-4">
            {/* Summary Details */}
            <View className="mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                  Subtotal ({items.length} {items.length === 1 ? "item" : "items"})
                </Text>
                <Text className="text-light-text dark:text-dark-text font-semibold">
                  {formatPrice(subtotal)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                  Shipping
                </Text>
                <Text className="text-mint dark:text-gold font-semibold">
                  Free
                </Text>
              </View>
              <View className="h-px bg-beige/30 dark:bg-dark-border/30 my-2" />
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-light-text dark:text-dark-text">
                  Total
                </Text>
                <Text className="text-lg font-bold text-mint dark:text-gold">
                  {formatPrice(subtotal)}
                </Text>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              className="bg-mint dark:bg-gold rounded-full py-4 items-center"
              onPress={handleCheckout}
            >
              <View className="flex-row items-center">
                <FontAwesome name="credit-card" size={20} color="white" />
                <Text className="text-white text-base font-bold ml-2">
                  Proceed to Checkout
                </Text>
              </View>
            </TouchableOpacity>

            {/* Continue Shopping */}
            <TouchableOpacity
              className="mt-3 py-3 items-center"
              onPress={() => navigation.navigate("Products")}
            >
              <Text className="text-mint dark:text-gold font-semibold">
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}