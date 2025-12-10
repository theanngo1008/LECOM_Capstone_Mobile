import { LeaderboardEntry, LeaderboardPeriod } from "@/api/gamification";
import { useLeaderboard } from "@/features/profile/hooks/useLeaderBoard";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
    <Ionicons name="person" size={size * 0.6} color="#FFF" />
  </View>
);

export function LeaderBoardScreen({ navigation }: any) {
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>("weekly");
  
  const { data, isLoading, error, refetch, isFetching } = useLeaderboard(selectedPeriod);

  const renderPeriodButton = (
    period: LeaderboardPeriod,
    label: string,
    icon: string
  ) => {
    const isActive = selectedPeriod === period;
    return (
      <TouchableOpacity
        onPress={() => setSelectedPeriod(period)}
        className={`flex-1 py-3 px-4 rounded-xl ${
          isActive ? "bg-gold" : "bg-white dark:bg-dark-card"
        }`}
        activeOpacity={0.7}
      >
        <View className="items-center">
          <Text className="text-xl mb-1">{icon}</Text>
          <Text
            className={`text-xs font-bold ${
              isActive
                ? "text-white"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTopThree = () => {
    if (!data?.entries || data.entries.length === 0) return null;

    const topThree = data.entries.slice(0, 3);
    const [first, second, third] = topThree;

    return (
      <View className="px-4 py-6">
        <View className="flex-row items-end justify-center">
          {/* Second Place */}
          {second && (
            <View className="items-center mx-2 mb-4 flex-1">
              <View className="relative mb-2">
                {second.avatarUrl && second.avatarUrl.trim() !== "" ? (
                  <View>
                    <Image
                      source={{ uri: second.avatarUrl }}
                      className="rounded-full"
                      style={{ width: 64, height: 64 }}
                    />
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
                  </View>
                ) : (
                  <View>
                    <DefaultAvatar size={64} />
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
                  </View>
                )}
                <View 
                  className="absolute -bottom-1 -right-1 rounded-full items-center justify-center"
                  style={{
                    width: 26,
                    height: 26,
                    backgroundColor: '#C0C0C0',
                  }}
                >
                  <Text className="text-xs font-black text-white">2</Text>
                </View>
              </View>
              <Text className="text-xs font-bold text-gray-800 dark:text-gray-200 text-center mb-1" numberOfLines={1}>
                {second.displayName}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                {second.score} điểm
              </Text>
            </View>
          )}

          {/* First Place */}
          {first && (
            <View className="items-center mx-2 flex-1">
              <Text className="text-3xl mb-1">👑</Text>
              <View className="relative mb-2">
                <View
                  style={{ 
                    width: 96, 
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: '#E8BA69',
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {first.avatarUrl && first.avatarUrl.trim() !== "" ? (
                    <View>
                      <Image
                        source={{ uri: first.avatarUrl }}
                        className="rounded-full"
                        style={{ width: 88, height: 88 }}
                      />
                      {first.userId === data?.currentUser?.userId && (
                        <View 
                          className="absolute inset-0 rounded-full" 
                          style={{ 
                            width: 88, 
                            height: 88,
                            borderWidth: 3,
                            borderColor: '#E8BA69'
                          }} 
                        />
                      )}
                    </View>
                  ) : (
                    <View>
                      <DefaultAvatar size={88} />
                      {first.userId === data?.currentUser?.userId && (
                        <View 
                          className="absolute inset-0 rounded-full" 
                          style={{ 
                            width: 88, 
                            height: 88,
                            borderWidth: 3,
                            borderColor: '#E8BA69'
                          }} 
                        />
                      )}
                    </View>
                  )}
                </View>
                <View 
                  className="absolute -bottom-1 -right-1 rounded-full items-center justify-center"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: '#FFD700',
                  }}
                >
                  <Text className="text-base font-black text-white">1</Text>
                </View>
              </View>
              <Text className="text-sm font-black text-gray-800 dark:text-gray-200 text-center mb-1" numberOfLines={1}>
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
                  <View>
                    <Image
                      source={{ uri: third.avatarUrl }}
                      className="rounded-full"
                      style={{ width: 56, height: 56 }}
                    />
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
                  </View>
                ) : (
                  <View>
                    <DefaultAvatar size={56} />
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
                  </View>
                )}
                <View 
                  className="absolute -bottom-1 -right-1 rounded-full items-center justify-center"
                  style={{
                    width: 22,
                    height: 22,
                    backgroundColor: '#CD7F32',
                  }}
                >
                  <Text className="text-xs font-black text-white">3</Text>
                </View>
              </View>
              <Text className="text-xs font-bold text-gray-800 dark:text-gray-200 text-center mb-1" numberOfLines={1} style={{ fontSize: 11 }}>
                {third.displayName}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400" style={{ fontSize: 10 }}>
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
        className={`mx-4 mb-3 rounded-xl overflow-hidden ${
          isCurrentUser ? "bg-gold/10" : "bg-white dark:bg-dark-card"
        }`}
      >
        <View className="p-3">
          <View className="flex-row items-center">
            {/* Rank Badge */}
            <View 
              className={`w-10 h-10 rounded-lg items-center justify-center ${
                isCurrentUser ? "bg-gold" : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <Text className={`text-sm font-black ${
                isCurrentUser ? "text-white" : "text-gray-700 dark:text-gray-300"
              }`}>
                {item.rank}
              </Text>
            </View>

            {/* Avatar */}
            <View className="ml-3 relative">
              {item.avatarUrl && item.avatarUrl.trim() !== "" ? (
                <View>
                  <Image
                    source={{ uri: item.avatarUrl }}
                    className="rounded-full"
                    style={{ width: 44, height: 44 }}
                  />
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
              ) : (
                <View>
                  <DefaultAvatar size={44} />
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
              )}
            </View>

            {/* User Info */}
            <View className="flex-1 ml-3">
              <View className="flex-row items-center mb-1">
                <Text className="text-sm font-bold text-gray-800 dark:text-gray-200 flex-1" numberOfLines={1}>
                  {item.displayName}
                </Text>
                {isCurrentUser && (
                  <View className="bg-gold rounded-full px-2 py-0.5 ml-1">
                    <Text className="text-xs text-white font-bold">Bạn</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Level {item.level}
              </Text>
            </View>

            {/* Score */}
            <View className="items-end ml-2">
              <Text className={`text-base font-black ${
                isCurrentUser ? "text-gold" : "text-gray-800 dark:text-gray-200"
              }`}>
                {item.score}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400" style={{ fontSize: 10 }}>
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
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E8BA69" />
          <Text className="text-gray-600 dark:text-gray-400 mt-4 font-medium">
            Đang tải bảng xếp hạng...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-6xl mb-4">😔</Text>
          <Text className="text-gray-800 dark:text-gray-200 text-center text-lg font-bold mb-2">
            Không thể tải bảng xếp hạng
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-4 text-sm">
            Đã xảy ra lỗi khi tải dữ liệu
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-gold rounded-full px-6 py-3"
          >
            <Text className="text-white font-bold text-sm">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const otherEntries = data?.entries.slice(3) || [];

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      {/* Header */}
      <View className="px-4 py-3 bg-white dark:bg-dark-card">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3 p-2 -ml-2"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-xl font-black text-gray-800 dark:text-gray-200">
              Bảng Xếp Hạng
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Cạnh tranh với cộng đồng
            </Text>
          </View>
        </View>

        {/* Period Tabs */}
        <View className="flex-row gap-2">
          {renderPeriodButton("weekly", "Tuần", "📅")}
          {renderPeriodButton("monthly", "Tháng", "📆")}
          {renderPeriodButton("all", "Tất cả", "🌟")}
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
            <Text className="text-6xl mb-4">🏆</Text>
            <Text className="text-gray-800 dark:text-gray-200 text-lg font-bold mb-2 text-center">
              Chưa có dữ liệu
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center text-sm">
              Bảng xếp hạng sẽ được cập nhật khi có người tham gia
            </Text>
          </View>
        }
      />

      {/* Current User Card - Fixed Bottom */}
      {data?.currentUser && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-700">
          <View className="px-4 py-3">
            <View className="flex-row items-center">
              <View 
                className="rounded-lg items-center justify-center mr-3 bg-gold"
                style={{
                  width: 40,
                  height: 40,
                }}
              >
                <Text className="text-sm font-black text-white">
                  #{data.currentUser.rank}
                </Text>
              </View>
              
              <View className="relative">
                {data.currentUser.avatarUrl && data.currentUser.avatarUrl.trim() !== "" ? (
                  <View>
                    <Image
                      source={{ uri: data.currentUser.avatarUrl }}
                      className="rounded-full"
                      style={{ width: 40, height: 40 }}
                    />
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
                ) : (
                  <View>
                    <DefaultAvatar size={40} />
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
                )}
              </View>
              
              <View className="flex-1 ml-3">
                <Text className="text-sm font-bold text-gray-800 dark:text-gray-200" numberOfLines={1}>
                  {data.currentUser.displayName}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Level {data.currentUser.level}
                </Text>
              </View>
              
              <View className="items-end">
                <Text className="text-lg font-black text-gold">
                  {data.currentUser.score}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
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