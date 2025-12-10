import { Voucher } from "@/api/voucher";
import { useVouchers } from "@/features/cart/hooks/useVouchers";
import { ProfileStackScreenProps } from "@/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; 
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileStackParamList } from "@/navigation/types";

type Props = ProfileStackScreenProps<"MyVouchers">;

export function MyVoucherScreen({ navigation: navProp }: Props) {
  // ✅ Fallback navigation nếu prop không có
  const navigationHook = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const navigation = navProp || navigationHook;

  const { data: vouchers, isLoading, error, refetch, isFetching } = useVouchers();

  // Sắp xếp vouchers: chưa dùng & chưa hết hạn lên trước, đã dùng hoặc hết hạn xuống cuối
  const sortedVouchers = useMemo(() => {
    if (!vouchers) return [];
    
    return [...vouchers].sort((a, b) => {
      const aExpired = a.isExpired || a.isUsed;
      const bExpired = b.isExpired || b.isUsed;
      
      if (aExpired === bExpired) return 0;
      return aExpired ? 1 : -1;
    });
  }, [vouchers]);

  const renderVoucherItem = ({ item }: { item: Voucher }) => {
    const isExpired = item.isExpired || item.isUsed;
    const discountText =
      item.discountType === "Percentage"
        ? `${item.discountValue}%`
        : `${item.discountValue.toLocaleString()}đ`;

    return (
      <View className="mx-4 mb-4">
        <LinearGradient
          colors={isExpired ? ['#E5E5E5', '#F5F5F5'] : ['#FFF9E6', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl overflow-hidden shadow-md"
          style={{ opacity: isExpired ? 0.6 : 1 }}
        >
          <View className="flex-row relative">
            {/* Left side - Discount badge */}
            <View className="w-32 justify-center items-center py-6 relative">
              <View className="items-center">
                <Text className="text-5xl font-black text-gold mb-2">
                  {discountText}
                </Text>
                <View className="bg-gold rounded-full px-4 py-1.5">
                  <Text className="text-xs text-white font-bold">
                    GIẢM GIÁ
                  </Text>
                </View>
              </View>
              
              {/* Vertical dashed line */}
              <View className="absolute right-0 top-4 bottom-4 w-0.5 border-r-2 border-dashed border-gold/30" />
            </View>

            {/* Right side - Voucher info */}
            <View className="flex-1 p-4 pl-6">
              {/* Code and status badge */}
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xl font-black text-gray-800 dark:text-gray-200 tracking-wider">
                  {item.code}
                </Text>
                
                {item.isUsed && (
                  <View className="bg-emerald-500 rounded-full px-3 py-1.5">
                    <Text className="text-xs text-white font-bold">
                      ✓ Đã dùng
                    </Text>
                  </View>
                )}
                {item.isExpired && !item.isUsed && (
                  <View className="bg-gray-500 rounded-full px-3 py-1.5">
                    <Text className="text-xs text-white font-bold">
                      Hết hạn
                    </Text>
                  </View>
                )}
              </View>

              {/* Details */}
              <View className="space-y-2">
                <View className="flex-row items-center mb-1">
                  <View className="w-6 h-6 bg-gold/20 rounded-full items-center justify-center mr-2">
                    <Text className="text-sm">💰</Text>
                  </View>
                  <Text className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                    Đơn tối thiểu: <Text className="font-bold text-gray-800 dark:text-gray-200">{item.minOrderAmount.toLocaleString()}đ</Text>
                  </Text>
                </View>

                {item.maxDiscountAmount && (
                  <View className="flex-row items-center mb-1">
                    <View className="w-6 h-6 bg-gold/20 rounded-full items-center justify-center mr-2">
                      <Text className="text-sm">🎯</Text>
                    </View>
                    <Text className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                      Giảm tối đa: <Text className="font-bold text-gray-800 dark:text-gray-200">{item.maxDiscountAmount.toLocaleString()}đ</Text>
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center pt-2 mt-1 border-t border-gray-200 dark:border-gray-600">
                  <View className="w-6 h-6 bg-red-100 rounded-full items-center justify-center mr-2">
                    <Text className="text-sm">📅</Text>
                  </View>
                  <Text className="text-xs text-gray-500 dark:text-gray-500">
                    HSD: <Text className="font-semibold">{new Date(item.endDate).toLocaleDateString("vi-VN")}</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Decorative punch holes */}
            <View className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cream dark:bg-dark-background border border-gray-200" />
            <View className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cream dark:bg-dark-background border border-gray-200" />
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E8BA69" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4 font-medium">
            Đang tải voucher...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-6xl mb-4">😔</Text>
          <Text className="text-red-500 text-center text-lg font-semibold mb-2">
            Không thể tải voucher
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            Vui lòng thử lại sau
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      {/* Header */}
      <View className="px-4 py-4 bg-white dark:bg-dark-card shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => {
              console.log("🔙 Going back...");
              navigation.goBack();
            }}
            className="mr-3 p-2 -ml-2"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          <View className="bg-gold/20 rounded-full p-2 mr-3">
            <Text className="text-2xl">🎫</Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Voucher của tôi
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {vouchers?.length || 0} voucher
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={sortedVouchers}
        renderItem={renderVoucherItem}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => refetch()}
            tintColor="#E8BA69"
            colors={["#E8BA69"]}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20 px-6">
            <View className="bg-white dark:bg-dark-card rounded-3xl p-10 items-center shadow-lg w-full max-w-sm">
              <View className="bg-gold/10 rounded-full p-6 mb-4">
                <Text className="text-7xl">🎫</Text>
              </View>
              <Text className="text-gray-800 dark:text-gray-200 text-xl font-bold mb-2 text-center">
                Chưa có voucher
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
                Bạn chưa có voucher nào{"\n"}Hãy tham gia các chương trình{"\n"}khuyến mãi để nhận voucher!
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}