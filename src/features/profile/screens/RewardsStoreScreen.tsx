import { ProfileStackScreenProps } from "@/navigation/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGamificationProfile } from "../hooks/useGamificationProfile";
import { useGamificationRewards } from "../hooks/useGamificationRewards";

type Props = ProfileStackScreenProps<"RewardsStore">;

export function RewardsStoreScreen({ navigation }: Props) {
  const { data: rewardsData, isLoading, isError, refetch } = useGamificationRewards();
  const { data: profileData, isLoading: profileLoading } = useGamificationProfile();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const rewardsResult = rewardsData?.result;
  const profile = profileData?.result;

  // Combine all rewards
  const allRewards = [
    ...(rewardsResult?.vouchers || []),
    ...(rewardsResult?.boosters || []),
  ];

  const categories = ["All", "Voucher", "Booster"];

  const filteredRewards =
    selectedCategory === "All"
      ? allRewards
      : allRewards.filter((r: any) => r.type === selectedCategory);

  const handleRedeem = (reward: any) => {
    if (!profile) return;

    if (profile.coins < reward.coinCost) {
      Alert.alert(
        "Không đủ xu",
        `Bạn cần ${reward.coinCost - profile.coins} xu nữa để đổi phần thưởng này.`,
        [{ text: "OK" }]
      );
      return;
    }

    if (!reward.redeemable) {
      Alert.alert("Không khả dụng", "Phần thưởng này hiện không thể đổi.", [{ text: "OK" }]);
      return;
    }

    Alert.alert(
      "Xác nhận đổi thưởng",
      `Bạn có chắc muốn đổi "${reward.title}" với ${reward.coinCost} xu?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đổi ngay",
          style: "default",
          onPress: () => {
            // TODO: Implement redeem API call
            Alert.alert("Thành công", "Đã đổi phần thưởng thành công!");
          },
        },
      ]
    );
  };

  if (isLoading || profileLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Loading rewards...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !rewardsResult) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesome name="exclamation-circle" size={64} color="#F2A297" />
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
            Oops!
          </Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
            Failed to load rewards
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

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
      {/* Header */}
      <View className="bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
          >
            <FontAwesome name="arrow-left" size={18} color="#ACD6B8" />
          </TouchableOpacity>

          <Text className="flex-1 text-xl font-bold text-light-text dark:text-dark-text text-center mx-4">
            Cửa hàng phần thưởng
          </Text>

          <View className="w-10 h-10" />
        </View>

        {/* User Balance Card */}
        {profile && (
          <View className="px-6 pb-4">
            <View className="bg-white dark:bg-dark-card rounded-2xl p-4 border-2 border-mint/30 dark:border-gold/30">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-mint/10 dark:bg-gold/10 rounded-xl items-center justify-center mr-3">
                    <FontAwesome name="trophy" size={20} color="#ACD6B8" />
                  </View>
                  <View>
                    <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs mb-1">
                      Level {profile.level} • Số dư của bạn
                    </Text>
                    <View className="flex-row items-center">
                      <FontAwesome name="money" size={16} color="#F2A297" />
                      <Text className="text-coral text-2xl font-bold ml-2">
                        {profile.coins}
                      </Text>
                      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm ml-1">
                        xu
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate("MissionsMain")}
                  className="bg-mint dark:bg-gold px-4 py-2 rounded-xl"
                >
                  <Text className="text-white text-xs font-semibold">Kiếm xu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-6 py-4 border-b border-beige/30 dark:border-dark-border/30 flex-grow-0"
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            className={`mr-3 px-5 py-2.5 rounded-full ${
              selectedCategory === category
                ? "bg-mint dark:bg-gold"
                : "bg-white dark:bg-dark-card border border-beige/30 dark:border-dark-border/30"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedCategory === category
                  ? "text-white"
                  : "text-light-text dark:text-dark-text"
              }`}
            >
              {category === "All"
                ? `Tất cả (${allRewards.length})`
                : category === "Voucher"
                ? `Voucher (${rewardsResult.vouchers.length})`
                : `Booster (${rewardsResult.boosters.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Rewards List */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          {filteredRewards.length === 0 ? (
            <View className="bg-white dark:bg-dark-card rounded-2xl p-8 items-center border border-beige/30 dark:border-dark-border/30 mt-8">
              <FontAwesome name="gift" size={48} color="#9CA3AF" />
              <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4 text-center">
                Chưa có phần thưởng trong danh mục này
              </Text>
            </View>
          ) : (
            filteredRewards.map((reward: any) => (
              <View
                key={reward.id}
                className="bg-white dark:bg-dark-card rounded-2xl p-4 mb-3 border border-beige/30 dark:border-dark-border/30"
              >
                <View className="flex-row">
                  {/* Reward Icon/Image */}
                  <View className="mr-4">
                    {reward.imageUrl ? (
                      <View className="w-20 h-20 rounded-xl overflow-hidden">
                        <Image
                          source={{ uri: reward.imageUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>
                    ) : (
                      <View
                        className={`w-20 h-20 rounded-xl items-center justify-center ${
                          reward.type === "Voucher"
                            ? "bg-coral/10"
                            : "bg-skyBlue/10 dark:bg-lavender/10"
                        }`}
                      >
                        <FontAwesome
                          name={reward.type === "Voucher" ? "ticket" : "rocket"}
                          size={28}
                          color={reward.type === "Voucher" ? "#F2A297" : "#A5C4FB"}
                        />
                      </View>
                    )}

                    {/* Type Badge */}
                    <View className="absolute -top-1 -right-1">
                      <View
                        className={`px-2 py-0.5 rounded-lg ${
                          reward.type === "Voucher" ? "bg-coral" : "bg-skyBlue dark:bg-lavender"
                        }`}
                      >
                        <Text className="text-white text-xs font-bold">
                          {reward.type === "Voucher" ? "V" : "B"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    {/* Title & Code */}
                    <View className="mb-2">
                      <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
                        {reward.title}
                      </Text>
                      <View className="bg-beige/50 dark:bg-dark-border/50 px-2 py-1 rounded self-start">
                        <Text className="text-xs font-mono font-semibold text-mint dark:text-gold">
                          {reward.rewardCode}
                        </Text>
                      </View>
                    </View>

                    {/* Description */}
                    <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-2">
                      {reward.description}
                    </Text>

                    {/* Duration */}
                    <View className="flex-row items-center mb-3">
                      <FontAwesome name="clock-o" size={12} color="#9CA3AF" />
                      <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                        {reward.durationDescription}
                      </Text>
                    </View>

                    {/* Price & Action */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <FontAwesome name="money" size={16} color="#F2A297" />
                        <Text className="text-coral text-xl font-bold ml-2">
                          {reward.coinCost}
                        </Text>
                        <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm ml-1">
                          xu
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleRedeem(reward)}
                        disabled={
                          !profile ||
                          profile.coins < reward.coinCost ||
                          !reward.redeemable
                        }
                        className={`px-6 py-2.5 rounded-xl ${
                          !profile ||
                          profile.coins < reward.coinCost ||
                          !reward.redeemable
                            ? "bg-beige/30 dark:bg-dark-border/30"
                            : "bg-mint dark:bg-gold"
                        }`}
                      >
                        <Text
                          className={`text-sm font-bold ${
                            !profile ||
                            profile.coins < reward.coinCost ||
                            !reward.redeemable
                              ? "text-light-textSecondary dark:text-dark-textSecondary"
                              : "text-white"
                          }`}
                        >
                          {!reward.redeemable
                            ? "Không khả dụng"
                            : reward.coinCost === 0
                            ? "Miễn phí"
                            : "Đổi ngay"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Insufficient Coins Warning */}
                    {profile &&
                      profile.coins < reward.coinCost &&
                      reward.redeemable &&
                      reward.coinCost > 0 && (
                        <View className="mt-2 bg-coral/10 px-3 py-1.5 rounded-lg flex-row items-center">
                          <FontAwesome name="info-circle" size={12} color="#F2A297" />
                          <Text className="text-coral text-xs ml-2 font-semibold">
                            Thiếu {reward.coinCost - profile.coins} xu
                          </Text>
                        </View>
                      )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Summary Stats */}
        {allRewards.length > 0 && (
          <View className="pb-4">
            <View className="bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30">
              <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-3">
                Tổng quan
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <View className="flex-row items-center mb-1">
                    <FontAwesome name="ticket" size={14} color="#F2A297" />
                    <Text className="text-lg font-bold text-coral ml-2">
                      {rewardsResult.vouchers.length}
                    </Text>
                  </View>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                    Voucher
                  </Text>
                </View>

                <View className="items-center">
                  <View className="flex-row items-center mb-1">
                    <FontAwesome name="rocket" size={14} color="#A5C4FB" />
                    <Text className="text-lg font-bold text-skyBlue dark:text-lavender ml-2">
                      {rewardsResult.boosters.length}
                    </Text>
                  </View>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                    Booster
                  </Text>
                </View>

                <View className="items-center">
                  <View className="flex-row items-center mb-1">
                    <FontAwesome name="money" size={14} color="#10B981" />
                    <Text className="text-lg font-bold text-green-600 dark:text-green-400 ml-2">
                      {profile?.coins || 0}
                    </Text>
                  </View>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                    Số dư
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Info Note */}
        <View className="pb-6">
          <View className="bg-skyBlue/10 dark:bg-lavender/10 rounded-2xl p-4 border border-skyBlue/30 dark:border-lavender/30">
            <View className="flex-row items-start">
              <FontAwesome name="info-circle" size={16} color="#A5C4FB" />
              <View className="flex-1 ml-3">
                <Text className="text-sm text-light-text dark:text-dark-text font-semibold mb-1">
                  Hướng dẫn sử dụng
                </Text>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary leading-5">
                  • Hoàn thành nhiệm vụ hàng ngày để kiếm xu{"\n"}
                  • Voucher có hạn sử dụng, vui lòng kiểm tra kỹ{"\n"}
                  • Booster giúp tăng tốc độ học tập của bạn{"\n"}
                  • Đổi thưởng ngay để nhận ưu đãi tốt nhất!
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}