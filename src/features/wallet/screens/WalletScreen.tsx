import { useWalletBalance } from "@/features/cart/hooks/useWalletBalance";
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

export function WalletScreen({ navigation }: any) {
  const { data, isLoading, isError, refetch } = useWalletBalance();
  const wallet = data?.result;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Loading wallet...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !wallet) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesome name="exclamation-circle" size={64} color="#F2A297" />
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
            Oops!
          </Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
            Failed to load wallet information
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
      <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
        >
          <FontAwesome name="arrow-left" size={18} color="#ACD6B8" />
        </TouchableOpacity>

        <Text className="flex-1 text-xl font-bold text-light-text dark:text-dark-text text-center mx-4">
          My Wallet
        </Text>

        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View className="px-6 py-6">
          <View className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-lg border-2 border-mint/30 dark:border-gold/30">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm mb-2">
                  Số dư khả dụng
                </Text>
                <Text className="text-mint dark:text-gold text-3xl font-bold">
                  {formatCurrency(wallet.balance)}₫
                </Text>
              </View>
              <View className="w-16 h-16 bg-mint/10 dark:bg-gold/10 rounded-2xl items-center justify-center">
                <FontAwesome name="google-wallet" size={32} color="#ACD6B8" />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity className="flex-1 bg-mint dark:bg-gold rounded-xl py-3 items-center">
                <View className="flex-row items-center">
                  <FontAwesome name="exchange" size={14} color="white" />
                  <Text className="text-white text-sm font-semibold ml-2">Rút tiền</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-1 bg-skyBlue/20 dark:bg-lavender/20 rounded-xl py-3 items-center border border-skyBlue dark:border-lavender">
                <View className="flex-row items-center">
                  <FontAwesome name="history" size={14} color="#A5C4FB" />
                  <Text className="text-skyBlue dark:text-lavender text-sm font-semibold ml-2">Lịch sử</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Statistics Cards */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
            Thống kê
          </Text>
          
          <View className="flex-row gap-3 mb-3">
            {/* Total Spent */}
            <View className="flex-1 bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30">
              <View className="w-10 h-10 bg-coral/10 rounded-xl items-center justify-center mb-3">
                <FontAwesome name="arrow-up" size={16} color="#F2A297" />
              </View>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Đã chi tiêu
              </Text>
              <Text className="text-base font-bold text-coral">
                {formatCurrency(wallet.totalSpent)}₫
              </Text>
            </View>

            {/* Total Refunded */}
            <View className="flex-1 bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30">
              <View className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl items-center justify-center mb-3">
                <FontAwesome name="undo" size={16} color="#10B981" />
              </View>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                Đã hoàn tiền
              </Text>
              <Text className="text-base font-bold text-green-600 dark:text-green-400">
                {formatCurrency(wallet.totalRefunded)}₫
              </Text>
            </View>
          </View>

          {/* Total Withdrawn */}
          <View className="bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl items-center justify-center mr-3">
                  <FontAwesome name="arrow-down" size={18} color="#F97316" />
                </View>
                <View>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                    Đã rút tiền
                  </Text>
                  <Text className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(wallet.totalWithdrawn)}₫
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Wallet Info */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
            Thông tin ví
          </Text>

          <View className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-beige/30 dark:border-dark-border/30">
            {/* Customer ID */}
            <View className="flex-row items-center justify-between p-4 border-b border-beige/30 dark:border-dark-border/30">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3">
                  <FontAwesome name="id-card" size={16} color="#ACD6B8" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                    Mã khách hàng
                  </Text>
                  <Text
                    className="text-sm font-bold text-light-text dark:text-dark-text"
                    numberOfLines={1}
                  >
                    {wallet.customerId}
                  </Text>
                </View>
              </View>
            </View>

            {/* Current Balance */}
            <View className="flex-row items-center justify-between p-4 border-b border-beige/30 dark:border-dark-border/30">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                  <FontAwesome name="money" size={16} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                    Số dư hiện tại
                  </Text>
                  <Text className="text-base font-bold text-mint dark:text-gold">
                    {formatCurrency(wallet.balance)}₫
                  </Text>
                </View>
              </View>
            </View>

            {/* Last Updated */}
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 items-center justify-center mr-3">
                  <FontAwesome name="clock-o" size={16} color="#A855F7" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                    Cập nhật lần cuối
                  </Text>
                  <Text className="text-sm font-bold text-light-text dark:text-dark-text">
                    {formatDate(wallet.lastUpdated)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction Summary */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
            Tổng quan giao dịch
          </Text>

          <View className="bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30">
            {/* Total In */}
            <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-beige/20 dark:border-dark-border/20">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg items-center justify-center mr-3">
                  <FontAwesome name="plus" size={12} color="#10B981" />
                </View>
                <Text className="text-sm text-light-text dark:text-dark-text">
                  Tổng tiền vào
                </Text>
              </View>
              <Text className="text-base font-bold text-green-600 dark:text-green-400">
                +{formatCurrency(wallet.totalRefunded)}₫
              </Text>
            </View>

            {/* Total Out */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg items-center justify-center mr-3">
                  <FontAwesome name="minus" size={12} color="#EF4444" />
                </View>
                <Text className="text-sm text-light-text dark:text-dark-text">
                  Tổng tiền ra
                </Text>
              </View>
              <Text className="text-base font-bold text-red-600 dark:text-red-400">
                -{formatCurrency(wallet.totalSpent + wallet.totalWithdrawn)}₫
              </Text>
            </View>
          </View>
        </View>

        {/* Help Section */}
        <View className="px-6 mb-6">
          <TouchableOpacity className="bg-white dark:bg-dark-card rounded-2xl p-4 border border-beige/30 dark:border-dark-border/30 flex-row items-center">
            <View className="w-12 h-12 rounded-xl bg-coral/10 items-center justify-center mr-4">
              <FontAwesome name="question-circle" size={20} color="#F2A297" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
                Trợ giúp
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                Hướng dẫn sử dụng ví điện tử
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Info Note */}
        <View className="px-6 pb-6">
          <View className="bg-skyBlue/10 dark:bg-lavender/10 rounded-2xl p-4 border border-skyBlue/30 dark:border-lavender/30">
            <View className="flex-row items-start">
              <FontAwesome name="info-circle" size={16} color="#A5C4FB" />
              <View className="flex-1 ml-3">
                <Text className="text-sm text-light-text dark:text-dark-text font-semibold mb-1">
                  Lưu ý
                </Text>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary leading-5">
                  Số dư ví được bảo vệ bởi hệ thống bảo mật 2 lớp. Vui lòng không chia sẻ thông
                  tin tài khoản với người khác.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}