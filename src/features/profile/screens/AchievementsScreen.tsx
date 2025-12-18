import { AchievementItem } from "@/api/achievements";
import { useAchievements } from "@/features/profile/hooks/useAchievements";
import { ProfileStackScreenProps } from "@/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = ProfileStackScreenProps<"Achievements">;

// =============================
// CONSTANTS OUTSIDE COMPONENT
// =============================
const CATEGORY_TABS = [
  { key: "all", label: "Tất cả", icon: "" },
  { key: "account", label: "Tài khoản", icon: "" },
  { key: "learning", label: "Học tập", icon: "" },
  { key: "shopping", label: "Mua sắm", icon: "" },
  { key: "social", label: "Tương tác", icon: "" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  account: "Tài khoản",
  learning: "Học tập",
  shopping: "Mua sắm",
  social: "Tương tác",
};

const CATEGORY_ICONS: Record<string, string> = {
  account: "👤",
  learning: "📚",
  shopping: "🛒",
  social: "💬",
};

// =============================
// COMPONENT
// =============================
export function AchievementsScreen({ navigation }: Props) {
  const { data: achievements, isLoading, error, refetch, isFetching } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // -----------------------------
  // stable callbacks
  // ----------------------------
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // -----------------------------
  // Stats
  // -----------------------------
  const stats = useMemo(() => {
    if (!achievements) return { total: 0, completed: 0 };
    const completed = achievements.filter((a) => a.isCompleted).length;
    return { total: achievements.length, completed };
  }, [achievements]);

  // -----------------------------
  // Filtered list
  // -----------------------------
  const filteredAchievements = useMemo(() => {
    if (!achievements) return [];
    if (selectedCategory === "all") return achievements;
    return achievements.filter((a) => a.category.toLowerCase() === selectedCategory);
  }, [achievements, selectedCategory]);

  // -----------------------------
  // Grouped by category
  // -----------------------------
  const groupedAchievements = useMemo(() => {
    return filteredAchievements.reduce((acc, item) => {
      const category = item.category.toLowerCase();
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, AchievementItem[]>);
  }, [filteredAchievements]);

  // -----------------------------
  // helpers
  // -----------------------------
  const getCategoryIcon = useCallback(
    (category: string) => CATEGORY_ICONS[category.toLowerCase()] || "🏅",
    []
  );

  const getCategoryLabel = useCallback(
    (category: string) => CATEGORY_LABELS[category.toLowerCase()] || category,
    []
  );

  // -----------------------------
  // Render Achievement Card
  // -----------------------------
  const renderAchievementCard = useCallback((item: AchievementItem) => {
    const progress = Math.min((item.currentCount / item.targetCount) * 100, 100);
    const isCompleted = item.isCompleted;

    return (
      <View
        key={item.id}
        className={`rounded-2xl p-4 mb-3 ${
          isCompleted ? "bg-white dark:bg-dark-card" : "bg-gray-50 dark:bg-gray-800"
        }`}
        style={{ opacity: isCompleted ? 1 : 0.7 }}
      >
        <View className="flex-row items-center">
          {/* Image */}
          <View className="relative mr-4">
            <View
              className={`w-20 h-20 rounded-2xl overflow-hidden ${
                !isCompleted ? "opacity-50" : ""
              }`}
              style={{
                backgroundColor: isCompleted ? "#E8BA69" : "#D1D5DB",
              }}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text className="text-3xl">
                    {CATEGORY_ICONS[item.category.toLowerCase()] || "🏅"}
                  </Text>
                </View>
              )}
            </View>

            {isCompleted && (
              <View className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 items-center justify-center border-2 border-white">
                <Ionicons name="checkmark" size={14} color="white" />
              </View>
            )}
          </View>

          {/* Info */}
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
              {item.title}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {item.description}
            </Text>

            {/* Rewards */}
            <View className="flex-row items-center mb-2">
              {item.xpReward > 0 && (
                <View className="flex-row items-center mr-3">
                  <Text className="text-xs font-bold text-gray-700 dark:text-gray-300 mr-1">
                    +{item.xpReward} XP
                  </Text>
                  <Text className="text-sm">🏅</Text>
                </View>
              )}
              {item.coinReward > 0 && (
                <View className="flex-row items-center">
                  <Text className="text-xs font-bold text-gray-700 dark:text-gray-300 mr-1">
                    +{item.coinReward}
                  </Text>
                  <Text className="text-sm">🪙</Text>
                </View>
              )}
            </View>

            {/* Progress */}
            <View>
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Tiến độ {item.currentCount} / {item.targetCount}
                </Text>
                <Text className="text-xs font-bold text-gold">{Math.round(progress)}%</Text>
              </View>

              <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <View
                  className="h-full bg-gold rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }, []);

  // =============================
  // LOADING & ERROR UI
  // =============================
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background justify-center items-center">
        <ActivityIndicator size="large" color="#E8BA69" />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">Đang tải thành tựu...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background justify-center items-center px-6">
        <Text className="text-6xl mb-4">😔</Text>
        <Text className="text-red-500 text-xl font-bold mb-2">Không thể tải thành tựu</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-4">
          Vui lòng thử lại sau
        </Text>

        <TouchableOpacity onPress={() => refetch()} className="bg-gold rounded-full px-6 py-3">
          <Text className="text-white font-bold">Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // =============================
  // MAIN UI
  // =============================
  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      {/* Header */}
      <View className="px-4 py-4 bg-white dark:bg-dark-card shadow-sm">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <View className="bg-gold/20 rounded-full p-2 mr-3">
            <Text className="text-2xl">🏆</Text>
          </View>

          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Thành tựu của bạn
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Khám phá và nhận thưởng cho các thành tựu
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="bg-gold/10 rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-center">
            <Text className="text-3xl font-black text-gold mr-2">
              {stats.completed}
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-400">
              / {stats.total} Thành tựu đã đạt được
            </Text>
          </View>

          <View className="mt-3 h-3 bg-white dark:bg-gray-700 rounded-full overflow-hidden">
            <View
              className="h-full bg-gold rounded-full"
              style={{
                width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
              }}
            />
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleCategoryChange(tab.key)}
                className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
                  isActive ? "bg-gold" : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <Text className="text-base mr-1">{tab.icon}</Text>
                <Text
                  className={`text-sm font-bold ${
                    isActive ? "text-white" : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Achievement List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => refetch()}
            tintColor="#E8BA69"
            colors={["#E8BA69"]}
          />
        }
      >
        <View className="px-4 py-4">
          {selectedCategory === "all" ? (
            // group by category
            Object.entries(groupedAchievements).map(([category, items]) => (
              <View key={category} className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Text className="text-2xl mr-2">{getCategoryIcon(category)}</Text>
                  <Text className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {getCategoryLabel(category)}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({items.filter((i) => i.isCompleted).length}/{items.length})
                  </Text>
                </View>

                {items.map(renderAchievementCard)}
              </View>
            ))
          ) : (
            filteredAchievements.map(renderAchievementCard)
          )}

          {filteredAchievements.length === 0 && (
            <View className="flex-1 justify-center items-center py-20 px-6">
              <View className="bg-white dark:bg-dark-card rounded-3xl p-10 items-center shadow-lg w-full">
                <View className="bg-gold/10 rounded-full p-6 mb-4">
                  <Text className="text-7xl">🏆</Text>
                </View>
                <Text className="text-gray-800 dark:text-gray-200 text-xl font-bold mb-2 text-center">
                  Chưa có thành tựu
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
                  Hãy bắt đầu học tập và hoàn thành{"\n"}các nhiệm vụ để mở khóa thành tựu!
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
