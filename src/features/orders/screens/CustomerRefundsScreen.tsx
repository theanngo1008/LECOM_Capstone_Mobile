import type { RefundItem } from "@/api/refund";
import type { OrdersStackParamList } from "@/navigation/types";
import { formatVietnamDateTime, getRelativeTime } from "@/utils/dateUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCustomerRefunds } from "../hooks/useCustomerRefunds";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<OrdersStackParamList>;

// ✅ Filter tabs configuration
const FILTER_TABS: { key: string; label: string; icon: string }[] = [
  { key: "All", label: "Tất cả", icon: "list" },
  { key: "PendingShop", label: "Chờ duyệt", icon: "clock-o" },
  { key: "ShopApproved", label: "Đã duyệt", icon: "check-circle" },
  { key: "PendingAdmin", label: "Chờ admin", icon: "shield" },
  { key: "ShopRejected", label: "Từ chối", icon: "times-circle" },
  { key: "Refunded", label: "Hoàn tiền", icon: "check" },
];

export function CustomerRefundsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { refunds, isLoading, isError, refetch } = useCustomerRefunds();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // ✅ Filter refunds based on selected status
  const filteredRefunds =
    selectedFilter === "All"
      ? refunds
      : refunds.filter((refund) => refund.status === selectedFilter);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return formatVietnamDateTime(dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PendingShop":
        return "bg-orange-100 dark:bg-orange-900/30";
      case "ShopApproved":
        return "bg-green-100 dark:bg-green-900/30";
      case "ShopRejected":
        return "bg-red-100 dark:bg-red-900/30";
      case "PendingAdmin":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "AdminApproved":
        return "bg-green-100 dark:bg-green-900/30";
      case "AdminRejected":
        return "bg-red-100 dark:bg-red-900/30";
      case "Refunded":
        return "bg-emerald-100 dark:bg-emerald-900/30";
      default:
        return "bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "PendingShop":
        return "text-orange-600 dark:text-orange-400";
      case "ShopApproved":
        return "text-green-600 dark:text-green-400";
      case "ShopRejected":
        return "text-red-600 dark:text-red-400";
      case "PendingAdmin":
        return "text-blue-600 dark:text-blue-400";
      case "AdminApproved":
        return "text-green-600 dark:text-green-400";
      case "AdminRejected":
        return "text-red-600 dark:text-red-400";
      case "Refunded":
        return "text-emerald-600 dark:text-emerald-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PendingShop":
        return "Chờ shop duyệt";
      case "ShopApproved":
        return "Shop đã duyệt";
      case "ShopRejected":
        return "Shop từ chối";
      case "PendingAdmin":
        return "Chờ admin duyệt";
      case "AdminApproved":
        return "Admin đã duyệt";
      case "AdminRejected":
        return "Admin từ chối";
      case "Refunded":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  const getReasonTypeText = (reasonType: string) => {
    switch (reasonType) {
      case "ProductIssue":
        return "Vấn đề sản phẩm";
      case "WrongProduct":
        return "Giao sai hàng";
      case "Damaged":
        return "Hàng bị hỏng";
      case "NotAsDescribed":
        return "Không đúng mô tả";
      case "Other":
        return "Khác";
      default:
        return reasonType;
    }
  };

  const getRefundTypeText = (type: string) => {
    switch (type) {
      case "Full":
        return "Hoàn tiền toàn bộ";
      case "Partial":
        return "Hoàn tiền một phần";
      default:
        return type;
    }
  };

  const getFilterCount = (filterKey: string) => {
    if (filterKey === "All") return refunds.length;
    return refunds.filter((refund) => refund.status === filterKey).length;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleImagePress = (images: string[], index: number) => {
    setSelectedImages(images);
    setCurrentImageIndex(index);
    setImageModalVisible(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < selectedImages.length - 1 ? prev + 1 : prev
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNavigateToOrder = (orderId: string) => {
    navigation.navigate("OrderDetail", { orderId });
  };

  const renderImageModal = () => (
    <Modal
      visible={imageModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setImageModalVisible(false)}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center justify-between px-6 py-4">
            <Text className="text-white text-base font-semibold">
              {currentImageIndex + 1} / {selectedImages.length}
            </Text>
            <TouchableOpacity
              onPress={() => setImageModalVisible(false)}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <FontAwesome name="times" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Image */}
        <View className="flex-1 items-center justify-center">
          <Image
            source={{ uri: selectedImages[currentImageIndex] }}
            style={{
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT * 0.7,
            }}
            resizeMode="contain"
          />
        </View>

        {/* Navigation Buttons */}
        {selectedImages.length > 1 && (
          <View className="absolute inset-0 flex-row items-center justify-between px-4 pointer-events-none">
            {currentImageIndex > 0 && (
              <TouchableOpacity
                onPress={handlePrevImage}
                className="w-12 h-12 rounded-full bg-white/20 items-center justify-center pointer-events-auto"
                style={{ marginLeft: 10 }}
              >
                <FontAwesome name="chevron-left" size={24} color="#FFF" />
              </TouchableOpacity>
            )}
            <View className="flex-1" />
            {currentImageIndex < selectedImages.length - 1 && (
              <TouchableOpacity
                onPress={handleNextImage}
                className="w-12 h-12 rounded-full bg-white/20 items-center justify-center pointer-events-auto"
                style={{ marginRight: 10 }}
              >
                <FontAwesome name="chevron-right" size={24} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Thumbnails */}
        {selectedImages.length > 1 && (
          <SafeAreaView edges={["bottom"]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingVertical: 20,
                gap: 12,
              }}
            >
              {selectedImages.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setCurrentImageIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden ${
                    idx === currentImageIndex ? "border-2 border-mint" : "opacity-50"
                  }`}
                >
                  <Image
                    source={{ uri: img }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        )}
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="w-32 h-32 rounded-full bg-beige/30 dark:bg-dark-border/30 items-center justify-center mb-6">
        <FontAwesome name="undo" size={64} color="#D1D5DB" />
      </View>
      <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">
        {selectedFilter === "All" ? "Chưa có yêu cầu hoàn tiền" : "Không có yêu cầu"}
      </Text>
      <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center mb-8">
        {selectedFilter === "All"
          ? "Yêu cầu hoàn tiền của bạn sẽ hiển thị tại đây"
          : `Không có yêu cầu ở trạng thái "${FILTER_TABS.find((t) => t.key === selectedFilter)?.label}"`}
      </Text>
    </View>
  );

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#ACD6B8" />
      <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
        Đang tải danh sách...
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
        Không thể tải danh sách yêu cầu hoàn tiền
      </Text>
      <TouchableOpacity
        className="px-6 py-3 rounded-full bg-mint dark:bg-gold"
        onPress={() => refetch()}
      >
        <Text className="text-white font-semibold">Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRefundCard = (refund: RefundItem) => {
    const isShopApproved = refund.status === "ShopApproved";
    const isPendingAdmin = refund.status === "PendingAdmin";
    const isShopRejected = refund.status === "ShopRejected";
    const isRefunded = refund.status === "Refunded";

    // Parse attachment URLs
    const attachmentUrls = refund.attachmentUrls
      ? refund.attachmentUrls.split(",").map((url) => url.trim())
      : [];

    return (
      <View
        key={refund.id}
        className="bg-white dark:bg-dark-card rounded-2xl mb-4 overflow-hidden shadow-lg"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        {/* Header */}
        <View className="p-4 bg-beige/20 dark:bg-dark-border/20 border-b border-beige/30 dark:border-dark-border/30">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 mr-3">
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-0.5">
                Mã đơn hàng
              </Text>
              <TouchableOpacity
                onPress={() => handleNavigateToOrder(refund.orderId)}
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-bold text-mint dark:text-gold"
                  numberOfLines={1}
                >
                  #{refund.orderCode}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              className={`px-2.5 py-1 rounded-full ${getStatusColor(refund.status)}`}
              style={{ minWidth: 110 }}
            >
              <Text
                className={`text-xs font-bold ${getStatusTextColor(refund.status)} text-center`}
                numberOfLines={1}
              >
                {getStatusText(refund.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Refund Details */}
        <View className="p-4">
          {/* Refund Type Badge */}
          <View className="mb-3">
            <View className="inline-flex self-start px-2.5 py-1 bg-lavender/20 dark:bg-lavender/10 rounded-full border border-lavender/30">
              <Text className="text-xs font-semibold text-lavender">
                {getRefundTypeText(refund.type)}
              </Text>
            </View>
          </View>

          {/* Reason */}
          <View className="mb-3">
            <View className="flex-row items-center mb-1.5">
              <View className="w-6 h-6 bg-lavender/20 dark:bg-lavender/10 rounded-full items-center justify-center mr-2">
                <FontAwesome name="exclamation-circle" size={12} color="#B4A7D6" />
              </View>
              <Text className="text-xs font-semibold text-light-text dark:text-dark-text">
                Lý do: {getReasonTypeText(refund.reasonType)}
              </Text>
            </View>
            <Text
              className="text-sm text-light-textSecondary dark:text-dark-textSecondary ml-8"
              numberOfLines={2}
            >
              {refund.reasonDescription}
            </Text>
          </View>

          {/* Attachment Images - ✅ Clickable */}
          {attachmentUrls.length > 0 && (
            <View className="mb-3">
              <Text className="text-xs font-semibold text-light-text dark:text-dark-text mb-2">
                Hình ảnh đính kèm ({attachmentUrls.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {attachmentUrls.slice(0, 4).map((url, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleImagePress(attachmentUrls, index)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: url }}
                        className="w-20 h-20 rounded-lg"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                  {attachmentUrls.length > 4 && (
                    <TouchableOpacity
                      onPress={() => handleImagePress(attachmentUrls, 4)}
                      className="w-20 h-20 rounded-lg bg-black/60 items-center justify-center"
                    >
                      <Text className="text-lg font-bold text-white">
                        +{attachmentUrls.length - 4}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Refund Amount */}
          <View className="flex-row items-center justify-between bg-beige/30 dark:bg-dark-border/30 rounded-xl p-3 mb-3">
            <View className="flex-row items-center">
              <FontAwesome name="money" size={14} color="#ACD6B8" />
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-2">
                Số tiền hoàn:
              </Text>
            </View>
            <Text className="text-base font-bold text-coral">
              {formatCurrency(refund.refundAmount)}
            </Text>
          </View>

          {/* Shop Response Info */}
          {(isShopApproved || isPendingAdmin || isRefunded) && refund.shopResponseByName && (
            <View className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/30 mb-3">
              <View className="flex-row items-center mb-1">
                <FontAwesome name="check-circle" size={12} color="#10B981" />
                <Text className="text-xs font-semibold text-green-600 dark:text-green-400 ml-1.5">
                  Shop đã duyệt
                </Text>
              </View>
              <Text className="text-xs text-green-600 dark:text-green-400">
                {formatDate(refund.shopRespondedAt || "")}
              </Text>
            </View>
          )}

          {/* Shop Rejection Reason */}
          {isShopRejected && refund.shopRejectReason && (
            <View className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 mb-3">
              <View className="flex-row items-center mb-1">
                <FontAwesome name="times-circle" size={12} color="#EF4444" />
                <Text className="text-xs font-semibold text-red-600 dark:text-red-400 ml-1.5">
                  Lý do shop từ chối
                </Text>
              </View>
              <Text className="text-xs text-red-600 dark:text-red-400 mb-1">
                {refund.shopRejectReason}
              </Text>
              <Text className="text-xs text-red-500 dark:text-red-400">
                {formatDate(refund.shopRespondedAt || "")}
              </Text>
            </View>
          )}

          {/* Admin Process Note */}
          {isRefunded && refund.processNote && (
            <View className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
              <View className="flex-row items-center mb-1">
                <FontAwesome name="shield" size={12} color="#10B981" />
                <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-1.5">
                  Ghi chú hoàn tiền
                </Text>
              </View>
              <Text className="text-xs text-emerald-600 dark:text-emerald-400">
                {refund.processNote}
              </Text>
              {refund.processedAt && (
                <Text className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">
                  {formatDate(refund.processedAt)}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Footer */}
        <View className="px-4 py-3 bg-beige/10 dark:bg-dark-border/10 border-t border-beige/30 dark:border-dark-border/30">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <FontAwesome name="clock-o" size={12} color="#9CA3AF" />
              <Text
                className="text-xs text-light-textSecondary dark:text-dark-textSecondary ml-1.5"
                numberOfLines={1}
              >
                {getRelativeTime(refund.requestedAt)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleNavigateToOrder(refund.orderId)}
              className="px-3 py-1.5 bg-mint/10 dark:bg-gold/10 rounded-lg"
              activeOpacity={0.7}
            >
              <Text className="text-xs font-semibold text-mint dark:text-gold">
                Xem đơn hàng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Calculate statistics
  const pendingShopCount = refunds.filter((r) => r.status === "PendingShop").length;
  const shopApprovedCount = refunds.filter((r) => r.status === "ShopApproved").length;
  const shopRejectedCount = refunds.filter((r) => r.status === "ShopRejected").length;
  const refundedCount = refunds.filter((r) => r.status === "Refunded").length;

  return (
    <SafeAreaView
      className="flex-1 bg-cream dark:bg-dark-background"
      edges={["top"]}
    >
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
          >
            <FontAwesome name="arrow-left" size={18} color="#ACD6B8" />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Yêu cầu hoàn tiền
            </Text>
            {refunds.length > 0 && (
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                {filteredRefunds.length}/{refunds.length} yêu cầu
              </Text>
            )}
          </View>

          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
            onPress={() => refetch()}
          >
            <FontAwesome name="refresh" size={18} color="#ACD6B8" />
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        {refunds.length > 0 && (
          <View className="flex-row gap-2">
            <View className="flex-1 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-2.5 border border-orange-200 dark:border-orange-800/30">
              <Text className="text-xs text-orange-600 dark:text-orange-400 font-semibold mb-0.5">
                Chờ duyệt
              </Text>
              <Text className="text-xs font-bold text-orange-600 dark:text-orange-400">
                {pendingShopCount}
              </Text>
            </View>

            <View className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-2.5 border border-green-200 dark:border-green-800/30">
              <Text className="text-xs text-green-600 dark:text-green-400 font-semibold mb-0.5">
                Đã duyệt
              </Text>
              <Text className="text-xs font-bold text-green-600 dark:text-green-400">
                {shopApprovedCount}
              </Text>
            </View>

            <View className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-xl p-2.5 border border-red-200 dark:border-red-800/30">
              <Text className="text-xs text-red-600 dark:text-red-400 font-semibold mb-0.5">
                Từ chối
              </Text>
              <Text className="text-xs font-bold text-red-600 dark:text-red-400">
                {shopRejectedCount}
              </Text>
            </View>

            <View className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2.5 border border-emerald-200 dark:border-emerald-800/30">
              <Text className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5">
                Hoàn tiền
              </Text>
              <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {refundedCount}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ✅ Filter Tabs */}
      {refunds.length > 0 && (
        <View className="bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6 }}
            style={{ maxHeight: 40 }}
          >
            {FILTER_TABS.map((tab) => {
              const count = getFilterCount(tab.key);
              const isActive = selectedFilter === tab.key;

              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setSelectedFilter(tab.key)}
                  className={`mr-2 px-2.5 py-1 rounded-full flex-row items-center ${
                    isActive
                      ? "bg-mint/20 dark:bg-gold/20 border border-mint dark:border-gold"
                      : "bg-beige/30 dark:bg-dark-border/30"
                  }`}
                  activeOpacity={0.7}
                >
                  <FontAwesome
                    name={tab.icon as any}
                    size={11}
                    color={isActive ? "#ACD6B8" : "#9CA3AF"}
                    style={{ marginRight: 3 }}
                  />
                  <Text
                    className={`text-xs font-semibold ${
                      isActive
                        ? "text-mint dark:text-gold"
                        : "text-light-textSecondary dark:text-dark-textSecondary"
                    }`}
                  >
                    {tab.label}
                  </Text>
                  {count > 0 && (
                    <View
                      className={`ml-1 min-w-[18px] h-[18px] px-1 rounded-full items-center justify-center ${
                        isActive ? "bg-mint dark:bg-gold" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <Text className="text-[10px] font-bold text-white leading-none">
                        {count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        renderLoading()
      ) : isError ? (
        renderError()
      ) : filteredRefunds.length === 0 ? (
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
          {filteredRefunds.map((refund) => renderRefundCard(refund))}
        </ScrollView>
      )}

      {/* ✅ Image Modal */}
      {renderImageModal()}
    </SafeAreaView>
  );
}

