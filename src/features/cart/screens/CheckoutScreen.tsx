import { useAddressStore } from "@/store/address-store";
import { useCartSelectionStore } from "@/store/cart-store";
import { useCheckoutStore } from "@/store/checkout-store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDistricts } from "../../../hooks/useDistricts";
import { useProvinces } from "../../../hooks/useProvinces";
import { useWards } from "../../../hooks/useWards";
import { useCart } from "../hooks/useCart";
import { useCheckout } from "../hooks/useCheckout";
import { useCheckoutPreview } from "../hooks/useCheckoutPreview";
import { useVouchers } from "../hooks/useVouchers";
import { useWalletBalance } from "../hooks/useWalletBalance";

export function CheckoutScreen({ navigation, route }: any) {
  // Get selected products from store instead of route params
  const { selectedProductIds } = useCartSelectionStore();

  const { items, isLoading: cartLoading } = useCart();
  const { checkout, isLoading: isPending } = useCheckout();
  const { previewCheckout, previewData, shippingFee: previewShippingFee, isLoading: isPreviewLoading } = useCheckoutPreview();
  const { data: vouchers, isLoading: voucherLoading } = useVouchers();
  const { data: walletData, isLoading: walletLoading } = useWalletBalance();

  const walletBalance = walletData?.result?.balance ?? 0;

  // Use checkout store for form state
  const {
    shipToName,
    shipToPhone,
    shipToAddress,
    note,
    toProvinceId,
    toProvinceName,
    toDistrictId,
    toDistrictName,
    toWardCode,
    toWardName,
    paymentMethod,
    selectedVoucher,
    hasPreviewed,
    previewData: storePreviewData,
    updateForm,
    setAddress,
    setPreviewData,
    clearPreview,
  } = useCheckoutStore();

  // Local state for form inputs (will sync with store)
  const [localFormData, setLocalFormData] = useState({
    shipToName: shipToName || "",
    shipToPhone: shipToPhone || "",
    shipToAddress: shipToAddress || "",
    note: note || "",
  });

  // Sync local state with store on mount
  useEffect(() => {
    if (shipToName) setLocalFormData(prev => ({ ...prev, shipToName }));
    if (shipToPhone) setLocalFormData(prev => ({ ...prev, shipToPhone }));
    if (shipToAddress) setLocalFormData(prev => ({ ...prev, shipToAddress }));
    if (note) setLocalFormData(prev => ({ ...prev, note }));
  }, [shipToName, shipToPhone, shipToAddress, note]);

  // Reset preview when address or voucher changes
  useEffect(() => {
    if (hasPreviewed) {
      clearPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toProvinceId, toDistrictId, toWardCode, selectedVoucher]);

  const serviceTypeId = 2; // Always 2 - Giao hàng nhanh

  // Modal states
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [voucherModal, setVoucherModal] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);

  // Address hooks
  const { data: provinces, isLoading: isLoadingProvinces } = useProvinces();
  const { data: districts, isLoading: isLoadingDistricts } = useDistricts(toProvinceId || null);
  const { data: wards, isLoading: isLoadingWards } = useWards(toDistrictId || null);

  const filteredItems =
    items
      ?.map((shop) => ({
        ...shop,
        items: shop.items.filter((p: any) =>
          selectedProductIds.includes(p.productId)
        ),
      }))
      .filter((shop) => shop.items.length > 0) || [];

  const subtotalSelected = filteredItems.reduce(
    (total, shop) =>
      total + shop.items.reduce((s, i) => s + i.lineTotal, 0),
    0
  );

  // Use preview shipping fee if available, otherwise show placeholder
  const finalPreviewData = previewData || storePreviewData;
  const shippingFee = hasPreviewed && previewShippingFee ? previewShippingFee : 0;
  const discountApplied = hasPreviewed && finalPreviewData ? finalPreviewData.discountApplied : 0;

  const calculateDiscount = () => {
    // If previewed, use discount from preview
    if (hasPreviewed && discountApplied > 0) {
      return discountApplied;
    }
    
    // Otherwise calculate from voucher
    if (!selectedVoucher || !vouchers) return 0;
    const v = vouchers.find((x) => x.code === selectedVoucher);
    if (!v) return 0;
    if (subtotalSelected < v.minOrderAmount) return 0;

    if (v.discountType === "FixedAmount") return v.discountValue;

    if (v.discountType === "Percentage") {
      const d = (subtotalSelected * v.discountValue) / 100;
      return v.maxDiscountAmount ? Math.min(d, v.maxDiscountAmount) : d;
    }

    return 0;
  };

  const discount = calculateDiscount();
  const totalWithShipping = subtotalSelected - discount + shippingFee;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

  const validateForm = () => {
    if (!localFormData.shipToName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên người nhận");
      return false;
    }
    if (!localFormData.shipToPhone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return false;
    }
    if (!/^[0-9]{10,11}$/.test(localFormData.shipToPhone.trim())) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return false;
    }
    if (!toProvinceId || !toProvinceName) {
      Alert.alert("Lỗi", "Vui lòng chọn tỉnh/thành phố");
      return false;
    }
    if (!toDistrictId || !toDistrictName) {
      Alert.alert("Lỗi", "Vui lòng chọn quận/huyện");
      return false;
    }
    if (!toWardCode || !toWardName) {
      Alert.alert("Lỗi", "Vui lòng chọn phường/xã");
      return false;
    }
    if (!localFormData.shipToAddress.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ cụ thể");
      return false;
    }
    return true;
  };

  const handlePreviewCheckout = () => {
    if (!validateForm()) return;

    // Update store with form data
    updateForm({
      shipToName: localFormData.shipToName.trim(),
      shipToPhone: localFormData.shipToPhone.trim(),
      shipToAddress: localFormData.shipToAddress.trim(),
      note: localFormData.note.trim(),
    });

    previewCheckout(
      {
        shipToName: localFormData.shipToName.trim(),
        shipToPhone: localFormData.shipToPhone.trim(),
        shipToAddress: localFormData.shipToAddress.trim(),
        toProvinceId,
        toProvinceName,
        toDistrictId,
        toDistrictName,
        toWardCode,
        toWardName,
        serviceTypeId,
        voucherCode: selectedVoucher,
        selectedProductIds,
        paymentMethod,
        note: localFormData.note.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          setPreviewData(data?.result);
          Alert.alert("Thành công", "Đã tính toán phí vận chuyển");
        },
        onError: (err: any) => {
          Alert.alert(
            "Lỗi",
            err.response?.data?.errorMessages?.[0] || "Không thể tính phí vận chuyển"
          );
        },
      }
    );
  };

  const handleCheckout = () => {
    if (!validateForm()) return;
    if (!hasPreviewed) {
      Alert.alert("Lỗi", "Vui lòng kiểm tra phí vận chuyển trước");
      return;
    }

    // Update store with form data
    updateForm({
      shipToName: localFormData.shipToName.trim(),
      shipToPhone: localFormData.shipToPhone.trim(),
      shipToAddress: localFormData.shipToAddress.trim(),
      note: localFormData.note.trim(),
    });

    checkout(
      {
        shipToName: localFormData.shipToName.trim(),
        shipToPhone: localFormData.shipToPhone.trim(),
        shipToAddress: localFormData.shipToAddress.trim(),
        toProvinceId,
        toProvinceName,
        toDistrictId,
        toDistrictName,
        toWardCode,
        toWardName,
        serviceTypeId,
        voucherCode: selectedVoucher,
        selectedProductIds,
        paymentMethod,
        note: localFormData.note.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          setCheckoutResult(res.result);
          // Clear form and selection after successful checkout
          updateForm({
            shipToName: "",
            shipToPhone: "",
            shipToAddress: "",
            note: "",
            toProvinceId: 0,
            toProvinceName: "",
            toDistrictId: 0,
            toDistrictName: "",
            toWardCode: "",
            toWardName: "",
            selectedVoucher: null,
          });
          clearPreview();
          // Save address to history
          const { addAddress } = useAddressStore.getState();
          addAddress({
            provinceId: toProvinceId,
            provinceName: toProvinceName,
            districtId: toDistrictId,
            districtName: toDistrictName,
            wardCode: toWardCode,
            wardName: toWardName,
            detailAddress: localFormData.shipToAddress.trim(),
          });
        },
        onError: (err: any) =>
          Alert.alert(
            "Lỗi",
            err.response?.data?.errorMessages?.[0] || "Không thể xử lý"
          ),
      }
    );
  };

  const handlePayment = async () => {
    if (paymentMethod === "wallet") {
      Alert.alert("Thanh toán thành công", "Thanh toán bằng Ví LECOM.", [
        { text: "OK", onPress: () => navigation.navigate("OrdersMain") },
      ]);
      return;
    }

    if (!checkoutResult?.paymentUrl) {
      Alert.alert("Lỗi", "Không tìm thấy link thanh toán");
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(checkoutResult.paymentUrl);
      if (canOpen) await Linking.openURL(checkoutResult.paymentUrl);
      else Alert.alert("Không mở được trang thanh toán");
    } catch {
      Alert.alert("Lỗi khi mở trang thanh toán");
    }
  };

  if (cartLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color="#ACD6B8" />
        <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
          Đang tải...
        </Text>
      </SafeAreaView>
    );
  }

  if (checkoutResult) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-b-2 border-beige/50 dark:border-dark-border/50">
          <TouchableOpacity
            onPress={() => setCheckoutResult(null)}
            className="w-12 h-12 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
          >
            <FontAwesome name="arrow-left" size={20} color="#ACD6B8" />
          </TouchableOpacity>
          <Text className="flex-1 text-xl font-bold text-center text-light-text dark:text-dark-text">
            Chi tiết đơn hàng
          </Text>
          <View className="w-12" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Banner */}
          <View className="bg-mint/10 dark:bg-gold/10 p-5 rounded-2xl border-2 border-mint/30 dark:border-gold/30 mb-6">
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-mint dark:bg-gold rounded-full items-center justify-center mr-4">
                <FontAwesome name="check" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-mint dark:text-gold mb-1">
                  Đặt hàng thành công!
                </Text>
                <Text className="text-light-textSecondary dark:text-dark-textSecondary">
                  {checkoutResult.orders.length} đơn hàng đã được tạo
                </Text>
              </View>
            </View>
          </View>

          {/* Orders List */}
          {checkoutResult.orders.map((order: any) => (
            <View
              key={order.id}
              className="bg-white dark:bg-dark-card rounded-2xl border-2 border-beige/50 dark:border-dark-border/50 mb-6 overflow-hidden shadow-lg"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              {/* Order Header */}
              <View className="p-5 bg-beige/30 dark:bg-dark-border/30 border-b-2 border-beige/50 dark:border-dark-border/50">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <FontAwesome name="shopping-cart" size={16} color="#ACD6B8" />
                    <Text className="text-base font-bold text-light-text dark:text-dark-text ml-2 flex-1" numberOfLines={1}>
                      {order.shopName}
                    </Text>
                  </View>
                  <View className="bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-full">
                    <Text className="text-orange-600 dark:text-orange-400 text-xs font-bold">
                      {order.status}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  Mã đơn: {order.orderCode}
                </Text>
              </View>

              {/* Order Items */}
              <View className="p-5">
                {order.details.map((item: any, i: number) => (
                  <View
                    key={i}
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
                      <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-2" numberOfLines={2}>
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
              </View>

              {/* Order Summary */}
              <View className="p-5 bg-beige/20 dark:bg-dark-border/20 border-t-2 border-beige/50 dark:border-dark-border/50">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                    Tạm tính
                  </Text>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                    {formatPrice(order.subtotal)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                    Phí vận chuyển
                  </Text>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                    {formatPrice(order.shippingFee)}
                  </Text>
                </View>
                {order.discount > 0 && (
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      Giảm giá
                    </Text>
                    <Text className="text-sm font-semibold text-coral">
                      -{formatPrice(order.discount)}
                    </Text>
                  </View>
                )}
                <View className="h-px bg-beige/50 dark:bg-dark-border/50 my-3" />
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-bold text-light-text dark:text-dark-text">
                    Tổng cộng
                  </Text>
                  <Text className="text-xl font-bold text-mint dark:text-gold">
                    {formatPrice(order.subtotal + order.shippingFee - order.discount)}
                  </Text>
                </View>
              </View>

              {/* Shipping Info */}
              <View className="p-5 border-t-2 border-beige/50 dark:border-dark-border/50 bg-beige/10 dark:bg-dark-border/10">
                <Text className="text-base font-bold text-light-text dark:text-dark-text mb-3">
                  Thông tin nhận hàng
                </Text>
                <View className="space-y-2">
                  <View className="flex-row items-center mb-2">
                    <FontAwesome name="user" size={14} color="#9CA3AF" />
                    <Text className="text-sm text-light-text dark:text-dark-text ml-3">
                      {order.shipToName}
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <FontAwesome name="phone" size={14} color="#9CA3AF" />
                    <Text className="text-sm text-light-text dark:text-dark-text ml-3">
                      {order.shipToPhone}
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <FontAwesome name="map-marker" size={14} color="#9CA3AF" />
                    <Text className="text-sm text-light-text dark:text-dark-text ml-3 flex-1">
                      {order.shipToAddress}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* Payment Summary */}
          <View className="bg-white dark:bg-dark-card rounded-2xl p-5 border-2 border-beige/50 dark:border-dark-border/50 shadow-lg"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
              Thông tin thanh toán
            </Text>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                Phương thức
              </Text>
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                {checkoutResult.paymentMethod === "wallet" ? "Ví LECOM" : "PayOS"}
              </Text>
            </View>
            {checkoutResult.walletAmountUsed > 0 && (
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  Số tiền ví dùng
                </Text>
                <Text className="text-sm font-semibold text-coral">
                  -{formatPrice(checkoutResult.walletAmountUsed)}
                </Text>
              </View>
            )}
            <View className="h-px bg-beige/50 dark:bg-dark-border/50 my-3" />
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-bold text-light-text dark:text-dark-text">
                Tổng thanh toán
              </Text>
              <Text className="text-2xl font-bold text-mint dark:text-gold">
                {formatPrice(checkoutResult.totalAmount)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View className="absolute left-0 right-0 bottom-0 p-5 bg-white dark:bg-dark-card border-t-2 border-beige/50 dark:border-dark-border/50">
          <TouchableOpacity
            onPress={handlePayment}
            className="bg-mint dark:bg-gold rounded-full py-4 items-center mb-3 shadow-lg"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text className="text-white dark:text-dark-text text-base font-bold">
              {paymentMethod === "wallet" ? "Hoàn tất" : "Thanh toán ngay"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("OrdersMain")}>
            <Text className="text-mint dark:text-gold text-center font-bold">
              Đã thanh toán? Xem đơn hàng của tôi
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text className="text-xl font-bold flex-1 text-center text-light-text dark:text-dark-text">
          Thanh toán
        </Text>
        <View className="w-12" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <View className="bg-white dark:bg-dark-card p-5 rounded-2xl border-2 border-beige/50 dark:border-dark-border/50 mb-6 shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            Tóm tắt đơn hàng
          </Text>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Số lượng sản phẩm
            </Text>
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
              {filteredItems.reduce((t, s) => t + s.items.length, 0)} sản phẩm
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Tạm tính
            </Text>
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
              {formatPrice(subtotalSelected)}
            </Text>
          </View>

          {(discount > 0 || (hasPreviewed && discountApplied > 0)) && (
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                Phiếu giảm giá
              </Text>
              <Text className="text-sm font-semibold text-coral">
                -{formatPrice(discount || discountApplied)}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Phí vận chuyển
            </Text>
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
              {hasPreviewed && shippingFee > 0 ? formatPrice(shippingFee) : "---"}
            </Text>
          </View>

          <View className="h-px bg-beige/50 dark:bg-dark-border/50 my-3" />

          <View className="flex-row justify-between items-center">
            <Text className="text-base font-bold text-light-text dark:text-dark-text">
              Tổng cộng
            </Text>
            <Text className="text-xl font-bold text-mint dark:text-gold">
              {formatPrice(totalWithShipping)}
            </Text>
          </View>
        </View>

        {/* Voucher Section */}
        <View className="bg-white dark:bg-dark-card p-5 rounded-2xl border-2 border-beige/50 dark:border-dark-border/50 mb-6 shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            Mã giảm giá
          </Text>

          <TouchableOpacity
            onPress={() => setVoucherModal(true)}
            className="border-2 border-beige/50 dark:border-dark-border/50 p-4 rounded-xl flex-row items-center justify-between bg-beige/10 dark:bg-dark-border/10"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <FontAwesome name="ticket" size={18} color="#ACD6B8" />
              <Text className="ml-3 text-sm font-semibold text-light-text dark:text-dark-text flex-1" numberOfLines={1}>
                {selectedVoucher ? `Voucher: ${selectedVoucher}` : "Chọn mã giảm giá"}
              </Text>
            </View>
            <FontAwesome name="angle-right" size={20} color="#ACD6B8" />
          </TouchableOpacity>

          {selectedVoucher && (
            <TouchableOpacity
              onPress={() => updateForm({ selectedVoucher: null })}
              className="mt-3 py-2 px-4 rounded-full bg-red-100 dark:bg-red-900/30 self-start"
            >
              <Text className="text-red-600 dark:text-red-400 text-xs font-semibold">
                Bỏ chọn voucher
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Shipping Info Form */}
        <View className="bg-white dark:bg-dark-card rounded-2xl p-5 border-2 border-beige/50 dark:border-dark-border/50 mb-6 shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            Thông tin nhận hàng
          </Text>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Tên người nhận <Text className="text-coral">*</Text>
            </Text>
            <TextInput
              value={localFormData.shipToName}
              onChangeText={(t) => setLocalFormData({ ...localFormData, shipToName: t })}
              placeholder="Nhập tên người nhận"
              placeholderTextColor="#9CA3AF"
              className="bg-beige/30 dark:bg-dark-border/30 px-4 py-3 rounded-xl text-light-text dark:text-dark-text border border-beige/50 dark:border-dark-border/50"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Số điện thoại <Text className="text-coral">*</Text>
            </Text>
            <TextInput
              keyboardType="phone-pad"
              value={localFormData.shipToPhone}
              onChangeText={(t) => setLocalFormData({ ...localFormData, shipToPhone: t })}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#9CA3AF"
              className="bg-beige/30 dark:bg-dark-border/30 px-4 py-3 rounded-xl text-light-text dark:text-dark-text border border-beige/50 dark:border-dark-border/50"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Tỉnh / Thành phố <Text className="text-coral">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowProvinceModal(true)}
              className="bg-beige/30 dark:bg-dark-border/30 px-4 py-3 rounded-xl border border-beige/50 dark:border-dark-border/50 flex-row items-center justify-between"
            >
              <Text className={toProvinceName ? "text-light-text dark:text-dark-text" : "text-gray-400"}>
                {toProvinceName || "Chọn tỉnh / thành phố..."}
              </Text>
              <FontAwesome name="chevron-down" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Quận / Huyện <Text className="text-coral">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowDistrictModal(true)}
              disabled={!toProvinceId}
              className={`bg-beige/30 dark:bg-dark-border/30 px-4 py-3 rounded-xl border border-beige/50 dark:border-dark-border/50 flex-row items-center justify-between ${
                !toProvinceId ? "opacity-50" : ""
              }`}
            >
              <Text className={toDistrictName ? "text-light-text dark:text-dark-text" : "text-gray-400"}>
                {toDistrictName || (toProvinceId ? "Chọn quận / huyện..." : "Chọn tỉnh trước")}
              </Text>
              <FontAwesome name="chevron-down" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Phường / Xã <Text className="text-coral">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowWardModal(true)}
              disabled={!toDistrictId}
              className={`bg-beige/30 dark:bg-dark-border/30 px-4 py-3 rounded-xl border border-beige/50 dark:border-dark-border/50 flex-row items-center justify-between ${
                !toDistrictId ? "opacity-50" : ""
              }`}
            >
              <Text className={toWardName ? "text-light-text dark:text-dark-text" : "text-gray-400"}>
                {toWardName || (toDistrictId ? "Chọn phường / xã..." : "Chọn quận trước")}
              </Text>
              <FontAwesome name="chevron-down" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Địa chỉ cụ thể <Text className="text-coral">*</Text>
            </Text>
            <TextInput
              multiline
              numberOfLines={3}
              value={localFormData.shipToAddress}
              onChangeText={(t) => setLocalFormData({ ...localFormData, shipToAddress: t })}
              placeholder="Nhập địa chỉ nhận hàng cụ thể"
              placeholderTextColor="#9CA3AF"
              className="bg-beige/30 dark:bg-dark-border/30 px-4 py-3 rounded-xl text-light-text dark:text-dark-text border border-beige/50 dark:border-dark-border/50"
              textAlignVertical="top"
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
              Ghi chú
            </Text>
            <TextInput
              multiline
              numberOfLines={2}
              value={localFormData.note}
              onChangeText={(t) => setLocalFormData({ ...localFormData, note: t })}
              placeholder="Thêm ghi chú (không bắt buộc)"
              placeholderTextColor="#9CA3AF"
              className="bg-beige/30 dark:bg-dark-border/30 px-4 py-3 rounded-xl text-light-text dark:text-dark-text border border-beige/50 dark:border-dark-border/50"
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Shipping Method */}
        <View className="bg-white dark:bg-dark-card rounded-2xl p-5 border-2 border-beige/50 dark:border-dark-border/50 mb-6 shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            Phương thức vận chuyển
          </Text>

          <View className="bg-beige/30 dark:bg-dark-border/30 px-4 py-3 rounded-xl border border-beige/50 dark:border-dark-border/50 flex-row items-center justify-between">
            <Text className="text-light-text dark:text-dark-text">
              Giao hàng nhanh
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View className="bg-white dark:bg-dark-card p-5 rounded-2xl border-2 border-beige/50 dark:border-dark-border/50 mb-6 shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            Phương thức thanh toán
          </Text>

          <TouchableOpacity
            onPress={() => updateForm({ paymentMethod: "payos" })}
            className={`p-4 rounded-xl border-2 mb-3 ${
              paymentMethod === "payos"
                ? "border-mint dark:border-gold bg-mint/10 dark:bg-gold/10"
                : "border-beige/50 dark:border-dark-border/50 bg-beige/10 dark:bg-dark-border/10"
            }`}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                paymentMethod === "payos" ? "bg-mint dark:bg-gold" : "bg-beige/30 dark:bg-dark-border/30"
              }`}>
                <FontAwesome
                  name="credit-card"
                  size={18}
                  color={paymentMethod === "payos" ? "#fff" : "#9CA3AF"}
                />
              </View>
              <Text className={`font-bold ${
                paymentMethod === "payos"
                  ? "text-mint dark:text-gold"
                  : "text-light-textSecondary dark:text-dark-textSecondary"
              }`}>
                Thanh toán qua PayOS
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => updateForm({ paymentMethod: "wallet" })}
            className={`p-4 rounded-xl border-2 ${
              paymentMethod === "wallet"
                ? "border-mint dark:border-gold bg-mint/10 dark:bg-gold/10"
                : "border-beige/50 dark:border-dark-border/50 bg-beige/10 dark:bg-dark-border/10"
            }`}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  paymentMethod === "wallet" ? "bg-mint dark:bg-gold" : "bg-beige/30 dark:bg-dark-border/30"
                }`}>
                  <FontAwesome
                    name="money"
                    size={18}
                    color={paymentMethod === "wallet" ? "#fff" : "#9CA3AF"}
                  />
                </View>
                <Text className={`font-bold ${
                  paymentMethod === "wallet"
                    ? "text-mint dark:text-gold"
                    : "text-light-textSecondary dark:text-dark-textSecondary"
                }`}>
                  Ví LECOM
                </Text>
              </View>

              <View>
                {walletLoading ? (
                  <ActivityIndicator size="small" color="#ACD6B8" />
                ) : (
                  <Text className="text-sm font-bold text-mint dark:text-gold">
                    {formatPrice(walletBalance)}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Checkout Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-card p-5 border-t-2 border-beige/50 dark:border-dark-border/50 shadow-lg"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        {/* Subtotal */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
            Tạm tính
          </Text>
          <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
            {formatPrice(subtotalSelected)}
          </Text>
        </View>

        {/* Shipping Fee - Show when previewed */}
        {hasPreviewed && shippingFee > 0 && (
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Phí vận chuyển
            </Text>
            <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
              {formatPrice(shippingFee)}
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
            Tổng thanh toán
          </Text>
          <Text className="text-2xl font-bold text-mint dark:text-gold">
            {formatPrice(totalWithShipping)}
          </Text>
        </View>

        {!hasPreviewed ? (
          <TouchableOpacity
            onPress={handlePreviewCheckout}
            disabled={isPreviewLoading}
            className="bg-skyBlue dark:bg-lavender rounded-full py-4 items-center shadow-lg"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
            activeOpacity={0.8}
          >
            {isPreviewLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white dark:text-dark-text text-base font-bold">
                Kiểm tra phí vận chuyển
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleCheckout}
            disabled={isPending}
            className="bg-mint dark:bg-gold rounded-full py-4 items-center shadow-lg"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
            activeOpacity={0.8}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white dark:text-dark-text text-base font-bold">
                Xác nhận thanh toán
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Voucher Modal */}
      <Modal
        visible={voucherModal}
        transparent
        animationType="slide"
        onRequestClose={() => setVoucherModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setVoucherModal(false)}
          className="flex-1 bg-black/50"
        />

        <View className="bg-white dark:bg-dark-card p-6 rounded-t-3xl absolute bottom-0 left-0 right-0 max-h-[70%] border-t-2 border-beige/50 dark:border-dark-border/50">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Chọn mã giảm giá
            </Text>
            <TouchableOpacity
              onPress={() => setVoucherModal(false)}
              className="w-8 h-8 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
            >
              <FontAwesome name="times" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {voucherLoading && (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#ACD6B8" />
                <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-3">
                  Đang tải voucher...
                </Text>
              </View>
            )}

            {!voucherLoading &&
              vouchers?.map((v) => {
                const eligible = subtotalSelected >= v.minOrderAmount && !v.isUsed;

                return (
                  <TouchableOpacity
                    key={v.code}
                    disabled={!eligible}
                    onPress={() => {
                      updateForm({ selectedVoucher: v.code });
                      clearPreview(); // Reset preview when voucher changes
                      setVoucherModal(false);
                    }}
                    className={`p-4 border-2 rounded-xl mb-3 ${
                      selectedVoucher === v.code
                        ? "border-mint dark:border-gold bg-mint/10 dark:bg-gold/10"
                        : "border-beige/50 dark:border-dark-border/50 bg-beige/10 dark:bg-dark-border/10"
                    } ${!eligible ? "opacity-40" : ""}`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center mb-2">
                      <View className="bg-mint/20 dark:bg-gold/20 px-3 py-1 rounded-full mr-2">
                        <Text className="text-mint dark:text-gold font-bold text-xs">
                          {v.code}
                        </Text>
                      </View>
                      {v.isUsed && (
                        <View className="bg-gray-500 dark:bg-gray-600 px-2 py-1 rounded-full">
                          <Text className="text-white text-xs font-semibold">
                            Đã sử dụng
                          </Text>
                        </View>
                      )}
                      {!v.isUsed && !eligible && (
                        <View className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                          <Text className="text-red-600 dark:text-red-400 text-xs font-semibold">
                            Không đủ điều kiện
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
                      Giảm:{" "}
                      {v.discountType === "FixedAmount"
                        ? formatPrice(v.discountValue)
                        : `${v.discountValue}%`}
                    </Text>
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                      Đơn tối thiểu: {formatPrice(v.minOrderAmount)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>

          <TouchableOpacity
            onPress={() => setVoucherModal(false)}
            className="mt-4 py-4 rounded-full bg-beige/50 dark:bg-dark-border/50"
            activeOpacity={0.7}
          >
            <Text className="text-center font-bold text-light-text dark:text-dark-text">
              Đóng
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Province Modal */}
      <Modal
        visible={showProvinceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProvinceModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-md max-h-[80%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-beige/50 dark:border-dark-border/50">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Chọn tỉnh/thành phố
              </Text>
              <TouchableOpacity
                onPress={() => setShowProvinceModal(false)}
                className="w-8 h-8 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
              >
                <FontAwesome name="times" size={16} color="#4A5568" />
              </TouchableOpacity>
            </View>

            {isLoadingProvinces ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#ACD6B8" />
                <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
                  Đang tải...
                </Text>
              </View>
            ) : (
              <FlatList
                data={provinces || []}
                keyExtractor={(item) => item.ProvinceID.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="px-6 py-4 border-b border-beige/30 dark:border-dark-border/30 active:bg-beige/20 dark:active:bg-dark-border/20"
                    onPress={() => {
                      setAddress({
                        provinceId: item.ProvinceID,
                        provinceName: item.ProvinceName,
                        districtId: 0,
                        districtName: "",
                        wardCode: "",
                        wardName: "",
                      });
                      clearPreview(); // Reset preview when address changes
                      setShowProvinceModal(false);
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-semibold text-light-text dark:text-dark-text">
                        {item.ProvinceName}
                      </Text>
                      {toProvinceId === item.ProvinceID && (
                        <FontAwesome name="check-circle" size={20} color="#ACD6B8" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View className="py-12 items-center">
                    <FontAwesome name="inbox" size={48} color="#D1D5DB" />
                    <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
                      Không có dữ liệu
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* District Modal */}
      <Modal
        visible={showDistrictModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-md max-h-[80%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-beige/50 dark:border-dark-border/50">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Chọn quận/huyện
              </Text>
              <TouchableOpacity
                onPress={() => setShowDistrictModal(false)}
                className="w-8 h-8 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
              >
                <FontAwesome name="times" size={16} color="#4A5568" />
              </TouchableOpacity>
            </View>

            {isLoadingDistricts ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#ACD6B8" />
                <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
                  Đang tải...
                </Text>
              </View>
            ) : (
              <FlatList
                data={districts || []}
                keyExtractor={(item) => item.DistrictID.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="px-6 py-4 border-b border-beige/30 dark:border-dark-border/30 active:bg-beige/20 dark:active:bg-dark-border/20"
                    onPress={() => {
                      setAddress({
                        provinceId: toProvinceId,
                        provinceName: toProvinceName,
                        districtId: item.DistrictID,
                        districtName: item.DistrictName,
                        wardCode: "",
                        wardName: "",
                      });
                      clearPreview(); // Reset preview when address changes
                      setShowDistrictModal(false);
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-semibold text-light-text dark:text-dark-text">
                        {item.DistrictName}
                      </Text>
                      {toDistrictId === item.DistrictID && (
                        <FontAwesome name="check-circle" size={20} color="#ACD6B8" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View className="py-12 items-center">
                    <FontAwesome name="inbox" size={48} color="#D1D5DB" />
                    <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
                      {toProvinceId ? "Không có dữ liệu" : "Vui lòng chọn tỉnh trước"}
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Ward Modal */}
      <Modal
        visible={showWardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWardModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-md max-h-[80%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-beige/50 dark:border-dark-border/50">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Chọn phường/xã
              </Text>
              <TouchableOpacity
                onPress={() => setShowWardModal(false)}
                className="w-8 h-8 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
              >
                <FontAwesome name="times" size={16} color="#4A5568" />
              </TouchableOpacity>
            </View>

            {isLoadingWards ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#ACD6B8" />
                <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
                  Đang tải...
                </Text>
              </View>
            ) : (
              <FlatList
                data={wards || []}
                keyExtractor={(item) => item.WardCode}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="px-6 py-4 border-b border-beige/30 dark:border-dark-border/30 active:bg-beige/20 dark:active:bg-dark-border/20"
                    onPress={() => {
                      setAddress({
                        provinceId: toProvinceId,
                        provinceName: toProvinceName,
                        districtId: toDistrictId,
                        districtName: toDistrictName,
                        wardCode: item.WardCode,
                        wardName: item.WardName,
                      });
                      clearPreview(); // Reset preview when address changes
                      setShowWardModal(false);
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-semibold text-light-text dark:text-dark-text">
                        {item.WardName}
                      </Text>
                      {toWardCode === item.WardCode && (
                        <FontAwesome name="check-circle" size={20} color="#ACD6B8" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View className="py-12 items-center">
                    <FontAwesome name="inbox" size={48} color="#D1D5DB" />
                    <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
                      {toDistrictId ? "Không có dữ liệu" : "Vui lòng chọn quận trước"}
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}