import { useCourseCategories } from "@/hooks/useCourseCategories";
import { useUploadFile } from "@/hooks/useUploadFile";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCreateCourse } from "../hooks/useCreateCourse";

export const CreateShopCourseScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const { mutate: createCourse, isPending } = useCreateCourse();
  const { uploadFile, isLoading: isUploading } = useUploadFile();
  const { data: categories, isLoading: isLoadingCategories } = useCourseCategories();

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const pickAndUploadThumbnail = async () => {
    try {
      const { status: permissionStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionStatus !== "granted") {
        Alert.alert("Cần quyền truy cập", "Vui lòng cho phép truy cập ảnh của bạn");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const file: any = {
        uri: asset.uri,
        name: asset.fileName || `thumbnail_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      };

      const uploaded = await uploadFile(file, "image");
      const uploadedUrl = typeof uploaded === "string" ? uploaded : uploaded?.url;
      if (!uploadedUrl) throw new Error("Upload failed");

      setCourseThumbnail(uploadedUrl);
      Alert.alert("Thành công", "Tải hình ảnh đại diện lên thành công!");
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Lỗi", err.message || "Không thể tải hình ảnh đại diện lên");
    }
  };

  const handleSubmit = () => {
    if (!title || !summary || !categoryId || !courseThumbnail) {
      Alert.alert("Lỗi xác thực", "Vui lòng điền đầy đủ các trường và tải hình ảnh đại diện lên");
      return;
    }

    const slug = generateSlug(title);

    createCourse(
      {
        title,
        slug,
        summary,
        categoryId,
        shopId: 0,
        courseThumbnail,
      },
      {
        onSuccess: () => {
          Alert.alert("Thành công", "Tạo khóa học thành công!", [
            {
              text: "OK",
              onPress: () => {
                setTitle("");
                setSummary("");
                setCategoryId("");
                setCategoryName("");
                setCourseThumbnail("");
                navigation.goBack();
              },
            },
          ]);
        },
        onError: (error: any) => {
          Alert.alert("Lỗi", error.message || "Không thể tạo khóa học");
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
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
              Tạo khóa học
            </Text>
            <View className="w-10" />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Course Title */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Tiêu đề khóa học <Text className="text-coral">*</Text>
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Nhập tiêu đề khóa học"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige/30 dark:border-dark-border/30"
            />
          </View>

          {/* Summary */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Tóm tắt <Text className="text-coral">*</Text>
            </Text>
            <TextInput
              value={summary}
              onChangeText={setSummary}
              placeholder="Nhập tóm tắt khóa học"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige/30 dark:border-dark-border/30"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* ✅ Category Selector */}
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

          {/* Course Thumbnail */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
              Hình ảnh đại diện <Text className="text-coral">*</Text>
            </Text>
            
            {courseThumbnail ? (
              <View className="relative">
                <Image
                  source={{ uri: courseThumbnail }}
                  className="w-full aspect-square rounded-xl bg-beige/20"
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => setCourseThumbnail("")}
                  className="absolute top-3 right-3 bg-coral rounded-full w-8 h-8 items-center justify-center"
                >
                  <FontAwesome name="times" size={14} color="white" />
                </Pressable>
                <View className="absolute bottom-3 left-3 bg-mint dark:bg-gold px-3 py-1 rounded-lg">
                  <Text className="text-white text-xs font-bold">1:1</Text>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={pickAndUploadThumbnail}
                disabled={isUploading}
                className="border-2 border-dashed border-beige dark:border-dark-border rounded-xl p-8 items-center justify-center bg-white dark:bg-dark-card aspect-square"
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#ACD6B8" />
                ) : (
                  <View className="items-center">
                    <FontAwesome name="image" size={40} color="#ACD6B8" />
                    <Text className="text-mint dark:text-gold font-semibold mt-3">
                      Tải hình ảnh đại diện lên
                    </Text>
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                      Khuyến nghị: Hình vuông (1:1)
                    </Text>
                  </View>
                )}
              </Pressable>
            )}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending || isUploading}
            className="bg-mint dark:bg-gold py-4 rounded-xl items-center justify-center active:opacity-80"
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <FontAwesome name="check" size={16} color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  Tạo khóa học
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ✅ Category Modal */}
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