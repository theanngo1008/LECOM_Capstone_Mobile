import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { formatVietnamDateTime } from "@/utils/dateUtils";
import React, { useState } from "react";
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
import type { OrdersStackParamList } from "@/navigation/types";
import { useCancelOrder } from "../hooks/useCancelOrder";
import { useConfirmOrder } from "../hooks/useConfirmOrder";
import { useMyOrders } from "../hooks/useMyOrders";

type NavigationProp = NativeStackNavigationProp<OrdersStackParamList> & DrawerNavigationProp<any>;

export function OrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { data: ordersResponse, isLoading, isError, refetch } = useMyOrders();
  const { mutate: confirmOrder, isPending: confirming } = useConfirmOrder();
  const { cancelOrder, isLoading: canceling } = useCancelOrder();

  const [refreshing, setRefreshing] = useState(false);

  const orders = ordersResponse?.result || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return formatVietnamDateTime(dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 dark:bg-orange-900/30";
      case "Paid":
        return "bg-green-100 dark:bg-green-900/30";
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
      case "Paid":
        return "text-green-600 dark:text-green-400";
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "Pending":
        return "Chờ thanh toán";
      case "Paid":
        return "Đã thanh toán";
      case "Processing":
        return "Đang xử lý";
      case "Shipping":
        return "Đang giao";
      case "Completed":
        return "Hoàn thành";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleConfirmReceived = (orderId: string) => {
    confirmOrder(orderId, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      "Hủy đơn hàng",
      "Bạn có chắc chắn muốn hủy đơn hàng này?",
      [
        {
          text: "Không",
          style: "cancel",
        },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelOrder({ orderId, reason: "Khách hàng yêu cầu hủy" });
              refetch();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể hủy đơn hàng");
            }
          },
        },
      ]
    );
  };

  const handleNavigateToDetail = (orderId: string) => {
    navigation.navigate("OrderDetail", { orderId });
  };

  const canCancelOrder = (status: string) => {
    return ["Pending", "Paid", "Processing"].includes(status);
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
        Lịch sử đơn hàng của bạn sẽ hiển thị tại đây
      </Text>
      <TouchableOpacity
        className="px-8 py-4 rounded-full bg-mint dark:bg-gold"
        onPress={() => navigation.navigate("Products" as any)}
      >
        <Text className="text-white text-base font-bold">Bắt đầu mua sắm</Text>
      </TouchableOpacity>
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

  const renderActionButtons = (order: any) => {
    const { status, id } = order;

    return (
      <View className="px-4 py-3 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
        <View className="flex-row gap-2">
          {/* Cancel Order Button - Only show if status is Pending/Paid/Processing */}
          {canCancelOrder(status) && (
            <TouchableOpacity
              className="flex-1 py-2.5 rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 flex-row items-center justify-center"
              onPress={() => handleCancelOrder(id)}
              activeOpacity={0.7}
              disabled={canceling}
            >
              {canceling ? (
                <ActivityIndicator size={14} color="#EF4444" />
              ) : (
                <>
                  <FontAwesome name="times-circle" size={14} color="#EF4444" />
                  <Text className="text-red-600 dark:text-red-400 font-bold text-xs ml-1.5">
                    Hủy đơn
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Confirm Received Button - Only for Shipping status */}
          {status === "Shipping" && (
            <TouchableOpacity
              className="flex-1 py-2.5 rounded-xl bg-mint dark:bg-gold flex-row items-center justify-center"
              onPress={() => handleConfirmReceived(id)}
              activeOpacity={0.7}
              disabled={confirming}
            >
              {confirming ? (
                <ActivityIndicator size={14} color="#fff" />
              ) : (
                <>
                  <FontAwesome name="check-circle" size={14} color="#fff" />
                  <Text className="text-white font-bold text-xs ml-1.5">
                    Đã nhận
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Detail Button - Always show */}
          <TouchableOpacity
            className="flex-1 py-2.5 rounded-xl bg-beige/50 dark:bg-dark-border/50 border border-mint/30 dark:border-gold/30 flex-row items-center justify-center"
            onPress={() => handleNavigateToDetail(id)}
            activeOpacity={0.7}
          >
            <FontAwesome name="info-circle" size={14} color="#ACD6B8" />
            <Text className="text-mint dark:text-gold font-bold text-xs ml-1.5">
              Chi tiết
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ...existing code...

  const renderOrderCard = (order: any) => (
    <TouchableOpacity
      key={order.id}
      className="bg-white dark:bg-dark-card rounded-2xl mb-4 overflow-hidden shadow-lg"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
      onPress={() => handleNavigateToDetail(order.id)}
      activeOpacity={0.7}
    >
      {/* Order Header */}
      <View className="p-4 bg-beige/20 dark:bg-dark-border/20 border-b border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-3">
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-0.5">
              Mã đơn hàng
            </Text>
            <Text className="text-sm font-bold text-light-text dark:text-dark-text" numberOfLines={1}>
              #{order.orderCode}
            </Text>
          </View>
          <View
            className={`px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}
            style={{ minWidth: 90 }}
          >
            <Text
              className={`text-xs font-bold ${getStatusTextColor(order.status)} text-center`}
              numberOfLines={1}
            >
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <FontAwesome name="shopping-bag" size={12} color="#9CA3AF" />
          <Text
            className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1.5 flex-1"
            numberOfLines={1}
          >
            {order.shopName}
          </Text>
        </View>
      </View>

      {/* Order Items Preview - Compact */}
      <View className="p-4">
        {order.details.slice(0, 2).map((item: any, index: number) => (
          <View
            key={index}
            className={`flex-row items-center ${
              index < order.details.slice(0, 2).length - 1 ? "mb-3 pb-3 border-b border-beige/30 dark:border-dark-border/30" : ""
            }`}
          >
            {item.productImage ? (
              <Image
                source={{ uri: item.productImage }}
                className="w-16 h-16 rounded-lg mr-3"
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-lg bg-beige/30 dark:bg-dark-border/30 items-center justify-center mr-3">
                <FontAwesome name="image" size={24} color="#D1D5DB" />
              </View>
            )}
            <View className="flex-1 mr-2">
              <Text
                className="text-sm font-semibold text-light-text dark:text-dark-text mb-1"
                numberOfLines={2}
              >
                {item.productName}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                x{item.quantity}
              </Text>
            </View>
            <Text className="text-sm font-bold text-mint dark:text-gold">
              {formatPrice(item.lineTotal)}
            </Text>
          </View>
        ))}

        {order.details.length > 2 && (
          <View className="mt-2 pt-2 border-t border-beige/30 dark:border-dark-border/30">
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary text-center">
              +{order.details.length - 2} sản phẩm khác
            </Text>
          </View>
        )}
      </View>

      {/* Order Summary - Compact */}
      <View className="px-4 py-3 bg-beige/10 dark:bg-dark-border/10 border-t border-beige/30 dark:border-dark-border/30">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1 mr-3">
            <FontAwesome name="clock-o" size={12} color="#9CA3AF" />
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1.5" numberOfLines={1}>
              {formatDate(order.createdAt)}
            </Text>
          </View>
          <View className="flex-row items-center flex-shrink-0">
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mr-2">
              Tổng:
            </Text>
            <Text className="text-base font-bold text-mint dark:text-gold" numberOfLines={1}>
              {formatPrice(order.total)}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {renderActionButtons(order)}
    </TouchableOpacity>
  );

  // ...existing code...

  return (
    <SafeAreaView
      className="flex-1 bg-cream dark:bg-dark-background"
      edges={["top"]}
    >
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-center justify-between mb-4">
          {/* Left - Menu Button */}
          <TouchableOpacity
            className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3"
            onPress={() => navigation.openDrawer()}
          >
            <FontAwesome name="bars" size={20} color="#ACD6B8" />
          </TouchableOpacity>

          {/* Center - Title */}
          <View className="flex-1">
            <Text className="text-3xl font-bold text-light-text dark:text-dark-text">
              Đơn hàng của tôi
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                {orders.length > 0 ? `${orders.length} đơn hàng` : "Lịch sử đơn hàng"}
              </Text>
            </View>
          </View>

          {/* Right - Buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center"
              onPress={() => navigation.navigate("CustomerRefunds")}
            >
              <FontAwesome name="undo" size={18} color="#ACD6B8" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center"
              onPress={() => refetch()}
            >
              <FontAwesome name="refresh" size={20} color="#ACD6B8" />
            </TouchableOpacity>
          </View>
        </View>
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
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 30,
          }}
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