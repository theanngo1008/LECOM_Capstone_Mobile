import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useCart } from "../hooks/useCart";
import { useCheckout } from "../hooks/useCheckout";
import { useVouchers } from "../hooks/useVouchers";
import { useWalletBalance } from "../hooks/useWalletBalance";

export function CheckoutScreen({ navigation, route }: any) {
  const { selectedProductIds } = route.params;

  const { items, isLoading: cartLoading } = useCart();
  const { checkout, isLoading: isPending } = useCheckout();
  const { data: vouchers, isLoading: voucherLoading } = useVouchers();
  const { data: walletData, isLoading: walletLoading } = useWalletBalance();

  const walletBalance = walletData?.result?.balance ?? 0;
  const SHIPPING_FEE = 30000;

  const [formData, setFormData] = useState({
    shipToName: "",
    shipToPhone: "",
    shipToAddress: "",
    note: "",
  });

  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [voucherModal, setVoucherModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"payos" | "wallet">("payos");
  const [checkoutResult, setCheckoutResult] = useState<any>(null);

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

  const shippingFee = filteredItems.length * SHIPPING_FEE;

  const calculateDiscount = () => {
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
    if (!formData.shipToName.trim()) return Alert.alert("Thiếu tên"), false;
    if (!formData.shipToPhone.trim()) return Alert.alert("Thiếu số điện thoại"), false;
    if (!/^[0-9]{10,11}$/.test(formData.shipToPhone.trim()))
      return Alert.alert("Số điện thoại không hợp lệ"), false;
    if (!formData.shipToAddress.trim()) return Alert.alert("Thiếu địa chỉ"), false;
    return true;
  };

  const handleCheckout = () => {
    if (!validateForm()) return;

    checkout(
      {
        ...formData,
        voucherCode: selectedVoucher,
        selectedProductIds,
        paymentMethod,
      },
      {
        onSuccess: (res) => setCheckoutResult(res.result),
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
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (checkoutResult) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b">
          <TouchableOpacity
            onPress={() => setCheckoutResult(null)}
            className="w-10 h-10 rounded-full bg-beige/50 items-center justify-center"
          >
            <FontAwesome name="arrow-left" size={18} color="#5AC38D" />
          </TouchableOpacity>
          <Text className="flex-1 text-xl font-bold text-center">Chi tiết đơn hàng</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
        >
          <View className="bg-mint/10 p-4 rounded-2xl border mb-6 flex-row">
            <View className="w-12 h-12 bg-mint rounded-full items-center justify-center mr-4">
              <FontAwesome name="check" size={22} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-mint">Tạo đơn thành công!</Text>
              <Text>{checkoutResult.orders.length} đơn hàng đã được tạo</Text>
            </View>
          </View>

          {checkoutResult.orders.map((order: any) => (
            <View key={order.id} className="bg-white rounded-2xl border mb-4">
              <View className="p-4 bg-beige/30 border-b">
                <View className="flex-row justify-between">
                  <Text className="font-semibold">{order.shopName}</Text>
                  <View className="bg-orange-100 px-3 py-1 rounded-full">
                    <Text className="text-orange-600 text-xs">{order.status}</Text>
                  </View>
                </View>
                <Text className="text-xs">Mã đơn: {order.orderCode}</Text>
              </View>

              <View className="p-4">
                {order.details.map((item: any, i: number) => (
                  <View
                    key={i}
                    className="flex-row items-center pb-3 mb-3 border-b last:border-b-0"
                  >
                    {item.productImage ? (
                      <Image
                        source={{ uri: item.productImage }}
                        className="w-16 h-16 rounded-lg mr-3"
                      />
                    ) : (
                      <View className="w-16 h-16 bg-gray-200 rounded-lg mr-3" />
                    )}

                    <View className="flex-1">
                      <Text className="font-semibold">{item.productName}</Text>
                      <Text className="text-xs">
                        {formatPrice(item.unitPrice)} × {item.quantity}
                      </Text>
                    </View>

                    <Text className="font-semibold text-mint">
                      {formatPrice(item.lineTotal)}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="p-4 bg-beige/20 border-t">
                <View className="flex-row justify-between mb-1">
                  <Text>Tạm tính</Text>
                  <Text>{formatPrice(order.subtotal)}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text>Phí vận chuyển</Text>
                  <Text>{formatPrice(order.shippingFee)}</Text>
                </View>
                {order.discount > 0 && (
                  <View className="flex-row justify-between">
                    <Text>Giảm giá</Text>
                    <Text className="text-coral">-{formatPrice(order.discount)}</Text>
                  </View>
                )}
              </View>

              <View className="p-4 border-t">
                <Text className="font-bold mb-1">Thông tin nhận hàng</Text>
                <Text>👤 {order.shipToName}</Text>
                <Text>📞 {order.shipToPhone}</Text>
                <Text>📍 {order.shipToAddress}</Text>
              </View>
            </View>
          ))}

          <View className="bg-white rounded-2xl p-4 border">
            <Text className="text-lg font-bold mb-3">Thanh toán</Text>
            <View className="flex-row justify-between mb-2">
              <Text>Phương thức</Text>
              <Text>{checkoutResult.paymentMethod}</Text>
            </View>
            {checkoutResult.walletAmountUsed > 0 && (
              <View className="flex-row justify-between mb-2">
                <Text>Số tiền ví dùng</Text>
                <Text className="text-coral">
                  -{formatPrice(checkoutResult.walletAmountUsed)}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between">
              <Text className="font-bold">Tổng thanh toán</Text>
              <Text className="text-xl font-bold text-mint">
                {formatPrice(checkoutResult.totalAmount)}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View className="absolute left-0 right-0 bottom-0 p-4 bg-white border-t">
          <TouchableOpacity
            onPress={handlePayment}
            className="bg-mint rounded-full py-4 items-center mb-3"
          >
            <Text className="text-white font-bold">
              {paymentMethod === "wallet" ? "Hoàn tất" : "Thanh toán ngay"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
            <Text className="text-mint text-center font-semibold">
              Xem đơn hàng của tôi
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-beige/50 rounded-full items-center justify-center"
        >
          <FontAwesome name="arrow-left" size={18} color="#5AC38D" />
        </TouchableOpacity>
        <Text className="text-xl font-bold flex-1 text-center">Thanh toán</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
      >
        <View className="bg-white p-4 rounded-2xl border mb-5">
          <Text className="text-lg font-bold mb-3">Tóm tắt đơn hàng</Text>

          <View className="flex-row justify-between mb-2">
            <Text>Số lượng sản phẩm</Text>
            <Text>
              {filteredItems.reduce((t, s) => t + s.items.length, 0)} sản phẩm
            </Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text>Tạm tính</Text>
            <Text>{formatPrice(subtotalSelected)}</Text>
          </View>

          {discount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text>Giảm giá (voucher)</Text>
              <Text className="text-coral">-{formatPrice(discount)}</Text>
            </View>
          )}

          <View className="flex-row justify-between mb-2">
            <Text>Phí vận chuyển</Text>
            <Text>{formatPrice(shippingFee)}</Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="font-bold">Tổng cộng</Text>
            <Text className="text-lg font-bold text-mint">
              {formatPrice(totalWithShipping)}
            </Text>
          </View>
        </View>

        <View className="bg-white p-4 rounded-2xl border mb-5">
          <Text className="text-lg font-bold mb-3">Mã giảm giá</Text>

          <TouchableOpacity
            onPress={() => setVoucherModal(true)}
            className="border border-beige/50 p-4 rounded-xl flex-row justify-between"
          >
            <Text>
              {selectedVoucher ? `Voucher: ${selectedVoucher}` : "Chọn voucher"}
            </Text>
            <FontAwesome name="angle-right" size={20} />
          </TouchableOpacity>

          {selectedVoucher && (
            <TouchableOpacity onPress={() => setSelectedVoucher(null)} className="mt-3">
              <Text className="text-red-500">Bỏ chọn</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="bg-white rounded-2xl p-4 border mb-5">
          <Text className="text-lg font-bold mb-4">Thông tin nhận hàng</Text>

          <View className="mb-4">
            <Text>Tên người nhận *</Text>
            <TextInput
              value={formData.shipToName}
              onChangeText={(t) => setFormData({ ...formData, shipToName: t })}
              className="bg-beige/30 px-4 py-3 rounded-xl"
            />
          </View>

          <View className="mb-4">
            <Text>Số điện thoại *</Text>
            <TextInput
              keyboardType="phone-pad"
              value={formData.shipToPhone}
              onChangeText={(t) => setFormData({ ...formData, shipToPhone: t })}
              className="bg-beige/30 px-4 py-3 rounded-xl"
            />
          </View>

          <View className="mb-4">
            <Text>Địa chỉ *</Text>
            <TextInput
              multiline
              numberOfLines={2}
              value={formData.shipToAddress}
              onChangeText={(t) =>
                setFormData({ ...formData, shipToAddress: t })
              }
              className="bg-beige/30 px-4 py-3 rounded-xl"
            />
          </View>

          <View>
            <Text>Ghi chú</Text>
            <TextInput
              multiline
              numberOfLines={2}
              value={formData.note}
              onChangeText={(t) => setFormData({ ...formData, note: t })}
              className="bg-beige/30 px-4 py-3 rounded-xl"
            />
          </View>
        </View>

        <View className="bg-white p-4 rounded-2xl border mb-10">
          <Text className="text-lg font-bold mb-4">Phương thức thanh toán</Text>

          <TouchableOpacity
            onPress={() => setPaymentMethod("payos")}
            className={`p-4 rounded-xl border mb-3 ${
              paymentMethod === "payos"
                ? "border-mint bg-mint/10"
                : "border-beige/30"
            }`}
          >
            <View className="flex-row items-center">
              <FontAwesome
                name="credit-card"
                size={20}
                color={paymentMethod === "payos" ? "#5AC38D" : "#999"}
              />
              <Text className="ml-3 font-semibold">Thanh toán PayOS</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPaymentMethod("wallet")}
            className={`p-4 rounded-xl border ${
              paymentMethod === "wallet"
                ? "border-mint bg-mint/10"
                : "border-beige/30"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <FontAwesome
                  name="money"
                  size={20}
                  color={paymentMethod === "wallet" ? "#5AC38D" : "#999"}
                />
                <Text className="ml-3 font-semibold">Ví LECOM</Text>
              </View>

              <View>
                {walletLoading ? (
                  <Text className="text-xs text-gray-400">Đang tải...</Text>
                ) : (
                  <Text className="text-xs font-semibold text-red">
                    {formatPrice(walletBalance)}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white p-5 border-t">
        <View className="flex-row justify-between mb-3">
          <Text>Tổng thanh toán</Text>
          <Text className="text-2xl font-bold text-mint">
            {formatPrice(totalWithShipping)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleCheckout}
          disabled={isPending}
          className="bg-mint rounded-full py-4 items-center"
        >
          {isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">Đặt hàng</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={voucherModal}
        transparent
        animationType="slide"
        onRequestClose={() => setVoucherModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setVoucherModal(false)}
          className="flex-1 bg-black/40"
        />

        <View className="bg-white p-6 rounded-t-3xl absolute bottom-0 left-0 right-0 max-h-[70%]">
          <Text className="text-lg font-bold mb-4">Chọn mã giảm giá</Text>

          <ScrollView>
            {voucherLoading && <Text>Đang tải...</Text>}

            {!voucherLoading &&
              vouchers?.map((v) => {
                const eligible = subtotalSelected >= v.minOrderAmount;

                return (
                  <TouchableOpacity
                    key={v.code}
                    disabled={!eligible}
                    onPress={() => {
                      setSelectedVoucher(v.code);
                      setVoucherModal(false);
                    }}
                    className={`p-4 border rounded-xl mb-3 ${
                      selectedVoucher === v.code
                        ? "border-mint bg-mint/10"
                        : "border-gray-200"
                    } ${!eligible ? "opacity-50" : ""}`}
                  >
                    <Text className="font-bold">{v.code}</Text>
                    <Text>
                      Giảm:{" "}
                      {v.discountType === "FixedAmount"
                        ? formatPrice(v.discountValue)
                        : `${v.discountValue}%`}
                    </Text>
                    <Text className="text-xs mt-1">
                      Đơn tối thiểu: {formatPrice(v.minOrderAmount)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>

          <TouchableOpacity
            onPress={() => setVoucherModal(false)}
            className="mt-3 py-3 rounded-full bg-gray-200"
          >
            <Text className="text-center font-bold">Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
