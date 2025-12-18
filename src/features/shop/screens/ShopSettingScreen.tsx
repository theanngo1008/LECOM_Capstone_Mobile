import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GHNConnectPayload, ShopAddressPayload } from "../../../api/shop";
import { useDistricts } from "../../../hooks/useDistricts";
import { useProvinces } from "../../../hooks/useProvinces";
import { useWards } from "../../../hooks/useWards";
import { useConnectGHN } from "../hooks/useConnectGHN";
import { useGHNStatus } from "../hooks/useGHNStatus";
import { useSetShopAddress } from "../hooks/useSetShopAddress";
import { useShopAddress } from "../hooks/useShopAddress";
import { useUpdateShopAddress } from "../hooks/useUpdateShopAddress";

export function ShopSettingScreen({ navigation }: any) {
  // GET hooks
  const { data: addressData, isLoading: isLoadingAddress } = useShopAddress();
  const { data: ghnStatusData, isLoading: isLoadingGHN } = useGHNStatus();

  // POST hooks
  const { mutate: setShopAddress, isPending: isSettingAddress } = useSetShopAddress();
  const { mutate: updateShopAddress, isPending: isUpdatingAddress } = useUpdateShopAddress();
  const { mutate: connectGHN, isPending: isConnectingGHN } = useConnectGHN();

  const isProcessingAddress = isSettingAddress || isUpdatingAddress;

  // Address form state
  const [detailAddress, setDetailAddress] = useState("");
  const [provinceId, setProvinceId] = useState<number>(0);
  const [provinceName, setProvinceName] = useState("");
  const [districtId, setDistrictId] = useState<number>(0);
  const [districtName, setDistrictName] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [wardName, setWardName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isDefault, setIsDefault] = useState(true);

  // GHN form state
  const [ghnToken, setGhnToken] = useState("");
  const [ghnShopId, setGhnShopId] = useState("");

  // Modal states
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);

  // Address hooks
  const { data: provinces, isLoading: isLoadingProvinces } = useProvinces();
  const { data: districts, isLoading: isLoadingDistricts } = useDistricts(provinceId || null);
  const { data: wards, isLoading: isLoadingWards } = useWards(districtId || null);

  // Load existing address data
  useEffect(() => {
    if (addressData?.result) {
      const addr = addressData.result;
      setDetailAddress(addr.detailAddress || "");
      setProvinceId(addr.provinceId || 0);
      setProvinceName(addr.provinceName || "");
      setDistrictId(addr.districtId || 0);
      setDistrictName(addr.districtName || "");
      setWardCode(addr.wardCode || "");
      setWardName(addr.wardName || "");
      setContactName(addr.contactName || "");
      setContactPhone(addr.contactPhone || "");
      setIsDefault(addr.isDefault || false);
    }
  }, [addressData]);

  // Load existing GHN data
  useEffect(() => {
    if (ghnStatusData?.result?.isConnected) {
      setGhnShopId(ghnStatusData.result.ghnShopId || "");
    }
  }, [ghnStatusData]);

  const handleSubmitAddress = () => {
    if (!provinceId || !districtId || !contactName.trim() || !contactPhone.trim()) {
      return;
    }

    const payload: ShopAddressPayload = {
      provinceId,
      provinceName: provinceName.trim(),
      districtId,
      districtName: districtName.trim(),
      wardCode: wardCode.trim() || "", // Optional, có thể để trống
      wardName: wardName.trim() || "", // Optional, có thể để trống
      detailAddress: detailAddress.trim() || "", // Optional, có thể để trống
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      isDefault,
    };

    // Nếu đã có địa chỉ (có addressId), dùng update, ngược lại dùng create
    if (addressData?.result?.id) {
      updateShopAddress({ addressId: addressData.result.id, payload });
    } else {
      setShopAddress(payload);
    }
  };

  const handleConnectGHN = () => {
    if (!ghnToken.trim() || !ghnShopId.trim()) {
      return;
    }

    const payload: GHNConnectPayload = {
      ghnToken: ghnToken.trim(),
      ghnShopId: ghnShopId.trim(),
    };

    connectGHN(payload);
  };

  const isLoading = isLoadingAddress || isLoadingGHN;

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-beige/50 dark:border-dark-border/50">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-white dark:bg-dark-card items-center justify-center"
            >
              <FontAwesome name="arrow-left" size={16} color="#4A5568" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-light-text dark:text-dark-text flex-1 text-center">
              Cài đặt cửa hàng
            </Text>
            <View className="w-10" />
          </View>
          <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center">
            Cập nhật địa chỉ và thiết lập liên kết với hệ thống giao hàng.
          </Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#A5C4FB" />
            <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
              Đang tải...
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6 pt-6 pb-8">
              {/* SECTION 1: KẾT NỐI GHN */}
              <View className="mb-8">
                <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
                  Kết nối với hệ thống vận chuyển Giao Hàng Nhanh
                </Text>
                
                {/* GHN Status Banner */}
                {ghnStatusData?.result && ghnStatusData.result.isConnected && (
                  <View className="bg-mint/20 border-2 border-mint rounded-2xl p-4 mb-4">
                    <View className="flex-row items-start">
                      <FontAwesome name="truck" size={20} color="#ACD6B8" style={{ marginTop: 2 }} />
                      <View className="flex-1 ml-3">
                        <Text className="text-base font-bold text-mint mb-1">
                          Đã kết nối với đơn vị vận chuyển Giao Hàng Nhanh
                        </Text>
                        <Text className="text-sm text-light-text dark:text-dark-text">
                          {ghnStatusData.result.message || `Shop đã kết nối GHN thành công với Shop ID: ${ghnStatusData.result.ghnShopId || ""}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-4">
                  Thiết lập kết nối với đơn vị vận chuyển Giao Hàng Nhanh.{" "}
                  <Text className="text-skyBlue dark:text-lavender underline">
                    (Xem hướng dẫn lấy API Token)
                  </Text>
                </Text>

                <View className="gap-4">
                  {/* GHN Token */}
                  <View>
                    <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                      API Token GHN
                    </Text>
                    <TextInput
                      className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige dark:border-dark-border"
                      placeholder="Nhập API token GHN..."
                      placeholderTextColor="#9CA3AF"
                      value={ghnToken}
                      onChangeText={setGhnToken}
                      autoCapitalize="none"
                      editable={!isConnectingGHN}
                      secureTextEntry
                    />
                  </View>

                  {/* GHN Shop ID */}
                  <View>
                    <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                      ID cửa hàng GHN
                    </Text>
                    <TextInput
                      className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige dark:border-dark-border"
                      placeholder="Nhập ID cửa hàng từ GHN..."
                      placeholderTextColor="#9CA3AF"
                      value={ghnShopId}
                      onChangeText={setGhnShopId}
                      autoCapitalize="none"
                      editable={!isConnectingGHN}
                    />
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl py-3.5 items-center justify-center flex-row"
                      onPress={() => {
                        setGhnToken("");
                        setGhnShopId("");
                      }}
                      disabled={isConnectingGHN}
                    >
                      <FontAwesome name="refresh" size={16} color="#4A5568" />
                      <Text className="text-gray-700 dark:text-gray-300 font-semibold ml-2">
                        Đặt lại
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-gold dark:bg-mint rounded-xl py-3.5 items-center justify-center flex-row shadow-md active:opacity-80"
                      onPress={handleConnectGHN}
                      disabled={isConnectingGHN || !ghnToken.trim() || !ghnShopId.trim()}
                    >
                      {isConnectingGHN ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <FontAwesome name="link" size={16} color="white" />
                          <Text className="text-white font-bold ml-2">
                            Kết nối với GHN
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* SECTION 2: ĐỊA CHỈ KHO HÀNG */}
              <View className="mb-6">
                <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
                  Địa chỉ kho hàng
                </Text>
                <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-4">
                  Thiết lập địa chỉ kho và thông tin liên hệ của kho cho cửa hàng.
                </Text>

                {/* Sub-section: Khu vực */}
                <View className="mb-6">
                  <Text className="text-base font-semibold text-light-text dark:text-dark-text mb-3">
                    Khu vực
                  </Text>
                  <View className="gap-3">
                    {/* Province */}
                    <View>
                      <Text className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
                        Tỉnh / Thành phố
                      </Text>
                      <TouchableOpacity
                        className="bg-white dark:bg-dark-card px-4 py-3.5 rounded-xl border border-beige dark:border-dark-border flex-row items-center justify-between"
                        onPress={() => setShowProvinceModal(true)}
                        disabled={isProcessingAddress || isLoadingProvinces}
                      >
                        <Text
                          className={`${
                            provinceName
                              ? "text-light-text dark:text-dark-text"
                              : "text-gray-400"
                          }`}
                        >
                          {provinceName || "Chọn tỉnh/thành phố"}
                        </Text>
                        <FontAwesome name="chevron-down" size={14} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>

                    {/* District */}
                    <View>
                      <Text className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
                        Quận / Huyện
                      </Text>
                      <TouchableOpacity
                        className="bg-white dark:bg-dark-card px-4 py-3.5 rounded-xl border border-beige dark:border-dark-border flex-row items-center justify-between"
                        onPress={() => setShowDistrictModal(true)}
                        disabled={isProcessingAddress || !provinceId || isLoadingDistricts}
                      >
                        <Text
                          className={`${
                            districtName
                              ? "text-light-text dark:text-dark-text"
                              : "text-gray-400"
                          }`}
                        >
                          {districtName || (provinceId ? "Chọn quận/huyện" : "Chọn tỉnh trước")}
                        </Text>
                        <FontAwesome name="chevron-down" size={14} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Sub-section: Thông tin liên hệ */}
                <View className="mb-6">
                  <Text className="text-base font-semibold text-light-text dark:text-dark-text mb-3">
                    Thông tin liên hệ
                  </Text>
                  <View className="gap-3">

                    {/* Contact Name */}
                    <View>
                      <Text className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
                        Tên người liên hệ
                      </Text>
                      <TextInput
                        className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige dark:border-dark-border"
                        placeholder="Nhập tên người liên hệ"
                        placeholderTextColor="#9CA3AF"
                        value={contactName}
                        onChangeText={setContactName}
                        editable={!isProcessingAddress}
                      />
                    </View>

                    {/* Contact Phone */}
                    <View>
                      <Text className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
                        Số điện thoại liên hệ
                      </Text>
                      <TextInput
                        className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-xl border border-beige dark:border-dark-border"
                        placeholder="Nhập số điện thoại"
                        placeholderTextColor="#9CA3AF"
                        value={contactPhone}
                        onChangeText={setContactPhone}
                        keyboardType="phone-pad"
                        editable={!isProcessingAddress}
                      />
                    </View>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  className="bg-gold dark:bg-mint rounded-xl py-4 items-center justify-center shadow-md active:opacity-80"
                  onPress={handleSubmitAddress}
                  disabled={isProcessingAddress || !provinceId || !districtId || !contactName.trim() || !contactPhone.trim()}
                >
                  {isProcessingAddress ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      {addressData?.result ? "Cập nhật địa chỉ" : "Thiết lập địa chỉ"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}

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
                        setProvinceId(item.ProvinceID);
                        setProvinceName(item.ProvinceName);
                        setDistrictId(0);
                        setDistrictName("");
                        setWardCode("");
                        setWardName("");
                        setShowProvinceModal(false);
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-semibold text-light-text dark:text-dark-text">
                          {item.ProvinceName}
                        </Text>
                        {provinceId === item.ProvinceID && (
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
                        setDistrictId(item.DistrictID);
                        setDistrictName(item.DistrictName);
                        setWardCode("");
                        setWardName("");
                        setShowDistrictModal(false);
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-semibold text-light-text dark:text-dark-text">
                          {item.DistrictName}
                        </Text>
                        {districtId === item.DistrictID && (
                          <FontAwesome name="check-circle" size={20} color="#ACD6B8" />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={() => (
                    <View className="py-12 items-center">
                      <FontAwesome name="inbox" size={48} color="#D1D5DB" />
                      <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
                        {provinceId ? "Không có dữ liệu" : "Vui lòng chọn tỉnh trước"}
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
                        setWardCode(item.WardCode);
                        setWardName(item.WardName);
                        setShowWardModal(false);
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-semibold text-light-text dark:text-dark-text">
                          {item.WardName}
                        </Text>
                        {wardCode === item.WardCode && (
                          <FontAwesome name="check-circle" size={20} color="#ACD6B8" />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={() => (
                    <View className="py-12 items-center">
                      <FontAwesome name="inbox" size={48} color="#D1D5DB" />
                      <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
                        {districtId ? "Không có dữ liệu" : "Vui lòng chọn quận trước"}
                      </Text>
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

