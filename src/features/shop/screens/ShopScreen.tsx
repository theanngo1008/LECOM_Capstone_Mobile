import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
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
import { useDeleteShop } from "../hooks/useDeleteShop";
import { useMyShop } from "../hooks/useMyShop";

export function ShopScreen({ navigation }: any) {
  const { data, isLoading, refetch, isRefetching } = useMyShop();
  const { mutate: deleteShop, isPending: isDeleting } = useDeleteShop();
  const shopData = data?.result || null;

  const handleDeleteShop = () => {
    if (!shopData?.id) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin shop");
      return;
    }

    Alert.alert(
      "Xóa Shop",
      `Bạn có chắc chắn muốn xóa "${shopData.name}"? Hành động này không thể hoàn tác.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            console.log("🗑️ Deleting shop ID:", shopData.id);
            deleteShop(shopData.id);
          },
        },
      ]
    );
  };

  const handleEditShop = () => {
    navigation.navigate("UpdateShop");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-mint dark:text-mint";
      case "Pending":
        return "text-gold dark:text-gold";
      case "Rejected":
        return "text-coral dark:text-coral";
      default:
        return "text-light-textSecondary dark:text-dark-textSecondary";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-mint/20 dark:bg-mint/20 border-mint dark:border-mint";
      case "Pending":
        return "bg-gold/20 dark:bg-gold/20 border-gold dark:border-gold";
      case "Rejected":
        return "bg-coral/20 dark:bg-coral/20 border-coral dark:border-coral";
      default:
        return "bg-beige/20 dark:bg-dark-border/20 border-beige dark:border-dark-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return "check-circle";
      case "Pending":
        return "clock-o";
      case "Rejected":
        return "times-circle";
      default:
        return "question-circle";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Approved":
        return "Shop đã được duyệt";
      case "Pending":
        return "Chờ phê duyệt";
      case "Rejected":
        return "Shop bị từ chối";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#A5C4FB" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
            Đang tải thông tin shop...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // No Shop
  if (!shopData) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          <View className="flex-1 items-center justify-center px-6 py-20">
            <View className="w-32 h-32 rounded-full bg-gold/20 dark:bg-mint/20 items-center justify-center mb-6">
              <Text className="text-6xl">🏪</Text>
            </View>

            <Text className="text-3xl font-bold text-light-text dark:text-dark-text mb-3 text-center">
              Chưa có Shop
            </Text>

            <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary text-center mb-8 px-4">
              Bạn chưa đăng ký shop.{"\n"}Bắt đầu bán hàng bằng cách tạo shop ngay!
            </Text>

            <TouchableOpacity
              className="bg-gold dark:bg-mint rounded-2xl py-4 px-8 items-center justify-center shadow-lg active:opacity-80"
              onPress={() => navigation.navigate("RegisterShop")}
            >
              <Text className="text-white font-bold text-lg">
                Tạo Shop của bạn
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Has Shop
  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Banner */}
        <View className="relative h-52">
          <Image
            source={{
              uri: shopData.shopBanner || "https://via.placeholder.com/400x200",
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />

          {/* Top Actions */}
          <View className="absolute top-4 left-4 right-4 flex-row justify-end gap-2">
            <TouchableOpacity
              onPress={handleEditShop}
              className="w-10 h-10 rounded-full bg-skyBlue items-center justify-center shadow-lg"
              disabled={isDeleting}
            >
              <FontAwesome name="edit" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteShop}
              className="w-10 h-10 rounded-full bg-coral items-center justify-center shadow-lg"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <FontAwesome name="trash" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {/* Shop Avatar - Positioned at bottom of banner */}
          <View className="absolute -bottom-12 left-6">
            <View className="relative">
              <Image
                source={{
                  uri: shopData.shopAvatar || "https://via.placeholder.com/100",
                }}
                className="w-24 h-24 rounded-2xl border-4 border-cream dark:border-dark-background"
                resizeMode="cover"
              />
              {shopData.status === "Approved" && (
                <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-mint rounded-full items-center justify-center border-3 border-cream dark:border-dark-background">
                  <FontAwesome name="check" size={12} color="white" />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-6 pt-16 pb-8">
          {/* Shop Name & Category */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
              {shopData.name}
            </Text>
            <View className="flex-row items-center">
              <FontAwesome name="tag" size={12} color="#9CA3AF" />
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary ml-2">
                {shopData.categoryName}
              </Text>
            </View>
          </View>

          {/* Status Card */}
          <View
            className={`${getStatusBgColor(
              shopData.status
            )} border-2 rounded-2xl p-4 mb-6`}
          >
            <View className="flex-row items-center justify-center">
              <FontAwesome
                name={getStatusIcon(shopData.status)}
                size={18}
                color={
                  shopData.status === "Approved"
                    ? "#ACD6B8"
                    : shopData.status === "Pending"
                    ? "#FFCB66"
                    : "#F2A297"
                }
              />
              <Text
                className={`ml-2 font-bold text-base ${getStatusColor(
                  shopData.status
                )}`}
              >
                {getStatusText(shopData.status)}
              </Text>
            </View>
            {shopData.status === "Pending" && (
              <Text className="text-xs text-center text-light-textSecondary dark:text-dark-textSecondary mt-2">
                Shop của bạn đang được xem xét. Quá trình này có thể mất 1-3 ngày làm việc.
              </Text>
            )}
          </View>

          {/* Rejection Reason */}
          {shopData.status === "Rejected" && shopData.rejectedReason && (
            <View className="bg-coral/10 border-2 border-coral/30 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <FontAwesome
                  name="exclamation-circle"
                  size={14}
                  color="#F2A297"
                />
                <Text className="text-sm font-bold text-coral ml-2">
                  Lý do từ chối
                </Text>
              </View>
              <Text className="text-sm text-light-text dark:text-dark-text">
                {shopData.rejectedReason}
              </Text>
            </View>
          )}

          {/* Quick Stats */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-skyBlue/10 rounded-2xl p-4">
              <FontAwesome name="calendar" size={18} color="#A5C4FB" />
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-2 mb-1">
                Thành viên từ
              </Text>
              <Text className="text-sm font-bold text-light-text dark:text-dark-text">
                {new Date(shopData.createdAt).toLocaleDateString("vi-VN", {
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>

            <View className="flex-1 bg-mint/10 rounded-2xl p-4">
              <FontAwesome name="phone" size={18} color="#ACD6B8" />
              <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-2 mb-1">
                Liên hệ
              </Text>
              <Text
                className="text-sm font-bold text-light-text dark:text-dark-text"
                numberOfLines={1}
              >
                {shopData.phoneNumber}
              </Text>
            </View>
          </View>

          {/* Shop Information */}
          <InfoSection
            title="Thông tin Shop"
            color="skyBlue"
            icon="info-circle"
            rows={[
              {
                icon: "align-left",
                label: "Mô tả",
                value: shopData.description || "Chưa có mô tả",
              },
              {
                icon: "briefcase",
                label: "Loại hình kinh doanh",
                value: shopData.businessType || "N/A",
              },
              {
                icon: "map-marker",
                label: "Địa chỉ",
                value: shopData.address,
              },
            ]}
          />

          {/* Owner Information */}
          <InfoSection
            title="Thông tin chủ sở hữu"
            color="mint"
            icon="user"
            rows={[
              {
                icon: "user-circle",
                label: "Họ và tên",
                value: shopData.ownerFullName,
              },
              {
                icon: "id-card",
                label: "CMND/CCCD",
                value: shopData.ownerPersonalIdNumber,
              },
              {
                icon: "birthday-cake",
                label: "Ngày sinh",
                value: new Date(shopData.ownerDateOfBirth).toLocaleDateString("vi-VN"),
              },
            ]}
          />

          {/* Manage Your Shop Section */}
          <View className="mt-8 mb-6">
            <Text className="text-lg font-bold text-light-text dark:text-dark-text mb-3">
              Quản lý Shop
            </Text>
            
            {/* First Row - Products & Courses */}
            <View className="flex-row gap-3 mb-3">
              <TouchableOpacity
                className="flex-1 bg-skyBlue rounded-2xl p-4 items-center justify-center shadow-md active:opacity-80"
                onPress={() => navigation.navigate("ShopProductsMain")}
              >
                <FontAwesome name="cube" size={20} color="white" />
                <Text className="text-white font-bold mt-2">
                  Sản phẩm
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-mint rounded-2xl p-4 items-center justify-center shadow-md active:opacity-80"
                onPress={() => navigation.navigate("ShopCoursesMain")}
              >
                <FontAwesome name="graduation-cap" size={20} color="white" />
                <Text className="text-white font-bold mt-2">
                  Khóa học
                </Text>
              </TouchableOpacity>
            </View>

            {/* Second Row - Orders & Customer Chats */}
            <View className="flex-row gap-3 mb-3">
              <TouchableOpacity
                className="flex-1 bg-gold rounded-2xl p-4 items-center justify-center shadow-md active:opacity-80"
                onPress={() => navigation.navigate("ShopOrdersMain")}
              >
                <FontAwesome name="shopping-bag" size={20} color="white" />
                <Text className="text-white font-bold mt-2">
                  Đơn hàng
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-lavender rounded-2xl p-4 items-center justify-center shadow-md active:opacity-80"
                onPress={() => navigation.navigate("SellerChatList")}
              >
                <FontAwesome name="comments" size={20} color="white" />
                <Text className="text-white font-bold mt-2">
                  Tin nhắn KH
                </Text>
              </TouchableOpacity>
            </View>

            {/* Third Row - Shop Wallet (Full Width with LinearGradient) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("ShopWalletMain")}
            >
              <LinearGradient
                colors={['#ACD6B8', '#FFCB66']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-2xl p-5 flex-row items-center justify-between shadow-lg"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
                    <FontAwesome name="money" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg mb-1">
                      Ví Shop
                    </Text>
                    <Text className="text-white/80 text-xs">
                      Xem số dư và lịch sử giao dịch
                    </Text>
                  </View>
                </View>
                <FontAwesome name="chevron-right" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Social Media */}
          {(shopData.shopFacebook ||
            shopData.shopTiktok ||
            shopData.shopInstagram) && (
            <InfoSection
              title="Mạng xã hội"
              color="lavender"
              icon="share-alt"
              rows={
                [
                  shopData.shopFacebook && {
                    icon: "facebook-square",
                    label: "Facebook",
                    value: shopData.shopFacebook,
                  },
                  shopData.shopTiktok && {
                    icon: "music",
                    label: "TikTok",
                    value: shopData.shopTiktok,
                  },
                  shopData.shopInstagram && {
                    icon: "instagram",
                    label: "Instagram",
                    value: shopData.shopInstagram,
                  },
                ].filter(Boolean) as {
                  icon: string;
                  label: string;
                  value: string;
                }[]
              }
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoSection = ({
  title,
  color,
  icon,
  rows,
}: {
  title: string;
  color: string;
  icon: string;
  rows: { icon: string; label: string; value: string }[];
}) => (
  <View className="bg-white dark:bg-dark-card rounded-2xl p-4 mb-4 shadow-sm">
    <View className="flex-row items-center mb-3 pb-3 border-b border-beige/50 dark:border-dark-border/50">
      <View
        className={`w-9 h-9 bg-${color}/20 rounded-xl items-center justify-center mr-3`}
      >
        <FontAwesome
          name={icon as any}
          size={16}
          color={
            color === "skyBlue"
              ? "#A5C4FB"
              : color === "mint"
              ? "#ACD6B8"
              : color === "lavender"
              ? "#CDB6DB"
              : "#9CA3AF"
          }
        />
      </View>
      <Text className="text-base font-bold text-light-text dark:text-dark-text">
        {title}
      </Text>
    </View>
    <View className="gap-3">
      {rows.map((row, i) => (
        <InfoRow key={i} {...row} />
      ))}
    </View>
  </View>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View className="flex-row items-start">
    <View className="w-7 h-7 bg-beige/30 dark:bg-dark-border/30 rounded-lg items-center justify-center mr-3 mt-0.5">
      <FontAwesome name={icon as any} size={12} color="#9CA3AF" />
    </View>
    <View className="flex-1">
      <Text className="text-xs font-semibold text-light-textSecondary dark:text-dark-textSecondary mb-0.5">
        {label}
      </Text>
      <Text className="text-sm text-light-text dark:text-dark-text">
        {value}
      </Text>
    </View>
  </View>
);