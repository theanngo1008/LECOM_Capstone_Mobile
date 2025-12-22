import { LeaderboardEntry, LeaderboardPeriod } from "@/api/gamification";
import { useLeaderboard } from "@/features/profile/hooks/useLeaderBoard";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Default avatar component
const DefaultAvatar = ({ size = 48 }: { size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: "#E8BA69",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <FontAwesome name="user" size={size * 0.5} color="#FFF" />
  </View>
);

export function LeaderBoardScreen({ navigation }: any) {
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>("weekly");
  
  const { data, isLoading, error, refetch, isFetching } = useLeaderboard(selectedPeriod);

  const renderPeriodButton = (
    period: LeaderboardPeriod,
    label: string
  ) => {
    const isActive = selectedPeriod === period;
    return (
      <TouchableOpacity
        onPress={() => setSelectedPeriod(period)}
        className={`flex-1 py-3 px-4 rounded-xl border-2 ${
          isActive 
            ? "bg-gold border-gold" 
            : "bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30"
        }`}
        activeOpacity={0.7}
      >
        <Text
          className={`text-sm font-bold text-center ${
            isActive
              ? "text-white"
              : "text-light-text dark:text-dark-text"
          }`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTopThree = () => {
    if (!data?.entries || data.entries.length === 0) return null;

    const topThree = data.entries.slice(0, 3);
    const [first, second, third] = topThree;

    return (
      <View className="px-6 py-6 bg-white dark:bg-dark-card mx-4 mb-4 rounded-2xl border border-beige/30 dark:border-dark-border/30">
        <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4 text-center">
          Top 3
        </Text>
        <View className="flex-row items-end justify-center">
          {/* Second Place */}
          {second && (
            <View className="items-center mx-2 mb-4 flex-1">
              <View className="relative mb-2">
                {second.avatarUrl && second.avatarUrl.trim() !== "" ? (
                  <Image
                    source={{ uri: second.avatarUrl }}
                    className="rounded-full"
                    style={{ width: 64, height: 64 }}
                  />
                ) : (
                  <DefaultAvatar size={64} />
                )}
                {second.userId === data?.currentUser?.userId && (
                  <View 
                    className="absolute inset-0 rounded-full" 
                    style={{ 
                      width: 64, 
                      height: 64,
                      borderWidth: 3,
                      borderColor: '#E8BA69'
                    }} 
                  />
                )}
                <View 
                  className="absolute -bottom-1 -right-1 rounded-full items-center justify-center bg-gray-400"
                  style={{
                    width: 24,
                    height: 24,
                  }}
                >
                  <Text className="text-xs font-bold text-white">2</Text>
                </View>
              </View>
              <Text className="text-xs font-bold text-light-text dark:text-dark-text text-center mb-1" numberOfLines={1}>
                {second.displayName}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                {second.score} điểm
              </Text>
            </View>
          )}

          {/* First Place */}
          {first && (
            <View className="items-center mx-2 flex-1">
              <View className="relative mb-2">
                <View
                  style={{ 
                    width: 88, 
                    height: 88,
                    borderRadius: 44,
                    backgroundColor: '#E8BA69',
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {first.avatarUrl && first.avatarUrl.trim() !== "" ? (
                    <Image
                      source={{ uri: first.avatarUrl }}
                      className="rounded-full"
                      style={{ width: 80, height: 80 }}
                    />
                  ) : (
                    <DefaultAvatar size={80} />
                  )}
                  {first.userId === data?.currentUser?.userId && (
                    <View 
                      className="absolute inset-0 rounded-full" 
                      style={{ 
                        width: 80, 
                        height: 80,
                        borderWidth: 3,
                        borderColor: '#FFF'
                      }} 
                    />
                  )}
                </View>
                <View 
                  className="absolute -bottom-1 -right-1 rounded-full items-center justify-center bg-gold"
                  style={{
                    width: 28,
                    height: 28,
                  }}
                >
                  <Text className="text-sm font-bold text-white">1</Text>
                </View>
              </View>
              <Text className="text-sm font-bold text-light-text dark:text-dark-text text-center mb-1" numberOfLines={1}>
                {first.displayName}
              </Text>
              <Text className="text-sm font-bold text-gold">
                {first.score} điểm
              </Text>
            </View>
          )}

          {/* Third Place */}
          {third && (
            <View className="items-center mx-2 mb-8 flex-1">
              <View className="relative mb-2">
                {third.avatarUrl && third.avatarUrl.trim() !== "" ? (
                  <Image
                    source={{ uri: third.avatarUrl }}
                    className="rounded-full"
                    style={{ width: 56, height: 56 }}
                  />
                ) : (
                  <DefaultAvatar size={56} />
                )}
                {third.userId === data?.currentUser?.userId && (
                  <View 
                    className="absolute inset-0 rounded-full" 
                    style={{ 
                      width: 56, 
                      height: 56,
                      borderWidth: 3,
                      borderColor: '#E8BA69'
                    }} 
                  />
                )}
                <View 
                  className="absolute -bottom-1 -right-1 rounded-full items-center justify-center bg-amber-700"
                  style={{
                    width: 22,
                    height: 22,
                  }}
                >
                  <Text className="text-xs font-bold text-white">3</Text>
                </View>
              </View>
              <Text className="text-xs font-bold text-light-text dark:text-dark-text text-center mb-1" numberOfLines={1}>
                {third.displayName}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                {third.score} điểm
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => {
    const isCurrentUser = item.userId === data?.currentUser?.userId;
    
    return (
      <View
        className={`mx-4 mb-3 rounded-xl overflow-hidden border ${
          isCurrentUser 
            ? "bg-gold/10 border-gold/30" 
            : "bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30"
        }`}
      >
        <View className="p-4">
          <View className="flex-row items-center">
            {/* Rank Badge */}
            <View 
              className={`w-10 h-10 rounded-lg items-center justify-center ${
                isCurrentUser ? "bg-gold" : "bg-beige/30 dark:bg-dark-border/30"
              }`}
            >
              <Text className={`text-sm font-bold ${
                isCurrentUser ? "text-white" : "text-light-text dark:text-dark-text"
              }`}>
                {item.rank}
              </Text>
            </View>

            {/* Avatar */}
            <View className="ml-3 relative">
              {item.avatarUrl && item.avatarUrl.trim() !== "" ? (
                <Image
                  source={{ uri: item.avatarUrl }}
                  className="rounded-full"
                  style={{ width: 44, height: 44 }}
                />
              ) : (
                <DefaultAvatar size={44} />
              )}
              {isCurrentUser && (
                <View 
                  className="absolute inset-0 rounded-full" 
                  style={{ 
                    width: 44, 
                    height: 44,
                    borderWidth: 2,
                    borderColor: '#E8BA69'
                  }} 
                />
              )}
            </View>

            {/* User Info */}
            <View className="flex-1 ml-3">
              <View className="flex-row items-center mb-1">
                <Text className="text-sm font-bold text-light-text dark:text-dark-text flex-1" numberOfLines={1}>
                  {item.displayName}
                </Text>
                {isCurrentUser && (
                  <View className="bg-gold rounded-full px-2 py-0.5 ml-1">
                    <Text className="text-xs text-white font-bold">Bạn</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                Level {item.level}
              </Text>
            </View>

            {/* Score */}
            <View className="items-end ml-2">
              <Text className={`text-base font-bold ${
                isCurrentUser ? "text-gold" : "text-light-text dark:text-dark-text"
              }`}>
                {item.score}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                điểm
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center mr-3"
            >
              <FontAwesome name="arrow-left" size={18} color="#ACD6B8" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Bảng xếp hạng
            </Text>
          </View>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E8BA69" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Đang tải...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center mr-3"
            >
              <FontAwesome name="arrow-left" size={18} color="#ACD6B8" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Bảng xếp hạng
            </Text>
          </View>
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="exclamation-triangle" size={32} color="#F2A297" />
          </View>
          <Text className="text-light-text dark:text-dark-text text-center text-lg font-bold mb-2">
            Không thể tải bảng xếp hạng
          </Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-4">
            Đã xảy ra lỗi khi tải dữ liệu
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-gold rounded-xl px-6 py-3"
          >
            <Text className="text-white font-bold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const otherEntries = data?.entries.slice(3) || [];

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center mr-3"
          >
            <FontAwesome name="arrow-left" size={18} color="#ACD6B8" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Bảng xếp hạng
            </Text>
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mt-0.5">
              Cạnh tranh với cộng đồng
            </Text>
          </View>
        </View>

        {/* Period Tabs */}
        <View className="flex-row gap-2">
          {renderPeriodButton("weekly", "Tuần")}
          {renderPeriodButton("monthly", "Tháng")}
          {renderPeriodButton("all", "Tất cả")}
        </View>
      </View>

      <FlatList
        data={otherEntries}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.userId}
        ListHeaderComponent={renderTopThree}
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => refetch()}
            tintColor="#E8BA69"
            colors={["#E8BA69"]}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-16 px-6">
            <View className="w-20 h-20 rounded-full bg-beige/20 dark:bg-dark-border/20 items-center justify-center mb-4">
              <FontAwesome name="trophy" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-light-text dark:text-dark-text text-lg font-bold mb-2 text-center">
              Chưa có dữ liệu
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
              Bảng xếp hạng sẽ được cập nhật khi có người tham gia
            </Text>
          </View>
        }
      />

      {/* Current User Card - Fixed Bottom */}
      {data?.currentUser && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
          <View className="px-4 py-3">
            <View className="flex-row items-center">
              <View 
                className="rounded-lg items-center justify-center mr-3 bg-gold"
                style={{
                  width: 40,
                  height: 40,
                }}
              >
                <Text className="text-sm font-bold text-white">
                  #{data.currentUser.rank}
                </Text>
              </View>
              
              <View className="relative">
                {data.currentUser.avatarUrl && data.currentUser.avatarUrl.trim() !== "" ? (
                  <Image
                    source={{ uri: data.currentUser.avatarUrl }}
                    className="rounded-full"
                    style={{ width: 40, height: 40 }}
                  />
                ) : (
                  <DefaultAvatar size={40} />
                )}
                <View 
                  className="absolute inset-0 rounded-full" 
                  style={{ 
                    width: 40, 
                    height: 40,
                    borderWidth: 2,
                    borderColor: '#E8BA69'
                  }} 
                />
              </View>
              
              <View className="flex-1 ml-3">
                <Text className="text-sm font-bold text-light-text dark:text-dark-text" numberOfLines={1}>
                  {data.currentUser.displayName}
                </Text>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-0.5">
                  Level {data.currentUser.level}
                </Text>
              </View>
              
              <View className="items-end">
                <Text className="text-lg font-bold text-gold">
                  {data.currentUser.score}
                </Text>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  điểm
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
