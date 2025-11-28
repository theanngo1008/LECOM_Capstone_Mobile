import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState, useLayoutEffect } from "react";
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
import { useMyShopOrders } from "../hooks/useMyShopOrders";

export function ShopOrdersScreen({ navigation }: any) {
  const { data: ordersResponse, isLoading, isError, refetch } = useMyShopOrders();
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Hide default navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const orders = ordersResponse?.result || [];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 dark:bg-orange-900/30";
      case "Processing":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "Shipping":
        return "bg-purple-100 dark:bg-purple-900/30";
      case "Completed":
        return "bg-green-100 dark:bg-green-900/30";
      case "Cancelled":
        return "bg-red-100 dark:bg-red-900/30";
      default:
        return "bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-orange-600 dark:text-orange-400";
      case "Processing":
        return "text-blue-600 dark:text-blue-400";
      case "Shipping":
        return "text-purple-600 dark:text-purple-400";
      case "Completed":
        return "text-green-600 dark:text-green-400";
      case "Cancelled":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 dark:bg-yellow-900/30";
      case "Paid":
        return "bg-green-100 dark:bg-green-900/30";
      case "Failed":
        return "bg-red-100 dark:bg-red-900/30";
      default:
        return "bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getPaymentStatusTextColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600 dark:text-yellow-400";
      case "Paid":
        return "text-green-600 dark:text-green-400";
      case "Failed":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="w-32 h-32 rounded-full bg-beige/30 dark:bg-dark-border/30 items-center justify-center mb-6">
        <FontAwesome name="shopping-bag" size={64} color="#D1D5DB" />
      </View>
      <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">
        Chưa có đơn hàng
      </Text>
      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-8">
        Đơn hàng từ khách hàng sẽ hiển thị tại đây
      </Text>
    </View>
  );

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#ACD6B8" />
      <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
        Đang tải đơn hàng...
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
        Không thể tải danh sách đơn hàng
      </Text>
      <TouchableOpacity
        className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
        onPress={() => refetch()}
      >
        <Text className="text-white font-semibold">Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOrderCard = (order: any) => (
    <TouchableOpacity
      key={order.id}
      className="bg-white dark:bg-dark-card rounded-3xl mb-5 overflow-hidden shadow-lg"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      }}
      onPress={() => navigation.navigate("ShopOrderDetail", { orderId: order.id })}
      activeOpacity={0.7}
    >
      {/* Order Header with Gradient */}
      <View className="p-5 bg-gradient-to-r from-skyBlue/10 to-mint/10 dark:from-gold/10 dark:to-mint/10">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 mr-3">
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1 uppercase tracking-wider">
              Mã đơn hàng
            </Text>
            <Text className="text-base font-bold text-light-text dark:text-dark-text">
              #{order.orderCode}
            </Text>
          </View>
          
          <View className="flex-row gap-2">
            <View className={`px-3 py-1.5 rounded-full ${getStatusColor(order.status)}`}>
              <Text className={`text-xs font-bold ${getStatusTextColor(order.status)}`}>
                {order.status}
              </Text>
            </View>
            <View className={`px-3 py-1.5 rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
              <Text className={`text-xs font-bold ${getPaymentStatusTextColor(order.paymentStatus)}`}>
                {order.paymentStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Balance Status */}
        {order.balanceReleased && (
          <View className="flex-row items-center justify-center bg-green-500/10 dark:bg-green-500/20 rounded-xl py-2.5 px-4 mb-3">
            <FontAwesome name="check-circle" size={16} color="#10B981" />
            <Text className="text-sm font-bold text-green-600 dark:text-green-400 ml-2">
              Đã giải ngân
            </Text>
          </View>
        )}

        {/* Customer Info Card */}
        <View className="bg-white dark:bg-dark-background rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 bg-skyBlue/20 dark:bg-gold/20 rounded-full items-center justify-center mr-3">
              <FontAwesome name="user" size={16} color="#ACD6B8" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-0.5">
                Khách hàng
              </Text>
              <Text className="text-sm font-bold text-light-text dark:text-dark-text">
                {order.shipToName}
              </Text>
            </View>
          </View>

          <View className="h-px bg-beige/50 dark:bg-dark-border/50 my-2" />

          <View className="flex-row items-center mb-2">
            <FontAwesome name="phone" size={12} color="#9CA3AF" />
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-2">
              {order.shipToPhone}
            </Text>
          </View>
          
          <View className="flex-row items-start">
            <FontAwesome name="map-marker" size={12} color="#9CA3AF" />
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-2 flex-1" numberOfLines={2}>
              {order.shipToAddress}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Items Section */}
      <View className="p-5 bg-beige/10 dark:bg-dark-border/10">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-sm font-bold text-light-text dark:text-dark-text">
            SẢN PHẨM
          </Text>
          <View className="px-3 py-1 bg-mint/20 dark:bg-gold/20 rounded-full">
            <Text className="text-xs font-bold text-mint dark:text-gold">
              {order.details.length} sản phẩm
            </Text>
          </View>
        </View>

        <View className="bg-white dark:bg-dark-card rounded-2xl p-4">
          {order.details.slice(0, 2).map((item: any, index: number) => (
            <View key={index} className={`flex-row items-center ${index < 1 && order.details.length > 1 ? 'mb-4 pb-4 border-b border-beige/30 dark:border-dark-border/30' : ''}`}>
              {item.productImage ? (
                <Image
                  source={{ uri: item.productImage }}
                  className="w-20 h-20 rounded-xl mr-3"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-20 h-20 rounded-xl bg-beige/30 dark:bg-dark-border/30 items-center justify-center mr-3">
                  <FontAwesome name="image" size={28} color="#D1D5DB" />
                </View>
              )}
              
              <View className="flex-1 mr-2">
                <Text
                  className="text-sm font-bold text-light-text dark:text-dark-text mb-1"
                  numberOfLines={2}
                >
                  {item.productName}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                    {formatPrice(item.unitPrice)}
                  </Text>
                  <View className="w-1 h-1 rounded-full bg-light-textSecondary dark:bg-dark-textSecondary mx-2" />
                  <Text className="text-xs font-bold text-mint dark:text-gold">
                    x{item.quantity}
                  </Text>
                </View>
                {item.productSku && (
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                    SKU: {item.productSku}
                  </Text>
                )}
              </View>
              
              <Text className="text-base font-bold text-mint dark:text-gold">
                {formatPrice(item.lineTotal)}
              </Text>
            </View>
          ))}

          {order.details.length > 2 && (
            <View className="mt-3 pt-3 border-t border-beige/30 dark:border-dark-border/30">
              <Text className="text-xs text-center text-light-textSecondary dark:text-dark-textSecondary">
                + {order.details.length - 2} sản phẩm khác
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Order Summary */}
      <View className="p-5 bg-white dark:bg-dark-card">
        <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-3">
          CHI TIẾT THANH TOÁN
        </Text>

        <View className="space-y-2">
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Tạm tính
            </Text>
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
              {formatPrice(order.subtotal)}
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Phí vận chuyển
            </Text>
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
              {formatPrice(order.shippingFee)}
            </Text>
          </View>

          {order.discount > 0 && (
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                Giảm giá
              </Text>
              <Text className="text-sm font-semibold text-coral">
                -{formatPrice(order.discount)}
              </Text>
            </View>
          )}

          <View className="h-px bg-beige/50 dark:bg-dark-border/50 my-2" />

          <View className="flex-row justify-between items-center py-2">
            <Text className="text-base font-bold text-light-text dark:text-dark-text">
              Tổng doanh thu
            </Text>
            <Text className="text-xl font-bold text-mint dark:text-gold">
              {formatPrice(order.total)}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Footer */}
      <View className="px-5 py-4 bg-beige/10 dark:bg-dark-border/10 border-t border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <FontAwesome name="clock-o" size={12} color="#9CA3AF" />
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-2">
              {formatDate(order.createdAt)}
            </Text>
          </View>

          {order.completedAt && (
            <View className="flex-row items-center flex-1 justify-center">
              <FontAwesome name="check-circle" size={12} color="#10B981" />
              <Text className="text-xs text-green-600 dark:text-green-400 ml-2">
                {formatDate(order.completedAt)}
              </Text>
            </View>
          )}

          <View className="items-end">
            <FontAwesome name="chevron-right" size={14} color="#ACD6B8" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((order) => order.status === "Pending").length;
  const processingOrders = orders.filter((order) => order.status === "Processing").length;
  const completedOrders = orders.filter((order) => order.status === "Completed").length;

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
      {/* Header */}
      <View
        className="px-6 py-4 bg-white dark:bg-dark-card shadow-sm"
        style={{ 
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-11 h-11 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
          >
            <FontAwesome name="arrow-left" size={18} color="#ACD6B8" />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Đơn hàng Shop
            </Text>
            {orders.length > 0 && (
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                {orders.length} đơn hàng
              </Text>
            )}
          </View>

          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
            onPress={() => refetch()}
          >
            <FontAwesome name="refresh" size={18} color="#ACD6B8" />
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        {orders.length > 0 && (
          <View className="flex-row gap-2">
            <View className="flex-1 bg-gradient-to-br from-mint/20 to-mint/10 dark:from-gold/20 dark:to-gold/10 rounded-2xl p-3 border border-mint/30 dark:border-gold/30">
              <View className="flex-row items-center mb-1">
                <FontAwesome name="money" size={12} color="#ACD6B8" />
                <Text className="text-xs text-mint dark:text-gold ml-1 font-semibold">
                  Doanh thu
                </Text>
              </View>
              <Text className="text-sm font-bold text-mint dark:text-gold" numberOfLines={1}>
                {formatPrice(totalRevenue)}
              </Text>
            </View>

            <View className="flex-1 bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-3 border border-orange-200 dark:border-orange-800/30">
              <View className="flex-row items-center mb-1">
                <FontAwesome name="clock-o" size={12} color="#F97316" />
                <Text className="text-xs text-orange-600 dark:text-orange-400 ml-1 font-semibold">
                  Chờ xử lý
                </Text>
              </View>
              <Text className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {pendingOrders}
              </Text>
            </View>

            <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 border border-blue-200 dark:border-blue-800/30">
              <View className="flex-row items-center mb-1">
                <FontAwesome name="refresh" size={12} color="#3B82F6" />
                <Text className="text-xs text-blue-600 dark:text-blue-400 ml-1 font-semibold">
                  Đang xử lý
                </Text>
              </View>
              <Text className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {processingOrders}
              </Text>
            </View>

            <View className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-2xl p-3 border border-green-200 dark:border-green-800/30">
              <View className="flex-row items-center mb-1">
                <FontAwesome name="check" size={12} color="#10B981" />
                <Text className="text-xs text-green-600 dark:text-green-400 ml-1 font-semibold">
                  Hoàn thành
                </Text>
              </View>
              <Text className="text-sm font-bold text-green-600 dark:text-green-400">
                {completedOrders}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        renderLoading()
      ) : isError ? (
        renderError()
      ) : orders.length === 0 ? (
        renderEmptyState()
      ) : (
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
          {orders.map((order) => renderOrderCard(order))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}