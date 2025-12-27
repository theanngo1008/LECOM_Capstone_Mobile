import { getRelativeTime } from "@/utils/dateUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCommunityPostDetail } from "../hooks/useCommunityPostDetail";
import { useCreateComment } from "../hooks/useCreateComment";

type PostDetailScreenProps = {
  route: {
    params: {
      postId: string;
    };
  };
  navigation: any;
};

const INITIAL_COMMENT_LIMIT = 3;

export function PostDetailScreen({ route, navigation }: PostDetailScreenProps) {
  const { postId } = route.params;
  const [commentBody, setCommentBody] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);

  const { data, isLoading, isError, refetch } = useCommunityPostDetail(postId);
  const { mutate: createComment, isPending: isCommenting } = useCreateComment(postId);

  const post = data?.result;

  const handleCreateComment = () => {
    if (!commentBody.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập bình luận");
      return;
    }

    createComment(
      { body: commentBody.trim() },
      {
        onSuccess: () => {
          setCommentBody("");
          refetch();
        },
        onError: (error: any) => {
          Alert.alert("Lỗi", error.message || "Không thể thêm bình luận");
        },
      }
    );
  };

  const formatDate = (dateString: string) => {
    return getRelativeTime(dateString);
  };

  const stripHtmlTags = (html: string) => {
    if (!html) return "";
    // Remove HTML tags and decode HTML entities
    return html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/&amp;/g, "&") // Replace &amp; with &
      .replace(/&lt;/g, "<") // Replace &lt; with <
      .replace(/&gt;/g, ">") // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .trim();
  };

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
        <View className="items-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4 text-base">
            Đang tải bài viết...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (isError || !post) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background px-6" edges={['top', 'bottom']}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="exclamation-triangle" size={40} color="#F2A297" />
          </View>
          <Text className="text-coral font-bold text-xl mb-2">Ồ!</Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
            Không thể tải chi tiết bài viết
          </Text>
          <TouchableOpacity
            className="bg-mint dark:bg-gold rounded-2xl py-3 px-8 active:opacity-80 mb-3"
            onPress={() => refetch()}
          >
            <Text className="text-white font-bold text-base">Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white dark:bg-dark-card rounded-2xl py-3 px-8 border-2 border-beige/30 dark:border-dark-border/30 active:opacity-80"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-light-text dark:text-dark-text font-bold text-base">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalComments = post.comments.length;
  const displayedComments = showAllComments 
    ? post.comments 
    : post.comments.slice(0, INITIAL_COMMENT_LIMIT);
  const hasMoreComments = totalComments > INITIAL_COMMENT_LIMIT;

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="w-10 h-10 rounded-xl bg-beige/20 dark:bg-dark-border/20 items-center justify-center mr-3 active:opacity-70"
              onPress={() => navigation.goBack()}
            >
              <FontAwesome name="chevron-left" size={18} color="#ACD6B8" />
            </TouchableOpacity>
            
            <View className="flex-1">
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
                Chi tiết bài viết
              </Text>
              <View className="flex-row items-center mt-1">
                <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  {totalComments} {totalComments === 1 ? 'bình luận' : 'bình luận'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Post Card */}
          <View className="bg-white dark:bg-dark-card mx-6 mt-6 rounded-2xl border border-beige/30 dark:border-dark-border/30 shadow-sm overflow-hidden">
            {/* Post Header */}
            <View className="p-4 border-b border-beige/30 dark:border-dark-border/30">
              <View className="flex-row items-center">
                {post.user.avatar ? (
                  <Image
                    source={{ uri: post.user.avatar }}
                    className="w-14 h-14 rounded-xl"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-14 h-14 rounded-xl bg-gradient-to-br from-mint to-skyBlue dark:from-gold dark:to-lavender items-center justify-center">
                    <Text className="text-2xl font-bold text-white">
                      {post.user.userName?.charAt(0).toUpperCase() || "U"}
                    </Text>
                  </View>
                )}
                <View className="flex-1 ml-3">
                  <Text className="text-lg font-bold text-light-text dark:text-dark-text">
                    {post.user.userName || "Ẩn danh"}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <FontAwesome name="clock-o" size={12} color="#9CA3AF" />
                    <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary ml-1">
                      {formatDate(post.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Post Content */}
            <View className="p-4">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-3">
                {post.title}
              </Text>
              <Text className="text-base text-light-text dark:text-dark-text leading-6">
                {stripHtmlTags(post.body)}
              </Text>
            </View>

            {/* Post Stats */}
            <View className="px-4 py-3 border-t border-beige/30 dark:border-dark-border/30 bg-beige/5 dark:bg-dark-border/5">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
                  <FontAwesome name="comment" size={14} color="#ACD6B8" />
                </View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                  {totalComments} {totalComments === 1 ? 'bình luận' : 'bình luận'}
                </Text>
              </View>
            </View>
          </View>

          {/* Comments Section */}
          <View className="px-6 mt-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-lg bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
                <FontAwesome name="comments" size={14} color="#ACD6B8" />
              </View>
              <Text className="text-lg font-bold text-light-text dark:text-dark-text">
                Bình luận
              </Text>
              <View className="flex-1 h-px bg-beige/30 dark:bg-dark-border/30 ml-3" />
            </View>

            {totalComments === 0 ? (
              <View className="bg-white dark:bg-dark-card rounded-2xl p-8 items-center border border-beige/30 dark:border-dark-border/30">
                <View className="w-16 h-16 rounded-full bg-mint/10 dark:bg-gold/10 items-center justify-center mb-3">
                  <FontAwesome name="comment-o" size={28} color="#ACD6B8" />
                </View>
                <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
                  Chưa có bình luận
                </Text>
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center">
                  Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!
                </Text>
              </View>
            ) : (
              <>
                <View className="gap-3">
                  {displayedComments.map((comment, index) => (
                    <View 
                      key={comment.id}
                      className="bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30"
                    >
                      <View className="flex-row items-start">
                        {comment.user.avatar ? (
                          <Image
                            source={{ uri: comment.user.avatar }}
                            className="w-10 h-10 rounded-lg"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-10 h-10 rounded-lg bg-gradient-to-br from-skyBlue to-lavender dark:from-lavender dark:to-mint items-center justify-center">
                            <Text className="text-base font-bold text-white">
                              {comment.user.userName?.charAt(0).toUpperCase() || "U"}
                            </Text>
                          </View>
                        )}
                        <View className="flex-1 ml-3">
                          <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-base font-bold text-light-text dark:text-dark-text">
                              {comment.user.userName || "Ẩn danh"}
                            </Text>
                            <View className="flex-row items-center">
                              <FontAwesome name="clock-o" size={10} color="#9CA3AF" />
                              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                                {formatDate(comment.createdAt)}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-sm text-light-text dark:text-dark-text leading-5">
                            {comment.body}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Show More/Less Button */}
                {hasMoreComments && (
                  <TouchableOpacity
                    className="mt-4 bg-white dark:bg-dark-card rounded-2xl py-3 px-4 border border-mint/30 dark:border-gold/30 active:opacity-70"
                    onPress={() => setShowAllComments(!showAllComments)}
                  >
                    <View className="flex-row items-center justify-center">
                      <FontAwesome 
                        name={showAllComments ? "chevron-up" : "chevron-down"} 
                        size={14} 
                        color="#ACD6B8" 
                      />
                      <Text className="text-mint dark:text-gold font-semibold text-sm ml-2">
                        {showAllComments 
                          ? "Ẩn bớt" 
                          : `Xem thêm ${totalComments - INITIAL_COMMENT_LIMIT} ${totalComments - INITIAL_COMMENT_LIMIT === 1 ? 'bình luận' : 'bình luận'}`
                        }
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
          <View className="flex-row items-end gap-3">
            <View className="flex-1 bg-beige/20 dark:bg-dark-border/20 rounded-2xl px-4 py-2 border border-beige/30 dark:border-dark-border/30">
              <TextInput
                className="text-base text-light-text dark:text-dark-text max-h-[100px]"
                value={commentBody}
                onChangeText={setCommentBody}
                placeholder="Viết bình luận..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
                editable={!isCommenting}
              />
            </View>
            
            <TouchableOpacity
              className={`w-12 h-12 rounded-xl items-center justify-center shadow-sm ${
                commentBody.trim() && !isCommenting
                  ? 'bg-mint dark:bg-gold'
                  : 'bg-beige/20 dark:bg-dark-border/20'
              }`}
              onPress={handleCreateComment}
              disabled={!commentBody.trim() || isCommenting}
              activeOpacity={0.7}
            >
              {isCommenting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <FontAwesome 
                  name="send" 
                  size={18} 
                  color={commentBody.trim() ? "white" : "#9CA3AF"} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}