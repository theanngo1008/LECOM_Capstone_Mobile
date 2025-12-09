import { useAddToCart } from "@/features/cart/hooks/useAddToCart";
import { useCart } from "@/features/cart/hooks/useCart";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useProductBySlug } from "../hooks/useProductBySlug";
import { useRecommendedProducts } from "../hooks/useRecommendedProducts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStartChat } from "@/features/chat/hooks/useStartChat";
import { useStartAIChat } from "@/features/chat/hooks/useStartAIChat";
import { FeedbackSection } from "./FeedbackSection";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProductsStackParamList } from "@/navigation/ProductsStackNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ✅ Type-safe props
type Props = NativeStackScreenProps<ProductsStackParamList, "ProductDetail">;

export function ProductDetailScreen({ navigation, route }: Props) {
  const { slug } = route.params;
  const { product, isLoading, isError, refetch } = useProductBySlug(slug);
  const { data: recommendedData, isLoading: isLoadingRecommended } =
    useRecommendedProducts(slug);
  const addToCart = useAddToCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const startChat = useStartChat();
  const startAIChat = useStartAIChat();

  // ✅ Lấy giỏ hàng để đếm số lượng
  const { items: cartShopGroups } = useCart();

  // ✅ Tính tổng số lượng sản phẩm từ tất cả shop
  const cartItemCount = cartShopGroups.reduce((total, shopGroup) => {
    const shopTotal = shopGroup.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    return total + shopTotal;
  }, 0);

  // ✅ Quantity Modal State
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const recommendedProducts = recommendedData?.result || [];

  const handleAskSeller = () => {
    if (!product?.id) {
      Alert.alert("Lỗi", "Thông tin sản phẩm không hợp lệ.");
      return;
    }

    startChat.mutate(
      { productId: product.id },
      {
        onSuccess: (res) => {
          const conversation = res.result;

          if (!conversation) {
            Alert.alert("Lỗi", "Không thể bắt đầu cuộc trò chuyện.");
            return;
          }

          // ✅ Navigate with type safety
          navigation.navigate("ChatDetail", {
            conversationId: conversation.id,
          });
        },
        onError: (err: any) => {
          Alert.alert(
            "Lỗi",
            err?.response?.data?.message ||
              "Không thể bắt đầu cuộc trò chuyện."
          );
        },
      }
    );
  };

  const handleAskAI = () => {
    if (!product?.id) {
      Alert.alert("Lỗi", "Thông tin sản phẩm không hợp lệ.");
      return;
    }

    startAIChat.mutate(
      { productId: product.id },
      {
        onSuccess: (res) => {
          const conversation = res.result;

          if (!conversation) {
            Alert.alert("Lỗi", "Không thể bắt đầu trò chuyện với AI.");
            return;
          }

          // ✅ Navigate with type safety
          navigation.navigate("ChatDetail", {
            conversationId: conversation.id,
            isAIChat: conversation.isAIChat,
          });
        },
        onError: (err: any) => {
          Alert.alert(
            "Lỗi",
            err?.response?.data?.message ||
              "Không thể bắt đầu trò chuyện với AI."
          );
        },
      }
    );
  };

  const renderLoading = () => (
    <View className="flex-1 bg-cream dark:bg-dark-background">
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ACD6B8" />
        <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
          Đang tải sản phẩm...
        </Text>
      </View>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 bg-cream dark:bg-dark-background">
      <View className="flex-1 items-center justify-center px-6">
        <FontAwesome name="exclamation-circle" size={64} color="#FF6B6B" />
        <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
          Đã xảy ra lỗi
        </Text>
        <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
          Không thể tải thông tin sản phẩm
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
          label: "Đang bán",
          icon: "check-circle",
        };
      case "Draft":
        return {
          bgColor: "bg-gray-500/90",
          textColor: "text-gray-600",
          label: "Nháp",
          icon: "pencil",
        };
      case "OutOfStock":
        return {
          bgColor: "bg-coral/90",
          textColor: "text-coral",
          label: "Hết hàng",
          icon: "ban",
        };
      case "Archived":
        return {
          bgColor: "bg-orange-500/90",
          textColor: "text-orange-600",
          label: "Đã lưu trữ",
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
      Alert.alert("Giới hạn kho", `Chỉ còn ${product.stock} sản phẩm`);
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
      Alert.alert("Giới hạn kho", `Chỉ còn ${product.stock} sản phẩm`);
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
      Alert.alert(
        "Không khả dụng",
        "Sản phẩm này không thể thêm vào giỏ hàng"
      );
      return;
    }

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
            "Thành công",
            `Đã thêm ${quantity} sản phẩm vào giỏ hàng`,
            [
              {
                text: "Tiếp tục mua",
                style: "cancel",
              },
              {
                text: "Xem giỏ hàng",
                onPress: () => navigation.navigate("CartMain"),
              },
            ]
          );
        },
        onError: (error: any) => {
          Alert.alert(
            "Lỗi",
            error.response?.data?.message || "Không thể thêm vào giỏ hàng"
          );
        },
      }
    );
  };

  // ✅ Navigate to recommended product
  const handleRecommendedProductPress = (recommendedSlug: string) => {
    navigation.push("ProductDetail", { slug: recommendedSlug });
  };
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
            <FontAwesome name="arrow-left" size={18} color="#ACD6B8" />
          </TouchableOpacity>

          <Text
            className="flex-1 text-xl font-bold text-light-text dark:text-dark-text text-center mx-4"
            numberOfLines={1}
          >
            Chi tiết sản phẩm
          </Text>

          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center relative"
            onPress={() => navigation.navigate("CartMain")}
          >
            <FontAwesome name="shopping-cart" size={18} color="#ACD6B8" />
            {/* ✅ Cart Badge */}
            {cartItemCount > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-coral items-center justify-center border-2 border-white dark:border-dark-card">
                <Text className="text-white text-[10px] font-bold">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </Text>
              </View>
            )}
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
            <View
              className={`absolute top-4 right-4 px-4 py-2 rounded-full ${statusConfig.bgColor}`}
            >
              <Text className="text-white text-xs font-bold">
                {statusConfig.label}
              </Text>
            </View>

            {/* Stock Warning Badges */}
            {product.status !== "OutOfStock" &&
              product.stock <= 10 &&
              product.stock > 0 && (
                <View className="absolute top-4 left-4 px-4 py-2 rounded-full bg-orange-500/90">
                  <Text className="text-white text-xs font-bold">
                    Chỉ còn {product.stock}
                  </Text>
                </View>
              )}

            {(product.status === "OutOfStock" || product.stock === 0) && (
              <View className="absolute top-4 left-4 px-4 py-2 rounded-full bg-coral/90">
                <Text className="text-white text-xs font-bold">Hết hàng</Text>
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

            {/* Actions: Ask Seller + Ask AI */}
            <View className="flex-row space-x-3 mb-4">
              <TouchableOpacity
                onPress={handleAskSeller}
                disabled={startChat.isPending}
                className="px-4 py-2 rounded-full bg-skyBlue/20 dark:bg-lavender/20 border border-skyBlue/40 dark:border-lavender/40 flex-row items-center"
              >
                {startChat.isPending ? (
                  <ActivityIndicator size="small" color="#87CEEB" />
                ) : (
                  <>
                    <FontAwesome name="comments" size={14} color="#87CEEB" />
                    <Text className="ml-2 text-skyBlue dark:text-lavender font-semibold text-sm">
                      Hỏi người bán
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAskAI}
                disabled={startAIChat.isPending}
                className="px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700 flex-row items-center"
              >
                {startAIChat.isPending ? (
                  <ActivityIndicator size="small" color="#C084FC" />
                ) : (
                  <>
                    <FontAwesome name="magic" size={14} color="#C084FC" />
                    <Text className="ml-2 text-purple-600 dark:text-purple-300 font-semibold text-sm">
                      Hỏi AI
                    </Text>
                  </>
                )}
              </TouchableOpacity>
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
                  Trong kho
                </Text>
              </View>

              <View className="flex-1 items-center border-r border-beige/30 dark:border-dark-border/30">
                <FontAwesome name="image" size={20} color="#ACD6B8" />
                <Text className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
                  {product.images?.length || 0}
                </Text>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                  Hình ảnh
                </Text>
              </View>

              <View className="flex-1 items-center">
                <FontAwesome
                  name={statusConfig.icon as any}
                  size={20}
                  color="#ACD6B8"
                />
                <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-2">
                  {statusConfig.label}
                </Text>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                  Trạng thái
                </Text>
              </View>
            </View>

            {/* Description */}
            <View className="bg-white dark:bg-dark-card rounded-2xl p-6 mb-6 border border-beige/30 dark:border-dark-border/30">
              <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-3">
                Mô tả
              </Text>
              <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary leading-6">
                {product.description || "Không có mô tả"}
              </Text>
            </View>

            {/* Shop Info */}
            <View className="bg-white dark:bg-dark-card rounded-2xl p-6 mb-6 border border-beige/30 dark:border-dark-border/30">
              <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
                Thông tin cửa hàng
              </Text>

              <View className="flex-row items-center">
                {product.shopAvatar ? (
                  <Image
                    source={{ uri: product.shopAvatar }}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                ) : (
                  <View className="w-16 h-16 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mr-4">
                    <FontAwesome
                      name={"store" as any}
                      size={24}
                      color="#ACD6B8"
                    />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
                    {product.shopName}
                  </Text>
                  <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                    {product.shopDescription || "Không có mô tả"}
                  </Text>
                </View>
              </View>
            </View>

            {/* ✨ FEEDBACK SECTION - Using Component */}
            <FeedbackSection productId={product.id} />

            {/* 🎯 RECOMMENDED PRODUCTS */}
            {!isLoadingRecommended && recommendedProducts.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text
                      className="text-lg font-bold text-light-text dark:text-dark-text"
                      numberOfLines={1}
                    >
                      Sản phẩm tương{"\u00A0"}tự
                    </Text>
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                      Có thể bạn sẽ thích
                    </Text>
                  </View>
                  <View className="w-8 h-8 rounded-full bg-skyBlue/10 dark:bg-lavender/10 items-center justify-center">
                    <FontAwesome name="heart" size={14} color="#7DD3FC" />
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 24 }}
                >
                  {recommendedProducts.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      className="mr-4 bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-beige/30 dark:border-dark-border/30 w-44"
                      onPress={() => handleRecommendedProductPress(item.slug)}
                    >
                      <Image
                        source={{ uri: item.thumbnailUrl }}
                        className="w-full h-40 bg-beige/20"
                        resizeMode="cover"
                      />
                      <View className="p-3">
                        <Text
                          className="text-sm font-bold text-light-text dark:text-dark-text mb-2"
                          numberOfLines={2}
                        >
                          {item.name}
                        </Text>
                        <View className="flex-row items-baseline mb-2">
                          <Text className="text-lg font-bold text-mint dark:text-gold">
                            {item.price.toLocaleString()}
                          </Text>
                          <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                            ₫
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          {item.shopAvatar ? (
                            <Image
                              source={{ uri: item.shopAvatar }}
                              className="w-5 h-5 rounded-full bg-beige/20 mr-2"
                            />
                          ) : (
                            <View className="w-5 h-5 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
                              <FontAwesome
                                name="shopping-bag"
                                size={8}
                                color="#ACD6B8"
                              />
                            </View>
                          )}
                          <Text
                            className="text-xs font-medium text-light-text dark:text-dark-text flex-1"
                            numberOfLines={1}
                          >
                            {item.shopName}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Product Details */}
            <View className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-beige/30 dark:border-dark-border/30">
              <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
                Chi tiết sản phẩm
              </Text>

              <View className="space-y-3">
                <View className="flex-row justify-between py-2 border-b border-beige/20 dark:border-dark-border/20">
                  <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                    Mã sản phẩm
                  </Text>
                  <Text
                    className="text-light-text dark:text-dark-text font-semibold"
                    numberOfLines={1}
                  >
                    {product.id.slice(0, 8)}...
                  </Text>
                </View>

                <View className="flex-row justify-between py-2 border-b border-beige/20 dark:border-dark-border/20">
                  <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                    Danh mục
                  </Text>
                  <Text className="text-light-text dark:text-dark-text font-semibold">
                    {product.categoryName}
                  </Text>
                </View>

                <View className="flex-row justify-between py-2 border-b border-beige/20 dark:border-dark-border/20">
                  <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                    Trạng thái
                  </Text>
                  <View className="flex-row items-center">
                    <FontAwesome
                      name={statusConfig.icon as any}
                      size={12}
                      color={
                        statusConfig.textColor.includes("mint")
                          ? "#ACD6B8"
                          : statusConfig.textColor.includes("coral")
                          ? "#FF6B6B"
                          : statusConfig.textColor.includes("orange")
                          ? "#F97316"
                          : "#9CA3AF"
                      }
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      className={`font-semibold ${statusConfig.textColor}`}
                    >
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                    Cập nhật lần cuối
                  </Text>
                  <Text className="text-light-text dark:text-dark-text font-semibold">
                    {new Date(product.lastUpdatedAt).toLocaleDateString(
                      "vi-VN"
                    )}
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
                Alert.alert("Danh sách yêu thích", "Tính năng sắp ra mắt");
              }}
            >
              <FontAwesome name="heart-o" size={20} color="#ACD6B8" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-3 bg-mint dark:bg-gold rounded-full py-4 items-center flex-row justify-center"
              onPress={handleAddToCart}
              disabled={
                product.status !== "Published" || product.stock === 0
              }
            >
              <FontAwesome name="shopping-cart" size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">
                {product.status === "OutOfStock" || product.stock === 0
                  ? "Hết hàng"
                  : product.status === "Published"
                  ? "Thêm vào giỏ"
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
                  Chọn số lượng
                </Text>
                <TouchableOpacity
                  onPress={() => setShowQuantityModal(false)}
                >
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
                  Số lượng
                </Text>
                <View className="flex-row items-center justify-between">
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

                  <TextInput
                    value={quantity.toString()}
                    onChangeText={handleQuantityInput}
                    keyboardType="number-pad"
                    className="flex-1 mx-4 text-center text-2xl font-bold text-light-text dark:text-dark-text bg-beige/30 dark:bg-dark-border/30 rounded-2xl py-3"
                    selectTextOnFocus
                  />

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
                      color={
                        quantity >= product.stock ? "#9CA3AF" : "#ACD6B8"
                      }
                    />
                  </TouchableOpacity>
                </View>

                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary text-center mt-3">
                  Còn lại: {product.stock} sản phẩm
                </Text>
              </View>

              {/* Total Price */}
              <View className="bg-beige/30 dark:bg-dark-border/30 rounded-2xl p-4 mb-6">
                <View className="flex-row justify-between items-center">
                  <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                    Tổng cộng
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
                    <FontAwesome
                      name="shopping-cart"
                      size={20}
                      color="white"
                    />
                    <Text className="text-white text-base font-bold ml-2">
                      Thêm {quantity} vào giỏ
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}