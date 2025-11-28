import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShopWalletTransactions } from "../hooks/useShopWalletTransactions";

export function ShopWalletTransactionsScreen({ navigation }: any) {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError, refetch, isFetching } = useShopWalletTransactions(page, pageSize);
  const [refreshing, setRefreshing] = useState(false);

  const result = data?.result;
  const transactions = result?.transactions || [];
  const pagination = result?.pagination;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "earning":
        return { name: "arrow-down", color: "#22C55E", bg: "bg-green-100 dark:bg-green-900/30" };
      case "withdrawal":
        return { name: "arrow-up", color: "#3B82F6", bg: "bg-blue-100 dark:bg-blue-900/30" };
      case "refund":
        return { name: "undo", color: "#EF4444", bg: "bg-red-100 dark:bg-red-900/30" };
      default:
        return { name: "exchange", color: "#9CA3AF", bg: "bg-gray-100 dark:bg-gray-900/30" };
    }
  };

  const getBalanceTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case "available":
        return "Số dư khả dụng";
      case "pending":
        return "Số dư chờ xử lý";
      default:
        return type;
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case "earning":
        return "Thu nhập";
      case "withdrawal":
        return "Rút tiền";
      case "refund":
        return "Hoàn trả";
      default:
        return type;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (pagination && page < pagination.totalPages && !isFetching) {
      setPage(page + 1);
    }
  };

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#ACD6B8" />
      <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
        Đang tải giao dịch...
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
        Không thể tải lịch sử giao dịch
      </Text>
      <TouchableOpacity
        className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
        onPress={() => refetch()}
      >
        <Text className="text-white font-semibold">Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="w-32 h-32 rounded-full bg-beige/30 dark:bg-dark-border/30 items-center justify-center mb-6">
        <FontAwesome name="history" size={64} color="#D1D5DB" />
      </View>
      <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">
        Chưa có giao dịch
      </Text>
      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
        Lịch sử giao dịch sẽ hiển thị tại đây
      </Text>
    </View>
  );

    const renderTransaction = ({ item }: { item: any }) => {
    const icon = getTransactionIcon(item.type);
    // ✅ Check if amount is positive or negative
    const isPositive = item.amount > 0;

    return (
      <View className="bg-white dark:bg-dark-card rounded-2xl p-5 mb-4 border-2 border-beige/50 dark:border-dark-border/50 shadow-lg"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-start flex-1">
            <View className={`w-12 h-12 ${icon.bg} rounded-full items-center justify-center mr-3`}>
              <FontAwesome name={icon.name as any} size={20} color={icon.color} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
                {getTransactionTypeText(item.type)}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                {item.description}
              </Text>
            </View>
          </View>

          <Text className={`text-lg font-bold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {isPositive ? "+" : ""}{formatPrice(item.amount)}
          </Text>
        </View>

        {/* Details */}
        <View className="pt-3 border-t border-beige/30 dark:border-dark-border/30">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              Loại số dư
            </Text>
            <Text className="text-xs font-semibold text-light-text dark:text-dark-text">
              {getBalanceTypeText(item.balanceType)}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              Số dư trước
            </Text>
            <Text className="text-xs font-semibold text-light-text dark:text-dark-text">
              {formatPrice(item.balanceBefore)}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              Số dư sau
            </Text>
            <Text className="text-xs font-semibold text-mint dark:text-gold">
              {formatPrice(item.balanceAfter)}
            </Text>
          </View>

          {item.referenceId && (
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                Mã tham chiếu
              </Text>
              <Text className="text-xs font-mono text-light-text dark:text-dark-text">
                {item.referenceId}
              </Text>
            </View>
          )}

          <View className="flex-row items-center mt-2 pt-2 border-t border-beige/30 dark:border-dark-border/30">
            <FontAwesome name="clock-o" size={10} color="#9CA3AF" />
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-2">
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };


  const renderFooter = () => {
    if (!isFetching || page === 1) return null;

    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#ACD6B8" />
        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-2">
          Đang tải thêm...
        </Text>
      </View>
    );
  };

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
            Lịch sử giao dịch
          </Text>
          {pagination && (
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              {pagination.totalItems} giao dịch
            </Text>
          )}
        </View>

        <TouchableOpacity
          className="w-12 h-12 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
          onPress={() => refetch()}
        >
          <FontAwesome name="refresh" size={20} color="#ACD6B8" />
        </TouchableOpacity>
      </View>

      {/* Summary Bar */}
      {result && (
        <View className="bg-white dark:bg-dark-card px-6 py-4 border-b-2 border-beige/50 dark:border-dark-border/50">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              Số dư khả dụng
            </Text>
            <Text className="text-base font-bold text-mint dark:text-gold">
              {formatPrice(result.availableBalance)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              Số dư chờ xử lý
            </Text>
            <Text className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              {formatPrice(result.pendingBalance)}
            </Text>
          </View>
        </View>
      )}

      {/* Content */}
      {isLoading && page === 1 ? (
        renderLoading()
      ) : isError ? (
        renderError()
      ) : transactions.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </SafeAreaView>
  );
}