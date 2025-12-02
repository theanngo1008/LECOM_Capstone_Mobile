import { ProfileStackScreenProps } from "@/navigation/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGamificationProfile } from "../hooks/useGamificationProfile";

type Props = ProfileStackScreenProps<"MissionsMain">;

export function MissionScreen({ navigation }: Props) {
  const { data, isLoading, isError, refetch } = useGamificationProfile();
  const gamification = data?.result;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Loading missions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !gamification) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesome name="exclamation-circle" size={64} color="#F2A297" />
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
            Oops!
          </Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
            Failed to load missions
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const dailyQuests = gamification.dailyQuests || [];
  const weeklyQuests = gamification.weeklyQuests || [];
  const monthlyQuests = gamification.monthlyQuests || [];

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
        >
          <FontAwesome name="arrow-left" size={18} color="#ACD6B8" />
        </TouchableOpacity>

        <Text className="flex-1 text-xl font-bold text-light-text dark:text-dark-text text-center mx-4">
          Nhiệm vụ
        </Text>

        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Stats */}
        <View className="px-6 py-6">
          <View className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-lg border-2 border-mint/30 dark:border-gold/30">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm mb-1">
                  Cấp độ hiện tại
                </Text>
                <Text className="text-mint dark:text-gold text-3xl font-bold">
                  Level {gamification.level}
                </Text>
              </View>
              <View className="w-16 h-16 bg-mint/10 dark:bg-gold/10 rounded-2xl items-center justify-center">
                <FontAwesome name="trophy" size={32} color="#ACD6B8" />
              </View>
            </View>

            {/* Progress Bar */}
            <View className="mb-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  XP: {gamification.currentXP}/{gamification.xpToNextLevel}
                </Text>
                <Text className="text-xs font-semibold text-mint dark:text-gold">
                  {Math.round((gamification.currentXP / gamification.xpToNextLevel) * 100)}%
                </Text>
              </View>
              <View className="h-3 bg-beige/30 dark:bg-dark-border/30 rounded-full overflow-hidden">
                <View
                  className="h-full bg-mint dark:bg-gold rounded-full"
                  style={{
                    width: `${(gamification.currentXP / gamification.xpToNextLevel) * 100}%`,
                  }}
                />
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row gap-3 pt-3 border-t border-beige/20 dark:border-dark-border/20">
              <View className="flex-1 items-center">
                <View className="flex-row items-center mb-1">
                  <FontAwesome name="money" size={14} color="#F2A297" />
                  <Text className="text-lg font-bold text-coral ml-2">
                    {gamification.coins}
                  </Text>
                </View>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  Xu
                </Text>
              </View>

              <View className="flex-1 items-center">
                <View className="flex-row items-center mb-1">
                  <FontAwesome name="fire" size={14} color="#F97316" />
                  <Text className="text-lg font-bold text-orange-600 ml-2">
                    {gamification.dailyStreak}
                  </Text>
                </View>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  Streak
                </Text>
              </View>

              <View className="flex-1 items-center">
                <View className="flex-row items-center mb-1">
                  <FontAwesome name="check-circle" size={14} color="#10B981" />
                  <Text className="text-lg font-bold text-green-600 ml-2">
                    {[...dailyQuests, ...weeklyQuests, ...monthlyQuests].filter((q: any) => q.status === "Completed").length}
                  </Text>
                </View>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  Hoàn thành
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Daily Quests */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Nhiệm vụ hàng ngày
            </Text>
            <View className="bg-mint/10 dark:bg-gold/10 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-mint dark:text-gold">
                {dailyQuests.filter((q: any) => q.status === "Completed").length}/{dailyQuests.length}
              </Text>
            </View>
          </View>

          {dailyQuests.length === 0 ? (
            <View className="bg-white dark:bg-dark-card rounded-2xl p-6 items-center border border-beige/30 dark:border-dark-border/30">
              <FontAwesome name="check-circle" size={40} color="#ACD6B8" />
              <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-2">
                Không có nhiệm vụ hàng ngày
              </Text>
            </View>
          ) : (
            dailyQuests.map((quest: any) => (
              <View
                key={quest.id}
                className="bg-white dark:bg-dark-card rounded-2xl p-4 mb-3 border border-beige/30 dark:border-dark-border/30"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
                      {quest.title}
                    </Text>
                    <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      {quest.description}
                    </Text>
                  </View>
                  {quest.status === "Completed" && (
                    <View className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center ml-3">
                      <FontAwesome name="check" size={14} color="#10B981" />
                    </View>
                  )}
                </View>

                {/* Progress */}
                <View className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                      Tiến độ: {quest.currentValue}/{quest.targetValue}
                    </Text>
                    <Text className="text-xs font-semibold text-mint dark:text-gold">
                      {Math.round((quest.currentValue / quest.targetValue) * 100)}%
                    </Text>
                  </View>
                  <View className="h-2 bg-beige/30 dark:bg-dark-border/30 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-mint dark:bg-gold rounded-full"
                      style={{
                        width: `${Math.min((quest.currentValue / quest.targetValue) * 100, 100)}%`,
                      }}
                    />
                  </View>
                </View>

                {/* Rewards */}
                <View className="flex-row items-center justify-between pt-3 border-t border-beige/20 dark:border-dark-border/20">
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center">
                      <FontAwesome name="star" size={12} color="#FFCB66" />
                      <Text className="text-xs font-semibold ml-1 text-gold">
                        +{quest.rewardXP} XP
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <FontAwesome name="money" size={12} color="#F2A297" />
                      <Text className="text-xs font-semibold ml-1 text-coral">
                        +{quest.rewardPoints} Xu
                      </Text>
                    </View>
                  </View>
                  {quest.status === "Completed" && (
                    <Text className="text-xs text-green-600 dark:text-green-400 font-semibold">
                      {quest.isRewardClaimed ? "Đã nhận thưởng ✓" : "Hoàn thành ✓"}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Weekly Quests */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Nhiệm vụ hàng tuần
            </Text>
            <View className="bg-coral/10 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-coral">
                {weeklyQuests.filter((q: any) => q.status === "Completed").length}/{weeklyQuests.length}
              </Text>
            </View>
          </View>

          {weeklyQuests.length === 0 ? (
            <View className="bg-white dark:bg-dark-card rounded-2xl p-6 items-center border border-beige/30 dark:border-dark-border/30">
              <FontAwesome name="calendar" size={40} color="#F2A297" />
              <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-2">
                Không có nhiệm vụ hàng tuần
              </Text>
            </View>
          ) : (
            weeklyQuests.map((quest: any) => (
              <View
                key={quest.id}
                className="bg-white dark:bg-dark-card rounded-2xl p-4 mb-3 border border-coral/30"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <View className="bg-coral/10 px-2 py-0.5 rounded mr-2">
                        <Text className="text-xs font-semibold text-coral">WEEKLY</Text>
                      </View>
                      <Text className="text-base font-bold text-light-text dark:text-dark-text flex-1">
                        {quest.title}
                      </Text>
                    </View>
                    <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      {quest.description}
                    </Text>
                  </View>
                  {quest.status === "Completed" && (
                    <View className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center ml-3">
                      <FontAwesome name="check" size={14} color="#10B981" />
                    </View>
                  )}
                </View>

                {/* Progress */}
                <View className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                      Tiến độ: {quest.currentValue}/{quest.targetValue}
                    </Text>
                    <Text className="text-xs font-semibold text-coral">
                      {Math.round((quest.currentValue / quest.targetValue) * 100)}%
                    </Text>
                  </View>
                  <View className="h-2 bg-beige/30 dark:bg-dark-border/30 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-coral rounded-full"
                      style={{
                        width: `${Math.min((quest.currentValue / quest.targetValue) * 100, 100)}%`,
                      }}
                    />
                  </View>
                </View>

                {/* Rewards */}
                <View className="flex-row items-center justify-between pt-3 border-t border-beige/20 dark:border-dark-border/20">
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center">
                      <FontAwesome name="star" size={12} color="#FFCB66" />
                      <Text className="text-xs font-semibold ml-1 text-gold">
                        +{quest.rewardXP} XP
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <FontAwesome name="money" size={12} color="#F2A297" />
                      <Text className="text-xs font-semibold ml-1 text-coral">
                        +{quest.rewardPoints} Xu
                      </Text>
                    </View>
                  </View>
                  {quest.status === "Completed" && (
                    <Text className="text-xs text-green-600 dark:text-green-400 font-semibold">
                      {quest.isRewardClaimed ? "Đã nhận thưởng ✓" : "Hoàn thành ✓"}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Monthly Quests */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Nhiệm vụ hàng tháng
            </Text>
            <View className="bg-gold/10 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-gold">
                {monthlyQuests.filter((q: any) => q.status === "Completed").length}/{monthlyQuests.length}
              </Text>
            </View>
          </View>

          {monthlyQuests.length === 0 ? (
            <View className="bg-white dark:bg-dark-card rounded-2xl p-6 items-center border border-beige/30 dark:border-dark-border/30">
              <FontAwesome name="calendar-o" size={40} color="#FFCB66" />
              <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-2">
                Chưa có nhiệm vụ hàng tháng
              </Text>
            </View>
          ) : (
            monthlyQuests.map((quest: any) => (
              <View
                key={quest.id}
                className="bg-white dark:bg-dark-card rounded-2xl p-4 mb-3 border border-gold/30"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <View className="bg-gold/10 px-2 py-0.5 rounded mr-2">
                        <Text className="text-xs font-semibold text-gold">MONTHLY</Text>
                      </View>
                      <Text className="text-base font-bold text-light-text dark:text-dark-text flex-1">
                        {quest.title}
                      </Text>
                    </View>
                    <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      {quest.description}
                    </Text>
                  </View>
                  {quest.status === "Completed" && (
                    <View className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center ml-3">
                      <FontAwesome name="check" size={14} color="#10B981" />
                    </View>
                  )}
                </View>

                {/* Progress */}
                <View className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                      Tiến độ: {quest.currentValue}/{quest.targetValue}
                    </Text>
                    <Text className="text-xs font-semibold text-gold">
                      {Math.round((quest.currentValue / quest.targetValue) * 100)}%
                    </Text>
                  </View>
                  <View className="h-2 bg-beige/30 dark:bg-dark-border/30 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-gold rounded-full"
                      style={{
                        width: `${Math.min((quest.currentValue / quest.targetValue) * 100, 100)}%`,
                      }}
                    />
                  </View>
                </View>

                {/* Rewards */}
                <View className="flex-row items-center justify-between pt-3 border-t border-beige/20 dark:border-dark-border/20">
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center">
                      <FontAwesome name="star" size={12} color="#FFCB66" />
                      <Text className="text-xs font-semibold ml-1 text-gold">
                        +{quest.rewardXP} XP
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <FontAwesome name="money" size={12} color="#F2A297" />
                      <Text className="text-xs font-semibold ml-1 text-coral">
                        +{quest.rewardPoints} Xu
                      </Text>
                    </View>
                  </View>
                  {quest.status === "Completed" && (
                    <Text className="text-xs text-green-600 dark:text-green-400 font-semibold">
                      {quest.isRewardClaimed ? "Đã nhận thưởng ✓" : "Hoàn thành ✓"}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}