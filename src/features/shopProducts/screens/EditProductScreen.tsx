import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useProductDetail } from "../hooks/useProductDetail";
import { useUpdateProduct } from "../hooks/useUpdateProduct";
import { useUploadFile } from "@/hooks/useUploadFile";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ShopStackParamList } from "@/navigation/ShopStackNavigator";
import { ShopProductImage } from "../../../api/shopProducts";

type Props = NativeStackScreenProps<ShopStackParamList, "EditShopProduct">;

export const EditProductScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId } = route.params;
  const { data, isLoading, isError, refetch } = useProductDetail(productId);
  const { mutate: updateProduct, isPending } = useUpdateProduct();
  const { uploadFile, isLoading: isUploading } = useUploadFile();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published" | "OutOfStock" | "Archived">("Draft");
  const [images, setImages] = useState<ShopProductImage[]>([]);

  const statusOptions = [
    { value: "Draft", label: "Draft", color: "#F59E0B", bgColor: "#FFFBEB", icon: "edit" },
    { value: "Published", label: "Published", color: "#10B981", bgColor: "#ECFDF5", icon: "check-circle" },
    { value: "OutOfStock", label: "Out of Stock", color: "#EF4444", bgColor: "#FEF2F2", icon: "times-circle" },
    { value: "Archived", label: "Archived", color: "#6B7280", bgColor: "#F9FAFB", icon: "archive" },
  ] as const;

  useEffect(() => {
    if (data) {
      setName(data.name);
      setDescription(data.description);
      setPrice(data.price.toString());
      setStock(data.stock.toString());
      setCategoryId(data.categoryId);
      setStatus(data.status);
      setImages(data.images);
    }
  }, [data]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background" edges={['bottom']}>
        <ActivityIndicator size="large" color="#ACD6B8" />
        <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
          Loading product...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background px-6" edges={['bottom']}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="exclamation-triangle" size={40} color="#FF6B6B" />
          </View>
          <Text className="text-coral font-bold text-xl mb-2">Error</Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
            Failed to load product details
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const pickAndUpload = async () => {
    try {
      const { status: permissionStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionStatus !== "granted") {
        Alert.alert("Permission required", "Please allow access to your photos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      const file: any = {
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.type ? `image/${asset.type}` : "image/jpeg",
      };

      const uploaded = await uploadFile(file, "image");
      const uploadedUrl = typeof uploaded === "string" ? uploaded : uploaded?.url;
      if (!uploadedUrl) throw new Error("Upload failed");

      setImages((prev) => [
        ...prev,
        {
          url: uploadedUrl,
          orderIndex: prev.length,
          isPrimary: prev.length === 0,
        },
      ]);
      Alert.alert("Success", "Image uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Error", err.message || "Failed to upload image");
    }
  };

  const handleDeleteImage = (index: number) => {
    Alert.alert(
      "Delete Image",
      "Are you sure you want to remove this image?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setImages((prev) => prev.filter((_, i) => i !== index)),
        },
      ]
    );
  };

  const handleSubmit = () => {
    if (!name || !categoryId || !description || !price || !stock) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    updateProduct(
      {
        productId,
        payload: {
          name,
          description,
          price: Number(price),
          stock: Number(stock),
          categoryId,
          status,
          images,
        },
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Product updated successfully!", [
            {
              text: "OK",
              onPress: () => {
                refetch();
                navigation.goBack();
              },
            },
          ]);
        },
        onError: (err: any) => Alert.alert("Error", err.message || "Update failed"),
      }
    );
  };

  return (
    <View className="flex-1 bg-cream dark:bg-dark-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header - No SafeAreaView here */}
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30" style={{ paddingTop: Platform.OS === 'ios' ? 50 : 16 }}>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-beige/30 dark:bg-dark-border/30 items-center justify-center"
            >
              <FontAwesome name="arrow-left" size={16} color="#4A5568" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Edit Product
            </Text>
            <View className="w-10" />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Name */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Product Name <Text className="text-coral">*</Text>
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter product name"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige/30 dark:border-dark-border/30"
            />
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Description <Text className="text-coral">*</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter product description"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige/30 dark:border-dark-border/30"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Price & Stock */}
          <View className="flex-row gap-3 mb-5">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                Price (₫) <Text className="text-coral">*</Text>
              </Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige/30 dark:border-dark-border/30"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                Stock <Text className="text-coral">*</Text>
              </Text>
              <TextInput
                value={stock}
                onChangeText={setStock}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige/30 dark:border-dark-border/30"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Category ID */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Category ID <Text className="text-coral">*</Text>
            </Text>
            <TextInput
              value={categoryId}
              onChangeText={setCategoryId}
              placeholder="e.g., cfood"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige/30 dark:border-dark-border/30"
            />
          </View>

          {/* Status */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
              Status <Text className="text-coral">*</Text>
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {statusOptions.map((option) => {
                const isSelected = status === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setStatus(option.value)}
                    className="flex-row items-center px-3.5 py-2.5 rounded-lg"
                    style={{
                      backgroundColor: isSelected ? option.bgColor : "#F3F4F6",
                      borderWidth: 1.5,
                      borderColor: isSelected ? option.color : "transparent",
                    }}
                  >
                    <FontAwesome
                      name={option.icon as any}
                      size={14}
                      color={isSelected ? option.color : "#9CA3AF"}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: isSelected ? option.color : "#6B7280" }}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Images */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
              Product Images
            </Text>
            <View className="flex-row flex-wrap gap-3 mb-3">
              {images.map((img, idx) => (
                <View key={idx} className="relative">
                  <Image
                    source={{ uri: img.url }}
                    className="w-24 h-24 rounded-xl bg-beige/20"
                    resizeMode="cover"
                  />
                  {img.isPrimary && (
                    <View className="absolute top-1 left-1 bg-mint dark:bg-gold px-2 py-0.5 rounded">
                      <Text className="text-white text-[10px] font-bold">Primary</Text>
                    </View>
                  )}
                  <Pressable
                    onPress={() => handleDeleteImage(idx)}
                    className="absolute -top-1.5 -right-1.5 bg-coral rounded-full w-6 h-6 items-center justify-center"
                  >
                    <FontAwesome name="times" size={12} color="white" />
                  </Pressable>
                </View>
              ))}
            </View>

            <Pressable
              onPress={pickAndUpload}
              disabled={isUploading}
              className="border-2 border-dashed border-beige dark:border-dark-border rounded-xl p-4 items-center justify-center bg-white dark:bg-dark-card"
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#ACD6B8" />
              ) : (
                <View className="items-center">
                  <FontAwesome name="plus-circle" size={32} color="#ACD6B8" />
                  <Text className="text-mint dark:text-gold font-semibold mt-2">
                    Add Image
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            className="bg-mint dark:bg-gold py-4 rounded-xl items-center justify-center active:opacity-80"
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <FontAwesome name="save" size={16} color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  Update Product
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};