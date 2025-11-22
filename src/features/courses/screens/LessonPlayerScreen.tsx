import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ResizeMode, Video } from "expo-av";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const VIDEO_HEIGHT = (width * 9) / 16; // 16:9 aspect ratio

export function LessonPlayerScreen({ navigation, route }: any) {
  const {
    courseId,
    courseTitle,
    sectionId,
    sectionTitle,
    lessonId,
    lessonTitle,
    contentUrl,
    hasLinkedProducts,
    linkedProducts = [],
  } = route.params;

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [playbackStatus, setPlaybackStatus] = useState<any>({});

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

  const handleProductPress = (product: any) => {
    navigation.navigate("ProductDetail", { slug: product.slug });
  };

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
      {/* Header */}
      <View className="bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30 px-6 py-4">
        <View className="flex-row items-center">
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
              {lessonTitle}
            </Text>
            <Text
              className="text-xs text-light-textSecondary dark:text-dark-textSecondary"
              numberOfLines={1}
            >
              {courseTitle}
            </Text>
          </View>
        </View>
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
            source={{ uri: contentUrl }}
            style={{ width: "100%", height: VIDEO_HEIGHT }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping={false}
            onPlaybackStatusUpdate={(status: any) => {
              setPlaybackStatus(status);
              if (status.isLoaded) {
                setIsLoading(false);
                setIsPlaying(status.isPlaying);
              }
            }}
            onError={(error) => {
              console.error("Video error:", error);
              setIsLoading(false);
            }}
          />

          {/* Loading Overlay */}
          {isLoading && (
            <View className="absolute inset-0 items-center justify-center bg-black/50">
              <ActivityIndicator size="large" color="#ACD6B8" />
              <Text className="text-white mt-2">Loading video...</Text>
            </View>
          )}

          {/* Controls Overlay */}
          {showControls && !isLoading && (
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
          <View className="flex-row items-center mb-3">
            <View className="px-3 py-1 rounded-full bg-mint/10 dark:bg-gold/10">
              <Text className="text-mint dark:text-gold text-xs font-semibold">
                {sectionTitle}
              </Text>
            </View>
          </View>

          {/* Lesson Title */}
          <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
            {lessonTitle}
          </Text>

          {/* Stats */}
          <View className="flex-row items-center mb-6">
            <FontAwesome name="video-camera" size={14} color="#9CA3AF" />
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary ml-2">
              Video Lesson
            </Text>
            {hasLinkedProducts && (
              <>
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mx-2">
                  •
                </Text>
                <FontAwesome name="shopping-bag" size={14} color="#ACD6B8" />
                <Text className="text-sm text-mint dark:text-gold ml-2 font-semibold">
                  {linkedProducts.length}{" "}
                  {linkedProducts.length === 1 ? "product" : "products"} featured
                </Text>
              </>
            )}
          </View>

         {/* Linked Products */}
{hasLinkedProducts && linkedProducts.length > 0 && (
  <View className="mb-6">
    <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
      Featured Products
    </Text>

    {linkedProducts.map((product: any) => (
      <TouchableOpacity
        key={product.id}
        onPress={() => navigation.navigate("ProductDetail", { slug: product.slug })}
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
            {/* Name */}
            <Text
              className="text-base font-bold text-light-text dark:text-dark-text mb-1"
              numberOfLines={2}
            >
              {product.name}
            </Text>

            {/* Description */}
            <Text
              className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-2"
              numberOfLines={2}
            >
              {product.description || "No description available"}
            </Text>

            {/* Price */}
            <View className="flex-row items-center mb-2">
              <Text className="text-lg font-bold text-mint dark:text-gold">
                {new Intl.NumberFormat("vi-VN").format(product.price)}₫
              </Text>

              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary line-through ml-2">
                    {new Intl.NumberFormat("vi-VN").format(
                      product.compareAtPrice
                    )}₫
                  </Text>
                )}
            </View>

            {/* Stock Status */}
           
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



          {/* No Products Message */}
          {!hasLinkedProducts && (
            <View className="bg-beige/20 dark:bg-dark-border/20 rounded-2xl p-6 items-center">
              <FontAwesome name="info-circle" size={32} color="#9CA3AF" />
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mt-2">
                No products are featured in this lesson
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}