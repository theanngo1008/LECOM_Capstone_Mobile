import { useUploadFile } from "@/hooks/useUploadFile";
import { OrdersStackScreenProps } from "@/navigation/types";
import { formatVietnamDateTime, toVietnamTime } from "@/utils/dateUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCancelOrder } from "../hooks/useCancelOrder";
import { useCreateFeedback } from "../hooks/useCreateFeedback";
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
  const { mutate: createFeedback, isPending: isCreatingFeedback } = useCreateFeedback();
  const { cancelOrder, isLoading: isCanceling } = useCancelOrder();
  const { uploadFile, isLoading: isUploading } = useUploadFile();

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackImages, setFeedbackImages] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const order = data?.result;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  // Refetch order detail mỗi khi vào lại màn hình
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return formatVietnamDateTime(dateString);
  };

  const isRefundAllowed = () => {
    if (!order || order.status !== "Completed") return false;
    if (!order.completedAt) return false;

    const completedDate = toVietnamTime(order.completedAt);
    if (isNaN(completedDate.getTime())) return false;

    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysDiff <= 5;
  };

  const getRemainingRefundDays = () => {
    if (!order || order.status !== "Completed") return 0;
    if (!order.completedAt) return 0;

    const completedDate = toVietnamTime(order.completedAt);
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

      setSelectedImage(asset.uri);

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
        "Thời gian yêu cầu hoàn tiền đã hết. Bạn chỉ có thể yêu cầu hoàn tiền trong vòng 5 ngày sau khi nhận hàng.",
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

    createRefund(payload, {
      onSuccess: () => {
        setShowRefundModal(false);
        setRefundReason("");
        setSelectedImage(null);
        setUploadedUrl(null);
        Alert.alert(
          "Thành công",
          "Yêu cầu hoàn tiền đã được gửi. Chúng tôi sẽ xử lý trong vòng 24-48 giờ.",
          [{ text: "OK", onPress: () => refetch() }]
        );
      },
      onError: (error: any) => {
        Alert.alert(
          "Lỗi",
          error?.response?.data?.message || "Không thể gửi yêu cầu hoàn tiền"
        );
      },
    });
  };

  const handlePickFeedbackImages = async () => {
    try {
      if (feedbackImages.length >= 5) {
        Alert.alert("Thông báo", "Bạn chỉ có thể tải lên tối đa 5 ảnh");
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Vui lòng cấp quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5 - feedbackImages.length,
        quality: 0.8,
      });

      if (result.canceled) return;

      const newFiles = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `feedback_${Date.now()}_${Math.random()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      }));

      setFeedbackImages((prev) => [...prev, ...newFiles]);
    } catch (err: any) {
      console.error("Pick feedback images error:", err);
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
    }
  };

  const handleRemoveFeedbackImage = (index: number) => {
    setFeedbackImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFeedbackButtonPress = (productId: string, product: any) => {
    setSelectedProductId(productId);
    setSelectedProduct(product);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = () => {
    if (!feedbackComment.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nhận xét của bạn");
      return;
    }

    if (!order || !selectedProductId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin sản phẩm");
      return;
    }

    const payload = {
      productId: selectedProductId,
      orderId: order.id,
      rating,
      content: feedbackComment.trim(),
      images: feedbackImages.length > 0 ? feedbackImages : undefined,
    };

    console.log("=== FEEDBACK PAYLOAD ===");
    console.log(`Product: ${selectedProductId}, Order: ${order.id}, Rating: ${rating}`);
    console.log(`Images: ${feedbackImages.length} files`);

    createFeedback(payload, {
      onSuccess: () => {
        setShowFeedbackModal(false);
        setSelectedProductId(null);
        setSelectedProduct(null);
        setRating(5);
        setFeedbackComment("");
        setFeedbackImages([]);
        Alert.alert(
          "Thành công",
          "Cảm ơn bạn đã đánh giá sản phẩm!",
          [{ text: "OK", onPress: () => refetch() }]
        );
      },
      onError: (error: any) => {
        console.error("=== FEEDBACK ERROR ===");
        console.error("Status:", error?.response?.status);
        console.error("Data:", JSON.stringify(error?.response?.data, null, 2));
        Alert.alert(
          "Lỗi",
          error?.response?.data?.message || "Không thể gửi đánh giá"
        );
      },
    });
  };

  const resetFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedProductId(null);
    setSelectedProduct(null);
    setRating(5);
    setFeedbackComment("");
    setFeedbackImages([]);
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
      {/* Header - Fixed Layout */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
            >
              <FontAwesome name="arrow-left" size={18} color="#ACD6B8" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-light-text dark:text-dark-text ml-3">
              Trở về
            </Text>
          </View>

          <View
            className="px-3 py-1.5 rounded-full"
            style={{ 
              backgroundColor: statusInfo.bgColor, 
              minWidth: 85,
              alignSelf: 'flex-start'
            }}
          >
            <Text 
              className="text-xs font-semibold text-center" 
              style={{ color: statusInfo.color }}
              numberOfLines={1}
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View className="mt-1">
          <Text 
            className="text-base font-bold text-light-text dark:text-dark-text" 
            numberOfLines={1}
          >
            Mã đơn hàng: {order.orderCode}
          </Text>
          <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
            Ngày đặt hàng: {formatDate(order.createdAt)}
          </Text>
        </View>
      </View>
      <ScrollView 
        className="flex-1" 
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
        {/* Order Status Timeline */}
        {!isCancelled && !isRefunded && !isPaymentFailed && (
          <View className="bg-white dark:bg-dark-card mx-6 mt-6 rounded-2xl p-6 border border-beige/30 dark:border-dark-border/30">
            <Text className="text-base font-bold text-light-text dark:text-dark-text mb-6">
              Trạng thái đơn hàng
            </Text>

            {/* Progress Bar */}
            <View className="relative mb-8">
              <View className="absolute top-5 left-0 right-0 h-1 bg-beige/30 dark:bg-dark-border/30 rounded-full" />
              <View
                className="absolute top-5 left-0 h-1 bg-mint dark:bg-gold rounded-full"
                style={{
                  width: `${
                    currentStepIndex >= 0
                      ? (currentStepIndex / (statusSteps.length - 1)) * 100
                      : 0
                  }%`,
                }}
              />
              
              {/* Steps */}
              <View className="flex-row justify-between">
                {statusSteps.map((step, index) => (
                  <View key={step.key} className="items-center" style={{ flex: 1 }}>
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center z-10 ${
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
                      className={`text-[10px] mt-2 text-center px-1 ${
                        index <= currentStepIndex
                          ? "text-mint dark:text-gold font-semibold"
                          : "text-light-textSecondary dark:text-dark-textSecondary"
                      }`}
                      numberOfLines={2}
                      style={{ minHeight: 32 }}
                    >
                      {step.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

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
                        Đã hết thời gian yêu cầu hoàn tiền (5 ngày)
                      </Text>
                    )}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}



        {/* Cancelled/Refunded/Failed Status - Optimized */}
        {(isCancelled || isRefunded || isPaymentFailed) && (
          <View className="bg-white dark:bg-dark-card mx-6 mt-6 rounded-2xl overflow-hidden border border-beige/30 dark:border-dark-border/30">
            {/* Header with gradient */}
            <View 
              className="px-6 py-4"
              style={{
                backgroundColor: isRefunded 
                  ? '#F9FAFB' 
                  : isPaymentFailed 
                  ? '#FEF2F2' 
                  : '#FEE2E2'
              }}
            >
              <View className="flex-row items-center justify-center">
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                        isRefunded 
                          ? "bg-gray-200 dark:bg-gray-700" 
                          : isPaymentFailed
                          ? "bg-red-200 dark:bg-red-900/50"
                          : "bg-red-200 dark:bg-red-900/50"
                      }`}
                    >
                      <FontAwesome
                        name={isRefunded ? "undo" : isPaymentFailed ? "times-circle" : "ban"}
                        size={24}
                        color={isRefunded ? "#6B7280" : "#EF4444"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-light-text dark:text-dark-text">
                        {statusInfo.label}
                      </Text>
                      <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-0.5">
                        {isRefunded
                          ? formatDate((order as any).updatedAt || order.createdAt)
                          : isPaymentFailed
                          ? "Vui lòng kiểm tra phương thức thanh toán"
                          : formatDate((order as any).updatedAt || order.createdAt)}
                      </Text>
                    </View>
                  </View>
            </View>

            {/* Content */}
            <View className="px-6 py-4">
              <Text className="text-sm text-light-text dark:text-dark-text text-center leading-5">
                {isRefunded
                  ? "Đơn hàng đã được hoàn tiền thành công. Số tiền sẽ được hoàn về ví của bạn ."
                  : isPaymentFailed
                  ? "Thanh toán không thành công. Vui lòng kiểm tra lại thông tin thanh toán hoặc thử phương thức khác."
                  : "Đơn hàng đã bị hủy. Nếu bạn đã thanh toán, số tiền sẽ được hoàn lại vào ví của bạn."}
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
                {order.status === "Completed" && (
                  <TouchableOpacity
                    className="mt-3 py-2 px-4 rounded-xl border-2 border-mint dark:border-gold items-center self-start"
                    onPress={() => handleFeedbackButtonPress(item.productId, item)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-mint dark:text-gold font-semibold text-sm">
                      Đánh giá
                    </Text>
                  </TouchableOpacity>
                )}
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
            <TouchableOpacity 
              className="flex-1 py-3 rounded-xl border-2 border-coral items-center"
              onPress={() => {
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
                          refetch(); // Refetch để cập nhật ngay
                        } catch {
                          Alert.alert("Lỗi", "Không thể hủy đơn hàng");
                        }
                      },
                    },
                  ]
                );
              }}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text className="text-coral font-bold">Hủy đơn</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-3 rounded-xl bg-mint dark:bg-gold items-center">
              <Text className="text-white font-bold">Thanh toán ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {order.status === "Completed" && (
        <View className="px-6 py-4 bg-white dark:bg-dark-card border-t border-beige/30 dark:border-dark-border/30">
          <TouchableOpacity
            className={`w-full py-3 rounded-xl border-2 items-center ${
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

              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-4">
                Vui lòng cung cấp hình ảnh và mô tả chi tiết về sản phẩm bị lỗi.
              </Text>

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

      <Modal
        visible={showFeedbackModal}
        transparent
        animationType="fade"
        onRequestClose={resetFeedbackModal}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <ScrollView
            className="w-full max-w-md"
            contentContainerStyle={{ paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="bg-white dark:bg-dark-card rounded-2xl p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                  Đánh giá sản phẩm
                </Text>
                <TouchableOpacity
                  onPress={resetFeedbackModal}
                  className="w-8 h-8 rounded-full bg-beige/30 dark:bg-dark-border/30 items-center justify-center"
                >
                  <FontAwesome name="times" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {selectedProduct && (
                <View className="flex-row items-center bg-beige/20 dark:bg-dark-border/20 rounded-xl p-4 mb-6">
                  <View className="w-16 h-16 bg-beige/30 dark:bg-dark-border/30 rounded-xl overflow-hidden mr-3">
                    {selectedProduct.productImage ? (
                      <Image
                        source={{ uri: selectedProduct.productImage }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <FontAwesome name="image" size={20} color="#9CA3AF" />
                      </View>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-bold text-light-text dark:text-dark-text mb-1"
                      numberOfLines={2}
                    >
                      {selectedProduct.productName}
                    </Text>
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                      {formatCurrency(selectedProduct.unitPrice || 0)}
                    </Text>
                  </View>
                </View>
              )}

              <View className="items-center mb-6">
                <Text className="text-base font-semibold text-light-text dark:text-dark-text mb-3">
                  Đánh giá của bạn
                </Text>
                <View className="flex-row gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      activeOpacity={0.7}
                    >
                      <FontAwesome
                        name={star <= rating ? "star" : "star-o"}
                        size={40}
                        color={star <= rating ? "#F59E0B" : "#D1D5DB"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mt-2">
                  {rating === 5 && "Tuyệt vời!"}
                  {rating === 4 && "Rất tốt!"}
                  {rating === 3 && "Khá ổn"}
                  {rating === 2 && "Tạm được"}
                  {rating === 1 && "Không hài lòng"}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Nhận xét <Text className="text-coral">*</Text>
                </Text>
                <TextInput
                  className="bg-beige/20 dark:bg-dark-border/20 rounded-xl p-4 text-light-text dark:text-dark-text min-h-[120px]"
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  value={feedbackComment}
                  onChangeText={setFeedbackComment}
                  maxLength={500}
                />
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary text-right mt-1">
                  {feedbackComment.length}/500
                </Text>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Thêm ảnh (tùy chọn)
                </Text>
                
                {feedbackImages.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-3"
                  >
                    <View className="flex-row gap-2">
                      {feedbackImages.map((file, index) => (
                        <View key={index} className="relative">
                          <Image
                            source={{ uri: file.uri }}
                            className="w-20 h-20 rounded-xl"
                            resizeMode="cover"
                          />
                          <TouchableOpacity
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center border-2 border-white"
                            onPress={() => handleRemoveFeedbackImage(index)}
                          >
                            <FontAwesome name="times" size={10} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}

                {feedbackImages.length < 5 && (
                  <TouchableOpacity
                    className="w-full h-32 rounded-xl border-2 border-dashed border-beige dark:border-dark-border items-center justify-center bg-beige/10 dark:bg-dark-border/10"
                    onPress={handlePickFeedbackImages}
                    activeOpacity={0.7}
                  >
                    <FontAwesome name="image" size={40} color="#ACD6B8" />
                    <Text className="text-sm text-mint dark:text-gold mt-2 font-semibold">
                      Thêm ảnh sản phẩm
                    </Text>
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                      Tối đa 5 ảnh ({feedbackImages.length}/5)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-4 flex-row">
                <FontAwesome
                  name="info-circle"
                  size={16}
                  color="#3B82F6"
                  style={{ marginTop: 2 }}
                />
                <Text className="text-xs text-blue-700 dark:text-blue-400 ml-2 flex-1">
                  Đánh giá của bạn sẽ giúp người mua khác có thêm thông tin tham khảo.
                </Text>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl border-2 border-beige dark:border-dark-border items-center"
                  onPress={resetFeedbackModal}
                  activeOpacity={0.7}
                  disabled={isCreatingFeedback}
                >
                  <Text className="text-light-text dark:text-dark-text font-bold">Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-mint dark:bg-gold items-center"
                  onPress={handleSubmitFeedback}
                  disabled={isCreatingFeedback || !feedbackComment.trim()}
                  activeOpacity={0.7}
                  style={{
                    opacity: isCreatingFeedback || !feedbackComment.trim() ? 0.5 : 1,
                  }}
                >
                  {isCreatingFeedback ? (
                    <ActivityIndicator size={20} color="#fff" />
                  ) : (
                    <Text className="text-white font-bold">Gửi đánh giá</Text>
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