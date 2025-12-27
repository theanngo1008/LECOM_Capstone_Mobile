import { useWalletBalance } from "@/features/cart/hooks/useWalletBalance";
import { useCustomerTransactions } from "@/features/wallet/hooks/useCustomerTransactions";
import { formatVietnamDateTime } from "@/utils/dateUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function WalletScreen({ navigation }: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError, refetch } = useWalletBalance();
  const { 
    data: transactionsData, 
    isLoading: isLoadingTransactions 
  } = useCustomerTransactions(currentPage, 10);

  const wallet = data?.result;
  const transactions = transactionsData?.result?.transactions || [];
  const pagination = transactionsData?.result?.pagination;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDate = (dateString: string) => {
    return formatVietnamDateTime(dateString);
  };

  type FAIconName = React.ComponentProps<typeof FontAwesome>['name'];

  const getTransactionIcon = (type: string): { name: FAIconName; color: string } => {
    switch (type) {
      case "OrderRevenue":
        return { name: "shopping-cart", color: "#10B981" };
      case "PlatformFee":
        return { name: "building", color: "#F97316" };
      case "Withdrawal":
        return { name: "arrow-down", color: "#EF4444" };
      case "Refund":
        return { name: "undo", color: "#3B82F6" };
      case "Adjustment":
        return { name: "edit", color: "#8B5CF6" };
      case "Payment":
        return { name: "credit-card", color: "#EC4899" };
      case "BalanceRelease":
        return { name: "unlock", color: "#14B8A6" };
      default:
        return { name: "exchange", color: "#6B7280" };
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "OrderRevenue":
        return "Thu nhập đơn hàng";
      case "PlatformFee":
        return "Phí nền tảng";
      case "Withdrawal":
        return "Rút tiền";
      case "Refund":
        return "Hoàn tiền";
      case "Adjustment":
        return "Điều chỉnh";
      case "Payment":
        return "Thanh toán";
      case "BalanceRelease":
        return "Giải phóng số dư";
      default:
        return type;
    }
  };

  const isPositiveTransaction = (type: string) => {
    return ["OrderRevenue", "Refund", "BalanceRelease", "Adjustment"].includes(type);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Đang tải...
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
            Không thể tải thông tin ví
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold">Thử lại</Text>
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
          Ví của tôi
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

            {/* Action Button */}
           <TouchableOpacity 
              className="bg-mint dark:bg-gold rounded-xl py-3 items-center mt-4"
              onPress={() => navigation.navigate("Withdrawals")}
            >
              <View className="flex-row items-center">
                <FontAwesome name="exchange" size={14} color="white" />
                <Text className="text-white text-sm font-semibold ml-2">Rút tiền</Text>
              </View>
            </TouchableOpacity>
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

        {/* Transaction History */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Lịch sử giao dịch
            </Text>
            {pagination && (
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                {pagination.totalItems} giao dịch
              </Text>
            )}
          </View>

          {isLoadingTransactions ? (
            <View className="bg-white dark:bg-dark-card rounded-2xl p-8 items-center border border-beige/30 dark:border-dark-border/30">
              <ActivityIndicator size="small" color="#ACD6B8" />
              <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-2 text-sm">
                Đang tải giao dịch...
              </Text>
            </View>
          ) : transactions.length === 0 ? (
            <View className="bg-white dark:bg-dark-card rounded-2xl p-8 items-center border border-beige/30 dark:border-dark-border/30">
              <View className="w-16 h-16 rounded-full bg-beige/30 dark:bg-dark-border/30 items-center justify-center mb-4">
                <FontAwesome name="history" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-light-text dark:text-dark-text font-semibold mb-1">
                Chưa có giao dịch
              </Text>
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm text-center">
                Lịch sử giao dịch của bạn sẽ hiển thị ở đây
              </Text>
            </View>
          ) : (
            <View className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-beige/30 dark:border-dark-border/30">
              {transactions.map((transaction, index) => {
                const icon = getTransactionIcon(transaction.type);
                const isPositive = isPositiveTransaction(transaction.type);
                
                return (
                  <View
                    key={transaction.id}
                    className={`p-4 ${
                      index !== transactions.length - 1
                        ? "border-b border-beige/20 dark:border-dark-border/20"
                        : ""
                    }`}
                  >
                    <View className="flex-row items-center">
                      {/* Icon */}
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${icon.color}20` }}
                      >
                        <FontAwesome name={icon.name} size={18} color={icon.color} />
                      </View>

                      {/* Details */}
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-base font-bold text-light-text dark:text-dark-text">
                            {getTransactionTypeLabel(transaction.type)}
                          </Text>
                          <Text
                            className={`text-base font-bold ${
                              isPositive
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {isPositive ? "+" : "-"}
                            {formatCurrency(Math.abs(transaction.amount))}₫
                          </Text>
                        </View>

                        <Text
                          className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1"
                          numberOfLines={2}
                        >
                          {transaction.description}
                        </Text>

                        <View className="flex-row items-center justify-between">
                          <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                            {formatDate(transaction.createdAt)}
                          </Text>
                          <View className="flex-row items-center">
                            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                              Số dư: {formatCurrency(transaction.balanceAfter)}₫
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <View className="p-4 border-t border-beige/30 dark:border-dark-border/30">
                  <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                      disabled={currentPage === 1}
                      onPress={() => setCurrentPage(currentPage - 1)}
                      className={`px-4 py-2 rounded-xl ${
                        currentPage === 1
                          ? "bg-beige/30 dark:bg-dark-border/30"
                          : "bg-mint dark:bg-gold"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          currentPage === 1
                            ? "text-light-textSecondary dark:text-dark-textSecondary"
                            : "text-white"
                        }`}
                      >
                        Trước
                      </Text>
                    </TouchableOpacity>

                    <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      Trang {currentPage} / {pagination.totalPages}
                    </Text>

                    <TouchableOpacity
                      disabled={currentPage === pagination.totalPages}
                      onPress={() => setCurrentPage(currentPage + 1)}
                      className={`px-4 py-2 rounded-xl ${
                        currentPage === pagination.totalPages
                          ? "bg-beige/30 dark:bg-dark-border/30"
                          : "bg-mint dark:bg-gold"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          currentPage === pagination.totalPages
                            ? "text-light-textSecondary dark:text-dark-textSecondary"
                            : "text-white"
                        }`}
                      >
                        Sau
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
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