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
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { useCreateProduct } from "../hooks/useCreateProduct";
import { useUploadFile } from "@/hooks/useUploadFile";
import { useProductCategories } from "@/hooks/useProductCategories";
import { ShopProductImage } from "../../../api/shopProducts";

export const CreateShopProductScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState<ShopProductImage[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const { mutate: createProduct, isPending } = useCreateProduct();
  const { uploadFile, isLoading: isUploading } = useUploadFile();
  const { data: categories, isLoading: isLoadingCategories } = useProductCategories();

  const pickAndUpload = async () => {
    try {
      const { status: permissionStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionStatus !== "granted") {
        Alert.alert("Yêu cầu quyền truy cập", "Vui lòng cho phép truy cập thư viện ảnh");
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
      if (!uploadedUrl) throw new Error("Tải ảnh thất bại");

      setImages((prev) => [
        ...prev,
        {
          url: uploadedUrl,
          orderIndex: prev.length,
          isPrimary: prev.length === 0,
        },
      ]);

      Alert.alert("Thành công", "Tải ảnh lên thành công!");
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Lỗi", err.message || "Không thể tải ảnh lên");
    }
  };

  const handleDeleteImage = (index: number) => {
    Alert.alert("Xóa ảnh", "Bạn có chắc chắn muốn xóa ảnh này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => setImages((prev) => prev.filter((_, i) => i !== index)),
      },
    ]);
  };

  const handleSubmit = () => {
    if (!name || !categoryId || !description || !price || !stock || images.length === 0) {
      Alert.alert("Lỗi xác thực", "Vui lòng điền đầy đủ các trường và thêm ít nhất một ảnh");
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
          Alert.alert("Thành công", "Tạo sản phẩm thành công!", [
            {
              text: "OK",
              onPress: () => {
                setName("");
                setCategoryId("");
                setCategoryName("");
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
          Alert.alert("Lỗi", error.message || "Không thể tạo sản phẩm");
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-beige/30 dark:bg-dark-border/30 items-center justify-center"
            >
              <FontAwesome name="arrow-left" size={16} color="#4A5568" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Tạo sản phẩm mới
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
              Tên sản phẩm <Text className="text-coral">*</Text>
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nhập tên sản phẩm"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige/30 dark:border-dark-border/30"
            />
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Mô tả <Text className="text-coral">*</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Nhập mô tả sản phẩm"
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
                Giá (₫) <Text className="text-coral">*</Text>
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
                Tồn kho <Text className="text-coral">*</Text>
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

          {/* Category Selector */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Danh mục <Text className="text-coral">*</Text>
            </Text>
            <TouchableOpacity
              className="bg-white dark:bg-dark-card px-4 py-3.5 rounded-xl border border-beige/30 dark:border-dark-border/30 flex-row items-center justify-between"
              onPress={() => setShowCategoryModal(true)}
              disabled={isPending || isLoadingCategories}
            >
              <Text
                className={`${
                  categoryName
                    ? "text-light-text dark:text-dark-text"
                    : "text-gray-400"
                }`}
              >
                {categoryName || "Chọn danh mục"}
              </Text>
              <FontAwesome name="chevron-down" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Status */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Trạng thái
            </Text>
            <View className="flex-row items-center px-3.5 py-2.5 rounded-lg bg-amber-50 border-1.5 border-amber-400 w-20">
              <FontAwesome name="edit" size={14} color="#F59E0B" style={{ marginRight: 6 }} />
              <Text className="text-xs font-semibold text-amber-600">Nháp</Text>
            </View>
          </View>

          {/* Images */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
              Hình ảnh sản phẩm <Text className="text-coral">*</Text>
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
                        <Text className="text-white text-[10px] font-bold">Chính</Text>
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
                    Thêm ảnh
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
                  Tạo sản phẩm
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-dark-card rounded-t-3xl max-h-[70%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-beige/50 dark:border-dark-border/50">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Chọn danh mục
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                className="w-8 h-8 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
              >
                <FontAwesome name="times" size={16} color="#4A5568" />
              </TouchableOpacity>
            </View>

            {/* Categories List */}
            {isLoadingCategories ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#ACD6B8" />
                <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
                  Đang tải danh mục...
                </Text>
              </View>
            ) : (
              <FlatList
                data={categories || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="px-6 py-4 border-b border-beige/30 dark:border-dark-border/30 active:bg-beige/20 dark:active:bg-dark-border/20"
                    onPress={() => {
                      setCategoryId(item.id);
                      setCategoryName(item.name);
                      setShowCategoryModal(false);
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-light-text dark:text-dark-text mb-1">
                          {item.name}
                        </Text>
                        {item.description && (
                          <Text
                            className="text-sm text-light-textSecondary dark:text-dark-textSecondary"
                            numberOfLines={1}
                          >
                            {item.description}
                          </Text>
                        )}
                      </View>
                      {categoryId === item.id && (
                        <FontAwesome name="check-circle" size={20} color="#ACD6B8" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View className="py-12 items-center">
                    <FontAwesome name="inbox" size={48} color="#D1D5DB" />
                    <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
                      Không có danh mục nào
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};