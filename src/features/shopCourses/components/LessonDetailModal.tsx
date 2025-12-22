import { CourseLesson } from "@/api/shopCourses";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ResizeMode, Video } from "expo-av";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface LessonDetailModalProps {
  visible: boolean;
  lesson: CourseLesson | null;
  onClose: () => void;
  onLinkProduct: (lessonId: string) => void;
  getApprovalStatusColor: (status: "Approved" | "Pending" | "Rejected") => string;
  getApprovalStatusTextColor: (status: "Approved" | "Pending" | "Rejected") => string;
  getApprovalStatusText: (status: "Approved" | "Pending" | "Rejected") => string;
  formatDuration: (seconds: number | null) => string;
  formatPrice: (price: number) => string;
}

export function LessonDetailModal({
  visible,
  lesson,
  onClose,
  onLinkProduct,
  getApprovalStatusColor,
  getApprovalStatusTextColor,
  getApprovalStatusText,
  formatDuration,
  formatPrice,
}: LessonDetailModalProps) {
  const videoRef = useRef<Video>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const SCREEN_WIDTH = Dimensions.get("window").width;
  const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16; // 16:9 aspect ratio

  React.useEffect(() => {
    if (visible && lesson) {
      console.log("📚 LessonDetailModal - Lesson data:", lesson);
      // Reset error when lesson changes
      setVideoError(null);
      setIsVideoLoading(true);
    }
    // Reset video state when modal closes
    if (!visible) {
      setIsVideoLoading(true);
      setIsPlaying(false);
      setVideoError(null);
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    }
  }, [visible, lesson]);

  const handleVideoPress = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Video play error:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white dark:bg-dark-card rounded-3xl p-6 w-full" style={{ maxHeight: "90%" }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Chi tiết bài học
            </Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="times" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {!lesson ? (
            <View className="py-8 items-center">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                Không có thông tin bài học
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
            {/* Lesson Info */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-2">
                {lesson.title}
              </Text>
              <View className="flex-row items-center flex-wrap mb-2">
                <View className="flex-row items-center px-2 py-1 rounded-lg bg-mint/10 dark:bg-gold/10 mr-2 mb-2">
                  <FontAwesome
                    name={lesson.type === "Quiz" ? "question-circle" : "video-camera"}
                    size={12}
                    color="#ACD6B8"
                  />
                  <Text className="text-xs font-semibold text-mint dark:text-gold ml-1">
                    {lesson.type}
                  </Text>
                </View>
                {lesson.durationSeconds !== null && (
                  <View className="flex-row items-center px-2 py-1 rounded-lg bg-beige/20 dark:bg-dark-border/20 mr-2 mb-2">
                    <FontAwesome name="clock-o" size={12} color="#9CA3AF" />
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                      {formatDuration(lesson.durationSeconds)}
                    </Text>
                  </View>
                )}
                <View
                  className={`px-2 py-1 rounded-lg border mb-2 ${getApprovalStatusColor(
                    lesson.approvalStatus
                  )}`}
                >
                  <Text
                    className={`text-xs font-semibold ${getApprovalStatusTextColor(
                      lesson.approvalStatus
                    )}`}
                  >
                    {getApprovalStatusText(lesson.approvalStatus)}
                  </Text>
                </View>
              </View>
              {lesson.moderatorNote && (
                <View className="px-3 py-2 bg-beige/30 dark:bg-dark-border/30 rounded-lg mb-2">
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                    <Text className="font-semibold">Ghi chú từ quản trị viên: </Text>
                    {lesson.moderatorNote}
                  </Text>
                </View>
              )}
            </View>

            {/* Video Content */}
            {lesson.type === "Video" && lesson.contentUrl && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Video
                </Text>
                <View className="bg-black rounded-lg overflow-hidden">
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleVideoPress}
                    className="relative"
                    style={{ height: VIDEO_HEIGHT }}
                  >
                    <Video
                      ref={videoRef}
                      source={{ uri: lesson.contentUrl }}
                      style={{ width: "100%", height: VIDEO_HEIGHT }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={false}
                      isLooping={false}
                      onPlaybackStatusUpdate={(status: any) => {
                        if (status.isLoaded) {
                          setIsVideoLoading(false);
                          setIsPlaying(status.isPlaying);
                          setVideoError(null);
                        } else if (status.error) {
                          setIsVideoLoading(false);
                          const errorMessage = status.error?.message || "";
                          if (errorMessage.includes("UnknownHostException") || errorMessage.includes("Unable to resolve host")) {
                            setVideoError("URL video không hợp lệ hoặc không thể kết nối đến server.");
                          } else {
                            setVideoError("Không thể tải video. Vui lòng kiểm tra kết nối mạng.");
                          }
                          console.error("Video playback error:", status.error);
                        }
                      }}
                      onError={(error: any) => {
                        console.error("Video error:", error);
                        setIsVideoLoading(false);
                        const errorMessage = error?.message || String(error) || "";
                        if (errorMessage.includes("UnknownHostException") || errorMessage.includes("Unable to resolve host")) {
                          setVideoError("URL video không hợp lệ hoặc không thể kết nối đến server.");
                        } else {
                          setVideoError("Không thể tải video. Vui lòng kiểm tra URL hoặc kết nối mạng.");
                        }
                      }}
                    />

                    {/* Loading Overlay */}
                    {isVideoLoading && !videoError && (
                      <View className="absolute inset-0 items-center justify-center bg-black/50">
                        <ActivityIndicator size="large" color="#ACD6B8" />
                        <Text className="text-white mt-2 text-xs">Đang tải video...</Text>
                      </View>
                    )}

                    {/* Error Overlay */}
                    {videoError && (
                      <View className="absolute inset-0 items-center justify-center bg-black/70 px-4">
                        <FontAwesome name="exclamation-triangle" size={32} color="#FF6B6B" />
                        <Text className="text-white mt-3 text-sm text-center">{videoError}</Text>
                        <TouchableOpacity
                          className="mt-4 px-4 py-2 bg-mint dark:bg-gold rounded-lg"
                          onPress={async () => {
                            setVideoError(null);
                            setIsVideoLoading(true);
                            if (videoRef.current && lesson?.contentUrl) {
                              try {
                                await videoRef.current.unloadAsync();
                                await videoRef.current.loadAsync({ uri: lesson.contentUrl });
                              } catch (error) {
                                console.error("Reload video error:", error);
                                setVideoError("Không thể tải lại video.");
                                setIsVideoLoading(false);
                              }
                            }
                          }}
                        >
                          <Text className="text-white font-semibold text-xs">Thử lại</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Play/Pause Button Overlay */}
                    {!isVideoLoading && !videoError && (
                      <View className="absolute inset-0 items-center justify-center">
                        <View className="w-16 h-16 rounded-full bg-black/50 items-center justify-center">
                          <FontAwesome
                            name={isPlaying ? "pause" : "play"}
                            size={24}
                            color="white"
                          />
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Quiz Content */}
            {lesson.type === "Quiz" && lesson.quiz && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">
                  Câu hỏi ({lesson.quiz.questions?.length || 0})
                </Text>
                {lesson.quiz.questions?.map((question, questionIndex) => (
                  <View
                    key={questionIndex}
                    className="mb-4 p-4 bg-beige/20 dark:bg-dark-border/20 rounded-xl border border-beige/30 dark:border-dark-border/30"
                  >
                    <View className="flex-row items-start mb-3">
                      <View className="w-6 h-6 rounded-full bg-mint/20 dark:bg-gold/20 items-center justify-center mr-2">
                        <Text className="text-xs font-bold text-mint dark:text-gold">
                          {questionIndex + 1}
                        </Text>
                      </View>
                      <Text className="flex-1 text-base font-semibold text-light-text dark:text-dark-text">
                        {question.content}
                      </Text>
                    </View>

                    <View className="ml-8">
                      <Text className="text-xs font-semibold text-light-textSecondary dark:text-dark-textSecondary mb-2">
                        Đáp án:
                      </Text>
                      {question.answers?.map((answer, answerIndex) => (
                        <View
                          key={answerIndex}
                          className="flex-row items-center mb-2 p-2 rounded-lg bg-white/50 dark:bg-dark-card/50"
                        >
                          <View
                            className={`w-5 h-5 rounded-full border-2 mr-2 items-center justify-center ${
                              answer.isCorrect
                                ? "border-mint dark:border-gold bg-mint/20 dark:bg-gold/20"
                                : "border-gray-300 dark:border-dark-border"
                            }`}
                          >
                            {answer.isCorrect && (
                              <FontAwesome name="check" size={10} color="#ACD6B8" />
                            )}
                          </View>
                          <Text
                            className={`flex-1 text-sm ${
                              answer.isCorrect
                                ? "text-mint dark:text-gold font-semibold"
                                : "text-light-text dark:text-dark-text"
                            }`}
                          >
                            {answer.content}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Linked Products */}
            {lesson.linkedProducts && lesson.linkedProducts.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Sản phẩm đã liên kết ({lesson.linkedProducts.length})
                </Text>
                {lesson.linkedProducts.map((product) => (
                  <View
                    key={product.id}
                    className="flex-row items-center p-3 bg-beige/20 dark:bg-dark-border/20 rounded-lg mb-2"
                  >
                    {product.thumbnailUrl ? (
                      <Image
                        source={{ uri: product.thumbnailUrl }}
                        className="w-12 h-12 rounded-lg mr-3"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-12 h-12 rounded-lg bg-beige/40 dark:bg-dark-border/40 items-center justify-center mr-3">
                        <FontAwesome name="image" size={16} color="#9CA3AF" />
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                        {product.name}
                      </Text>
                      <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                        {product.shopName}
                      </Text>
                    </View>
                    <Text className="text-sm font-bold text-mint dark:text-gold">
                      {formatPrice(product.price)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                className="flex-1 bg-mint/10 dark:bg-gold/10 rounded-full py-3 items-center border border-mint dark:border-gold"
                onPress={() => {
                  onLinkProduct(lesson.id);
                  onClose();
                }}
              >
                <Text className="text-mint dark:text-gold font-semibold">
                  Liên kết sản phẩm
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-white dark:bg-dark-card rounded-full py-3 items-center border-2 border-beige/30 dark:border-dark-border/30"
                onPress={onClose}
              >
                <Text className="text-light-text dark:text-dark-text font-semibold">
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

