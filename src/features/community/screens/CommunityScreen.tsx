import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { getRelativeTime } from "@/utils/dateUtils";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCommunityPosts } from "../hooks/useCommunityPosts";
import { useCreateCommunityPost } from "../hooks/useCreateCommunityPost";

export function CommunityScreen({ navigation: routeNavigation }: any) {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const { mutate: createPost, isPending: isCreating } = useCreateCommunityPost();
  const { data, isLoading, isError, refetch, isRefetching } = useCommunityPosts();

  const posts = data?.result || [];

  const handleCreatePost = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    createPost(
      { title: title.trim(), body: body.trim() },
      {
        onSuccess: () => {
          Alert.alert("Thành công", "Đã tạo bài viết thành công!");
          setTitle("");
          setBody("");
          setShowCreateModal(false);
          refetch();
        },
        onError: (error: any) => {
          Alert.alert("Lỗi", error.message || "Không thể tạo bài viết");
        },
      }
    );
  };

  const toggleComments = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
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
  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background px-6" edges={['top', 'bottom']}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="exclamation-triangle" size={40} color="#F2A297" />
          </View>
          <Text className="text-coral font-bold text-xl mb-2">Ồ!</Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
            Không thể tải bài viết
          </Text>
          <TouchableOpacity
            className="bg-mint dark:bg-gold rounded-2xl py-3 px-8 active:opacity-80"
            onPress={() => refetch()}
          >
            <Text className="text-white font-bold text-base">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-center justify-between mb-4">
          {/* Left - Menu Button */}
          <TouchableOpacity
            className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3"
            onPress={() => navigation.openDrawer()}
          >
            <FontAwesome name="bars" size={20} color="#ACD6B8" />
          </TouchableOpacity>

          {/* Center - Title */}
          <View className="flex-1">
            <Text className="text-3xl font-bold text-light-text dark:text-dark-text">
              Cộng đồng
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                {posts.length} {posts.length === 1 ? 'bài viết' : 'bài viết'}
              </Text>
            </View>
          </View>

          {/* Right - Create Post Button */}
          <TouchableOpacity
            className="w-12 h-12 rounded-xl bg-mint dark:bg-gold items-center justify-center shadow-lg"
            onPress={() => setShowCreateModal(true)}
          >
            <FontAwesome name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts List */}
      {posts.length === 0 ? (
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-32 h-32 rounded-full bg-mint/20 dark:bg-gold/20 items-center justify-center mb-6">
              <FontAwesome name="comments" size={60} color="#ACD6B8" />
            </View>
            
            <Text className="text-3xl font-bold text-light-text dark:text-dark-text mb-3 text-center">
              Chưa có bài viết
            </Text>
            
            <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary text-center mb-8 px-4">
              Hãy là người đầu tiên chia sẻ điều gì đó với cộng đồng!
            </Text>

            <TouchableOpacity
              className="bg-mint dark:bg-gold rounded-2xl py-4 px-8 shadow-lg active:opacity-80"
              onPress={() => setShowCreateModal(true)}
            >
              <View className="flex-row items-center">
                <FontAwesome name="plus" size={18} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Tạo bài viết</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#ACD6B8"
            />
          }
          renderItem={({ item: post }) => (
            <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
    >
            <View className="bg-white dark:bg-dark-card rounded-2xl mb-4 border border-beige/30 dark:border-dark-border/30 shadow-sm overflow-hidden">
              {/* Post Header */}
              <View className="p-4 border-b border-beige/30 dark:border-dark-border/30">
                <View className="flex-row items-center">
                  {post.user.avatar ? (
                    <Image
                      source={{ uri: post.user.avatar }}
                      className="w-12 h-12 rounded-xl bg-beige/20"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-xl bg-mint/20 dark:bg-gold/20 items-center justify-center">
                      <Text className="text-xl font-bold text-mint dark:text-gold">
                        {post.user.userName?.charAt(0).toUpperCase() || "U"}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-bold text-light-text dark:text-dark-text">
                      {post.user.userName || "Ẩn danh"}
                    </Text>
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                      {formatDate(post.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Post Content */}
              <View className="p-4">
                <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-2">
                  {post.title}
                </Text>
                <Text className="text-base text-light-text dark:text-dark-text leading-6">
                  {stripHtmlTags(post.body)}
                </Text>
              </View>

              {/* Post Footer */}
              <View className="px-4 py-3 border-t border-beige/30 dark:border-dark-border/30 bg-beige/10 dark:bg-dark-border/10">
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => toggleComments(post.id)}
                >
                  <View className="w-8 h-8 rounded-lg bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
                    <FontAwesome name="comment" size={14} color="#ACD6B8" />
                  </View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                    {post.comments.length} {post.comments.length === 1 ? 'bình luận' : 'bình luận'}
                  </Text>
                  <FontAwesome 
                    name={expandedPosts.has(post.id) ? "chevron-up" : "chevron-down"} 
                    size={12} 
                    color="#9CA3AF" 
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              </View>

              {/* Comments Section */}
              {expandedPosts.has(post.id) && post.comments.length > 0 && (
                <View className="px-4 py-3 bg-beige/5 dark:bg-dark-border/5 border-t border-beige/30 dark:border-dark-border/30">
                  {post.comments.map((comment, index) => (
                    <View 
                      key={comment.id}
                      className={`flex-row items-start ${index > 0 ? 'mt-3 pt-3 border-t border-beige/20 dark:border-dark-border/20' : ''}`}
                    >
                      {comment.user.avatar ? (
                        <Image
                          source={{ uri: comment.user.avatar }}
                          className="w-8 h-8 rounded-lg bg-beige/20"
                        />
                      ) : (
                        <View className="w-8 h-8 rounded-lg bg-skyBlue/20 dark:bg-lavender/20 items-center justify-center">
                          <Text className="text-sm font-bold text-skyBlue dark:text-lavender">
                            {comment.user.userName?.charAt(0).toUpperCase() || "U"}
                          </Text>
                        </View>
                      )}
                      <View className="flex-1 ml-3">
                        <View className="bg-white dark:bg-dark-card rounded-2xl px-3 py-2 border border-beige/30 dark:border-dark-border/30">
                          <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-1">
                            {comment.user.userName || "Ẩn danh"}
                          </Text>
                          <Text className="text-sm text-light-text dark:text-dark-text leading-5">
                            {comment.body}
                          </Text>
                        </View>
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1 ml-3">
                          {formatDate(comment.createdAt)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
             </TouchableOpacity>
          )}
        />
      )}

      {/* Create Post Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-20 bg-cream dark:bg-dark-background rounded-t-3xl">
            {/* Modal Header */}
            <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30 rounded-t-3xl">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
                    Tạo bài viết
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
                    <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      Chia sẻ với cộng đồng
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  className="w-10 h-10 rounded-xl bg-coral/10 items-center justify-center"
                  onPress={() => setShowCreateModal(false)}
                  disabled={isCreating}
                >
                  <FontAwesome name="times" size={20} color="#F2A297" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView 
              className="flex-1 px-6 py-6"
              showsVerticalScrollIndicator={false}
            >
              {/* Title Input */}
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-lg bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
                    <FontAwesome name="header" size={14} color="#ACD6B8" />
                  </View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                    Tiêu đề <Text className="text-coral">*</Text>
                  </Text>
                </View>
                
                <View className="bg-white dark:bg-dark-card rounded-2xl border border-beige/30 dark:border-dark-border/30 px-4">
                  <TextInput
                    className="text-base text-light-text dark:text-dark-text py-4"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Nhập tiêu đề bài viết"
                    placeholderTextColor="#9CA3AF"
                    editable={!isCreating}
                  />
                </View>
              </View>

              {/* Body Input */}
              <View className="mb-6">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-lg bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
                    <FontAwesome name="align-left" size={14} color="#ACD6B8" />
                  </View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                    Nội dung <Text className="text-coral">*</Text>
                  </Text>
                </View>
                
                <View className="bg-white dark:bg-dark-card rounded-2xl border border-beige/30 dark:border-dark-border/30 px-4">
                  <TextInput
                    className="text-base text-light-text dark:text-dark-text py-4 min-h-[200px]"
                    value={body}
                    onChangeText={setBody}
                    placeholder="Bạn đang nghĩ gì?"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                    editable={!isCreating}
                  />
                </View>
              </View>

              {/* Info Card */}
              <View className="bg-mint/10 dark:bg-gold/10 rounded-2xl p-4 border border-mint/30 dark:border-gold/30 mb-6">
                <View className="flex-row items-start">
                  <FontAwesome name="info-circle" size={16} color="#ACD6B8" />
                  <Text className="flex-1 ml-3 text-sm text-light-text dark:text-dark-text">
                    Hãy tôn trọng và tuân theo nguyên tắc cộng đồng khi đăng bài.
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="gap-3">
                <TouchableOpacity
                  className="bg-mint dark:bg-gold rounded-2xl py-4 shadow-lg active:opacity-80"
                  onPress={handleCreatePost}
                  disabled={isCreating}
                >
                  <View className="flex-row items-center justify-center">
                    {isCreating ? (
                      <>
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white font-bold text-lg ml-2">Đang tạo...</Text>
                      </>
                    ) : (
                      <>
                        <FontAwesome name="send" size={18} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">Đăng</Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white dark:bg-dark-card rounded-2xl py-4 border-2 border-beige/30 dark:border-dark-border/30 active:opacity-80"
                  onPress={() => setShowCreateModal(false)}
                  disabled={isCreating}
                >
                  <Text className="text-light-text dark:text-dark-text font-bold text-lg text-center">
                    Hủy
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}