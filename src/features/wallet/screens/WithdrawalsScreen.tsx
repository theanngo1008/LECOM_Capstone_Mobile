import { useWalletBalance } from "@/features/cart/hooks/useWalletBalance";
import { useCreateWithdrawal } from "@/features/wallet/hooks/useCreateWithdrawal";
import { useMyWithdrawals } from "@/features/wallet/hooks/useMyWithdrawals";
import { useCancelCustomerWithdrawal } from "@/features/wallet/hooks/useCancelCustomerWithdrawal";
import { formatVietnamDateTime } from "@/utils/dateUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type WithdrawalStatus = "Pending" | "Approved" | "Rejected" | "Completed";

export function WithdrawalsScreen({ navigation }: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [note, setNote] = useState("");

  const { data, isLoading, isError, refetch } = useMyWithdrawals(currentPage, 10);
  const { data: walletData } = useWalletBalance();
  const createWithdrawalMutation = useCreateWithdrawal();
  const cancelWithdrawalMutation = useCancelCustomerWithdrawal();

  const withdrawals = data?.result || [];
  const walletBalance = walletData?.result?.balance || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return formatVietnamDateTime(dateString);
  };

  const getStatusConfig = (status: string): {
    label: string;
    icon: React.ComponentProps<typeof FontAwesome>["name"];
    color: string;
    bgColor: string;
    textColor: string;
  } => {
    switch (status) {
      case "Pending":
        return {
          label: "ĐANG CHỜ",
          icon: "clock-o",
          color: "#F59E0B",
          bgColor: "#FEF3C7",
          textColor: "#F59E0B",
        };
      case "Approved":
        return {
          label: "ĐÃ DUYỆT",
          icon: "check-circle",
          color: "#3B82F6",
          bgColor: "#DBEAFE",
          textColor: "#3B82F6",
        };
      case "Rejected":
        return {
          label: "ĐÃ TỪ CHỐI",
          icon: "times-circle",
          color: "#EF4444",
          bgColor: "#FEE2E2",
          textColor: "#EF4444",
        };
      case "Completed":
        return {
          label: "HOÀN THÀNH",
          icon: "check-circle-o",
          color: "#10B981",
          bgColor: "#D1FAE5",
          textColor: "#10B981",
        };
      default:
        return {
          label: status,
          icon: "question-circle",
          color: "#6B7280",
          bgColor: "#F3F4F6",
          textColor: "#6B7280",
        };
    }
  };

  const totalItems = withdrawals.length;
  const pendingCount = withdrawals.filter((w: any) => w.status === "Pending").length;

  const resetForm = () => {
    setAmount("");
    setBankName("");
    setBankAccountNumber("");
    setBankAccountName("");
    setBankBranch("");
    setNote("");
  };

  const handleCancelWithdrawal = (withdrawalId: string, amount: number) => {
    Alert.alert(
      "Hủy yêu cầu rút tiền",
      `Bạn có chắc chắn muốn hủy yêu cầu rút ${formatCurrency(amount)}₫?\n\nSố tiền sẽ được hoàn lại vào số dư khả dụng của bạn.`,
      [
        {
          text: "Không",
          style: "cancel",
        },
        {
          text: "Hủy yêu cầu",
          style: "destructive",
          onPress: () => {
            cancelWithdrawalMutation.mutate(withdrawalId, {
              onSuccess: () => {
                Alert.alert(
                  "Thành công",
                  "Yêu cầu rút tiền đã được hủy. Số tiền đã được hoàn lại vào ví của bạn.",
                  [
                    {
                      text: "OK",
                      onPress: () => refetch(),
                    },
                  ]
                );
              },
              onError: (error: any) => {
                Alert.alert(
                  "Lỗi",
                  error?.response?.data?.message || "Không thể hủy yêu cầu rút tiền"
                );
              },
            });
          },
        },
      ]
    );
  };

  const handleCreateWithdrawal = () => {
    // Validation
    const withdrawalAmount = parseFloat(amount);
    const MIN_WITHDRAWAL_AMOUNT = 100000; // 100,000 VND

    if (!amount || isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (withdrawalAmount < MIN_WITHDRAWAL_AMOUNT) {
      Alert.alert(
        "Số tiền không hợp lệ",
        `Số tiền rút tối thiểu là ${formatCurrency(MIN_WITHDRAWAL_AMOUNT)}₫`,
        [{ text: "OK" }]
      );
      return;
    }

    if (withdrawalAmount > walletBalance) {
      Alert.alert(
        "Số dư không đủ",
        `Số tiền rút vượt quá số dư khả dụng!\n\nSố dư hiện tại: ${formatCurrency(walletBalance)}₫\nSố tiền muốn rút: ${formatCurrency(withdrawalAmount)}₫`,
        [{ text: "OK" }]
      );
      return;
    }

    if (!bankName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên ngân hàng");
      return;
    }

    if (!bankAccountNumber.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số tài khoản");
      return;
    }

    if (!bankAccountName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên chủ tài khoản");
      return;
    }

    if (!bankBranch.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập chi nhánh ngân hàng");
      return;
    }

    // Create withdrawal
    createWithdrawalMutation.mutate(
      {
        amount: withdrawalAmount,
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankAccountName: bankAccountName.trim(),
        bankBranch: bankBranch.trim(),
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert(
            "Thành công",
            "Yêu cầu rút tiền đã được tạo!\nChúng tôi sẽ xử lý trong vòng 1-3 ngày làm việc.",
            [
              {
                text: "OK",
                onPress: () => {
                  setShowCreateModal(false);
                  resetForm();
                  refetch();
                },
              },
            ]
          );
        },
        onError: (error: any) => {
          Alert.alert(
            "Lỗi",
            error?.response?.data?.message || "Không thể tạo yêu cầu rút tiền"
          );
        },
      }
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Đang tải...
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
            Không thể tải danh sách yêu cầu rút tiền
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
      <View className="flex-row items-center justify-between px-4 py-4 bg-cream dark:bg-dark-background">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-12 h-12 rounded-full bg-white dark:bg-dark-card items-center justify-center shadow-sm"
        >
          <FontAwesome name="arrow-left" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <Text className="flex-1 text-xl font-bold text-light-text dark:text-dark-text text-center mx-4">
          Yêu cầu rút tiền
        </Text>

        <TouchableOpacity
          className="w-12 h-12 rounded-full bg-mint dark:bg-gold items-center justify-center shadow-sm"
          onPress={() => setShowCreateModal(true)}
        >
          <FontAwesome name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View className="px-4 pt-2 pb-4">
        <View className="flex-row gap-3">
          {/* Total Requests */}
          <View className="flex-1 bg-white dark:bg-dark-card rounded-2xl p-4 shadow-sm">
            <View className="w-12 h-12 bg-mint/10 dark:bg-gold/10 rounded-2xl items-center justify-center mb-3">
              <FontAwesome name="list" size={20} color="#ACD6B8" />
            </View>
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
              Tổng yêu cầu
            </Text>
            <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
              {totalItems}
            </Text>
          </View>

          {/* Pending Count */}
          <View className="flex-1 bg-white dark:bg-dark-card rounded-2xl p-4 shadow-sm">
            <View className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl items-center justify-center mb-3">
              <FontAwesome name="clock-o" size={20} color="#F59E0B" />
            </View>
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
              Đang chờ
            </Text>
            <Text className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {pendingCount}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Withdrawals List */}
        {withdrawals.length === 0 ? (
          <View className="bg-white dark:bg-dark-card rounded-3xl p-8 items-center shadow-sm mt-2">
            <View className="w-20 h-20 rounded-full bg-beige/30 dark:bg-dark-border/30 items-center justify-center mb-4">
              <FontAwesome name="money" size={36} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-2">
              Chưa có yêu cầu rút tiền
            </Text>
            <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm text-center">
              Các yêu cầu rút tiền của bạn sẽ hiển thị ở đây
            </Text>
          </View>
        ) : (
          <View className="pb-6">
            {withdrawals.map((withdrawal: any) => {
              const statusConfig = getStatusConfig(withdrawal.status);
              const isPending = withdrawal.status === "Pending";

              return (
                <View
                  key={withdrawal.id}
                  className="bg-white dark:bg-dark-card rounded-3xl p-5 mb-4 shadow-sm"
                >
                  {/* Status Badge at Top Right */}
                  <View className="absolute top-5 right-5 z-10">
                    <View
                      className="px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: statusConfig.bgColor }}
                    >
                      <Text
                        className="text-[11px] font-bold tracking-wide"
                        style={{ color: statusConfig.textColor }}
                      >
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  {/* Header with Icon, Status Text and Date */}
                  <View className="flex-row items-start mb-4 pr-24">
                    <View
                      className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                      style={{ backgroundColor: statusConfig.bgColor }}
                    >
                      <FontAwesome
                        name={statusConfig.icon}
                        size={24}
                        color={statusConfig.color}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
                        {statusConfig.label === "ĐANG CHỜ" ? "Đang chờ" : 
                         statusConfig.label === "ĐÃ DUYỆT" ? "Đã duyệt" :
                         statusConfig.label === "ĐÃ TỪ CHỐI" ? "Đã từ chối" :
                         statusConfig.label === "HOÀN THÀNH" ? "Hoàn thành" : statusConfig.label}
                      </Text>
                      <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                        {formatDate(withdrawal.requestedAt)}
                      </Text>
                    </View>
                  </View>

                  {/* Amount Display */}
                  <View className="mb-4">
                    <Text className="text-3xl font-bold text-coral">
                      {formatCurrency(withdrawal.amount)}₫
                    </Text>
                  </View>

                  {/* Bank Info Section */}
                  <View className="bg-beige/10 dark:bg-dark-background rounded-2xl p-4 mb-4">
                    <View className="flex-row items-center mb-3">
                      <FontAwesome name="bank" size={16} color="#6B7280" />
                      <Text className="text-sm font-bold text-light-text dark:text-dark-text ml-2">
                        Thông tin ngân hàng
                      </Text>
                    </View>
                    <View>
                      <View className="flex-row mb-2">
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary w-28">
                          Ngân hàng:
                        </Text>
                        <Text className="text-xs font-semibold text-light-text dark:text-dark-text flex-1">
                          {withdrawal.bankName}
                        </Text>
                      </View>
                    
                      <View className="flex-row mb-2">
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary w-28">
                          Số tài khoản:
                        </Text>
                        <Text className="text-xs font-semibold text-light-text dark:text-dark-text flex-1">
                          {withdrawal.bankAccountNumber}
                        </Text>
                      </View>
                      <View className="flex-row">
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary w-28">
                          Chủ tài khoản:
                        </Text>
                        <Text className="text-xs font-semibold text-light-text dark:text-dark-text flex-1">
                          {withdrawal.bankAccountName}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Note */}
                  {withdrawal.note && (
                    <View className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4 mb-4">
                      <Text className="text-xs font-semibold text-light-textSecondary dark:text-dark-textSecondary mb-2">
                        Ghi chú của bạn:
                      </Text>
                      <Text className="text-sm text-light-text dark:text-dark-text">
                        {withdrawal.note}
                      </Text>
                    </View>
                  )}

                  {/* Admin Note */}
                  {withdrawal.adminNote && (
                    <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-4 border border-blue-200 dark:border-blue-800">
                      <View className="flex-row items-start">
                        <FontAwesome name="comment" size={16} color="#3B82F6" />
                        <View className="flex-1 ml-3">
                          <Text className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">
                            Ghi chú từ Admin:
                          </Text>
                          <Text className="text-sm text-blue-700 dark:text-blue-300">
                            {withdrawal.adminNote}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Rejection Reason */}
                  {withdrawal.status === "Rejected" && withdrawal.rejectionReason && (
                    <View className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 mb-4 border border-red-200 dark:border-red-800">
                      <View className="flex-row items-start">
                        <FontAwesome name="exclamation-circle" size={16} color="#EF4444" />
                        <View className="flex-1 ml-3">
                          <Text className="text-xs font-bold text-red-600 dark:text-red-400 mb-2">
                            Lý do từ chối:
                          </Text>
                          <Text className="text-sm text-red-700 dark:text-red-300">
                            {withdrawal.rejectionReason}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Cancel Button - Only show for Pending status */}
                  {isPending && (
                    <TouchableOpacity
                      className={`rounded-xl py-3 mb-4 items-center justify-center ${
                        cancelWithdrawalMutation.isPending
                          ? "bg-red-400"
                          : "bg-red-500"
                      }`}
                      onPress={() => handleCancelWithdrawal(withdrawal.id, withdrawal.amount)}
                      disabled={cancelWithdrawalMutation.isPending}
                    >
                      {cancelWithdrawalMutation.isPending ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <View className="flex-row items-center">
                          <FontAwesome name="times-circle" size={16} color="white" />
                          <Text className="text-white font-bold ml-2">
                            Hủy yêu cầu rút tiền
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* Timeline */}
                  <View className="pt-4 border-t border-beige/20 dark:border-dark-border/20">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
                        <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                          Yêu cầu:
                        </Text>
                      </View>
                      <Text className="text-xs font-semibold text-light-text dark:text-dark-text">
                        {formatDate(withdrawal.requestedAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Create Withdrawal Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-dark-card rounded-t-3xl px-6 pb-8 pt-6 max-h-[90%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Tạo yêu cầu rút tiền
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="w-10 h-10 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
              >
                <FontAwesome name="times" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Available Balance */}
              <View className="bg-mint/10 dark:bg-gold/10 rounded-2xl p-4 mb-6 border border-mint/30 dark:border-gold/30">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <FontAwesome name="google-wallet" size={20} color="#ACD6B8" />
                    <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary ml-2">
                      Số dư khả dụng:
                    </Text>
                  </View>
                  <Text className="text-lg font-bold text-mint dark:text-gold">
                    {formatCurrency(walletBalance)}₫
                  </Text>
                </View>
              </View>

              {/* Amount Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Số tiền rút *
                </Text>
                <TextInput
                  className="bg-beige/20 dark:bg-dark-background rounded-xl px-4 py-3 text-base text-light-text dark:text-dark-text"
                  placeholder="Nhập số tiền muốn rút (tối thiểu 100,000₫)"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
                {amount && parseFloat(amount) > 0 && parseFloat(amount) < 100000 && (
                  <View className="flex-row items-center mt-2">
                    <FontAwesome name="exclamation-circle" size={14} color="#F59E0B" />
                    <Text className="text-xs text-orange-600 dark:text-orange-400 ml-1">
                      Số tiền rút tối thiểu là 100,000₫
                    </Text>
                  </View>
                )}
                {amount && parseFloat(amount) > walletBalance && (
                  <View className="flex-row items-center mt-2">
                    <FontAwesome name="exclamation-circle" size={14} color="#EF4444" />
                    <Text className="text-xs text-red-600 dark:text-red-400 ml-1">
                      Số tiền vượt quá số dư khả dụng
                    </Text>
                  </View>
                )}
              </View>

              {/* Bank Name */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Tên ngân hàng *
                </Text>
                <TextInput
                  className="bg-beige/20 dark:bg-dark-background rounded-xl px-4 py-3 text-base text-light-text dark:text-dark-text"
                  placeholder="VD: BIDV, Vietcombank, Techcombank..."
                  placeholderTextColor="#9CA3AF"
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>

              {/* Bank Branch */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Chi nhánh *
                </Text>
                <TextInput
                  className="bg-beige/20 dark:bg-dark-background rounded-xl px-4 py-3 text-base text-light-text dark:text-dark-text"
                  placeholder="VD: BIDV - CN Vinh Hai"
                  placeholderTextColor="#9CA3AF"
                  value={bankBranch}
                  onChangeText={setBankBranch}
                />
              </View>

              {/* Account Number */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Số tài khoản *
                </Text>
                <TextInput
                  className="bg-beige/20 dark:bg-dark-background rounded-xl px-4 py-3 text-base text-light-text dark:text-dark-text"
                  placeholder="Nhập số tài khoản"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={bankAccountNumber}
                  onChangeText={setBankAccountNumber}
                />
              </View>

              {/* Account Name */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Tên chủ tài khoản *
                </Text>
                <TextInput
                  className="bg-beige/20 dark:bg-dark-background rounded-xl px-4 py-3 text-base text-light-text dark:text-dark-text"
                  placeholder="Nhập tên chủ tài khoản"
                  placeholderTextColor="#9CA3AF"
                  value={bankAccountName}
                  onChangeText={setBankAccountName}
                  autoCapitalize="characters"
                />
              </View>

              {/* Note */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Ghi chú (tùy chọn)
                </Text>
                <TextInput
                  className="bg-beige/20 dark:bg-dark-background rounded-xl px-4 py-3 text-base text-light-text dark:text-dark-text"
                  placeholder="Thêm ghi chú..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={note}
                  onChangeText={setNote}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                className={`rounded-xl py-4 items-center ${
                  createWithdrawalMutation.isPending
                    ? "bg-mint/50 dark:bg-gold/50"
                    : "bg-mint dark:bg-gold"
                }`}
                onPress={handleCreateWithdrawal}
                disabled={createWithdrawalMutation.isPending}
              >
                {createWithdrawalMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-base font-bold">
                    Tạo yêu cầu rút tiền
                  </Text>
                )}
              </TouchableOpacity>

              {/* Info Note */}
              <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mt-4">
                <View className="flex-row items-start">
                  <FontAwesome name="info-circle" size={14} color="#3B82F6" />
                  <Text className="text-xs text-blue-700 dark:text-blue-300 ml-2 flex-1">
                    • Số tiền rút tối thiểu: 100,000₫{'\n'}
                    • Yêu cầu rút tiền sẽ được xử lý trong vòng 1-3 ngày làm việc{'\n'}
                    • Vui lòng đảm bảo thông tin ngân hàng chính xác{'\n'}
                    • Bạn có thể hủy yêu cầu khi đang ở trạng thái chờ duyệt
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}