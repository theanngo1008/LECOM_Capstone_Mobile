import { useAddToCart } from "@/features/cart/hooks/useAddToCart";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useProductBySlug } from "../hooks/useProductBySlug";

export function ProductDetailScreen({ navigation, route }: any) {
  const { slug } = route.params;
  const { product, isLoading, isError, refetch } = useProductBySlug(slug);
  const addToCart = useAddToCart();
  const [selectedImage, setSelectedImage] = useState(0);
  
  // ✅ Quantity Modal State
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const renderLoading = () => (
    <View className="flex-1 bg-cream dark:bg-dark-background">
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ACD6B8" />
        <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
          Loading product...
        </Text>
      </View>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 bg-cream dark:bg-dark-background">
      <View className="flex-1 items-center justify-center px-6">
        <FontAwesome name="exclamation-circle" size={64} color="#FF6B6B" />
        <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
          Something went wrong
        </Text>
        <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
          Unable to load product information
        </Text>
        <View className="flex-row space-x-4">
          <TouchableOpacity
            className="px-6 py-3 rounded-full bg-beige/50 dark:bg-dark-border/50"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-light-text dark:text-dark-text font-semibold">
              Go Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) return renderLoading();
  if (isError || !product) return renderError();

  const images = [
    product.thumbnailUrl,
    ...(product.images?.map((img) => img.url) || []),
  ].filter(Boolean);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Published":
        return {
          bgColor: "bg-mint/90 dark:bg-gold/90",
          textColor: "text-mint dark:text-gold",
          label: "Published",
          icon: "check-circle",
        };
      case "Draft":
        return {
          bgColor: "bg-gray-500/90",
          textColor: "text-gray-600",
          label: "Draft",
          icon: "pencil",
        };
      case "OutOfStock":
        return {
          bgColor: "bg-coral/90",
          textColor: "text-coral",
          label: "Out of Stock",
          icon: "ban",
        };
      case "Archived":
        return {
          bgColor: "bg-orange-500/90",
          textColor: "text-orange-600",
          label: "Archived",
          icon: "archive",
        };
      default:
        return {
          bgColor: "bg-gray-500/90",
          textColor: "text-gray-600",
          label: status,
          icon: "info-circle",
        };
    }
  };

  const statusConfig = getStatusConfig(product.status);

  // ✅ Handle Quantity Changes
  const handleIncreaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      Alert.alert("Stock Limit", `Only ${product.stock} items available`);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityInput = (text: string) => {
    const value = parseInt(text) || 1;
    if (value > product.stock) {
      Alert.alert("Stock Limit", `Only ${product.stock} items available`);
      setQuantity(product.stock);
    } else if (value < 1) {
      setQuantity(1);
    } else {
      setQuantity(value);
    }
  };

  // ✅ Handle Add to Cart
  const handleAddToCart = () => {
    if (product.status !== "Published" || product.stock === 0) {
      Alert.alert("Unavailable", "This product cannot be added to cart");
      return;
    }

    // Reset quantity và show modal
    setQuantity(1);
    setShowQuantityModal(true);
  };

  // ✅ Confirm Add to Cart
  const confirmAddToCart = () => {
    addToCart.mutate(
      {
        productId: product.id,
        quantity: quantity,
      },
      {
        onSuccess: () => {
          setShowQuantityModal(false);
          Alert.alert(
            "Success",
            `Added ${quantity} ${quantity === 1 ? "item" : "items"} to cart`,
            [
              {
                text: "Continue Shopping",
                style: "cancel",
              },
              {
                text: "View Cart",
                onPress: () => navigation.navigate("CartMain"),
              },
            ]
          );
        },
        onError: (error: any) => {
          Alert.alert(
            "Error",
            error.response?.data?.message || "Failed to add to cart"
          );
        },
      }
    );
  };

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

        <Text
          className="flex-1 text-xl font-bold text-light-text dark:text-dark-text text-center mx-4"
          numberOfLines={1}
        >
          Product Details
        </Text>

        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
          onPress={() => navigation.navigate("Cart")}
        >
          <FontAwesome name="shopping-cart" size={18} color="#ACD6B8" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View className="bg-white dark:bg-dark-card">
          {images.length > 0 ? (
            <>
              <Image
                source={{ uri: images[selectedImage] }}
                className="w-full h-96"
                resizeMode="cover"
              />
              {images.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="px-4 py-4"
                >
                  {images.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedImage(index)}
                      className={`mr-3 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index
                          ? "border-mint dark:border-gold"
                          : "border-beige/30 dark:border-dark-border/30"
                      }`}
                    >
                      <Image
                        source={{ uri: img }}
                        className="w-20 h-20"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View className="w-full h-96 bg-gradient-to-br from-mint to-skyBlue dark:from-gold dark:to-lavender items-center justify-center">
              <FontAwesome name="image" size={64} color="white" />
            </View>
          )}

          {/* Status Badge */}
          <View className={`absolute top-4 right-4 px-4 py-2 rounded-full ${statusConfig.bgColor}`}>
            <Text className="text-white text-xs font-bold">{statusConfig.label}</Text>
          </View>

          {/* Stock Warning Badges */}
          {product.status !== "OutOfStock" && product.stock <= 10 && product.stock > 0 && (
            <View className="absolute top-4 left-4 px-4 py-2 rounded-full bg-orange-500/90">
              <Text className="text-white text-xs font-bold">
                Only {product.stock} left
              </Text>
            </View>
          )}

          {(product.status === "OutOfStock" || product.stock === 0) && (
            <View className="absolute top-4 left-4 px-4 py-2 rounded-full bg-coral/90">
              <Text className="text-white text-xs font-bold">Out of Stock</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="px-6 py-6">
          {/* Category */}
          <View className="flex-row items-center mb-4">
            <View className="px-3 py-1 rounded-full bg-mint/10 dark:bg-gold/10">
              <Text className="text-mint dark:text-gold text-xs font-semibold">
                {product.categoryName}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">
            {product.name}
          </Text>

          {/* Price */}
          <View className="flex-row items-center mb-4">
            <Text className="text-3xl font-bold text-mint dark:text-gold">
              {formatPrice(product.price)}
            </Text>
          </View>

          {/* Stats */}
          <View className="flex-row bg-white dark:bg-dark-card rounded-2xl p-4 mb-6 border border-beige/30 dark:border-dark-border/30">
            <View className="flex-1 items-center border-r border-beige/30 dark:border-dark-border/30">
              <FontAwesome name="cubes" size={20} color="#ACD6B8" />
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
                {product.stock}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                In Stock
              </Text>
            </View>

            <View className="flex-1 items-center border-r border-beige/30 dark:border-dark-border/30">
              <FontAwesome name="image" size={20} color="#ACD6B8" />
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
                {product.images?.length || 0}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                Images
              </Text>
            </View>

            <View className="flex-1 items-center">
              <FontAwesome name={statusConfig.icon as any} size={20} color="#ACD6B8" />
              <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-2">
                {statusConfig.label}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                Status
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="bg-white dark:bg-dark-card rounded-2xl p-6 mb-6 border border-beige/30 dark:border-dark-border/30">
            <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-3">
              Description
            </Text>
            <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary leading-6">
              {product.description || "No description available"}
            </Text>
          </View>

          {/* Shop Info */}
          <View className="bg-white dark:bg-dark-card rounded-2xl p-6 mb-6 border border-beige/30 dark:border-dark-border/30">
            <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
              Shop Information
            </Text>
            <View className="flex-row items-center">
              {product.shopAvatar ? (
                <Image
                  source={{ uri: product.shopAvatar }}
                  className="w-16 h-16 rounded-full mr-4"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mr-4">
                  <FontAwesome name={"store" as any} size={24} color="#ACD6B8" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
                  {product.shopName}
                </Text>
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  {product.shopDescription || "No description"}
                </Text>
              </View>
            </View>
          </View>

          {/* Product Details */}
          <View className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-beige/30 dark:border-dark-border/30">
            <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
              Product Details
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between py-2 border-b border-beige/20 dark:border-dark-border/20">
                <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                  Product ID
                </Text>
                <Text className="text-light-text dark:text-dark-text font-semibold" numberOfLines={1}>
                  {product.id.slice(0, 8)}...
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-beige/20 dark:border-dark-border/20">
                <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                  Slug
                </Text>
                <Text className="text-light-text dark:text-dark-text font-semibold">
                  {product.slug}
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-beige/20 dark:border-dark-border/20">
                <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                  Category
                </Text>
                <Text className="text-light-text dark:text-dark-text font-semibold">
                  {product.categoryName}
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-beige/20 dark:border-dark-border/20">
                <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                  Status
                </Text>
                <View className="flex-row items-center">
                  <FontAwesome 
                    name={statusConfig.icon as any} 
                    size={12} 
                    color={statusConfig.textColor.includes("mint") ? "#ACD6B8" : 
                           statusConfig.textColor.includes("coral") ? "#FF6B6B" :
                           statusConfig.textColor.includes("orange") ? "#F97316" : "#9CA3AF"}
                    style={{ marginRight: 4 }}
                  />
                  <Text className={`font-semibold ${statusConfig.textColor}`}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between py-2">
                <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                  Last Updated
                </Text>
                <Text className="text-light-text dark:text-dark-text font-semibold">
                  {new Date(product.lastUpdatedAt).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className="flex-1 bg-beige/50 dark:bg-dark-border/50 rounded-full py-4 items-center"
            onPress={() => {
              Alert.alert("Wishlist", "Add to wishlist feature coming soon");
            }}
          >
            <FontAwesome name="heart-o" size={20} color="#ACD6B8" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-3 bg-mint dark:bg-gold rounded-full py-4 items-center flex-row justify-center"
            onPress={handleAddToCart}
            disabled={product.status !== "Published" || product.stock === 0}
          >
            <FontAwesome name="shopping-cart" size={20} color="white" />
            <Text className="text-white text-base font-bold ml-2">
              {product.status === "OutOfStock" || product.stock === 0
                ? "Out of Stock"
                : product.status === "Published"
                ? "Add to Cart"
                : statusConfig.label}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ✅ Quantity Modal */}
      <Modal
        visible={showQuantityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuantityModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-dark-card rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Select Quantity
              </Text>
              <TouchableOpacity onPress={() => setShowQuantityModal(false)}>
                <FontAwesome name="times" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Product Info */}
            <View className="flex-row items-center mb-6 pb-6 border-b border-beige/30 dark:border-dark-border/30">
              <Image
                source={{ uri: product.thumbnailUrl }}
                className="w-20 h-20 rounded-xl"
                resizeMode="cover"
              />
              <View className="flex-1 ml-4">
                <Text
                  className="text-base font-bold text-light-text dark:text-dark-text mb-1"
                  numberOfLines={2}
                >
                  {product.name}
                </Text>
                <Text className="text-lg font-bold text-mint dark:text-gold">
                  {formatPrice(product.price)}
                </Text>
              </View>
            </View>

            {/* Quantity Selector */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
                Quantity
              </Text>
              <View className="flex-row items-center justify-between">
                {/* Decrease Button */}
                <TouchableOpacity
                  className={`w-14 h-14 rounded-full items-center justify-center ${
                    quantity === 1
                      ? "bg-gray-200 dark:bg-gray-700"
                      : "bg-mint/20 dark:bg-gold/20"
                  }`}
                  onPress={handleDecreaseQuantity}
                  disabled={quantity === 1}
                >
                  <FontAwesome
                    name="minus"
                    size={20}
                    color={quantity === 1 ? "#9CA3AF" : "#ACD6B8"}
                  />
                </TouchableOpacity>

                {/* Quantity Input */}
                <TextInput
                  value={quantity.toString()}
                  onChangeText={handleQuantityInput}
                  keyboardType="number-pad"
                  className="flex-1 mx-4 text-center text-2xl font-bold text-light-text dark:text-dark-text bg-beige/30 dark:bg-dark-border/30 rounded-2xl py-3"
                  selectTextOnFocus
                />

                {/* Increase Button */}
                <TouchableOpacity
                  className={`w-14 h-14 rounded-full items-center justify-center ${
                    quantity >= product.stock
                      ? "bg-gray-200 dark:bg-gray-700"
                      : "bg-mint/20 dark:bg-gold/20"
                  }`}
                  onPress={handleIncreaseQuantity}
                  disabled={quantity >= product.stock}
                >
                  <FontAwesome
                    name="plus"
                    size={20}
                    color={quantity >= product.stock ? "#9CA3AF" : "#ACD6B8"}
                  />
                </TouchableOpacity>
              </View>

              {/* Stock Info */}
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary text-center mt-3">
                Available: {product.stock} {product.stock === 1 ? "item" : "items"}
              </Text>
            </View>

            {/* Total Price */}
            <View className="bg-beige/30 dark:bg-dark-border/30 rounded-2xl p-4 mb-6">
              <View className="flex-row justify-between items-center">
                <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                  Total Price
                </Text>
                <Text className="text-2xl font-bold text-mint dark:text-gold">
                  {formatPrice(product.price * quantity)}
                </Text>
              </View>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary text-right mt-1">
                {quantity} × {formatPrice(product.price)}
              </Text>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              className="bg-mint dark:bg-gold rounded-full py-4 items-center flex-row justify-center"
              onPress={confirmAddToCart}
              disabled={addToCart.isPending}
            >
              {addToCart.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <FontAwesome name="shopping-cart" size={20} color="white" />
                  <Text className="text-white text-base font-bold ml-2">
                    Add {quantity} to Cart
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}