import { CourseLesson, CourseSection } from "@/api/shopCourses";
import { useCourseCategories } from "@/hooks/useCourseCategories";
import { useUploadFile } from "@/hooks/useUploadFile";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQueryClient } from "@tanstack/react-query";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useShopProducts } from "../../shopProducts/hooks/useShopProducts";
import { useCreateLesson } from "../hooks/useCreateLesson";
import { useCreateSection } from "../hooks/useCreateSection";
import { useDeleteCourse } from "../hooks/useDeleteCourse";
import { useDeleteLesson } from "../hooks/useDeleteLesson";
import { useDeleteSection } from "../hooks/useDeleteSection";
import { useLinkProductToLesson } from "../hooks/useLinkProductToLesson";
import { useShopCourseDetail } from "../hooks/useShopCourseDetail";
import { useUpdateCourse } from "../hooks/useUpdateCourse";

export function ShopCourseDetailScreen({ navigation, route }: any) {
  const { courseId } = route.params;
  const queryClient = useQueryClient();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const { course, sections, isLoading, isError } = useShopCourseDetail(courseId);
  const { data: categories, isLoading: isCategoriesLoading } = useCourseCategories();
  const { data: productsData, isLoading: isProductsLoading } = useShopProducts();
  const createSection = useCreateSection();
  const createLesson = useCreateLesson();
  const deleteLesson = useDeleteLesson(courseId);
  const deleteSection = useDeleteSection(courseId);
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const { uploadFile, isLoading: isUploading } = useUploadFile();
  const linkProductMutation = useLinkProductToLesson(courseId);

  const products = productsData?.result || [];

  // Section modal
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // Lesson modal
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState<number>(0);

  // Edit Course Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  const [editActive, setEditActive] = useState(1);
  const [editCategoryId, setEditCategoryId] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // 🆕 Product Link Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  console.log("📚 Shop Course Detail:", { course, sections, isLoading, isError });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatPrice = (price: number) =>
    `${new Intl.NumberFormat("vi-VN").format(price)}₫`;

  const getTotalLessons = () => {
    if (!sections) return 0;
    return sections.reduce((total, section) => total + section.lessons.length, 0);
  };

  const getTotalDuration = () => {
    if (!sections) return 0;
    return sections.reduce(
      (total, section) =>
        total +
        section.lessons.reduce((sum, lesson) => sum + lesson.durationSeconds, 0),
      0
    );
  };

  const getVideoDuration = async (uri: string): Promise<number> => {
    try {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );

      if (status.isLoaded && status.durationMillis) {
        const durationSeconds = Math.floor(status.durationMillis / 1000);
        console.log("📹 Video duration:", durationSeconds, "seconds");

        await sound.unloadAsync();
        return durationSeconds;
      }

      return 0;
    } catch (error) {
      console.error("❌ Error getting video duration:", error);
      return 0;
    }
  };

  const pickAndUploadVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      if (asset.size && asset.size > 10 * 1024 * 1024) {
        Alert.alert(
          "File Too Large",
          "Please select a video smaller than 10MB."
        );
        return;
      }

      const file: any = {
        uri: asset.uri,
        name: asset.name || `video_${Date.now()}.mp4`,
        type: asset.mimeType || "video/mp4",
      };

      console.log("📹 Getting video duration...");
      const duration = await getVideoDuration(asset.uri);
      setVideoDuration(duration);
      console.log("✅ Duration set:", duration);

      Alert.alert("Uploading", "Please wait while the video is being uploaded...");
      const uploaded = await uploadFile(file, "video");
      const uploadedUrl = typeof uploaded === "string" ? uploaded : uploaded?.url;
      if (!uploadedUrl) throw new Error("Upload failed");

      setLessonVideoUrl(uploadedUrl);
      Alert.alert(
        "Success",
        `Video uploaded successfully! Duration: ${formatDuration(duration)}`
      );
    } catch (err: any) {
      console.error("Upload error:", err);

      if (err.message?.includes("413") || err.status === 413) {
        Alert.alert(
          "File Too Large",
          "The video file is too large for the server. Please select a smaller file."
        );
      } else {
        Alert.alert("Error", err.message || "Failed to upload video");
      }
    }
  };

  const pickAndUploadThumbnail = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled) return;

      const file: any = {
        uri: result.assets[0].uri,
        name: `thumbnail_${Date.now()}.jpg`,
        type: "image/jpeg",
      };

      Alert.alert("Uploading", "Uploading thumbnail...");
      const uploaded = await uploadFile(file, "image");
      const uploadedUrl = typeof uploaded === "string" ? uploaded : uploaded?.url;

      if (!uploadedUrl) throw new Error("Upload failed");

      setEditThumbnail(uploadedUrl);
      Alert.alert("Success", "Thumbnail uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Error", err.message || "Failed to upload thumbnail");
    }
  };

  // 🆕 Open Product Link Modal
  const openProductModal = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setSelectedProductId(null);
    setShowProductModal(true);
  };

  // 🆕 Handle Link Product
  const handleLinkProduct = () => {
    if (!selectedLessonId || !selectedProductId) {
      Alert.alert("Error", "Please select a product");
      return;
    }

    linkProductMutation.mutate(
      {
        lessonId: selectedLessonId,
        productId: selectedProductId,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Product linked successfully!");
          setShowProductModal(false);
          setSelectedLessonId(null);
          setSelectedProductId(null);
          
          // Refresh course detail to show updated linked products
          queryClient.invalidateQueries({
            queryKey: ["shopCourseDetail", courseId],
          });
        },
        onError: (error: any) => {
          console.error("Link product error:", error);
          Alert.alert(
            "Error",
            error.response?.data?.message || error.message || "Failed to link product"
          );
        },
      }
    );
  };

  const handleCreateLesson = () => {
    if (!lessonTitle.trim() || !lessonVideoUrl) {
      Alert.alert("Validation Error", "Please fill in lesson title and upload a video");
      return;
    }

    const payload = {
      courseSectionId: selectedSectionId,
      title: lessonTitle.trim(),
      type: "Video" as const,
      contentUrl: lessonVideoUrl,
      durationSeconds: videoDuration,
      orderIndex:
        sections?.find((s) => s.id === selectedSectionId)?.lessons.length || 0,
    };

    console.log("📤 Creating lesson payload:", payload);

    createLesson.mutate(payload, {
      onSuccess: (data) => {
        console.log("✅ Lesson created:", data);

        queryClient.invalidateQueries({
          queryKey: ["shopCourseDetail", courseId],
        });

        Alert.alert("Success", "Lesson created successfully!");
        setShowLessonModal(false);
        setLessonTitle("");
        setLessonVideoUrl("");
        setVideoDuration(0);
      },
      onError: (error: any) => {
        console.log("❌ Full error:", error);
        Alert.alert(
          "Error",
          error.response?.data?.message || error.message || "Failed to create lesson"
        );
      },
    });
  };

  const handleEditCourse = () => {
    if (!course) return;

    setEditTitle(course.title);
    setEditSummary(course.summary);
    setEditThumbnail(course.courseThumbnail);
    setEditActive(course.active);
    setEditCategoryId(course.categoryId);
    setShowEditModal(true);
  };

  const handleUpdateCourse = () => {
    if (!editTitle.trim()) {
      Alert.alert("Validation Error", "Course title is required");
      return;
    }

    if (!editCategoryId) {
      Alert.alert("Validation Error", "Please select a category");
      return;
    }

    const payload = {
      title: editTitle.trim(),
      summary: editSummary.trim(),
      categoryId: editCategoryId,
      courseThumbnail: editThumbnail,
      active: editActive,
    };

    updateCourse.mutate(
      { courseId, payload },
      {
        onSuccess: () => {
          Alert.alert("Success", "Course updated successfully!");
          setShowEditModal(false);
          queryClient.invalidateQueries({
            queryKey: ["shopCourseDetail", courseId],
          });
        },
        onError: (error: any) => {
          Alert.alert(
            "Error",
            error.response?.data?.message || "Failed to update course"
          );
        },
      }
    );
  };

  const handleDeleteCourse = () => {
    if (!course) return;

    const hasContent = sections && sections.length > 0;

    Alert.alert(
      "Delete Course",
      hasContent
        ? `"${course.title}" has ${sections.length} section(s). Deleting this course will also delete all sections and lessons. This action cannot be undone. Continue?`
        : `Are you sure you want to delete "${course.title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCourse.mutate(courseId, {
              onSuccess: () => {
                Alert.alert("Success", "Course deleted successfully!");
                navigation.goBack();
              },
              onError: (error: any) => {
                Alert.alert(
                  "Error",
                  error.response?.data?.message || "Failed to delete course"
                );
              },
            });
          },
        },
      ]
    );
  };

  const handleDeleteLesson = (lessonId: string, lessonTitle: string) => {
    Alert.alert("Delete Lesson", `Are you sure you want to delete "${lessonTitle}"?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteLesson.mutate(lessonId, {
            onSuccess: () => {
              Alert.alert("Success", "Lesson deleted successfully!");
              queryClient.invalidateQueries({
                queryKey: ["shopCourseDetail", courseId],
              });
            },
            onError: (error: any) => {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete lesson"
              );
            },
          });
        },
      },
    ]);
  };

  const handleDeleteSection = (sectionId: string, sectionTitle: string) => {
    const section = sections?.find((s) => s.id === sectionId);
    const hasLessons = section && section.lessons.length > 0;

    Alert.alert(
      "Delete Section",
      hasLessons
        ? `"${sectionTitle}" has ${section.lessons.length} lesson(s). Deleting this section will also delete all its lessons. Continue?`
        : `Are you sure you want to delete "${sectionTitle}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSection.mutate(sectionId, {
              onSuccess: () => {
                Alert.alert("Success", "Section deleted successfully!");
                queryClient.invalidateQueries({
                  queryKey: ["shopCourseDetail", courseId],
                });
              },
              onError: (error: any) => {
                Alert.alert(
                  "Error",
                  error.response?.data?.message || "Failed to delete section"
                );
              },
            });
          },
        },
      ]
    );
  };

  // ✅ Lesson item + Linked Products + Link Button
  const renderLesson = (lesson: CourseLesson, index: number) => {
    const hasLinkedProducts = lesson.linkedProducts && lesson.linkedProducts.length > 0;

    return (
      <View
        key={lesson.id}
        className="p-4 bg-beige/20 dark:bg-dark-border/20 rounded-xl mb-2"
      >
        {/* Row chính: info + play + delete */}
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            className="flex-1 flex-row items-center"
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert("Lesson", `Playing: ${lesson.title}`);
            }}
          >
            <View className="w-10 h-10 rounded-full bg-mint/20 dark:bg-gold/20 items-center justify-center mr-3">
              <Text className="text-mint dark:text-gold font-bold">{index + 1}</Text>
            </View>

            <View className="flex-1">
              <Text
                className="text-base font-semibold text-light-text dark:text-dark-text mb-1"
                numberOfLines={2}
              >
                {lesson.title}
              </Text>

              <View className="flex-row items-center flex-wrap">
                <FontAwesome name="video-camera" size={12} color="#9CA3AF" />
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                  {lesson.type}
                </Text>

                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mx-2">
                  •
                </Text>

                <FontAwesome name="clock-o" size={12} color="#9CA3AF" />
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                  {formatDuration(lesson.durationSeconds)}
                </Text>

                {hasLinkedProducts && (
                  <>
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mx-2">
                      •
                    </Text>
                    <FontAwesome name="shopping-bag" size={12} color="#ACD6B8" />
                    <Text className="text-xs text-mint dark:text-gold ml-1">
                      {lesson.linkedProducts.length}{" "}
                      {lesson.linkedProducts.length === 1 ? "product" : "products"}
                    </Text>
                  </>
                )}
              </View>
            </View>

            <View className="w-10 h-10 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
              <FontAwesome name="play" size={14} color="#ACD6B8" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-coral/10 items-center justify-center"
            onPress={() => handleDeleteLesson(lesson.id, lesson.title)}
            disabled={deleteLesson.isPending}
          >
            {deleteLesson.isPending ? (
              <ActivityIndicator size="small" color="#FF6B6B" />
            ) : (
              <FontAwesome name="trash-o" size={16} color="#FF6B6B" />
            )}
          </TouchableOpacity>
        </View>

        {/* 🆕 Link Product Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center p-3 bg-skyBlue/10 dark:bg-lavender/10 rounded-xl border border-skyBlue/30 dark:border-lavender/30 mb-3 active:opacity-70"
          onPress={() => openProductModal(lesson.id)}
        >
          <FontAwesome name="link" size={14} color="#87CEEB" />
          <Text className="text-skyBlue dark:text-lavender font-semibold text-sm ml-2">
            Link Product to Lesson
          </Text>
        </TouchableOpacity>

        {/* ✅ Linked Products block */}
        {hasLinkedProducts && (
          <View className="bg-white/80 dark:bg-dark-card rounded-xl p-3 border border-beige/30 dark:border-dark-border/30">
            <View className="flex-row items-center mb-2">
              <FontAwesome name="shopping-basket" size={14} color="#ACD6B8" />
              <Text className="text-xs font-semibold text-light-text dark:text-dark-text ml-2">
                Linked Products ({lesson.linkedProducts.length})
              </Text>
            </View>

            {lesson.linkedProducts.map((product) => (
              <View
                key={product.id}
                className="flex-row items-center mb-2 last:mb-0"
              >
                {product.thumbnailUrl ? (
                  <Image
                    source={{ uri: product.thumbnailUrl }}
                    className="w-10 h-10 rounded-lg mr-3"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-10 h-10 rounded-lg bg-beige/40 dark:bg-dark-border/40 items-center justify-center mr-3">
                    <FontAwesome name="image" size={14} color="#9CA3AF" />
                  </View>
                )}

                <View className="flex-1">
                  <Text
                    className="text-xs font-semibold text-light-text dark:text-dark-text"
                    numberOfLines={1}
                  >
                    {product.name}
                  </Text>
                  <Text className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary" numberOfLines={1}>
                    {product.shopName}
                  </Text>
                </View>

                <Text className="text-xs font-bold text-mint dark:text-gold ml-2">
                  {formatPrice(product.price)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSection = (section: CourseSection) => {
    const isExpanded = expandedSections.has(section.id);

    return (
      <View
        key={section.id}
        className="mb-4 bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-beige/30 dark:border-dark-border/30"
      >
        <View className="flex-row items-center justify-between p-4">
          <TouchableOpacity
            className="flex-1 flex-row items-center"
            onPress={() => toggleSection(section.id)}
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 rounded-lg bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3">
              <FontAwesome name="folder-open" size={16} color="#ACD6B8" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
                {section.title}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                {section.lessons.length}{" "}
                {section.lessons.length === 1 ? "lesson" : "lessons"}
              </Text>
            </View>
            <FontAwesome
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-coral/10 items-center justify-center ml-2"
            onPress={() => handleDeleteSection(section.id, section.title)}
            disabled={deleteSection.isPending}
          >
            {deleteSection.isPending ? (
              <ActivityIndicator size="small" color="#FF6B6B" />
            ) : (
              <FontAwesome name="trash-o" size={16} color="#FF6B6B" />
            )}
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <View className="px-4 pb-4">
            {section.lessons.map((lesson, index) => renderLesson(lesson, index))}

            <TouchableOpacity
              className="flex-row items-center justify-center p-4 bg-mint/10 dark:bg-gold/10 rounded-xl border-2 border-dashed border-mint/30 dark:border-gold/30 mt-2"
              onPress={() => {
                setSelectedSectionId(section.id);
                setShowLessonModal(true);
              }}
            >
              <FontAwesome name="plus-circle" size={18} color="#ACD6B8" />
              <Text className="text-mint dark:text-gold font-semibold ml-2">
                Add Lesson
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderLoading = () => (
    <View className="flex-1 bg-cream dark:bg-dark-background">
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ACD6B8" />
        <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
          Loading course...
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
          Unable to load course information
        </Text>
        <TouchableOpacity
          className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) return renderLoading();
  if (isError || !course) return renderError();

  const selectedCategory = categories?.find((cat) => cat.id === editCategoryId);

  return (
    <View className="flex-1 bg-cream dark:bg-dark-background">
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
          {course.title}
        </Text>

        <View className="flex-row">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center mr-2"
            onPress={handleEditCourse}
          >
            <FontAwesome name="edit" size={18} color="#ACD6B8" />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-coral/10 items-center justify-center"
            onPress={handleDeleteCourse}
            disabled={deleteCourse.isPending}
          >
            {deleteCourse.isPending ? (
              <ActivityIndicator size="small" color="#FF6B6B" />
            ) : (
              <FontAwesome name="trash-o" size={18} color="#FF6B6B" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="relative">
          {course.courseThumbnail ? (
            <Image
              source={{ uri: course.courseThumbnail }}
              className="w-full h-64"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-64 bg-gradient-to-br from-mint to-skyBlue dark:from-gold dark:to-lavender items-center justify-center">
              <FontAwesome name="book" size={64} color="white" />
            </View>
          )}

          <View
            className={`absolute top-4 right-4 px-4 py-2 rounded-full ${
              course.active === 1 ? "bg-mint/90 dark:bg-gold/90" : "bg-coral/90"
            }`}
          >
            <Text className="text-white text-xs font-bold">
              {course.active === 1 ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <View className="px-6 py-6">
          <View className="flex-row items-center mb-4">
            <View className="px-3 py-1 rounded-full bg-mint/10 dark:bg-gold/10">
              <Text className="text-mint dark:text-gold text-xs font-semibold">
                {course.categoryName}
              </Text>
            </View>
          </View>

          <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">
            {course.title}
          </Text>

          <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary mb-6 leading-6">
            {course.summary}
          </Text>

          <View className="flex-row bg-white dark:bg-dark-card rounded-2xl p-4 mb-6 border border-beige/30 dark:border-dark-border/30">
            <View className="flex-1 items-center border-r border-beige/30 dark:border-dark-border/30">
              <FontAwesome name="list" size={20} color="#ACD6B8" />
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
                {sections?.length || 0}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                {sections?.length === 1 ? "Section" : "Sections"}
              </Text>
            </View>

            <View className="flex-1 items-center border-r border-beige/30 dark:border-dark-border/30">
              <FontAwesome name="play-circle" size={20} color="#ACD6B8" />
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
                {getTotalLessons()}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                {getTotalLessons() === 1 ? "Lesson" : "Lessons"}
              </Text>
            </View>

            <View className="flex-1 items-center">
              <FontAwesome name="clock-o" size={20} color="#ACD6B8" />
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
                {Math.floor(getTotalDuration() / 60)}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                {Math.floor(getTotalDuration() / 60) === 1 ? "Minute" : "Minutes"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Course Content
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (sections && sections.length > 0) {
                  const allExpanded = sections.every((s) =>
                    expandedSections.has(s.id)
                  );
                  if (allExpanded) {
                    setExpandedSections(new Set());
                  } else {
                    setExpandedSections(new Set(sections.map((s) => s.id)));
                  }
                }
              }}
            >
              <Text className="text-sm text-mint dark:text-gold font-semibold">
                {sections?.every((s) => expandedSections.has(s.id))
                  ? "Collapse All"
                  : "Expand All"}
              </Text>
            </TouchableOpacity>
          </View>

          {sections && sections.length > 0 ? (
            sections.map((section) => renderSection(section))
          ) : (
            <View className="bg-white dark:bg-dark-card rounded-2xl p-8 items-center border border-beige/30 dark:border-dark-border/30">
              <FontAwesome name="folder-open-o" size={48} color="#D1D5DB" />
              <Text className="text-lg font-bold text-light-text dark:text-dark-text mt-4 mb-2">
                No Content Yet
              </Text>
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
                Add sections and lessons to complete your course
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="px-6 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
        <TouchableOpacity
          className="bg-mint dark:bg-gold rounded-full py-4 items-center"
          onPress={() => setShowSectionModal(true)}
        >
          <Text className="text-white text-base font-bold">+ Add New Section</Text>
        </TouchableOpacity>
      </View>

      {/* Section Modal */}
      <Modal
        visible={showSectionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSectionModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white dark:bg-dark-card rounded-2xl p-6 w-full">
            <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-3">
              Create New Section
            </Text>
            <TextInput
              value={newSectionTitle}
              onChangeText={setNewSectionTitle}
              placeholder="Enter section title"
              placeholderTextColor="#999"
              className="border border-gray-300 dark:border-dark-border rounded-lg p-3 text-light-text dark:text-dark-text mb-4"
            />
            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity onPress={() => setShowSectionModal(false)}>
                <Text className="text-gray-500 font-medium mr-4">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!newSectionTitle.trim()) {
                    Alert.alert("Error", "Section title cannot be empty.");
                    return;
                  }

                  createSection.mutate(
                    {
                      courseId,
                      title: newSectionTitle.trim(),
                      orderIndex: sections?.length || 0,
                    },
                    {
                      onSuccess: () => {
                        setShowSectionModal(false);
                        setNewSectionTitle("");
                      },
                    }
                  );
                }}
                disabled={createSection.isPending}
              >
                <Text className="text-mint dark:text-gold font-bold">
                  {createSection.isPending ? "Creating..." : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lesson Modal */}
      <Modal
        visible={showLessonModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowLessonModal(false);
          setVideoDuration(0);
        }}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-dark-card rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Add New Lesson
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowLessonModal(false);
                  setVideoDuration(0);
                }}
              >
                <FontAwesome name="times" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Lesson Title <Text className="text-coral">*</Text>
                </Text>
                <TextInput
                  value={lessonTitle}
                  onChangeText={setLessonTitle}
                  placeholder="Enter lesson title"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 dark:border-dark-border rounded-lg p-3 text-light-text dark:text-dark-text"
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Video <Text className="text-coral">*</Text>
                </Text>
                {lessonVideoUrl ? (
                  <View className="bg-mint/10 dark:bg-gold/10 rounded-lg p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <FontAwesome name="check-circle" size={20} color="#ACD6B8" />
                        <Text
                          className="text-mint dark:text-gold ml-2 flex-1"
                          numberOfLines={1}
                        >
                          Video uploaded
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setLessonVideoUrl("");
                          setVideoDuration(0);
                        }}
                      >
                        <FontAwesome name="times-circle" size={20} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                    {videoDuration > 0 && (
                      <View className="flex-row items-center mt-2">
                        <FontAwesome name="clock-o" size={14} color="#ACD6B8" />
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-2">
                          Duration: {formatDuration(videoDuration)}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    className="border-2 border-dashed border-mint/30 dark:border-gold/30 rounded-lg p-4 items-center"
                    onPress={pickAndUploadVideo}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#ACD6B8" />
                    ) : (
                      <>
                        <FontAwesome name="cloud-upload" size={32} color="#ACD6B8" />
                        <Text className="text-mint dark:text-gold font-semibold mt-2">
                          Upload Video
                        </Text>
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                          Max size: 10MB
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                className="bg-mint dark:bg-gold rounded-full py-4 items-center"
                onPress={handleCreateLesson}
                disabled={createLesson.isPending || isUploading}
              >
                {createLesson.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-base font-bold">Create Lesson</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white dark:bg-dark-card rounded-t-3xl p-6"
            style={{ maxHeight: "90%" }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Edit Course
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <FontAwesome name="times" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Title */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Course Title <Text className="text-coral">*</Text>
                </Text>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Enter course title"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 dark:border-dark-border rounded-lg p-3 text-light-text dark:text-dark-text"
                />
              </View>

              {/* Category Selector */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Category <Text className="text-coral">*</Text>
                </Text>
                <TouchableOpacity
                  className="border border-gray-300 dark:border-dark-border rounded-lg p-3 flex-row items-center justify-between"
                  onPress={() => setShowCategoryPicker(true)}
                  disabled={isCategoriesLoading}
                >
                  {isCategoriesLoading ? (
                    <ActivityIndicator size="small" color="#ACD6B8" />
                  ) : (
                    <>
                      <Text
                        className={`flex-1 ${
                          selectedCategory
                            ? "text-light-text dark:text-dark-text"
                            : "text-gray-400"
                        }`}
                      >
                        {selectedCategory?.name || "Select a category"}
                      </Text>
                      <FontAwesome name="chevron-down" size={16} color="#9CA3AF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Summary */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Summary
                </Text>
                <TextInput
                  value={editSummary}
                  onChangeText={setEditSummary}
                  placeholder="Enter course summary"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  className="border border-gray-300 dark:border-dark-border rounded-lg p-3 text-light-text dark:text-dark-text"
                  style={{ minHeight: 100, textAlignVertical: "top" }}
                />
              </View>

              {/* Thumbnail */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Thumbnail
                </Text>
                {editThumbnail ? (
                  <View className="relative">
                    <Image
                      source={{ uri: editThumbnail }}
                      className="w-full h-40 rounded-lg"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-coral/90 items-center justify-center"
                      onPress={() => setEditThumbnail("")}
                    >
                      <FontAwesome name="times" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="border-2 border-dashed border-mint/30 dark:border-gold/30 rounded-lg p-4 items-center"
                    onPress={pickAndUploadThumbnail}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#ACD6B8" />
                    ) : (
                      <>
                        <FontAwesome name="image" size={32} color="#ACD6B8" />
                        <Text className="text-mint dark:text-gold font-semibold mt-2">
                          Upload Thumbnail
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Status */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Status
                </Text>
                <View className="flex-row">
                  <TouchableOpacity
                    className={`flex-1 mr-2 p-3 rounded-lg border-2 ${
                      editActive === 1
                        ? "border-mint dark:border-gold bg-mint/10 dark:bg-gold/10"
                        : "border-gray-300 dark:border-dark-border"
                    }`}
                    onPress={() => setEditActive(1)}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        editActive === 1
                          ? "text-mint dark:text-gold"
                          : "text-light-textSecondary dark:text-dark-textSecondary"
                      }`}
                    >
                      Active
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 ml-2 p-3 rounded-lg border-2 ${
                      editActive === 0
                        ? "border-coral bg-coral/10"
                        : "border-gray-300 dark:border-dark-border"
                    }`}
                    onPress={() => setEditActive(0)}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        editActive === 0
                          ? "text-coral"
                          : "text-light-textSecondary dark:text-dark-textSecondary"
                      }`}
                    >
                      Inactive
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Update Button */}
              <TouchableOpacity
                className="bg-mint dark:bg-gold rounded-full py-4 items-center"
                onPress={handleUpdateCourse}
                disabled={updateCourse.isPending || isUploading}
              >
                {updateCourse.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-base font-bold">Update Course</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white dark:bg-dark-card rounded-2xl p-6 w-full max-h-96">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-light-text dark:text-dark-text">
                Select Category
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <FontAwesome name="times" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {isCategoriesLoading ? (
                <ActivityIndicator size="large" color="#ACD6B8" className="my-4" />
              ) : categories && categories.length > 0 ? (
                categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`p-4 rounded-lg mb-2 border ${
                      editCategoryId === category.id
                        ? "border-mint dark:border-gold bg-mint/10 dark:bg-gold/10"
                        : "border-gray-200 dark:border-dark-border"
                    }`}
                    onPress={() => {
                      setEditCategoryId(category.id);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text
                      className={`font-semibold ${
                        editCategoryId === category.id
                          ? "text-mint dark:text-gold"
                          : "text-light-text dark:text-dark-text"
                      }`}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-center text-light-textSecondary dark:text-dark-textSecondary py-4">
                  No categories available
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 🆕 Product Link Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProductModal(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-20 bg-cream dark:bg-dark-background rounded-t-3xl">
            {/* Modal Header */}
            <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30 rounded-t-3xl">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
                    Link Product
                  </Text>
                  <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mt-1">
                    {selectedProductId ? "1 product selected" : "Select one product"}
                  </Text>
                </View>
                
                <TouchableOpacity
                  className="w-10 h-10 rounded-xl bg-coral/10 items-center justify-center"
                  onPress={() => setShowProductModal(false)}
                  disabled={linkProductMutation.isPending}
                >
                  <FontAwesome name="times" size={20} color="#F2A297" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Products List */}
            {isProductsLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#ACD6B8" />
                <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4 text-base">
                  Loading products...
                </Text>
              </View>
            ) : products.length === 0 ? (
              <View className="flex-1 items-center justify-center px-6">
                <View className="w-20 h-20 rounded-full bg-skyBlue/10 dark:bg-lavender/10 items-center justify-center mb-4">
                  <FontAwesome name="shopping-bag" size={40} color="#87CEEB" />
                </View>
                <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
                  No Products
                </Text>
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
                  Add products to your shop first
                </Text>
              </View>
            ) : (
              <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: product }) => {
                  const isSelected = selectedProductId === product.id;
                  
                  return (
                    <TouchableOpacity
                      className={`mb-3 rounded-2xl border overflow-hidden active:opacity-70 ${
                        isSelected
                          ? 'bg-skyBlue/10 dark:bg-lavender/10 border-skyBlue dark:border-lavender'
                          : 'bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30'
                      }`}
                      onPress={() => setSelectedProductId(product.id)}
                      disabled={linkProductMutation.isPending}
                    >
                      <View className="flex-row items-center p-4">
                        {/* Product Image */}
                        {product.thumbnailUrl ? (
                          <Image
                            source={{ uri: product.thumbnailUrl }}
                            className="w-16 h-16 rounded-xl"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-16 h-16 rounded-xl bg-beige/20 dark:bg-dark-border/20 items-center justify-center">
                            <FontAwesome name="image" size={24} color="#9CA3AF" />
                          </View>
                        )}

                        {/* Product Info */}
                        <View className="flex-1 ml-3">
                          <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1" numberOfLines={2}>
                            {product.name}
                          </Text>
                          <Text className="text-sm font-semibold text-skyBlue dark:text-lavender">
                            {formatPrice(product.price)}
                          </Text>
                          {product.stock !== undefined && (
                            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                              Stock: {product.stock}
                            </Text>
                          )}
                        </View>

                        {/* Radio Button */}
                        <View className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
                          isSelected
                            ? 'bg-skyBlue dark:bg-lavender border-skyBlue dark:border-lavender'
                            : 'border-beige/50 dark:border-dark-border/50'
                        }`}>
                          {isSelected && (
                            <View className="w-3 h-3 rounded-full bg-white" />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            {/* Action Buttons */}
            {products.length > 0 && (
              <View className="px-6 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
                <View className="gap-3">
                  <TouchableOpacity
                    className={`rounded-2xl py-4 shadow-lg active:opacity-80 ${
                      selectedProductId && !linkProductMutation.isPending
                        ? 'bg-skyBlue dark:bg-lavender'
                        : 'bg-beige/20 dark:bg-dark-border/20'
                    }`}
                    onPress={handleLinkProduct}
                    disabled={!selectedProductId || linkProductMutation.isPending}
                  >
                    <View className="flex-row items-center justify-center">
                      {linkProductMutation.isPending ? (
                        <>
                          <ActivityIndicator size="small" color="white" />
                          <Text className="text-white font-bold text-lg ml-2">Linking...</Text>
                        </>
                      ) : (
                        <>
                          <FontAwesome 
                            name="link" 
                            size={18} 
                            color={selectedProductId ? "white" : "#9CA3AF"} 
                          />
                          <Text className={`font-bold text-lg ml-2 ${
                            selectedProductId
                              ? 'text-white'
                              : 'text-light-textSecondary dark:text-dark-textSecondary'
                          }`}>
                            Link Product
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-white dark:bg-dark-card rounded-2xl py-4 border-2 border-beige/30 dark:border-dark-border/30 active:opacity-80"
                    onPress={() => setShowProductModal(false)}
                    disabled={linkProductMutation.isPending}
                  >
                    <Text className="text-light-text dark:text-dark-text font-bold text-lg text-center">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}