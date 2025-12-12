import { ShopStackParamList } from "@/navigation/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProductDetail } from "../hooks/useProductDetail";

type Props = NativeStackScreenProps<ShopStackParamList, "ShopProductDetail">;

export const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId } = route.params;
  const { data, isLoading, isError } = useProductDetail(productId);
  const [showModal, setShowModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const statusConfig = {
    Draft: { color: "#F59E0B", bgColor: "#FFFBEB", icon: "edit", label: "Nháp" },
    Published: { color: "#10B981", bgColor: "#ECFDF5", icon: "check-circle", label: "Đã xuất bản" },
    OutOfStock: { color: "#EF4444", bgColor: "#FEF2F2", icon: "times-circle", label: "Hết hàng" },
    Archived: { color: "#6B7280", bgColor: "#F9FAFB", icon: "archive", label: "Đã lưu trữ" },
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background">
        <ActivityIndicator size="large" color="#ACD6B8" />
        <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
          Đang tải sản phẩm...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background px-6">
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="exclamation-triangle" size={40} color="#FF6B6B" />
          </View>
          <Text className="text-coral font-bold text-xl mb-2">Lỗi</Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
            Không thể tải thông tin sản phẩm
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const product = data;
  const currentStatus = statusConfig[product.status as keyof typeof statusConfig];

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  };

  return (
    <View className="flex-1 bg-cream dark:bg-dark-background">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30" style={{ paddingTop: 50 }}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-beige/30 dark:bg-dark-border/30 items-center justify-center"
          >
            <FontAwesome name="arrow-left" size={16} color="#4A5568" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-light-text dark:text-dark-text">
            Chi tiết sản phẩm
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View className="bg-white dark:bg-dark-card p-6">
          <View className="items-center">
            <Image
              source={{ uri: product.thumbnailUrl }}
              className="w-full h-80 rounded-2xl bg-beige/20"
              resizeMode="cover"
            />
            {/* Status Badge - Display Only */}
            <View 
              className="absolute top-4 right-4 flex-row items-center px-3 py-2 rounded-full"
              style={{ backgroundColor: currentStatus.bgColor }}
            >
              <FontAwesome 
                name={currentStatus.icon as any} 
                size={14} 
                color={currentStatus.color}
                style={{ marginRight: 6 }}
              />
              <Text 
                className="text-xs font-bold"
                style={{ color: currentStatus.color }}
              >
                {currentStatus.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Product Info */}
        <View className="px-6 pt-6">
          {/* Name & Price */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-2 leading-tight">
              {product.name}
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-3xl font-bold text-mint dark:text-gold">
                {product.price.toLocaleString()}
              </Text>
              <Text className="text-lg text-light-textSecondary dark:text-dark-textSecondary ml-2">₫</Text>
            </View>
          </View>

          {/* Stock & Status Info */}
          <View className="flex-row items-center justify-between bg-white dark:bg-dark-card rounded-xl p-4 mb-6 border border-beige/30 dark:border-dark-border/30">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3">
                <FontAwesome name="cubes" size={18} color="#ACD6B8" />
              </View>
              <View>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  Tồn kho
                </Text>
                <Text className="text-base font-bold text-light-text dark:text-dark-text">
                  {product.stock} sản phẩm
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Trạng thái
              </Text>
              <View 
                className="flex-row items-center px-2.5 py-1.5 rounded-full"
                style={{ backgroundColor: currentStatus.bgColor }}
              >
                <FontAwesome 
                  name={currentStatus.icon as any} 
                  size={11} 
                  color={currentStatus.color}
                  style={{ marginRight: 4 }}
                />
                <Text 
                  className="text-[11px] font-bold"
                  style={{ color: currentStatus.color }}
                >
                  {currentStatus.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Updated Info */}
          <View className="bg-white dark:bg-dark-card rounded-xl p-4 mb-6 border border-beige/30 dark:border-dark-border/30">
            <View className="flex-row items-center">
              <FontAwesome name="clock-o" size={14} color="#ACD6B8" style={{ marginRight: 8 }} />
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                Cập nhật lần cuối:{" "}
                <Text className="font-semibold text-light-text dark:text-dark-text">
                  {new Date(product.lastUpdatedAt).toLocaleString("vi-VN")}
                </Text>
              </Text>
            </View>
          </View>

          {/* Shop Info */}
          <View className="bg-white dark:bg-dark-card rounded-xl p-4 mb-6 border border-beige/30 dark:border-dark-border/30">
            <View className="flex-row items-center">
              <Image
                source={{ uri: product.shopAvatar }}
                className="w-16 h-16 rounded-full bg-beige/20 mr-4"
              />
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <FontAwesome name={'store' as any} size={14} color="#ACD6B8" style={{ marginRight: 6 }} />
                  <Text className="text-base font-bold text-light-text dark:text-dark-text">
                    {product.shopName}
                  </Text>
                </View>
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary" numberOfLines={2}>
                  {product.shopDescription}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="bg-white dark:bg-dark-card rounded-xl p-4 mb-6 border border-beige/30 dark:border-dark-border/30">
            <View className="flex-row items-center mb-3">
              <FontAwesome name="align-left" size={16} color="#ACD6B8" style={{ marginRight: 8 }} />
              <Text className="text-lg font-bold text-light-text dark:text-dark-text">
                Mô tả
              </Text>
            </View>
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary leading-6">
              {product.description || "Chưa có mô tả."}
            </Text>
          </View>

          {/* Product Images Gallery */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <FontAwesome name="image" size={16} color="#ACD6B8" style={{ marginRight: 8 }} />
                <Text className="text-lg font-bold text-light-text dark:text-dark-text">
                  Hình ảnh sản phẩm
                </Text>
              </View>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                {product.images.length} ảnh
              </Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 24 }}
            >
              {product.images.map((img, idx) => (
                <Pressable 
                  key={idx} 
                  onPress={() => openModal(idx)}
                  className="mr-3"
                >
                  <Image
                    source={{ uri: img.url }}
                    className="w-32 h-32 rounded-xl bg-beige/20 border-2 border-transparent"
                    style={{ 
                      borderColor: img.isPrimary ? "#ACD6B8" : "transparent"
                    }}
                  />
                  {img.isPrimary && (
                    <View className="absolute top-2 left-2 bg-mint dark:bg-gold px-2 py-1 rounded">
                      <Text className="text-white text-[10px] font-bold">Chính</Text>
                    </View>
                  )}
                  <View className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded">
                    <Text className="text-white text-[10px] font-bold">{idx + 1}/{product.images.length}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 bg-black">
          {/* Header */}
          <View className="pt-12 px-6 pb-4 flex-row items-center justify-between">
            <Text className="text-white text-lg font-bold">
              {selectedImageIndex + 1} / {product.images.length}
            </Text>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <FontAwesome name="times" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Image Viewer */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: selectedImageIndex * 400, y: 0 }}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / 400);
              setSelectedImageIndex(index);
            }}
          >
            {product.images.map((img, idx) => (
              <View key={idx} className="w-screen items-center justify-center">
                <Image
                  source={{ uri: img.url }}
                  className="w-11/12 h-96 rounded-2xl"
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Thumbnails */}
          <View className="pb-8 pt-4">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              {product.images.map((img, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setSelectedImageIndex(idx)}
                  className="mr-3"
                >
                  <Image
                    source={{ uri: img.url }}
                    className="w-16 h-16 rounded-lg"
                    style={{
                      borderWidth: 2,
                      borderColor: idx === selectedImageIndex ? "#ACD6B8" : "transparent",
                      opacity: idx === selectedImageIndex ? 1 : 0.5,
                    }}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};