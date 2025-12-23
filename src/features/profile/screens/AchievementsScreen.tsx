import { AchievementItem } from "@/api/achievements";
import { useAchievements } from "@/features/profile/hooks/useAchievements";
import { useClaimAchievement } from "@/features/profile/hooks/useClaimAchievement";
import { ProfileStackScreenProps } from "@/navigation/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  { key: "all", label: "Tất cả", icon: "list" },
  { key: "account", label: "Tài khoản", icon: "user" },
  { key: "learning", label: "Học tập", icon: "book" },
  { key: "shopping", label: "Mua sắm", icon: "shopping-cart" },
  { key: "social", label: "Tương tác", icon: "comments" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  account: "Tài khoản",
  learning: "Học tập",
  shopping: "Mua sắm",
  social: "Tương tác",
};

const CATEGORY_ICONS: Record<string, string> = {
  account: "user",
  learning: "book",
  shopping: "shopping-cart",
  social: "comments",
};

// =============================
// COMPONENT
// =============================
export function AchievementsScreen({ navigation }: Props) {
  const { data: achievements, isLoading, error, refetch, isFetching } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const claimAchievement = useClaimAchievement();

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
    (category: string) => CATEGORY_ICONS[category.toLowerCase()] || "trophy",
    []
  );

  const getCategoryLabel = useCallback(
    (category: string) => CATEGORY_LABELS[category.toLowerCase()] || category,
    []
  );

  // -----------------------------
  // Handle Claim Achievement
  // -----------------------------
  const handleClaimAchievement = useCallback((id: number, title: string) => {
    Alert.alert(
      "Nhận thưởng",
      `Bạn có chắc chắn muốn nhận thưởng cho thành tựu "${title}"?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Nhận thưởng",
          onPress: () => {
            claimAchievement.mutate(id, {
              onSuccess: () => {
                Alert.alert("Thành công", "Bạn đã nhận thưởng thành công!");
              },
              onError: (error: any) => {
                Alert.alert(
                  "Lỗi",
                  error?.message || "Không thể nhận thưởng. Vui lòng thử lại sau."
                );
              },
            });
          },
        },
      ]
    );
  }, [claimAchievement]);

  // -----------------------------
  // Render Achievement Card
  // -----------------------------
  const renderAchievementCard = useCallback((item: AchievementItem) => {
    const progress = Math.min((item.currentCount / item.targetCount) * 100, 100);
    const isCompleted = item.isCompleted;
    const canClaim = isCompleted && !item.isRewardClaimed;
    const isClaiming = claimAchievement.isPending;

    return (
      <View
        key={item.id}
        className={`rounded-2xl p-4 mb-3 border ${
          isCompleted 
            ? "bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30" 
            : "bg-beige/10 dark:bg-dark-border/10 border-beige/20 dark:border-dark-border/20"
        }`}
        style={{ opacity: isCompleted ? 1 : 0.7 }}
      >
        <View className="flex-row items-center">
          {/* Image */}
          <View className="relative mr-4">
            <View
              className={`w-20 h-20 rounded-2xl overflow-hidden items-center justify-center ${
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
                  <FontAwesome 
                    name={getCategoryIcon(item.category) as any} 
                    size={32} 
                    color={isCompleted ? "#FFF" : "#9CA3AF"} 
                  />
                </View>
              )}
            </View>

            {isCompleted && (
              <View className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-mint items-center justify-center border-2 border-white dark:border-dark-card">
                <FontAwesome name="check" size={12} color="white" />
              </View>
            )}
          </View>

          {/* Info */}
          <View className="flex-1">
            <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
              {item.title}
            </Text>
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-2">
              {item.description}
            </Text>

            {/* Rewards */}
            <View className="flex-row items-center mb-2">
              {item.xpReward > 0 && (
                <View className="flex-row items-center mr-3 bg-gold/10 dark:bg-gold/10 rounded-full px-2 py-1">
                  <Text className="text-xs font-bold text-gold mr-1">
                    +{item.xpReward} XP
                  </Text>
                  <FontAwesome name="star" size={12} color="#E8BA69" />
                </View>
              )}
              {item.coinReward > 0 && (
                <View className="flex-row items-center bg-mint/10 dark:bg-mint/10 rounded-full px-2 py-1">
                  <Text className="text-xs font-bold text-mint mr-1">
                    +{item.coinReward}
                  </Text>
                  <FontAwesome name="money" size={12} color="#ACD6B8" />
                </View>
              )}
            </View>

            {/* Progress */}
            {!isCompleted && (
              <View>
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                    Tiến độ {item.currentCount} / {item.targetCount}
                  </Text>
                  <Text className="text-xs font-bold text-gold">{Math.round(progress)}%</Text>
                </View>

                <View className="h-2 bg-beige/30 dark:bg-dark-border/30 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-gold rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>
            )}

            {/* Claim Button */}
            {canClaim && (
              <TouchableOpacity
                className="mt-3 bg-gold rounded-full py-2.5 items-center flex-row justify-center"
                onPress={() => handleClaimAchievement(item.id, item.title)}
                disabled={isClaiming}
              >
                {isClaiming ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <FontAwesome name="gift" size={14} color="white" style={{ marginRight: 6 }} />
                    <Text className="text-white font-bold text-sm">Nhận thưởng</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Already Claimed Badge */}
            {isCompleted && item.isRewardClaimed && (
              <View className="mt-3 bg-mint/10 dark:bg-mint/10 rounded-full py-2 items-center flex-row justify-center border border-mint/30">
                <FontAwesome name="check-circle" size={14} color="#ACD6B8" style={{ marginRight: 6 }} />
                <Text className="text-mint font-semibold text-xs">Đã nhận thưởng</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }, [getCategoryIcon, handleClaimAchievement, claimAchievement.isPending]);

  // =============================
  // LOADING & ERROR UI
  // =============================
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
              Thành tựu
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
              Thành tựu
            </Text>
          </View>
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="exclamation-triangle" size={32} color="#F2A297" />
          </View>
          <Text className="text-light-text dark:text-dark-text text-xl font-bold mb-2">
            Không thể tải thành tựu
          </Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-4">
            Vui lòng thử lại sau
          </Text>
          <TouchableOpacity onPress={() => refetch()} className="bg-gold rounded-xl px-6 py-3">
            <Text className="text-white font-bold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // =============================
  // MAIN UI
  // =============================
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

          <View className="w-12 h-12 rounded-xl bg-gold/10 dark:bg-gold/10 items-center justify-center mr-3">
            <FontAwesome name="trophy" size={20} color="#E8BA69" />
          </View>

          <View className="flex-1">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Thành tựu của bạn
            </Text>
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Khám phá và nhận thưởng cho các thành tựu
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="bg-gold/10 dark:bg-gold/10 rounded-2xl p-4 mb-3 border border-gold/20 dark:border-gold/20">
          <View className="flex-row items-center justify-center">
            <Text className="text-3xl font-bold text-gold mr-2">
              {stats.completed}
            </Text>
            <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary">
              / {stats.total} Thành tựu đã đạt được
            </Text>
          </View>

          <View className="mt-3 h-3 bg-white dark:bg-dark-background rounded-full overflow-hidden border border-gold/20">
            <View
              className="h-full bg-gold rounded-full"
              style={{
                width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
              }}
            />
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleCategoryChange(tab.key)}
                className={`mr-2 px-4 py-2.5 rounded-full flex-row items-center border-2 ${
                  isActive 
                    ? "bg-gold border-gold" 
                    : "bg-white dark:bg-dark-card border-beige/30 dark:border-dark-border/30"
                }`}
              >
                <FontAwesome 
                  name={tab.icon as any} 
                  size={14} 
                  color={isActive ? "#FFF" : "#9CA3AF"} 
                  style={{ marginRight: 6 }}
                />
                <Text
                  className={`text-sm font-bold ${
                    isActive ? "text-white" : "text-light-text dark:text-dark-text"
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
                  <View className="w-8 h-8 rounded-lg bg-gold/10 dark:bg-gold/10 items-center justify-center mr-2">
                    <FontAwesome 
                      name={getCategoryIcon(category) as any} 
                      size={16} 
                      color="#E8BA69" 
                    />
                  </View>
                  <Text className="text-lg font-bold text-light-text dark:text-dark-text">
                    {getCategoryLabel(category)}
                  </Text>
                  <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary ml-2">
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
              <View className="bg-white dark:bg-dark-card rounded-3xl p-10 items-center border border-beige/30 dark:border-dark-border/30 w-full">
                <View className="bg-gold/10 dark:bg-gold/10 rounded-full p-6 mb-4">
                  <FontAwesome name="trophy" size={48} color="#E8BA69" />
                </View>
                <Text className="text-light-text dark:text-dark-text text-xl font-bold mb-2 text-center">
                  Chưa có thành tựu
                </Text>
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center leading-5">
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
