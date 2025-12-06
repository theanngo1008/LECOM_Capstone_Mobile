import { useUploadFile } from "@/hooks/useUploadFile";
import { OrdersStackScreenProps } from "@/navigation/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
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
import { useCreateRefund } from "../hooks/useCreateRefund";
import { useOrderDetail } from "../hooks/useOrderDetail";

type Props = OrdersStackScreenProps<"OrderDetail">;

// Order status mapping by string
const ORDER_STATUS_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  Pending: { label: "Chờ thanh toán", color: "#F59E0B", bgColor: "#FEF3C7" },
  Paid: { label: "Đã thanh toán", color: "#10B981", bgColor: "#D1FAE5" },
  Processing: { label: "Đang xử lý", color: "#3B82F6", bgColor: "#DBEAFE" },
  Shipping: { label: "Đang vận chuyển", color: "#06B6D4", bgColor: "#CFFAFE" },
  Completed: { label: "Đã hoàn thành", color: "#10B981", bgColor: "#D1FAE5" },
  Cancelled: { label: "Đã hủy", color: "#EF4444", bgColor: "#FEE2E2" },
  Refunded: { label: "Đã hoàn tiền", color: "#6B7280", bgColor: "#F3F4F6" },
  PaymentFailed: { label: "Thanh toán thất bại", color: "#EF4444", bgColor: "#FEE2E2" },
};

// Payment status mapping by string
const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  Pending: { label: "Chờ thanh toán", color: "#F59E0B", icon: "clock-o" },
  Paid: { label: "Đã thanh toán", color: "#10B981", icon: "check-circle" },
  Failed: { label: "Thanh toán thất bại", color: "#EF4444", icon: "times-circle" },
  PartiallyRefunded: { label: "Hoàn tiền một phần", color: "#8B5CF6", icon: "refresh" },
  Refunded: { label: "Đã hoàn tiền", color: "#6B7280", icon: "undo" },
  Cancelled: { label: "Đã hủy", color: "#EF4444", icon: "ban" },
};

export function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const { data, isLoading, isError, refetch } = useOrderDetail(orderId);
  const { mutate: createRefund, isPending: isCreatingRefund } = useCreateRefund();
  const { uploadFile, isLoading: isUploading } = useUploadFile();

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

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

const isRefundAllowed = () => {
  if (!order || order.status !== "Completed") return false;
  if (!order.completedAt) return false; // thêm check null

  const completedDate = new Date(order.completedAt);
  if (isNaN(completedDate.getTime())) return false; // tránh 'Invalid Date'

  const now = new Date();
  const daysDiff = Math.floor(
    (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysDiff <= 5;
};

const getRemainingRefundDays = () => {
  if (!order || order.status !== "Completed") return 0;
  if (!order.completedAt) return 0; // thêm check null

  const completedDate = new Date(order.completedAt);
  if (isNaN(completedDate.getTime())) return 0;

  const now = new Date();
  const daysDiff = Math.floor(
    (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(0, 5 - daysDiff);
};


  const handlePickImage = async () => {
    try {
      const { status: permissionStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionStatus !== "granted") {
        Alert.alert("Lỗi", "Vui lòng cấp quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const file: any = {
        uri: asset.uri,
        name: asset.fileName || `refund_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      };

      // Add image to preview immediately
      setSelectedImage(asset.uri);

      // Upload image
      const uploaded = await uploadFile(file, "image");
      const uploadedUrl = typeof uploaded === "string" ? uploaded : uploaded?.url;
      
      if (!uploadedUrl) {
        throw new Error("Upload failed");
      }

      setUploadedUrl(uploadedUrl);
      console.log("✅ Image uploaded successfully:", uploadedUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Lỗi", err.message || "Không thể tải ảnh lên. Vui lòng thử lại.");
      // Remove the failed image from preview
      setSelectedImage(null);
      setUploadedUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setUploadedUrl(null);
  };

  const handleRefundButtonPress = () => {
    if (!isRefundAllowed()) {
      Alert.alert(
        "Không thể hoàn tiền",
        "Thời gian yêu cầu hoàn tiền đã hết. Bạn chỉ có thể yêu cầu hoàn tiền trong vòng 7 ngày sau khi nhận hàng.",
        [{ text: "Đã hiểu" }]
      );
      return;
    }
    setShowRefundModal(true);
  };

  const handleRefundRequest = () => {
    if (!refundReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do hoàn tiền");
      return;
    }

    if (!uploadedUrl) {
      Alert.alert("Lỗi", "Vui lòng tải lên ảnh minh chứng sản phẩm bị lỗi");
      return;
    }

    if (!order) return;

    const payload = {
      orderId: order.id,
      reasonType: "ProductIssue" as const,
      reasonDescription: refundReason.trim(),
      type: "Full" as const,
      refundAmount: order.total,
      attachmentUrls: uploadedUrl,
    };

    // 🔍 LOG PAYLOAD
    console.log("=== REFUND REQUEST PAYLOAD ===");
    console.log(JSON.stringify(payload, null, 2));
    console.log("==============================");

    createRefund(payload, {
      onSuccess: () => {
        setShowRefundModal(false);
        setRefundReason("");
        setSelectedImage(null);
        setUploadedUrl(null);
        Alert.alert(
          "Thành công",
          "Yêu cầu hoàn tiền đã được gửi. Chúng tôi sẽ xử lý trong vòng 24-48 giờ.",
          [
            {
              text: "OK",
              onPress: () => {
                refetch();
              },
            },
          ]
        );
      },
      onError: (error: any) => {
        // 🔍 LOG ERROR
        console.error("=== REFUND ERROR ===");
        console.error("Status:", error?.response?.status);
        console.error("Data:", JSON.stringify(error?.response?.data, null, 2));
        console.error("Message:", error?.message);
        console.error("====================");

        Alert.alert(
          "Lỗi",
          error?.response?.data?.message || "Không thể gửi yêu cầu hoàn tiền"
        );
      },
    });
  };

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

  // Order status steps
  const statusSteps = [
    { key: "Pending", label: "Chờ thanh toán", icon: "clock-o" },
    { key: "Paid", label: "Đã thanh toán", icon: "check-circle" },
    { key: "Processing", label: "Đang xử lý", icon: "cog" },
    { key: "Shipping", label: "Đang giao", icon: "truck" },
    { key: "Completed", label: "Hoàn thành", icon: "check-circle-o" },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "Cancelled";
  const isRefunded = order.status === "Refunded";
  const isPaymentFailed = order.status === "PaymentFailed";

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
              Trở về
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

            {/* ✅ Refund Timer - Only show when Completed */}
            {order.status === "Completed" && (
              <View className="mt-4 pt-4 border-t border-beige/20 dark:border-dark-border/20">
                <View className="flex-row items-center">
                  <FontAwesome name="clock-o" size={14} color="#F59E0B" />
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-2">
                    {isRefundAllowed() ? (
                      <>
                        Bạn còn{" "}
                        <Text className="font-bold text-orange-500">
                          {getRemainingRefundDays()} ngày
                        </Text>{" "}
                        để yêu cầu hoàn tiền
                      </>
                    ) : (
                      <Text className="text-red-500 font-semibold">
                        Đã hết thời gian yêu cầu hoàn tiền (7 ngày)
                      </Text>
                    )}
                  </Text>
                </View>
              </View>
            )}
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
                  ? "Đơn hàng đã được hoàn tiền thành công"
                  : isPaymentFailed
                  ? "Thanh toán không thành công, vui lòng thử lại"
                  : "Đơn hàng đã bị hủy"}
              </Text>
            </View>
          </View>
        )}

        {/* ...existing code for Payment Status, Product List, Shipping Info, Order Summary... */}
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

        {/* Shipping Info */}
        <View className="bg-white dark:bg-dark-card mx-6 mt-4 rounded-2xl p-6 border border-beige/30 dark:border-dark-border/30">
          <Text className="text-base font-bold text-light-text dark:text-dark-text mb-4">
            Thông tin giao hàng
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
                Tổng đơn hàng
              </Text>
              <Text className="text-xl font-bold text-coral">
                {formatCurrency(order.total)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {order.status === "Pending" && (
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 py-3 rounded-xl border-2 border-coral items-center">
              <Text className="text-coral font-bold">Hủy đơn</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-3 rounded-xl bg-mint dark:bg-gold items-center">
              <Text className="text-white font-bold">Thanh toán ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {order.status === "Completed" && (
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl border-2 items-center ${
                isRefundAllowed()
                  ? "border-coral"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              onPress={handleRefundButtonPress}
              activeOpacity={0.7}
              disabled={!isRefundAllowed()}
            >
              <Text
                className={`font-bold ${
                  isRefundAllowed()
                    ? "text-coral"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                Hoàn tiền
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-3 rounded-xl border-2 border-mint dark:border-gold items-center">
              <Text className="text-mint dark:text-gold font-bold">Đánh giá</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-3 rounded-xl bg-mint dark:bg-gold items-center">
              <Text className="text-white font-bold">Mua lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {order.status === "PaymentFailed" && (
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
          <TouchableOpacity className="w-full py-3 rounded-xl bg-mint dark:bg-gold items-center">
            <Text className="text-white font-bold">Thử thanh toán lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Refund Request Modal */}
      <Modal
        visible={showRefundModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowRefundModal(false);
          setRefundReason("");
          setSelectedImage(null);
          setUploadedUrl(null);
        }}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <ScrollView
            className="w-full max-w-md"
            contentContainerStyle={{ paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="bg-white dark:bg-dark-card rounded-2xl p-6">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                  Yêu cầu hoàn tiền
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowRefundModal(false);
                    setRefundReason("");
                    setSelectedImage(null);
                    setUploadedUrl(null);
                  }}
                  className="w-8 h-8 rounded-full bg-beige/30 dark:bg-dark-border/30 items-center justify-center"
                >
                  <FontAwesome name="times" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Description */}
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-4">
                Vui lòng cung cấp hình ảnh và mô tả chi tiết về sản phẩm bị lỗi.
              </Text>

              {/* Order Info */}
              <View className="bg-beige/20 dark:bg-dark-border/20 rounded-xl p-4 mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                    Mã đơn hàng
                  </Text>
                  <Text className="text-sm font-bold text-light-text dark:text-dark-text">
                    {order?.orderCode}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                    Số tiền hoàn
                  </Text>
                  <Text className="text-sm font-bold text-coral">
                    {order && formatCurrency(order.total)}
                  </Text>
                </View>
              </View>

              {/* Image Upload Section */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Hình ảnh minh chứng <Text className="text-coral">*</Text>
                </Text>

                {selectedImage ? (
                  <View className="relative">
                    <Image
                      source={{ uri: selectedImage }}
                      className="w-full h-48 rounded-xl"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
                      onPress={handleRemoveImage}
                      activeOpacity={0.7}
                    >
                      <FontAwesome name="times" size={14} color="#fff" />
                    </TouchableOpacity>
                    {isUploading && (
                      <View className="absolute inset-0 bg-black/50 rounded-xl items-center justify-center">
                        <ActivityIndicator size="large" color="#fff" />
                        <Text className="text-white text-xs mt-2">Đang tải lên...</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    className="w-full h-48 rounded-xl border-2 border-dashed border-beige dark:border-dark-border items-center justify-center bg-beige/10 dark:bg-dark-border/10"
                    onPress={handlePickImage}
                    activeOpacity={0.7}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <ActivityIndicator size="large" color="#ACD6B8" />
                        <Text className="text-xs text-mint dark:text-gold mt-2">Đang tải lên...</Text>
                      </>
                    ) : (
                      <>
                        <FontAwesome name="camera" size={48} color="#ACD6B8" />
                        <Text className="text-sm text-mint dark:text-gold mt-3 font-semibold">
                          Chọn ảnh minh chứng
                        </Text>
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                          JPG, PNG (tối đa 10MB)
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Reason Input */}
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                Mô tả chi tiết <Text className="text-coral">*</Text>
              </Text>
              <TextInput
                className="bg-beige/20 dark:bg-dark-border/20 rounded-xl p-4 text-light-text dark:text-dark-text min-h-[120px] mb-2"
                placeholder="Mô tả chi tiết lỗi của sản phẩm (màu sắc, kích thước, chất lượng...)"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={refundReason}
                onChangeText={setRefundReason}
                maxLength={500}
              />

              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary text-right mb-4">
                {refundReason.length}/500
              </Text>

              {/* Info Note */}
              <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 mb-4 flex-row">
                <FontAwesome
                  name="info-circle"
                  size={16}
                  color="#F59E0B"
                  style={{ marginTop: 2 }}
                />
                <Text className="text-xs text-yellow-700 dark:text-yellow-400 ml-2 flex-1">
                  Yêu cầu sẽ được xem xét trong 24-48 giờ. Hãy cung cấp đầy đủ thông tin để được
                  xử lý nhanh chóng.
                </Text>
              </View>

              {/* Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl border-2 border-beige dark:border-dark-border items-center"
                  onPress={() => {
                    setShowRefundModal(false);
                    setRefundReason("");
                    setSelectedImage(null);
                    setUploadedUrl(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-light-text dark:text-dark-text font-bold">Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-coral items-center"
                  onPress={handleRefundRequest}
                  disabled={
                    isCreatingRefund ||
                    isUploading ||
                    !refundReason.trim() ||
                    !uploadedUrl
                  }
                  activeOpacity={0.7}
                  style={{
                    opacity:
                      isCreatingRefund ||
                      isUploading ||
                      !refundReason.trim() ||
                      !uploadedUrl
                        ? 0.5
                        : 1,
                  }}
                >
                  {isCreatingRefund ? (
                    <ActivityIndicator size={20} color="#fff" />
                  ) : (
                    <Text className="text-white font-bold">Gửi yêu cầu</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}