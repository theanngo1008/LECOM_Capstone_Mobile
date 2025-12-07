import { OrdersStackScreenProps } from "@/navigation/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOrderDetail } from "@/features/orders/hooks/useOrderDetail";
import { useUpdateOrderStatus } from "../hooks/useUpdateOrderStatus";

type Props = {
  route: { params: { orderId: string } };
  navigation: any;
};

// Order status mapping
const ORDER_STATUS_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  Pending: { label: "Chờ xác nhận", color: "#F59E0B", bgColor: "#FEF3C7" },
  Paid: { label: "Đã thanh toán", color: "#10B981", bgColor: "#D1FAE5" },
  Processing: { label: "Đang xử lý", color: "#3B82F6", bgColor: "#DBEAFE" },
  Shipping: { label: "Đang vận chuyển", color: "#06B6D4", bgColor: "#CFFAFE" },
  Completed: { label: "Đã hoàn thành", color: "#10B981", bgColor: "#D1FAE5" },
  Cancelled: { label: "Đã hủy", color: "#EF4444", bgColor: "#FEE2E2" },
  Refunded: { label: "Đã hoàn tiền", color: "#6B7280", bgColor: "#F3F4F6" },
  PaymentFailed: { label: "Thanh toán thất bại", color: "#EF4444", bgColor: "#FEE2E2" },
};

// Payment status mapping
const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  Pending: { label: "Chờ thanh toán", color: "#F59E0B", icon: "clock-o" },
  Paid: { label: "Đã thanh toán", color: "#10B981", icon: "check-circle" },
  Failed: { label: "Thanh toán thất bại", color: "#EF4444", icon: "times-circle" },
  PartiallyRefunded: { label: "Hoàn tiền một phần", color: "#8B5CF6", icon: "refresh" },
  Refunded: { label: "Đã hoàn tiền", color: "#6B7280", icon: "undo" },
  Cancelled: { label: "Đã hủy", color: "#EF4444", icon: "ban" },
};

export function ShopOrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const { data, isLoading, isError, refetch } = useOrderDetail(orderId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus(orderId);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<"confirm" | "ship" | null>(null);

  const order = data?.result;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleConfirmAction = () => {
    if (!order || !actionType) return;

    const newStatus = actionType === "confirm" ? "Processing" : "Shipping";

    updateStatus(newStatus, {
      onSuccess: () => {
        setShowConfirmModal(false);
        setActionType(null);
        const message =
          actionType === "confirm"
            ? "Đơn hàng đã được xác nhận và đang xử lý"
            : "Đơn hàng đã được gửi đi";
        Alert.alert("Thành công", message, [{ text: "OK", onPress: () => refetch() }]);
      },
      onError: (error: any) => {
        Alert.alert(
          "Lỗi",
          error?.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng"
        );
      },
    });
  };

  const openConfirmModal = (type: "confirm" | "ship") => {
    setActionType(type);
    setShowConfirmModal(true);
  };

  // ================================
  // LOADING & ERROR STATES
  // ================================
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Đang tải đơn hàng...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesome name="exclamation-circle" size={64} color="#F2A297" />
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mt-4 mb-2">
            Oops!
          </Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-6">
            Không thể tải thông tin đơn hàng
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

  const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.Pending;
  const paymentInfo = PAYMENT_STATUS_MAP[order.paymentStatus] || PAYMENT_STATUS_MAP.Pending;

  const statusSteps = [
    { key: "Paid", label: "Đã thanh toán", icon: "check-circle" },
    { key: "Processing", label: "Đang xử lý", icon: "cog" },
    { key: "Shipping", label: "Đang giao", icon: "truck" },
    { key: "Completed", label: "Hoàn thành", icon: "check-circle-o" },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "Cancelled";
  const isRefunded = order.status === "Refunded";
  const isPaymentFailed = order.status === "PaymentFailed";

  // ✅ Determine which button to show
  const showConfirmButton = order.status === "Paid";
  const showShipButton = order.status === "Processing";
  const showNoAction = ["Shipping", "Completed", "Cancelled", "Refunded"].includes(order.status);

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center mr-3"
            >
              <FontAwesome name="arrow-left" size={18} color="#ACD6B8" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-light-text dark:text-dark-text">
              Chi tiết đơn hàng
            </Text>
          </View>

          <View
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: statusInfo.bgColor }}
          >
            <Text className="text-xs font-semibold" style={{ color: statusInfo.color }}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View>
          <Text className="text-base font-bold text-light-text dark:text-dark-text">
            Mã đơn hàng: {order.orderCode}
          </Text>
          <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
            Ngày đặt hàng: {formatDate(order.createdAt)}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Order Status Timeline */}
        {!isCancelled && !isRefunded && !isPaymentFailed && (
          <View className="bg-white dark:bg-dark-card mx-6 mt-6 rounded-2xl p-6 border border-beige/30 dark:border-dark-border/30">
            <Text className="text-base font-bold text-light-text dark:text-dark-text mb-4">
              Trạng thái đơn hàng
            </Text>

            <View className="flex-row items-center justify-between mb-4">
              {statusSteps.map((step, index) => (
                <View key={step.key} className="items-center flex-1">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      index <= currentStepIndex
                        ? "bg-mint dark:bg-gold"
                        : "bg-beige/30 dark:bg-dark-border/30"
                    }`}
                  >
                    <FontAwesome
                      name={step.icon as any}
                      size={16}
                      color={index <= currentStepIndex ? "#fff" : "#9CA3AF"}
                    />
                  </View>
                  <Text
                    className={`text-xs mt-2 text-center ${
                      index <= currentStepIndex
                        ? "text-mint dark:text-gold font-semibold"
                        : "text-light-textSecondary dark:text-dark-textSecondary"
                    }`}
                    numberOfLines={2}
                  >
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>

            <View className="h-1 bg-beige/30 dark:bg-dark-border/30 rounded-full overflow-hidden">
              <View
                className="h-full bg-mint dark:bg-gold rounded-full"
                style={{
                  width: `${
                    currentStepIndex >= 0
                      ? (currentStepIndex / (statusSteps.length - 1)) * 100
                      : 0
                  }%`,
                }}
              />
            </View>
          </View>
        )}

        {/* Cancelled/Refunded/Failed Status */}
        {(isCancelled || isRefunded || isPaymentFailed) && (
          <View className="bg-white dark:bg-dark-card mx-6 mt-6 rounded-2xl p-6 border border-beige/30 dark:border-dark-border/30">
            <View className="items-center py-4">
              <View
                className={`w-16 h-16 rounded-full items-center justify-center ${
                  isRefunded ? "bg-gray-100" : "bg-red-100"
                }`}
              >
                <FontAwesome
                  name={isRefunded ? "undo" : isPaymentFailed ? "times-circle" : "ban"}
                  size={32}
                  color={isRefunded ? "#6B7280" : "#EF4444"}
                />
              </View>
              <Text className="text-lg font-bold text-light-text dark:text-dark-text mt-4">
                {statusInfo.label}
              </Text>
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center mt-2">
                {isRefunded
                  ? "Đơn hàng đã được hoàn tiền"
                  : isPaymentFailed
                  ? "Thanh toán không thành công"
                  : "Đơn hàng đã bị hủy"}
              </Text>
            </View>
          </View>
        )}

        {/* Payment Status */}
        <View className="bg-white dark:bg-dark-card mx-6 mt-4 rounded-2xl p-6 border border-beige/30 dark:border-dark-border/30">
          <Text className="text-base font-bold text-light-text dark:text-dark-text mb-4">
            Trạng thái thanh toán
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor:
                    order.paymentStatus === "Paid"
                      ? "#D1FAE5"
                      : order.paymentStatus === "Failed" || order.paymentStatus === "Cancelled"
                      ? "#FEE2E2"
                      : order.paymentStatus === "Refunded" ||
                        order.paymentStatus === "PartiallyRefunded"
                      ? "#F3F4F6"
                      : "#FEF3C7",
                }}
              >
                <FontAwesome
                  name={paymentInfo.icon as any}
                  size={16}
                  color={paymentInfo.color}
                />
              </View>
              <View className="ml-3">
                <Text className="text-sm font-semibold" style={{ color: paymentInfo.color }}>
                  {paymentInfo.label}
                </Text>
                {order.paymentStatus === "Paid" && (
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-0.5">
                    Đã xác nhận
                  </Text>
                )}
              </View>
            </View>

            {order.paymentStatus === "Paid" && (
              <View className="bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                <Text className="text-xs font-semibold text-green-600 dark:text-green-400">
                  ✓ Hoàn tất
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Balance Released Status */}
        {order.balanceReleased && (
          <View className="bg-white dark:bg-dark-card mx-6 mt-4 rounded-2xl p-6 border border-green-200 dark:border-green-800">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mr-4">
                <FontAwesome name="check-circle" size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-green-600 dark:text-green-400 mb-1">
                  Đã giải ngân
                </Text>
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  Tiền đã được chuyển vào tài khoản của bạn
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Product List */}
        <View className="bg-white dark:bg-dark-card mx-6 mt-4 rounded-2xl p-6 border border-beige/30 dark:border-dark-border/30">
          <Text className="text-base font-bold text-light-text dark:text-dark-text mb-4">
            Danh sách sản phẩm
          </Text>

          {order.details.map((item, index) => (
            <View
              key={item.id || index}
              className={`flex-row py-4 ${
                index !== order.details.length - 1
                  ? "border-b border-beige/20 dark:border-dark-border/20"
                  : ""
              }`}
            >
              <View className="w-20 h-20 bg-beige/20 dark:bg-dark-border/20 rounded-xl overflow-hidden mr-3">
                {item.productImage ? (
                  <Image
                    source={{ uri: item.productImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <FontAwesome name="image" size={24} color="#9CA3AF" />
                  </View>
                )}
              </View>

              <View className="flex-1">
                <Text
                  className="text-sm font-bold text-light-text dark:text-dark-text mb-1"
                  numberOfLines={2}
                >
                  {item.productName}
                </Text>
                {item.productCategory && (
                  <View className="bg-beige/30 dark:bg-dark-border/30 px-2 py-0.5 rounded self-start mb-2">
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                      {item.productCategory}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-coral font-semibold">
                    {formatCurrency(item.unitPrice)}
                  </Text>
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                    x{item.quantity}
                  </Text>
                </View>
                <View className="flex-row justify-end mt-1">
                  <Text className="text-sm font-bold text-light-text dark:text-dark-text">
                    {formatCurrency(item.lineTotal)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Customer Info */}
        <View className="bg-white dark:bg-dark-card mx-6 mt-4 rounded-2xl p-6 border border-beige/30 dark:border-dark-border/30">
          <Text className="text-base font-bold text-light-text dark:text-dark-text mb-4">
            Thông tin khách hàng
          </Text>

          <View className="space-y-3">
            <View className="flex-row items-start mb-3">
              <View className="w-8 h-8 bg-mint/10 dark:bg-gold/10 rounded-lg items-center justify-center">
                <FontAwesome name="user" size={14} color="#ACD6B8" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                  Người nhận
                </Text>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                  {order.shipToName}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mb-3">
              <View className="w-8 h-8 bg-mint/10 dark:bg-gold/10 rounded-lg items-center justify-center">
                <FontAwesome name="phone" size={14} color="#ACD6B8" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                  Số điện thoại
                </Text>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                  {order.shipToPhone}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-mint/10 dark:bg-gold/10 rounded-lg items-center justify-center">
                <FontAwesome name="map-marker" size={14} color="#ACD6B8" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
                  Địa chỉ giao hàng
                </Text>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                  {order.shipToAddress}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View className="bg-white dark:bg-dark-card mx-6 mt-4 mb-6 rounded-2xl p-6 border border-beige/30 dark:border-dark-border/30">
          <Text className="text-base font-bold text-light-text dark:text-dark-text mb-4">
            Tóm tắt đơn hàng
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                Tạm tính
              </Text>
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                {formatCurrency(order.subtotal)}
              </Text>
            </View>

            <View className="flex-row justify-between py-2">
              <View className="flex-row items-center">
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  Phí giao hàng
                </Text>
                <View className="ml-2 w-4 h-4 bg-skyBlue/20 dark:bg-lavender/20 rounded-full items-center justify-center">
                  <FontAwesome name="info" size={8} color="#A5C4FB" />
                </View>
              </View>
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                {formatCurrency(order.shippingFee)}
              </Text>
            </View>

            {order.discount > 0 && (
              <View className="flex-row justify-between py-2">
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  Giảm giá
                </Text>
                <Text className="text-sm font-semibold text-green-600 dark:text-green-400">
                  -{formatCurrency(order.discount)}
                </Text>
              </View>
            )}

            <View className="h-px bg-beige/20 dark:bg-dark-border/20" />

            <View className="flex-row justify-between pt-2">
              <Text className="text-lg font-bold text-light-text dark:text-dark-text">
                Tổng doanh thu
              </Text>
              <Text className="text-xl font-bold text-mint dark:text-gold">
                {formatCurrency(order.total)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ✅ Action Buttons - Dynamic based on status */}
      {showConfirmButton && (
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
          <TouchableOpacity
            className="w-full py-3 rounded-xl bg-mint dark:bg-gold items-center"
            onPress={() => openConfirmModal("confirm")}
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold">Xác nhận đơn hàng</Text>
          </TouchableOpacity>
        </View>
      )}

      {showShipButton && (
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
          <TouchableOpacity
            className="w-full py-3 rounded-xl bg-blue-500 items-center"
            onPress={() => openConfirmModal("ship")}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <FontAwesome name="truck" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold">Đã gửi hàng</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {showNoAction && (
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
          <View className="w-full py-3 rounded-xl bg-gray-200 dark:bg-gray-700 items-center">
            <Text className="text-gray-500 dark:text-gray-400 font-bold">
              {order.status === "Shipping" && "Đơn hàng đang vận chuyển"}
              {order.status === "Completed" && "Đơn hàng đã hoàn thành"}
              {order.status === "Cancelled" && "Đơn hàng đã hủy"}
              {order.status === "Refunded" && "Đơn hàng đã hoàn tiền"}
            </Text>
          </View>
        </View>
      )}

      {/* ✅ Confirm/Ship Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowConfirmModal(false);
          setActionType(null);
        }}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white dark:bg-dark-card rounded-2xl p-6 w-full max-w-md">
            <View className="items-center mb-6">
              <View
                className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                  actionType === "confirm" ? "bg-mint/20 dark:bg-gold/20" : "bg-blue-100"
                }`}
              >
                <FontAwesome
                  name={actionType === "confirm" ? "check-circle" : "truck"}
                  size={32}
                  color={actionType === "confirm" ? "#ACD6B8" : "#3B82F6"}
                />
              </View>
              <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
                {actionType === "confirm" ? "Xác nhận đơn hàng" : "Xác nhận gửi hàng"}
              </Text>
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center">
                {actionType === "confirm"
                  ? "Bạn có chắc muốn xác nhận đơn hàng này? Đơn hàng sẽ chuyển sang trạng thái ĐANG XỬ LÝ."
                  : "Bạn có chắc đã gửi hàng? Đơn hàng sẽ chuyển sang trạng thái ĐANG VẬN CHUYỂN."}
              </Text>
            </View>

            <View className="bg-beige/20 dark:bg-dark-border/20 rounded-xl p-4 mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  Mã đơn hàng
                </Text>
                <Text className="text-sm font-bold text-light-text dark:text-dark-text">
                  {order.orderCode}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  Tổng giá trị
                </Text>
                <Text className="text-sm font-bold text-mint dark:text-gold">
                  {formatCurrency(order.total)}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl border-2 border-beige dark:border-dark-border items-center"
                onPress={() => {
                  setShowConfirmModal(false);
                  setActionType(null);
                }}
                activeOpacity={0.7}
                disabled={isUpdating}
              >
                <Text className="text-light-text dark:text-dark-text font-bold">Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center ${
                  actionType === "confirm" ? "bg-mint dark:bg-gold" : "bg-blue-500"
                }`}
                onPress={handleConfirmAction}
                disabled={isUpdating}
                activeOpacity={0.7}
                style={{ opacity: isUpdating ? 0.5 : 1 }}
              >
                {isUpdating ? (
                  <ActivityIndicator size={20} color="#fff" />
                ) : (
                  <Text className="text-white font-bold">Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}