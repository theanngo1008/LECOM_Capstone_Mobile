import { formatVietnamDateTime } from "@/utils/dateUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShopWalletSummary } from "../hooks/useShopWalletSummary";

export function ShopWalletScreen({ navigation }: any) {
  const { data, isLoading, isError, refetch } = useShopWalletSummary();
  const [refreshing, setRefreshing] = React.useState(false);

  const summary = data?.result;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return formatVietnamDateTime(dateString);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#ACD6B8" />
      <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
        Đang tải ví...
      </Text>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 items-center justify-center px-6">
      <FontAwesome name="exclamation-circle" size={64} color="#FF6B6B" />
      <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
        Đã có lỗi xảy ra
      </Text>
      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
        Không thể tải thông tin ví
      </Text>
      <TouchableOpacity
        className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
        onPress={() => refetch()}
      >
        <Text className="text-white font-semibold">Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
        <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-b-2 border-beige/50 dark:border-dark-border/50">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-12 h-12 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
          >
            <FontAwesome name="arrow-left" size={20} color="#ACD6B8" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-light-text dark:text-dark-text">
            Ví Shop
          </Text>
          <View className="w-12" />
        </View>
        {renderLoading()}
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
        <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-b-2 border-beige/50 dark:border-dark-border/50">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-12 h-12 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
          >
            <FontAwesome name="arrow-left" size={20} color="#ACD6B8" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-light-text dark:text-dark-text">
            Ví Shop
          </Text>
          <View className="w-12" />
        </View>
        {renderError()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-b-2 border-beige/50 dark:border-dark-border/50">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-12 h-12 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
        >
          <FontAwesome name="arrow-left" size={20} color="#ACD6B8" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-light-text dark:text-dark-text">
            Ví Shop
          </Text>
          <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
            {summary?.shopName}
          </Text>
        </View>

        <TouchableOpacity
          className="w-12 h-12 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
          onPress={() => refetch()}
        >
          <FontAwesome name="refresh" size={20} color="#ACD6B8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ACD6B8"
            colors={["#ACD6B8"]}
          />
        }
      >
        {/* Balance Cards */}
        <View className="mb-6">
          {/* Available Balance */}
          <LinearGradient
            colors={['#ACD6B8', '#8BC5A0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-6 mb-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white/80 text-sm font-semibold">
                Số dư khả dụng
              </Text>
              <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                <FontAwesome name="money" size={20} color="white" />
              </View>
            </View>
            <Text className="text-white text-3xl font-bold mb-1">
              {formatPrice(summary?.availableBalance || 0)}
            </Text>
            <Text className="text-white/70 text-xs">
              Có thể rút về tài khoản
            </Text>
          </LinearGradient>

          {/* Pending Balance */}
          <View className="bg-white dark:bg-dark-card rounded-2xl p-6 border-2 border-beige/50 dark:border-dark-border/50 shadow-lg"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm font-semibold">
                Số dư chờ xử lý
              </Text>
              <View className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full items-center justify-center">
                <FontAwesome name="clock-o" size={20} color="#F97316" />
              </View>
            </View>
            <Text className="text-light-text dark:text-dark-text text-3xl font-bold mb-1">
              {formatPrice(summary?.pendingBalance || 0)}
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs">
              Từ {summary?.pendingOrdersCount || 0} đơn hàng đang xử lý
            </Text>
          </View>
        </View>

        {/* Statistics */}
        <View className="bg-white dark:bg-dark-card rounded-2xl p-5 border-2 border-beige/50 dark:border-dark-border/50 mb-6 shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            Thống kê
          </Text>

          <View className="space-y-4">
            {/* Total Earned */}
            <View className="flex-row items-center justify-between py-3 border-b border-beige/30 dark:border-dark-border/30">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mr-3">
                  <FontAwesome name="arrow-down" size={18} color="#22C55E" />
                </View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                  Tổng thu nhập
                </Text>
              </View>
              <Text className="text-base font-bold text-green-600 dark:text-green-400">
                {formatPrice(summary?.totalEarned || 0)}
              </Text>
            </View>

            {/* Total Withdrawn */}
            <View className="flex-row items-center justify-between py-3 border-b border-beige/30 dark:border-dark-border/30">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mr-3">
                  <FontAwesome name="arrow-up" size={18} color="#3B82F6" />
                </View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                  Đã rút
                </Text>
              </View>
              <Text className="text-base font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(summary?.totalWithdrawn || 0)}
              </Text>
            </View>

            {/* Total Refunded */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mr-3">
                  <FontAwesome name="undo" size={18} color="#EF4444" />
                </View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                  Hoàn trả
                </Text>
              </View>
              <Text className="text-base font-bold text-red-600 dark:text-red-400">
                {formatPrice(summary?.totalRefunded || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="bg-white dark:bg-dark-card rounded-2xl p-5 border-2 border-beige/50 dark:border-dark-border/50 mb-6 shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            Hành động
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("ShopWalletTransactions")}
            className="flex-row items-center justify-between p-4 rounded-xl bg-beige/30 dark:bg-dark-border/30 border border-beige/50 dark:border-dark-border/50 mb-3"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-mint/20 dark:bg-gold/20 rounded-full items-center justify-center mr-3">
                <FontAwesome name="history" size={18} color="#ACD6B8" />
              </View>
              <Text className="text-base font-semibold text-light-text dark:text-dark-text">
                Xem lịch sử giao dịch
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#ACD6B8" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-4 rounded-xl bg-mint/10 dark:bg-gold/10 border-2 border-mint dark:border-gold"
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Implement withdrawal
              navigation.navigate("ShopWithdrawals");
            }}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-mint dark:bg-gold rounded-full items-center justify-center mr-3">
                <FontAwesome name="bank" size={18} color="white" />
              </View>
              <Text className="text-base font-bold text-mint dark:text-gold">
                Rút tiền về tài khoản
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#ACD6B8" />
          </TouchableOpacity>
        </View>

        {/* Last Updated */}
        <View className="items-center">
          <View className="flex-row items-center">
            <FontAwesome name="clock-o" size={12} color="#9CA3AF" />
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-2">
              Cập nhật lần cuối: {summary?.lastUpdated ? formatDate(summary.lastUpdated) : "N/A"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}