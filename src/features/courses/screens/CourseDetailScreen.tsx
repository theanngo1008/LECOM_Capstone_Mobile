import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCourseBySlug } from "../hooks/useCourseBySlug";
import { useEnrollCourse } from "../hooks/useEnrollCourse";

export function CourseDetailScreen({ navigation, route }: any) {
  const { slug } = route.params;
  const { data, isLoading, isError, refetch } = useCourseBySlug(slug);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const course = data?.result;
  const courseId = course?.id ?? "";

  // ✅ Use isEnrolled from API response
  const isEnrolled = course?.isEnrolled ?? false;

  // 🔹 hook enroll
  const enrollMutation = useEnrollCourse(courseId);

  const isEnrollDisabled = !courseId || enrollMutation.isPending || isEnrolled;

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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTotalLessons = () => {
    if (!course?.sections) return 0;
    return course.sections.reduce((total, section) => total + section.lessons.length, 0);
  };

  const getTotalDuration = () => {
    if (!course?.sections) return 0;
    return course.sections.reduce(
      (total, section) =>
        total + section.lessons.reduce((sum, lesson) => sum + lesson.durationSeconds, 0),
      0
    );
  };

  const handlePlayLesson = (lesson: any, section: any) => {
    if (!isEnrolled) {
      Alert.alert(
        "Enroll Required",
        "You need to enroll in this course to watch lessons",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enroll Now",
            onPress: handleEnroll,
          },
        ]
      );
      return;
    }

    // ✅ Navigate to lesson player with courseId for useLearnCourse
    navigation.navigate("LessonPlayer", {
      courseId: courseId,
      sectionId: section.id,
      lessonId: lesson.id,
    });
  };

  const handleEnroll = async () => {
    if (!courseId || isEnrolled) return;
    try {
      await enrollMutation.mutateAsync();
      Alert.alert("Success", "You have enrolled in this course");
      refetch(); // Refresh to get updated isEnrolled status
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Failed to enroll");
    }
  };

  // ✅ Navigate to learning screen if already enrolled
  const handleStartLearning = () => {
    if (!isEnrolled || !courseId) return;
    
    // Navigate to first lesson of first section
    const firstSection = course?.sections?.[0];
    const firstLesson = firstSection?.lessons?.[0];

    if (firstSection && firstLesson) {
      navigation.navigate("LessonPlayer", {
        courseId: courseId,
        sectionId: firstSection.id,
        lessonId: firstLesson.id,
      });
    } else {
      Alert.alert("No Content", "This course doesn't have any lessons yet");
    }
  };

  const renderLoading = () => (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ACD6B8" />
        <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
          Loading course...
        </Text>
      </View>
    </SafeAreaView>
  );

  const renderError = () => (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
      <View className="flex-1 items-center justify-center px-6">
        <FontAwesome name="exclamation-circle" size={64} color="#FF6B6B" />
        <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
          Something went wrong
        </Text>
        <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
          Unable to load course information
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
    </SafeAreaView>
  );

  if (isLoading) return renderLoading();
  if (isError || !course) return renderError();

  const totalLessons = getTotalLessons();
  const totalDuration = getTotalDuration();

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
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
          Course Details
        </Text>

        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
          onPress={() => {
            Alert.alert("Share", "Share course feature coming soon");
          }}
        >
          <FontAwesome name="share-alt" size={18} color="#ACD6B8" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        <View className="relative">
          {course.courseThumbnail ? (
            <Image
              source={{ uri: course.courseThumbnail }}
              className="w-full h-64"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-64 bg-gradient-to-br from-mint to-skyBlue dark:from-gold dark:to-lavender items-center justify-center">
              <FontAwesome name="graduation-cap" size={64} color="white" />
            </View>
          )}

          <View className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

          {/* ✅ Enrolled Badge */}
          {isEnrolled && (
            <View className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-mint dark:bg-gold flex-row items-center">
              <FontAwesome name="check-circle" size={14} color="white" />
              <Text className="text-white text-xs font-bold ml-1">Enrolled</Text>
            </View>
          )}
        </View>

        {/* Course Info */}
        <View className="px-6 py-6">
          {/* Category */}
          <View className="flex-row items-center mb-4">
            <View className="px-3 py-1 rounded-full bg-mint/10 dark:bg-gold/10">
              <Text className="text-mint dark:text-gold text-xs font-semibold">
                {course.categoryName}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">
            {course.title}
          </Text>

          {/* Summary */}
          <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary mb-6 leading-6">
            {course.summary}
          </Text>

          {/* Stats */}
          <View className="flex-row bg-white dark:bg-dark-card rounded-2xl p-4 mb-6 border border-beige/30 dark:border-dark-border/30">
            <View className="flex-1 items-center border-r border-beige/30 dark:border-dark-border/30">
              <FontAwesome name="list" size={20} color="#ACD6B8" />
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
                {course.sections.length}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                {course.sections.length === 1 ? "Section" : "Sections"}
              </Text>
            </View>

            <View className="flex-1 items-center border-r border-beige/30 dark:border-dark-border/30">
              <FontAwesome name="play-circle" size={20} color="#ACD6B8" />
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
                {totalLessons}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                {totalLessons === 1 ? "Lesson" : "Lessons"}
              </Text>
            </View>

            <View className="flex-1 items-center">
              <FontAwesome name="clock-o" size={20} color="#ACD6B8" />
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
                {formatDuration(totalDuration)}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                Duration
              </Text>
            </View>
          </View>

          {/* Instructor */}
          <View className="bg-white dark:bg-dark-card rounded-2xl p-6 mb-6 border border-beige/30 dark:border-dark-border/30">
            <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
              Instructor
            </Text>
            <View className="flex-row items-center">
              {course.shop.avatar ? (
                <Image
                  source={{ uri: course.shop.avatar }}
                  className="w-16 h-16 rounded-full mr-4"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mr-4">
                  <FontAwesome name="user" size={24} color="#ACD6B8" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
                  {course.shop.name}
                </Text>
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  {course.shop.description || "No description"}
                </Text>
              </View>
            </View>
          </View>

          {/* Course Content */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Course Content
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (course.sections.length > 0) {
                  const allExpanded = course.sections.every((s) =>
                    expandedSections.has(s.id)
                  );
                  if (allExpanded) {
                    setExpandedSections(new Set());
                  } else {
                    setExpandedSections(new Set(course.sections.map((s) => s.id)));
                  }
                }
              }}
            >
              <Text className="text-sm text-mint dark:text-gold font-semibold">
                {course.sections.every((s) => expandedSections.has(s.id))
                  ? "Collapse All"
                  : "Expand All"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sections */}
          {course.sections.map((section, sectionIndex) => {
            const isExpanded = expandedSections.has(section.id);
            const sectionDuration = section.lessons.reduce(
              (sum, lesson) => sum + lesson.durationSeconds,
              0
            );

            return (
              <View
                key={section.id}
                className="mb-4 bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-beige/30 dark:border-dark-border/30"
              >
                <TouchableOpacity
                  className="flex-row items-center justify-between p-4"
                  onPress={() => toggleSection(section.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-1 flex-row items-center">
                    <View className="w-8 h-8 rounded-lg bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3">
                      <Text className="text-mint dark:text-gold font-bold text-sm">
                        {sectionIndex + 1}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
                        {section.title}
                      </Text>
                      <View className="flex-row items-center">
                        <FontAwesome name="play-circle-o" size={12} color="#9CA3AF" />
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                          {section.lessons.length}{" "}
                          {section.lessons.length === 1 ? "lesson" : "lessons"}
                        </Text>
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mx-2">
                          •
                        </Text>
                        <FontAwesome name="clock-o" size={12} color="#9CA3AF" />
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                          {formatDuration(sectionDuration)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <FontAwesome
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View className="px-4 pb-4">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <TouchableOpacity
                        key={lesson.id}
                        className="flex-row items-center p-4 bg-beige/20 dark:bg-dark-border/20 rounded-xl mb-2"
                        activeOpacity={0.7}
                        onPress={() => handlePlayLesson(lesson, section)}
                      >
                        <View className="w-10 h-10 rounded-full bg-mint/20 dark:bg-gold/20 items-center justify-center mr-3">
                          <Text className="text-mint dark:text-gold font-bold">
                            {lessonIndex + 1}
                          </Text>
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
                            
                            {/* ✅ Linked Products Badge */}
                            {lesson.hasLinkedProducts && (
                              <>
                                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mx-2">
                                  •
                                </Text>
                                <FontAwesome name="shopping-bag" size={12} color="#ACD6B8" />
                                <Text className="text-xs text-mint dark:text-gold ml-1 font-semibold">
                                  {lesson.linkedProducts.length} {lesson.linkedProducts.length === 1 ? 'product' : 'products'}
                                </Text>
                              </>
                            )}
                          </View>
                        </View>

                        <View className={`w-10 h-10 rounded-full items-center justify-center ${
                          isEnrolled 
                            ? "bg-mint/10 dark:bg-gold/10" 
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}>
                          <FontAwesome 
                            name={isEnrolled ? "play" : "lock"} 
                            size={14} 
                            color={isEnrolled ? "#ACD6B8" : "#9CA3AF"} 
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {course.sections.length === 0 && (
            <View className="bg-white dark:bg-dark-card rounded-2xl p-8 items-center border border-beige/30 dark:border-dark-border/30">
              <FontAwesome name="folder-open-o" size={48} color="#D1D5DB" />
              <Text className="text-lg font-bold text-light-text dark:text-dark-text mt-4 mb-2">
                No Content Yet
              </Text>
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
                This course does not have any content yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
        <TouchableOpacity
          disabled={!isEnrolled && (!courseId || enrollMutation.isPending)}
          className={`rounded-full py-4 items-center flex-row justify-center
            ${isEnrolled ? "bg-mint dark:bg-gold" : "bg-mint/80 dark:bg-gold/80"}
            ${!isEnrolled && enrollMutation.isPending ? "opacity-60" : ""}
          `}
          onPress={isEnrolled ? handleStartLearning : handleEnroll}
        >
          {enrollMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <FontAwesome
                name={isEnrolled ? "play-circle" : "graduation-cap"}
                size={20}
                color="white"
              />
              <Text className="text-white text-base font-bold ml-2">
                {isEnrolled ? "Vào học" : "Enroll Now"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}