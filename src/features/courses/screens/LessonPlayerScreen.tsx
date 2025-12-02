import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLearnCourse } from "../hooks/useLearnCourse";
import { useCompleteLesson } from "../hooks/useCompleteLesson";

const { width } = Dimensions.get("window");
const VIDEO_HEIGHT = (width * 9) / 16; // 16:9 aspect ratio

export function LessonPlayerScreen({ navigation, route }: any) {
  const { courseId, sectionId, lessonId } = route.params;

  // ✅ Use Learn Course Hook
  const { data, isLoading, isError, refetch } = useLearnCourse(courseId);

  // ✅ Use Complete Lesson Hook
  const completeLessonMutation = useCompleteLesson();

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [playbackStatus, setPlaybackStatus] = useState<any>({});
  const [hasCompletedLesson, setHasCompletedLesson] = useState(false);

  // ✅ Extract data from API response
  const learnData = data?.result;
  const course = learnData?.course;
  const progress = learnData?.progress;
  const sections = learnData?.sections || [];

  // ✅ Find current section and lesson
  const currentSection = sections.find((s) => s.id === sectionId);
  const currentLesson = currentSection?.lessons.find((l) => l.id === lessonId);

  // ✅ Check if video is completed (watched 95% or more)
  useEffect(() => {
    if (playbackStatus.isLoaded && playbackStatus.durationMillis) {
      const progress = playbackStatus.positionMillis / playbackStatus.durationMillis;
      const hasWatchedEnough = progress >= 0.95; // 95% threshold

      // Only complete once per lesson and if not already completed
      if (
        hasWatchedEnough &&
        !hasCompletedLesson &&
        !currentLesson?.isCompleted &&
        lessonId
      ) {
        console.log("✅ Video completed! Marking lesson as complete...");
        setHasCompletedLesson(true);

        // Call API to mark lesson as completed
        completeLessonMutation.mutate(lessonId, {
          onSuccess: () => {
            console.log("✅ Lesson marked as completed successfully");
          },
          onError: (error) => {
            console.error("❌ Failed to mark lesson as completed:", error);
            setHasCompletedLesson(false); // Reset on error
          },
        });
      }
    }
  }, [
    playbackStatus.positionMillis,
    playbackStatus.durationMillis,
    playbackStatus.isLoaded,
    hasCompletedLesson,
    currentLesson?.isCompleted,
    lessonId,
  ]);

  // ✅ Reset completion state when changing lessons
  useEffect(() => {
    setHasCompletedLesson(false);
  }, [lessonId]);

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoPress = () => {
    setShowControls(!showControls);
    // Auto hide controls after 3 seconds
    if (!showControls) {
      setTimeout(() => setShowControls(false), 3000);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleProductPress = (product: any) => {
    navigation.navigate("ProductDetail", { slug: product.slug });
  };

  const handleLessonPress = (lesson: any, section: any) => {
    // Navigate to new lesson
    navigation.push("LessonPlayer", {
      courseId: courseId,
      sectionId: section.id,
      lessonId: lesson.id,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Loading lesson...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !currentLesson) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesome name="exclamation-circle" size={64} color="#FF6B6B" />
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
            Lesson Not Found
          </Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
            Unable to load lesson information
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
      {/* Header */}
      <View className="bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30 px-6 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-xl bg-beige/20 dark:bg-dark-border/20 items-center justify-center mr-3"
          >
            <FontAwesome name="arrow-left" size={16} color="#2D3748" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text
              className="text-base font-bold text-light-text dark:text-dark-text"
              numberOfLines={1}
            >
              {currentLesson.title}
            </Text>
            <Text
              className="text-xs text-light-textSecondary dark:text-dark-textSecondary"
              numberOfLines={1}
            >
              {course?.title}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        {progress && (
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                Course Progress
              </Text>
              <Text className="text-xs font-bold text-mint dark:text-gold">
                {progress.completedLessons}/{progress.totalLessons} lessons • {progress.percent}%
              </Text>
            </View>
            <View className="h-2 bg-beige/30 dark:bg-dark-border/30 rounded-full overflow-hidden">
              <View
                className="h-full bg-mint dark:bg-gold rounded-full"
                style={{ width: `${progress.percent}%` }}
              />
            </View>
          </View>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Video Player */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleVideoPress}
          className="relative bg-black"
          style={{ height: VIDEO_HEIGHT }}
        >
          <Video
            ref={videoRef}
            source={{ uri: currentLesson.contentUrl }}
            style={{ width: "100%", height: VIDEO_HEIGHT }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping={false}
            onPlaybackStatusUpdate={(status: any) => {
              setPlaybackStatus(status);
              if (status.isLoaded) {
                setIsVideoLoading(false);
                setIsPlaying(status.isPlaying);
              }
            }}
            onError={(error) => {
              console.error("Video error:", error);
              setIsVideoLoading(false);
            }}
          />

          {/* Completed Badge */}
          {(currentLesson.isCompleted || hasCompletedLesson) && (
            <View className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-green-500 flex-row items-center">
              <FontAwesome name="check-circle" size={14} color="white" />
              <Text className="text-white text-xs font-bold ml-1">Completed</Text>
            </View>
          )}

          {/* Loading Overlay */}
          {isVideoLoading && (
            <View className="absolute inset-0 items-center justify-center bg-black/50">
              <ActivityIndicator size="large" color="#ACD6B8" />
              <Text className="text-white mt-2">Loading video...</Text>
            </View>
          )}

          {/* Controls Overlay */}
          {showControls && !isVideoLoading && (
            <View className="absolute inset-0 bg-black/30">
              {/* Center Play/Pause Button */}
              <View className="flex-1 items-center justify-center">
                <TouchableOpacity
                  onPress={handlePlayPause}
                  className="w-16 h-16 rounded-full bg-white/90 items-center justify-center"
                >
                  <FontAwesome
                    name={isPlaying ? "pause" : "play"}
                    size={24}
                    color="#2D3748"
                    style={{ marginLeft: isPlaying ? 0 : 4 }}
                  />
                </TouchableOpacity>
              </View>

              {/* Bottom Controls */}
              <View className="p-4">
                <View className="flex-row items-center">
                  <Text className="text-white text-xs mr-2">
                    {playbackStatus.positionMillis
                      ? formatTime(playbackStatus.positionMillis)
                      : "0:00"}
                  </Text>
                  <View className="flex-1 h-1 bg-white/30 rounded-full">
                    <View
                      className="h-full bg-mint dark:bg-gold rounded-full"
                      style={{
                        width: `${
                          playbackStatus.durationMillis
                            ? (playbackStatus.positionMillis /
                                playbackStatus.durationMillis) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </View>
                  <Text className="text-white text-xs ml-2">
                    {playbackStatus.durationMillis
                      ? formatTime(playbackStatus.durationMillis)
                      : "0:00"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Lesson Info */}
        <View className="px-6 py-6">
          {/* Section Info */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="px-3 py-1 rounded-full bg-mint/10 dark:bg-gold/10">
              <Text className="text-mint dark:text-gold text-xs font-semibold">
                {currentSection?.title}
              </Text>
            </View>
            
            {currentLesson.xpReward > 0 && (
              <View className="flex-row items-center px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <FontAwesome name="star" size={12} color="#F97316" />
                <Text className="text-orange-600 dark:text-orange-400 text-xs font-bold ml-1">
                  +{currentLesson.xpReward} XP
                </Text>
              </View>
            )}
          </View>

          {/* Lesson Title */}
          <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
            {currentLesson.title}
          </Text>

          {/* Stats */}
          <View className="flex-row items-center mb-6">
            <FontAwesome name="video-camera" size={14} color="#9CA3AF" />
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary ml-2">
              {currentLesson.type}
            </Text>
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mx-2">
              •
            </Text>
            <FontAwesome name="clock-o" size={14} color="#9CA3AF" />
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary ml-2">
              {formatDuration(currentLesson.durationSeconds)}
            </Text>
            {currentLesson.linkedProducts.length > 0 && (
              <>
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mx-2">
                  •
                </Text>
                <FontAwesome name="shopping-bag" size={14} color="#ACD6B8" />
                <Text className="text-sm text-mint dark:text-gold ml-2 font-semibold">
                  {currentLesson.linkedProducts.length}{" "}
                  {currentLesson.linkedProducts.length === 1 ? "product" : "products"}
                </Text>
              </>
            )}
          </View>

          {/* Linked Products */}
          {currentLesson.linkedProducts.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
                Featured Products
              </Text>

              {currentLesson.linkedProducts.map((product: any) => (
                <TouchableOpacity
                  key={product.id}
                  onPress={() => handleProductPress(product)}
                  className="bg-white dark:bg-dark-card rounded-2xl p-4 mb-3 border border-beige/30 dark:border-dark-border/30"
                  activeOpacity={0.7}
                >
                  <View className="flex-row">
                    {/* Product Image */}
                    {product.thumbnailUrl ? (
                      <Image
                        source={{ uri: product.thumbnailUrl }}
                        className="w-20 h-20 rounded-xl mr-4"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-20 h-20 rounded-xl bg-beige/20 dark:bg-dark-border/20 items-center justify-center mr-4">
                        <FontAwesome name="shopping-bag" size={24} color="#ACD6B8" />
                      </View>
                    )}

                    {/* Product Info */}
                    <View className="flex-1">
                      <Text
                        className="text-base font-bold text-light-text dark:text-dark-text mb-2"
                        numberOfLines={2}
                      >
                        {product.name}
                      </Text>

                      <Text className="text-lg font-bold text-mint dark:text-gold mb-2">
                        {new Intl.NumberFormat("vi-VN").format(product.price)}₫
                      </Text>

                      <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                        by {product.shopName}
                      </Text>
                    </View>

                    {/* Arrow */}
                    <View className="items-center justify-center ml-2">
                      <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Course Lessons List */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
              Course Lessons
            </Text>

            {sections.map((section) => (
              <View
                key={section.id}
                className="mb-4 bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-beige/30 dark:border-dark-border/30"
              >
                <View className="p-4 border-b border-beige/30 dark:border-dark-border/30">
                  <Text className="text-base font-bold text-light-text dark:text-dark-text">
                    {section.title}
                  </Text>
                </View>

                {section.lessons.map((lesson, index) => {
                  const isCurrentLesson = lesson.id === lessonId;
                  const isLessonCompleted =
                    lesson.isCompleted || (isCurrentLesson && hasCompletedLesson);
                  
                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      onPress={() => handleLessonPress(lesson, section)}
                      className={`flex-row items-center p-4 border-b border-beige/20 dark:border-dark-border/20 ${
                        isCurrentLesson ? "bg-mint/5 dark:bg-gold/5" : ""
                      }`}
                      activeOpacity={0.7}
                    >
                      <View
                        className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                          isLessonCompleted
                            ? "bg-green-100 dark:bg-green-900/30"
                            : isCurrentLesson
                            ? "bg-mint/20 dark:bg-gold/20"
                            : "bg-beige/20 dark:bg-dark-border/20"
                        }`}
                      >
                        {isLessonCompleted ? (
                          <FontAwesome name="check" size={14} color="#10B981" />
                        ) : (
                          <Text
                            className={`font-bold text-sm ${
                              isCurrentLesson
                                ? "text-mint dark:text-gold"
                                : "text-light-textSecondary dark:text-dark-textSecondary"
                            }`}
                          >
                            {index + 1}
                          </Text>
                        )}
                      </View>

                      <View className="flex-1">
                        <Text
                          className={`text-sm font-semibold mb-1 ${
                            isCurrentLesson
                              ? "text-mint dark:text-gold"
                              : "text-light-text dark:text-dark-text"
                          }`}
                          numberOfLines={2}
                        >
                          {lesson.title}
                        </Text>
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                          {formatDuration(lesson.durationSeconds)}
                        </Text>
                      </View>

                      {isCurrentLesson && (
                        <FontAwesome name="play-circle" size={16} color="#ACD6B8" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}