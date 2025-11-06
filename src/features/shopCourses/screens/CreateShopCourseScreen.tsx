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
import * as ImagePicker from "expo-image-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { useCreateCourse } from "../hooks/useCreateCourse";
import { useUploadFile } from "@/hooks/useUploadFile";

export const CreateShopCourseScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState("");

  const { mutate: createCourse, isPending } = useCreateCourse();
  const { uploadFile, isLoading: isUploading } = useUploadFile();

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
        Alert.alert("Permission required", "Please allow access to your photos");
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
      Alert.alert("Success", "Thumbnail uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Error", err.message || "Failed to upload thumbnail");
    }
  };

  const handleSubmit = () => {
    if (!title || !summary || !categoryId || !courseThumbnail) {
      Alert.alert("Validation Error", "Please fill in all fields and upload a thumbnail");
      return;
    }

    const slug = generateSlug(title);

    createCourse(
      {
        title,
        slug, // Temporary placeholder
        summary,
        categoryId,
        shopId: 0, // Default value
        courseThumbnail,
      },
      {
        onSuccess: () => {
          setTitle("");
          setSummary("");
          setCategoryId("");
          setCourseThumbnail("");
          navigation.goBack();
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
              Create Course
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
              Course Title <Text className="text-coral">*</Text>
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter course title"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige/30 dark:border-dark-border/30"
            />
          </View>

          {/* Summary */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Summary <Text className="text-coral">*</Text>
            </Text>
            <TextInput
              value={summary}
              onChangeText={setSummary}
              placeholder="Enter course summary"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige/30 dark:border-dark-border/30"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category ID */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Category ID <Text className="text-coral">*</Text>
            </Text>
            <TextInput
              value={categoryId}
              onChangeText={setCategoryId}
              placeholder="e.g., cprogramming"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige/30 dark:border-dark-border/30"
            />
          </View>

          {/* Course Thumbnail */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
              Course Thumbnail <Text className="text-coral">*</Text>
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
                      Upload Thumbnail
                    </Text>
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                      Recommended: Square (1:1)
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
                  Create Course
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};