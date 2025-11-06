import React, { useState } from "react";
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
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { useCreateProduct } from "../hooks/useCreateProduct";
import { useUploadFile } from "@/hooks/useUploadFile";
import { ShopProductImage } from "../../../api/shopProducts";

export const CreateShopProductScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState<ShopProductImage[]>([]);

  const { mutate: createProduct, isPending } = useCreateProduct();
  const { uploadFile, isLoading: isUploading } = useUploadFile();

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
        type: asset.mimeType || "image/jpeg",
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
    Alert.alert("Delete Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setImages((prev) => prev.filter((_, i) => i !== index)),
      },
    ]);
  };

  const handleSubmit = () => {
    if (!name || !categoryId || !description || !price || !stock || images.length === 0) {
      Alert.alert("Validation Error", "Please fill in all fields and add at least one image");
      return;
    }

    createProduct(
      {
        name,
        categoryId,
        description,
        price: Number(price),
        stock: Number(stock),
        status: "Draft",
        images,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Product created successfully!", [
            {
              text: "OK",
              onPress: () => {
                setName("");
                setCategoryId("");
                setDescription("");
                setPrice("");
                setStock("");
                setImages([]);
                navigation.goBack();
              },
            },
          ]);
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message || "Failed to create product");
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-cream dark:bg-dark-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30" style={{ paddingTop: Platform.OS === 'ios' ? 50 : 16 }}>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-beige/30 dark:bg-dark-border/30 items-center justify-center"
            >
              <FontAwesome name="arrow-left" size={16} color="#4A5568" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Create Product
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
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Status
            </Text>
            <View className="flex-row items-center px-3.5 py-2.5 rounded-lg bg-amber-50 border-1.5 border-amber-400 w-24">
              <FontAwesome name="edit" size={14} color="#F59E0B" style={{ marginRight: 6 }} />
              <Text className="text-xs font-semibold text-amber-600">Draft</Text>
            </View>
          </View>

          {/* Images */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
              Product Images <Text className="text-coral">*</Text>
            </Text>
            
            {images.length > 0 && (
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
                        <Text className="text-white text-[10px] font-bold">Thumbnail</Text>
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
            )}

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

          {/* Create Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            className="bg-mint dark:bg-gold py-4 rounded-xl items-center justify-center active:opacity-80"
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <FontAwesome name="check" size={16} color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  Create Product
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};