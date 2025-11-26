import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
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
import { useMyOrders } from "../hooks/useMyOrders";

export function OrdersScreen({ navigation }: any) {
  const { data: ordersResponse, isLoading, isError, refetch } = useMyOrders();
  const [refreshing, setRefreshing] = useState(false);

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
        No Orders Yet
      </Text>
      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-8">
        Your order history will appear here
      </Text>
      <TouchableOpacity
        className="px-8 py-4 rounded-full bg-mint dark:bg-gold"
        onPress={() => navigation.navigate("Products")}
      >
        <Text className="text-white text-base font-bold">Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#ACD6B8" />
      <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
        Loading orders...
      </Text>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 items-center justify-center px-6">
      <FontAwesome name="exclamation-circle" size={64} color="#FF6B6B" />
      <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
        Something went wrong
      </Text>
      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
        Unable to load your orders
      </Text>
      <TouchableOpacity
        className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
        onPress={() => refetch()}
      >
        <Text className="text-white font-semibold">Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOrderCard = (order: any) => (
    <TouchableOpacity
      key={order.id}
      className="bg-white dark:bg-dark-card rounded-2xl mb-6 overflow-hidden border-2 border-beige/50 dark:border-dark-border/50 shadow-lg"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
      onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
      activeOpacity={0.7}
    >
      {/* Order Header */}
      <View className="p-5 bg-beige/30 dark:bg-dark-border/30 border-b-2 border-beige/50 dark:border-dark-border/50">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
              Order Code
            </Text>
            <Text className="text-base font-bold text-light-text dark:text-dark-text">
              {order.orderCode}
            </Text>
          </View>
          <View className={`px-4 py-2 rounded-full ${getStatusColor(order.status)}`}>
            <Text className={`text-xs font-bold ${getStatusTextColor(order.status)}`}>
              {order.status}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between pt-3 border-t border-beige/30 dark:border-dark-border/30">
          <View className="flex-row items-center flex-1">
            <FontAwesome name="shopping-cart" size={16} color="#ACD6B8" />
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text ml-2 flex-1" numberOfLines={1}>
              {order.shopName}
            </Text>
          </View>
          <View className={`px-3 py-1.5 rounded-full ${getPaymentStatusColor(order.paymentStatus)} ml-2`}>
            <Text className={`text-xs font-bold ${getPaymentStatusTextColor(order.paymentStatus)}`}>
              {order.paymentStatus}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Items Preview */}
      <View className="p-5">
        {order.details.slice(0, 2).map((item: any, index: number) => (
          <View
            key={index}
            className="flex-row items-center mb-4 last:mb-0 pb-4 last:pb-0 border-b border-beige/30 dark:border-dark-border/30 last:border-b-0"
          >
            {item.productImage ? (
              <Image
                source={{ uri: item.productImage }}
                className="w-20 h-20 rounded-xl mr-4 border border-beige/30 dark:border-dark-border/30"
                resizeMode="cover"
              />
            ) : (
              <View className="w-20 h-20 rounded-xl bg-beige/30 dark:bg-dark-border/30 items-center justify-center mr-4 border border-beige/30 dark:border-dark-border/30">
                <FontAwesome name="image" size={28} color="#D1D5DB" />
              </View>
            )}
            <View className="flex-1">
              <Text
                className="text-sm font-bold text-light-text dark:text-dark-text mb-2"
                numberOfLines={2}
              >
                {item.productName}
              </Text>
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                {formatPrice(item.unitPrice)} × {item.quantity}
              </Text>
            </View>
            <Text className="text-base font-bold text-mint dark:text-gold ml-2">
              {formatPrice(item.lineTotal)}
            </Text>
          </View>
        ))}

        {order.details.length > 2 && (
          <View className="mt-3 pt-3 border-t border-beige/30 dark:border-dark-border/30">
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary text-center">
              +{order.details.length - 2} more {order.details.length - 2 === 1 ? "item" : "items"}
            </Text>
          </View>
        )}
      </View>

      {/* Order Summary */}
      <View className="p-5 bg-beige/20 dark:bg-dark-border/20 border-t-2 border-beige/50 dark:border-dark-border/50">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
            Subtotal
          </Text>
          <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
            {formatPrice(order.subtotal)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
            Shipping Fee
          </Text>
          <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
            {formatPrice(order.shippingFee)}
          </Text>
        </View>
        {order.discount > 0 && (
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Discount
            </Text>
            <Text className="text-sm font-semibold text-coral">
              -{formatPrice(order.discount)}
            </Text>
          </View>
        )}
        <View className="h-px bg-beige/50 dark:bg-dark-border/50 my-3" />
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-bold text-light-text dark:text-dark-text">
            Total
          </Text>
          <Text className="text-xl font-bold text-mint dark:text-gold">
            {formatPrice(order.total)}
          </Text>
        </View>
      </View>

      {/* Order Date */}
      <View className="px-5 py-4 border-t-2 border-beige/50 dark:border-dark-border/50 bg-beige/10 dark:bg-dark-border/10">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <FontAwesome name="clock-o" size={14} color="#9CA3AF" />
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-2">
              {formatDate(order.createdAt)}
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="#ACD6B8" />
        </View>
      </View>
    </TouchableOpacity>
  );

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
            My Orders
          </Text>
          {orders.length > 0 && (
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
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
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 }}
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