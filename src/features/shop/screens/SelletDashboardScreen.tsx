import { useSellerDashboard } from "@/features/shop/hooks/useSellerDashboard";
import { DashboardView } from "@/api/dashboard";
import { formatVietnamDate, toVietnamTime } from "@/utils/dateUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

type ViewOption = {
  label: string;
  value: DashboardView;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
};

const VIEW_OPTIONS: ViewOption[] = [
  { label: "Ngày", value: "day", icon: "calendar-o" },
  { label: "Tuần", value: "week", icon: "calendar" },
  { label: "Tháng", value: "month", icon: "calendar-check-o" },
  { label: "Quý", value: "quarter", icon: "calendar-plus-o" },
  { label: "Năm", value: "year", icon: "calendar-times-o" },
];

export function ShopDashboardScreen({ navigation }: any) {
  const [selectedView, setSelectedView] = useState<DashboardView>("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Custom range
  const [showCustomRangeModal, setShowCustomRangeModal] = useState(false);
  const [customFromDate, setCustomFromDate] = useState(new Date());
  const [customToDate, setCustomToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [isCustomRange, setIsCustomRange] = useState(false);

  // Helper functions - MOVE BEFORE usage
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return formatVietnamDate(dateString);
  };

  // Build query params using useMemo
  const queryParams = useMemo(() => {
    if (isCustomRange && selectedView === "custom") {
      return {
        view: "custom" as DashboardView,
        from: formatDate(customFromDate),
        to: formatDate(customToDate),
      };
    }
    return {
      view: selectedView,
      date: formatDate(selectedDate),
    };
  }, [isCustomRange, selectedView, customFromDate, customToDate, selectedDate]);

  const { data, isLoading, isError, refetch } = useSellerDashboard(queryParams);

  const dashboardData = data?.result;

  const getViewLabel = () => {
    const option = VIEW_OPTIONS.find((o) => o.value === selectedView);
    return option?.label || "Tháng";
  };

  const handleThisMonth = () => {
    setIsCustomRange(false);
    setSelectedView("month");
    setSelectedDate(new Date());
  };

  const handleCustomRange = () => {
    setShowCustomRangeModal(true);
  };

  const applyCustomRange = () => {
    setIsCustomRange(true);
    setSelectedView("custom");
    setShowCustomRangeModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return { bg: "#D1FAE5", text: "#10B981" };
      case "pending":
        return { bg: "#FEF3C7", text: "#F59E0B" };
      case "cancelled":
        return { bg: "#FEE2E2", text: "#EF4444" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Đang tải thống kê...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesome name="exclamation-circle" size={64} color="#F2A297" />
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
            Oops!
          </Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
            Không thể tải thống kê
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
      <View className="px-4 py-4 bg-cream dark:bg-dark-background">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-12 h-12 rounded-full bg-white dark:bg-dark-card items-center justify-center shadow-sm"
          >
            <FontAwesome name="arrow-left" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <Text className="flex-1 text-xl font-bold text-light-text dark:text-dark-text text-center mx-4">
            Thống kê Shop
          </Text>

          <TouchableOpacity
            onPress={() => refetch()}
            className="w-12 h-12 rounded-full bg-white dark:bg-dark-card items-center justify-center shadow-sm"
          >
            <FontAwesome name="refresh" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Shop Info */}
        {dashboardData && (
          <View className="bg-white dark:bg-dark-card rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-2xl font-bold text-mint dark:text-gold mb-1">
              {dashboardData.shopName}
            </Text>
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              {formatDateTime(dashboardData.range.from)} - {formatDateTime(dashboardData.range.to)}
            </Text>
          </View>
        )}

        {/* Time Range Selector */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-mint dark:bg-gold rounded-xl py-3 flex-row items-center justify-center shadow-sm"
            onPress={handleThisMonth}
          >
            <FontAwesome name="calendar-check-o" size={16} color="white" />
            <Text className="text-white font-semibold ml-2">Tháng này</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white dark:bg-dark-card rounded-xl py-3 flex-row items-center justify-center shadow-sm"
            onPress={handleCustomRange}
          >
            <FontAwesome name="calendar" size={16} color="#ACD6B8" />
            <Text className="text-light-text dark:text-dark-text font-semibold ml-2">
              Tùy chọn
            </Text>
          </TouchableOpacity>
        </View>

        {/* View Type Selector */}
        {!isCustomRange && (
          <TouchableOpacity
            className="bg-white dark:bg-dark-card rounded-xl py-3 px-4 mt-3 flex-row items-center justify-between shadow-sm"
            onPress={() => setShowViewModal(true)}
          >
            <View className="flex-row items-center">
              <FontAwesome
                name={VIEW_OPTIONS.find((o) => o.value === selectedView)?.icon || "calendar"}
                size={16}
                color="#ACD6B8"
              />
              <Text className="text-light-text dark:text-dark-text font-semibold ml-2">
                Xem theo: {getViewLabel()}
              </Text>
            </View>
            <FontAwesome name="chevron-down" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {dashboardData && (
          <>
            {/* Overview Stats */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-3">
                Tổng quan
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {/* Total Revenue */}
                <View className="flex-1 min-w-[48%] bg-white dark:bg-dark-card rounded-2xl p-4 shadow-sm">
                  <View className="w-12 h-12 bg-mint/10 dark:bg-gold/10 rounded-2xl items-center justify-center mb-3">
                    <FontAwesome name="money" size={20} color="#ACD6B8" />
                  </View>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                    Doanh thu
                  </Text>
                  <Text className="text-xl font-bold text-mint dark:text-gold">
                    {formatCurrency(dashboardData.overview.totalRevenue)}₫
                  </Text>
                </View>

                {/* Total Orders */}
                <View className="flex-1 min-w-[48%] bg-white dark:bg-dark-card rounded-2xl p-4 shadow-sm">
                  <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl items-center justify-center mb-3">
                    <FontAwesome name="shopping-cart" size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                    Đơn hàng
                  </Text>
                  <Text className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {dashboardData.overview.totalOrders}
                  </Text>
                </View>

                {/* Completed Orders */}
                <View className="flex-1 min-w-[48%] bg-white dark:bg-dark-card rounded-2xl p-4 shadow-sm">
                  <View className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl items-center justify-center mb-3">
                    <FontAwesome name="check-circle" size={20} color="#10B981" />
                  </View>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                    Hoàn thành
                  </Text>
                  <Text className="text-xl font-bold text-green-600 dark:text-green-400">
                    {dashboardData.overview.completedOrders}
                  </Text>
                </View>

                {/* Unique Customers */}
                <View className="flex-1 min-w-[48%] bg-white dark:bg-dark-card rounded-2xl p-4 shadow-sm">
                  <View className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl items-center justify-center mb-3">
                    <FontAwesome name="users" size={20} color="#8B5CF6" />
                  </View>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                    Khách hàng
                  </Text>
                  <Text className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {dashboardData.overview.uniqueCustomers}
                  </Text>
                </View>
              </View>
            </View>

            {/* Wallet Summary */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-3">
                Ví Shop
              </Text>
              <View className="bg-mint dark:bg-gold rounded-2xl p-5 shadow-lg">
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-white/80 text-sm mb-1">Số dư khả dụng</Text>
                    <Text className="text-white text-3xl font-bold">
                      {formatCurrency(dashboardData.walletSummary.availableBalance)}₫
                    </Text>
                  </View>
                  <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center">
                    <FontAwesome name="google-wallet" size={32} color="white" />
                  </View>
                </View>
                <View className="flex-row justify-between pt-4 border-t border-white/20">
                  <View>
                    <Text className="text-white/70 text-xs mb-1">Đang chờ</Text>
                    <Text className="text-white text-sm font-semibold">
                      {formatCurrency(dashboardData.walletSummary.pendingBalance)}₫
                    </Text>
                  </View>
                  <View>
                    <Text className="text-white/70 text-xs mb-1">Tổng thu</Text>
                    <Text className="text-white text-sm font-semibold">
                      {formatCurrency(dashboardData.walletSummary.totalEarned)}₫
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Rating Summary */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-3">
                Đánh giá
              </Text>
              <View className="bg-white dark:bg-dark-card rounded-2xl p-5 shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                      Đánh giá trung bình
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-3xl font-bold text-coral mr-2">
                        {dashboardData.ratingSummary.averageRating.toFixed(1)}
                      </Text>
                      <FontAwesome name="star" size={24} color="#F2A297" />
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                      Tổng đánh giá
                    </Text>
                    <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {dashboardData.ratingSummary.totalFeedbacks}
                    </Text>
                  </View>
                </View>
                <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                  <Text className="text-xs text-green-700 dark:text-green-300">
                    Tỷ lệ đánh giá tích cực:{" "}
                    <Text className="font-bold">
                      {dashboardData.ratingSummary.positiveRate.toFixed(1)}%
                    </Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Top Products */}
            {dashboardData.topProducts.length > 0 && (
              <View className="mb-4">
                <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-3">
                  Sản phẩm bán chạy
                </Text>
                {dashboardData.topProducts.map((product, index) => (
                  <View
                    key={product.productId}
                    className="bg-white dark:bg-dark-card rounded-2xl p-4 mb-3 shadow-sm"
                  >
                    <View className="flex-row items-center">
                      {/* Rank Badge */}
                      <View
                        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                          index === 0
                            ? "bg-yellow-100 dark:bg-yellow-900/30"
                            : index === 1
                            ? "bg-gray-200 dark:bg-gray-700"
                            : "bg-orange-100 dark:bg-orange-900/30"
                        }`}
                      >
                        <Text
                          className={`font-bold ${
                            index === 0
                              ? "text-yellow-600 dark:text-yellow-400"
                              : index === 1
                              ? "text-gray-600 dark:text-gray-400"
                              : "text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          #{index + 1}
                        </Text>
                      </View>

                      {/* Product Image */}
                      {product.thumbnailUrl ? (
                        <Image
                          source={{ uri: product.thumbnailUrl }}
                          className="w-16 h-16 rounded-xl mr-3"
                        />
                      ) : (
                        <View className="w-16 h-16 rounded-xl bg-beige/30 dark:bg-dark-border/30 items-center justify-center mr-3">
                          <FontAwesome name="image" size={24} color="#9CA3AF" />
                        </View>
                      )}

                      {/* Product Info */}
                      <View className="flex-1">
                        <Text
                          className="text-sm font-bold text-light-text dark:text-dark-text mb-1"
                          numberOfLines={2}
                        >
                          {product.productName}
                        </Text>
                        <View className="flex-row items-center mb-1">
                          <FontAwesome name="star" size={12} color="#F59E0B" />
                          <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1">
                            {product.averageRating.toFixed(1)} ({product.feedbackCount})
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                            Đã bán: {product.totalQuantity}
                          </Text>
                          <Text className="text-sm font-bold text-mint dark:text-gold">
                            {formatCurrency(product.totalRevenue)}₫
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Recent Orders */}
            {dashboardData.recentOrders.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-3">
                  Đơn hàng gần đây
                </Text>
                {dashboardData.recentOrders.map((order) => {
                  const statusColor = getStatusColor(order.status);
                  return (
                    <View
                      key={order.orderId}
                      className="bg-white dark:bg-dark-card rounded-2xl p-4 mb-3 shadow-sm"
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-1">
                            {order.orderCode}
                          </Text>
                          <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                            {order.customerName}
                          </Text>
                        </View>
                        <View
                          className="px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: statusColor.bg }}
                        >
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: statusColor.text }}
                          >
                            {order.status}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center justify-between pt-3 border-t border-beige/20 dark:border-dark-border/20">
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                          {formatDateTime(order.createdAt)}
                        </Text>
                        <Text className="text-base font-bold text-coral">
                          {formatCurrency(order.total)}₫
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* View Type Modal */}
      <Modal
        visible={showViewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowViewModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-dark-card rounded-t-3xl px-6 pb-8 pt-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Chọn loại xem
              </Text>
              <TouchableOpacity
                onPress={() => setShowViewModal(false)}
                className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
              >
                <FontAwesome name="times" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {VIEW_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${
                  selectedView === option.value
                    ? "bg-mint/10 dark:bg-gold/10 border-2 border-mint dark:border-gold"
                    : "bg-beige/20 dark:bg-dark-background"
                }`}
                onPress={() => {
                  setSelectedView(option.value);
                  setShowViewModal(false);
                  setIsCustomRange(false);
                }}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                      selectedView === option.value
                        ? "bg-mint dark:bg-gold"
                        : "bg-white dark:bg-dark-card"
                    }`}
                  >
                    <FontAwesome
                      name={option.icon}
                      size={18}
                      color={selectedView === option.value ? "white" : "#9CA3AF"}
                    />
                  </View>
                  <Text
                    className={`text-base font-semibold ${
                      selectedView === option.value
                        ? "text-mint dark:text-gold"
                        : "text-light-text dark:text-dark-text"
                    }`}
                  >
                    {option.label}
                  </Text>
                </View>
                {selectedView === option.value && (
                  <FontAwesome name="check" size={20} color="#ACD6B8" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Custom Range Modal */}
      <Modal
        visible={showCustomRangeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomRangeModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-dark-card rounded-t-3xl px-6 pb-8 pt-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Chọn khoảng thời gian
              </Text>
              <TouchableOpacity
                onPress={() => setShowCustomRangeModal(false)}
                className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
              >
                <FontAwesome name="times" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* From Date */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                Từ ngày
              </Text>
              <TouchableOpacity
                className="bg-beige/20 dark:bg-dark-background rounded-xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowFromPicker(true)}
              >
                <Text className="text-base text-light-text dark:text-dark-text">
                  {formatDateTime(customFromDate.toISOString())}
                </Text>
                <FontAwesome name="calendar" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* To Date */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                Đến ngày
              </Text>
              <TouchableOpacity
                className="bg-beige/20 dark:bg-dark-background rounded-xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowToPicker(true)}
              >
                <Text className="text-base text-light-text dark:text-dark-text">
                  {formatDateTime(customToDate.toISOString())}
                </Text>
                <FontAwesome name="calendar" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              className="bg-mint dark:bg-gold rounded-xl py-4 items-center"
              onPress={applyCustomRange}
            >
              <Text className="text-white text-base font-bold">Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showFromPicker && (
        <DateTimePicker
          value={customFromDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowFromPicker(false);
            if (date) setCustomFromDate(date);
          }}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={customToDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowToPicker(false);
            if (date) setCustomToDate(date);
          }}
        />
      )}
    </SafeAreaView>
  );
}