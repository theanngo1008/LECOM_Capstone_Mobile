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
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShopProducts } from "../../shopProducts/hooks/useShopProducts";
import {
  LessonDetailModal,
  LessonItem,
  SectionItem
} from "../components";
import { useCreateLesson } from "../hooks/useCreateLesson";
import { useCreateSection } from "../hooks/useCreateSection";
import { useDeleteCourse } from "../hooks/useDeleteCourse";
import { useDeleteLesson } from "../hooks/useDeleteLesson";
import { useDeleteSection } from "../hooks/useDeleteSection";
import { useLinkProductToLesson } from "../hooks/useLinkProductToLesson";
import { useShopCourseDetail } from "../hooks/useShopCourseDetail";
import { useUpdateCourse } from "../hooks/useUpdateCourse";
import {
  formatDuration,
  formatPrice,
  getApprovalStatusColor,
  getApprovalStatusText,
  getApprovalStatusTextColor,
  toRomanNumeral,
} from "../utils/helpers";

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

  // Lesson Detail Modal
  const [showLessonDetailModal, setShowLessonDetailModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);

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


  const getTotalLessons = () => {
    if (!sections) return 0;
    return sections.reduce((total, section) => total + section.lessons.length, 0);
  };

  const getTotalDuration = () => {
    if (!sections) return 0;
    return sections.reduce(
      (total, section) =>
        total +
        section.lessons.reduce(
          (sum, lesson) => sum + (lesson.durationSeconds || 0),
          0
        ),
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
          "File quá lớn",
          "Vui lòng chọn video nhỏ hơn 10MB."
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

      Alert.alert("Đang tải lên", "Vui lòng đợi trong khi video đang được tải lên...");
      const uploaded = await uploadFile(file, "video");
      const uploadedUrl = typeof uploaded === "string" ? uploaded : uploaded?.url;
      if (!uploadedUrl) throw new Error("Upload failed");

      setLessonVideoUrl(uploadedUrl);
      Alert.alert(
        "Thành công",
        `Tải video lên thành công! Thời lượng: ${formatDuration(duration)}`
      );
    } catch (err: any) {
      console.error("Upload error:", err);

      if (err.message?.includes("413") || err.status === 413) {
        Alert.alert(
          "File quá lớn",
          "File video quá lớn cho server. Vui lòng chọn file nhỏ hơn."
        );
      } else {
        Alert.alert("Lỗi", err.message || "Không thể tải video lên");
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

      Alert.alert("Đang tải lên", "Đang tải thumbnail lên...");
      const uploaded = await uploadFile(file, "image");
      const uploadedUrl = typeof uploaded === "string" ? uploaded : uploaded?.url;

      if (!uploadedUrl) throw new Error("Upload failed");

      setEditThumbnail(uploadedUrl);
      Alert.alert("Thành công", "Tải thumbnail lên thành công!");
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Lỗi", err.message || "Không thể tải thumbnail lên");
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
      Alert.alert("Lỗi", "Vui lòng chọn sản phẩm");
      return;
    }

    linkProductMutation.mutate(
      {
        lessonId: selectedLessonId,
        productId: selectedProductId,
      },
      {
        onSuccess: () => {
          Alert.alert("Thành công", "Liên kết sản phẩm thành công!");
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
            "Lỗi",
            error.response?.data?.message || error.message || "Không thể liên kết sản phẩm"
          );
        },
      }
    );
  };

  const handleCreateLesson = () => {
    if (!lessonTitle.trim()) {
      Alert.alert("Lỗi xác thực", "Vui lòng điền tiêu đề bài học");
      return;
    }

    if (!lessonVideoUrl) {
      Alert.alert("Lỗi xác thực", "Vui lòng tải video lên");
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

        Alert.alert("Thành công", "Tạo bài học thành công!");
        setShowLessonModal(false);
        setLessonTitle("");
        setLessonVideoUrl("");
        setVideoDuration(0);
      },
      onError: (error: any) => {
        console.log("❌ Full error:", error);
        Alert.alert(
          "Lỗi",
          error.response?.data?.message || error.message || "Không thể tạo bài học"
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
      Alert.alert("Lỗi xác thực", "Tiêu đề khóa học là bắt buộc");
      return;
    }

    if (!editCategoryId) {
      Alert.alert("Lỗi xác thực", "Vui lòng chọn danh mục");
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
          Alert.alert("Thành công", "Cập nhật khóa học thành công!");
          setShowEditModal(false);
          queryClient.invalidateQueries({
            queryKey: ["shopCourseDetail", courseId],
          });
        },
        onError: (error: any) => {
          Alert.alert(
            "Lỗi",
            error.response?.data?.message || "Không thể cập nhật khóa học"
          );
        },
      }
    );
  };

  const handleDeleteCourse = () => {
    if (!course) return;

    const hasContent = sections && sections.length > 0;

    Alert.alert(
      "Xóa khóa học",
      hasContent
        ? `"${course.title}" có ${sections.length} phần. Xóa khóa học này sẽ xóa tất cả các phần và bài học. Hành động này không thể hoàn tác. Tiếp tục?`
        : `Bạn có chắc muốn xóa "${course.title}"? Hành động này không thể hoàn tác.`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            deleteCourse.mutate(courseId, {
              onSuccess: () => {
                Alert.alert("Thành công", "Xóa khóa học thành công!");
                navigation.goBack();
              },
              onError: (error: any) => {
                Alert.alert(
                  "Lỗi",
                  error.response?.data?.message || "Không thể xóa khóa học"
                );
              },
            });
          },
        },
      ]
    );
  };

  const handleDeleteLesson = (lessonId: string, lessonTitle: string) => {
    Alert.alert("Xóa bài học", `Bạn có chắc muốn xóa "${lessonTitle}"?`, [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          deleteLesson.mutate(lessonId, {
            onSuccess: () => {
              Alert.alert("Thành công", "Xóa bài học thành công!");
              queryClient.invalidateQueries({
                queryKey: ["shopCourseDetail", courseId],
              });
            },
            onError: (error: any) => {
              Alert.alert(
                "Lỗi",
                error.response?.data?.message || "Không thể xóa bài học"
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
      "Xóa phần",
      hasLessons
        ? `"${sectionTitle}" có ${section.lessons.length} bài học. Xóa phần này sẽ xóa tất cả các bài học. Tiếp tục?`
        : `Bạn có chắc muốn xóa "${sectionTitle}"?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            deleteSection.mutate(sectionId, {
              onSuccess: () => {
                Alert.alert("Thành công", "Xóa phần thành công!");
                queryClient.invalidateQueries({
                  queryKey: ["shopCourseDetail", courseId],
                });
              },
              onError: (error: any) => {
                Alert.alert(
                  "Lỗi",
                  error.response?.data?.message || "Không thể xóa phần"
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
    return (
      <LessonItem
        key={lesson.id}
        lesson={lesson}
        index={index}
            onPress={() => {
          setSelectedLesson(lesson);
          setShowLessonDetailModal(true);
        }}
        onDelete={handleDeleteLesson}
        onLinkProduct={openProductModal}
        isDeleting={deleteLesson.isPending}
        getApprovalStatusColor={getApprovalStatusColor}
        getApprovalStatusTextColor={getApprovalStatusTextColor}
        getApprovalStatusText={getApprovalStatusText}
        formatDuration={formatDuration}
        formatPrice={formatPrice}
      />
    );
  };

  const renderSection = (section: CourseSection, romanIndex: number) => {
    const isExpanded = expandedSections.has(section.id);

    return (
      <SectionItem
        key={section.id}
        section={section}
        romanIndex={romanIndex}
        isExpanded={isExpanded}
        onToggle={() => toggleSection(section.id)}
        onDelete={handleDeleteSection}
        onAddLesson={() => {
                setSelectedSectionId(section.id);
                setShowLessonModal(true);
              }}
        isDeleting={deleteSection.isPending}
        getApprovalStatusColor={getApprovalStatusColor}
        getApprovalStatusTextColor={getApprovalStatusTextColor}
        getApprovalStatusText={getApprovalStatusText}
        toRomanNumeral={toRomanNumeral}
        renderLessons={() => (
          <>
            {section.lessons.map((lesson, index) => renderLesson(lesson, index))}
          </>
        )}
      />
    );
  };

  const renderLoading = () => (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ACD6B8" />
        <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
          Đang tải khóa học...
        </Text>
      </View>
    </SafeAreaView>
  );

  const renderError = () => (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center px-6">
        <FontAwesome name="exclamation-circle" size={64} color="#FF6B6B" />
        <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
          Có lỗi xảy ra
        </Text>
        <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
          Không thể tải thông tin khóa học
        </Text>
        <TouchableOpacity
          className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  if (isLoading) return renderLoading();
  if (isError || !course) return renderError();

  const selectedCategory = categories?.find((cat) => cat.id === editCategoryId);

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
      <View
        className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30"
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
              {course.active === 1 ? "Hoạt động" : "Tạm dừng"}
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
                {sections?.length === 1 ? "Phần" : "Phần"}
              </Text>
            </View>

            <View className="flex-1 items-center border-r border-beige/30 dark:border-dark-border/30">
              <FontAwesome name="play-circle" size={20} color="#ACD6B8" />
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
                {getTotalLessons()}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                {getTotalLessons() === 1 ? "Bài học" : "Bài học"}
              </Text>
            </View>

            <View className="flex-1 items-center">
              <FontAwesome name="clock-o" size={20} color="#ACD6B8" />
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
                {Math.floor(getTotalDuration() / 60)}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                {Math.floor(getTotalDuration() / 60) === 1 ? "Phút" : "Phút"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Nội dung khóa học
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
                  ? "Thu gọn tất cả"
                  : "Mở rộng tất cả"}
              </Text>
            </TouchableOpacity>
          </View>

          {sections && sections.length > 0 ? (
            [...sections]
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((section, index) => renderSection(section, index + 1))
          ) : (
            <View className="bg-white dark:bg-dark-card rounded-2xl p-8 items-center border border-beige/30 dark:border-dark-border/30">
              <FontAwesome name="folder-open-o" size={48} color="#D1D5DB" />
              <Text className="text-lg font-bold text-light-text dark:text-dark-text mt-4 mb-2">
                Chưa có nội dung
              </Text>
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
                Thêm phần và bài học để hoàn thành khóa học của bạn
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
          <Text className="text-white text-base font-bold">+ Thêm chương</Text>
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
              Tạo phần mới
            </Text>
            <TextInput
              value={newSectionTitle}
              onChangeText={setNewSectionTitle}
              placeholder="Nhập tiêu đề phần"
              placeholderTextColor="#999"
              className="border border-gray-300 dark:border-dark-border rounded-lg p-3 text-light-text dark:text-dark-text mb-4"
            />
            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity onPress={() => setShowSectionModal(false)}>
                <Text className="text-gray-500 font-medium mr-4">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!newSectionTitle.trim()) {
                    Alert.alert("Lỗi", "Tiêu đề phần không được để trống.");
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
                  {createSection.isPending ? "Đang tạo..." : "Tạo"}
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
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white dark:bg-dark-card rounded-3xl p-6 w-full" style={{ maxHeight: "90%" }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Thêm bài học mới
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
                  Tiêu đề bài học <Text className="text-coral">*</Text>
                </Text>
                <TextInput
                  value={lessonTitle}
                  onChangeText={setLessonTitle}
                  placeholder="Nhập tiêu đề bài học"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 dark:border-dark-border rounded-lg p-3 text-light-text dark:text-dark-text"
                />
              </View>

              {/* Video Form */}
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
                          Video đã tải lên
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
                          Thời lượng: {formatDuration(videoDuration)}
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
                          Tải video lên
                        </Text>
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                          Kích thước tối đa: 10MB
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
                  <Text className="text-white text-base font-bold">Tạo bài học</Text>
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
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View
            className="bg-white dark:bg-dark-card rounded-3xl p-6 w-full"
            style={{ maxHeight: "90%" }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Chỉnh sửa khóa học
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <FontAwesome name="times" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Title */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Tiêu đề khóa học <Text className="text-coral">*</Text>
                </Text>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Nhập tiêu đề khóa học"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 dark:border-dark-border rounded-lg p-3 text-light-text dark:text-dark-text"
                />
              </View>

              {/* Category Selector */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Danh mục <Text className="text-coral">*</Text>
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
                        {selectedCategory?.name || "Chọn danh mục"}
                      </Text>
                      <FontAwesome name="chevron-down" size={16} color="#9CA3AF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Summary */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Tóm tắt
                </Text>
                <TextInput
                  value={editSummary}
                  onChangeText={setEditSummary}
                  placeholder="Nhập tóm tắt khóa học"
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
                  Hình ảnh đại diện
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
                          Tải hình ảnh đại diện lên
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Status */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Trạng thái
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
                      Hoạt động
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
                      Tạm dừng
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
                  <Text className="text-white text-base font-bold">Cập nhật khóa học</Text>
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
                Chọn danh mục
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
                  Không có danh mục nào
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
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="flex-1 bg-cream dark:bg-dark-background rounded-3xl w-full" style={{ maxHeight: "90%" }}>
            {/* Modal Header */}
            <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30 rounded-t-3xl">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
                    Liên kết sản phẩm
                  </Text>
                  <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mt-1">
                    {selectedProductId ? "Đã chọn 1 sản phẩm" : "Chọn một sản phẩm"}
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
                  Đang tải sản phẩm...
                </Text>
              </View>
            ) : products.length === 0 ? (
              <View className="flex-1 items-center justify-center px-6">
                <View className="w-20 h-20 rounded-full bg-skyBlue/10 dark:bg-lavender/10 items-center justify-center mb-4">
                  <FontAwesome name="shopping-bag" size={40} color="#87CEEB" />
                </View>
                <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
                  Chưa có sản phẩm
                </Text>
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
                  Thêm sản phẩm vào cửa hàng trước
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
                              Tồn kho: {product.stock}
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
                          <Text className="text-white font-bold text-lg ml-2">Đang liên kết...</Text>
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
                            Liên kết sản phẩm
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
                      Hủy
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Lesson Detail Modal */}
      <LessonDetailModal
        visible={showLessonDetailModal}
        lesson={selectedLesson}
        onClose={() => setShowLessonDetailModal(false)}
        onLinkProduct={openProductModal}
        getApprovalStatusColor={getApprovalStatusColor}
        getApprovalStatusTextColor={getApprovalStatusTextColor}
        getApprovalStatusText={getApprovalStatusText}
        formatDuration={formatDuration}
        formatPrice={formatPrice}
      />
    </SafeAreaView>
  );
}