import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
import { RegisterShopPayload } from "../../../api/shop";
import { useCourseCategories } from "../../../hooks/useCourseCategories";
import { useDistricts } from "../../../hooks/useDistricts";
import { useProvinces } from "../../../hooks/useProvinces";
import { useUploadFile } from "../../../hooks/useUploadFile";
import { useWards } from "../../../hooks/useWards";
import { useRegisterShop } from "../hooks/useRegisterShop";

export function ShopRegisterScreen({ navigation }: any) {
  const { mutate: registerShop, isPending: isRegistering } = useRegisterShop();
  const { uploadFile, isLoading: isUploading } = useUploadFile();
  const { data: categories, isLoading: isLoadingCategories } = useCourseCategories();

  // Owner Info
  const [ownerFullName, setOwnerFullName] = useState("");
  const [ownerDateOfBirth, setOwnerDateOfBirth] = useState("");
  const [ownerPersonalIdNumber, setOwnerPersonalIdNumber] = useState("");
  const [ownerPersonalIdFrontUrl, setOwnerPersonalIdFrontUrl] = useState("");
  const [ownerPersonalIdBackUrl, setOwnerPersonalIdBackUrl] = useState("");

  // Shop Info
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [shopPhoneNumber, setShopPhoneNumber] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [provinceId, setProvinceId] = useState<number>(0);
  const [provinceName, setProvinceName] = useState("");
  const [districtId, setDistrictId] = useState<number>(0);
  const [districtName, setDistrictName] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [wardName, setWardName] = useState("");
  const [businessType, setBusinessType] = useState<"Cá nhân" | "Doanh nghiệp" | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [ownershipDocumentUrl, setOwnershipDocumentUrl] = useState("");
  const [shopAvatar, setShopAvatar] = useState("");
  const [shopBanner, setShopBanner] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Modal States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBusinessTypeModal, setShowBusinessTypeModal] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);

  // Address hooks - must be after state declarations
  const { data: provinces, isLoading: isLoadingProvinces } = useProvinces();
  const { data: districts, isLoading: isLoadingDistricts } = useDistricts(provinceId || null);
  const { data: wards, isLoading: isLoadingWards } = useWards(districtId || null);

  const businessTypeOptions = [
    { value: "Cá nhân", label: "Cá nhân", icon: "user" },
    { value: "Doanh nghiệp", label: "Doanh nghiệp", icon: "building" },
  ] as const;

  const pickAndUpload = async (
    setUrl: (url: string) => void,
    opts?: { type?: "image" | "document" }
  ) => {
    const type = opts?.type ?? "image";

    try {
      if (type === "document") {
        const res = await DocumentPicker.getDocumentAsync({
          type: "*/*",
          copyToCacheDirectory: false,
        });

        if (res.canceled) return;
        const asset = res.assets?.[0];
        if (!asset) return;

        const file: any = {
          uri: asset.uri,
          name: asset.name || `doc_${Date.now()}`,
          type: asset.mimeType || "application/octet-stream",
        };

        const uploaded = await uploadFile(file, "document");
        if (uploaded?.url) {
          setUrl(uploaded.url);
          Alert.alert("Tải lên thành công", "Tài liệu đã được tải lên!");
        } else {
          Alert.alert("Tải lên thất bại", "Không nhận được URL từ server.");
        }
        return;
      }

      // image flow
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Cần quyền truy cập", "Vui lòng cho phép truy cập thư viện ảnh");
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
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      };

      const uploaded = await uploadFile(file, "image");

      if (uploaded?.url) {
        setUrl(uploaded.url);
        Alert.alert("Tải lên thành công", "Ảnh đã được tải lên!");
      } else {
        Alert.alert("Tải lên thất bại", "Không nhận được URL từ server.");
      }
    } catch (err: any) {
      console.error("❌ Upload error:", err);
      Alert.alert("Tải lên thất bại", err.message || "Không thể tải tệp lên");
    }
  };

  const formatDateToISO = (dateString: string): string => {
    const parts = dateString.split("/");
    if (parts.length !== 3) return dateString;

    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];

    return `${year}-${month}-${day}T00:00:00.000Z`;
  };

  const handleSubmit = async () => {
    const payload: RegisterShopPayload = {
      shopName: shopName.trim(),
      shopDescription: shopDescription.trim(),
      shopPhoneNumber: shopPhoneNumber.trim(),
      shopAddress: shopAddress.trim(),
      provinceId,
      provinceName: provinceName.trim(),
      districtId,
      districtName: districtName.trim(),
      wardCode: wardCode.trim(),
      wardName: wardName.trim(),
      businessType: businessType.trim(),
      categoryId: categoryId.trim(),
      shopAvatar: shopAvatar.trim(),
      shopBanner: shopBanner.trim(),
      shopFacebook: undefined,
      shopTiktok: undefined,
      shopInstagram: undefined,
      ownershipDocumentUrl: ownershipDocumentUrl.trim(),
      ownerFullName: ownerFullName.trim(),
      ownerDateOfBirth: formatDateToISO(ownerDateOfBirth.trim()),
      ownerPersonalIdNumber: ownerPersonalIdNumber.trim(),
      ownerPersonalIdFrontUrl: ownerPersonalIdFrontUrl.trim(),
      ownerPersonalIdBackUrl: ownerPersonalIdBackUrl.trim(),
      acceptedTerms,
    };

    console.log("📝 Submitting shop registration:", payload);

    registerShop(payload, {
      onSuccess: () => {
        navigation.goBack();
      },
    });
  };

  const ImageUploadButton = ({
    title,
    imageUrl,
    onPress,
  }: {
    title: string;
    imageUrl: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="border-2 border-dashed border-beige dark:border-dark-border rounded-2xl p-4 items-center justify-center bg-white dark:bg-dark-card"
      disabled={isRegistering || isUploading}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-32 rounded-xl"
          resizeMode="cover"
        />
      ) : (
        <View className="items-center">
          <FontAwesome name="image" size={35} color="#9CA3AF" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-sm mt-2">
            {title}
          </Text>
        </View>
      )}
      {isUploading && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="small" color="#A5C4FB" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-beige/50 dark:border-dark-border/50">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white dark:bg-dark-card items-center justify-center"
            disabled={isRegistering}
          >
            <FontAwesome name="arrow-left" size={16} color="#4A5568" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-light-text dark:text-dark-text">
            Đăng ký cửa hàng
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-6 pb-8">
            {/* Header Icon */}
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full items-center justify-center bg-gold/20 dark:bg-mint/20 mb-3">
                <Text className="text-4xl">🏪</Text>
              </View>
              <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                Đăng ký cửa hàng của riêng bạn
              </Text>
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center">
                Hoàn thành biểu mẫu để bắt đầu bán hàng
              </Text>
            </View>

            {/* SECTION 1: THÔNG TIN CÁ NHÂN */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-1 h-6 bg-skyBlue dark:bg-lavender rounded-full mr-3" />
                <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                  Thông tin cá nhân
                </Text>
              </View>

              <View className="gap-4">
                {/* Owner Full Name */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Họ và tên <Text className="text-coral">*</Text>
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#9CA3AF"
                    value={ownerFullName}
                    onChangeText={setOwnerFullName}
                    editable={!isRegistering}
                  />
                </View>

                {/* Date of Birth */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Ngày sinh <Text className="text-coral">*</Text>
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#9CA3AF"
                    value={ownerDateOfBirth}
                    onChangeText={setOwnerDateOfBirth}
                    editable={!isRegistering}
                  />
                </View>

                {/* Personal ID Number */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Số CMND/CCCD <Text className="text-coral">*</Text>
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="123456789"
                    placeholderTextColor="#9CA3AF"
                    value={ownerPersonalIdNumber}
                    onChangeText={setOwnerPersonalIdNumber}
                    keyboardType="numeric"
                    editable={!isRegistering}
                  />
                </View>

                {/* Personal ID Images */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Ảnh CMND/CCCD mặt trước <Text className="text-coral">*</Text>
                  </Text>
                  <ImageUploadButton
                    title="Tải ảnh mặt trước"
                    imageUrl={ownerPersonalIdFrontUrl}
                    onPress={() => pickAndUpload(setOwnerPersonalIdFrontUrl, { type: "image" })}
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Ảnh CMND/CCCD mặt sau <Text className="text-coral">*</Text>
                  </Text>
                  <ImageUploadButton
                    title="Tải ảnh mặt sau"
                    imageUrl={ownerPersonalIdBackUrl}
                    onPress={() => pickAndUpload(setOwnerPersonalIdBackUrl, { type: "image" })}
                  />
                </View>
              </View>
            </View>

            {/* SECTION 2: THÔNG TIN CỬA HÀNG */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-1 h-6 bg-mint dark:bg-gold rounded-full mr-3" />
                <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                  Thông tin cửa hàng
                </Text>
              </View>

              <View className="gap-4">
                {/* Shop Name */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Tên Shop <Text className="text-coral">*</Text>
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="Shop của tôi"
                    placeholderTextColor="#9CA3AF"
                    value={shopName}
                    onChangeText={setShopName}
                    editable={!isRegistering}
                  />
                </View>

                {/* Shop Description */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Mô tả Shop <Text className="text-coral">*</Text>
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="Giới thiệu về shop của bạn..."
                    placeholderTextColor="#9CA3AF"
                    value={shopDescription}
                    onChangeText={setShopDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!isRegistering}
                  />
                </View>

                {/* Shop Phone */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Số điện thoại <Text className="text-coral">*</Text>
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="0123456789"
                    placeholderTextColor="#9CA3AF"
                    value={shopPhoneNumber}
                    onChangeText={setShopPhoneNumber}
                    keyboardType="phone-pad"
                    editable={!isRegistering}
                  />
                </View>

                {/* Business Type Selector */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Loại hình kinh doanh <Text className="text-coral">*</Text>
                  </Text>
                  <TouchableOpacity
                    className="bg-white dark:bg-dark-card px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border flex-row items-center justify-between"
                    onPress={() => setShowBusinessTypeModal(true)}
                    disabled={isRegistering}
                  >
                    <Text
                      className={`${
                        businessType
                          ? "text-light-text dark:text-dark-text"
                          : "text-gray-400"
                      }`}
                    >
                      {businessType || "Chọn loại hình kinh doanh"}
                    </Text>
                    <FontAwesome name="chevron-down" size={14} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Category Selector */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Danh mục <Text className="text-coral">*</Text>
                  </Text>
                  <TouchableOpacity
                    className="bg-white dark:bg-dark-card px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border flex-row items-center justify-between"
                    onPress={() => setShowCategoryModal(true)}
                    disabled={isRegistering || isLoadingCategories}
                  >
                    <Text
                      className={`${
                        categoryName
                          ? "text-light-text dark:text-dark-text"
                          : "text-gray-400"
                      }`}
                    >
                      {categoryName || "Chọn danh mục"}
                    </Text>
                    <FontAwesome name="chevron-down" size={14} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Shop Avatar */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Ảnh đại diện Shop <Text className="text-coral">*</Text>
                  </Text>
                  <ImageUploadButton
                    title="Tải ảnh đại diện"
                    imageUrl={shopAvatar}
                    onPress={() => pickAndUpload(setShopAvatar, { type: "image" })}
                  />
                </View>

                {/* Shop Banner */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Ảnh bìa Shop <Text className="text-coral">*</Text>
                  </Text>
                  <ImageUploadButton
                    title="Tải ảnh bìa"
                    imageUrl={shopBanner}
                    onPress={() => pickAndUpload(setShopBanner, { type: "image" })}
                  />
                </View>

                {/* Ownership Document */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Giấy tờ sở hữu <Text className="text-coral">*</Text>
                  </Text>
                  <ImageUploadButton
                    title="Tải tài liệu"
                    imageUrl={ownershipDocumentUrl}
                    onPress={() => pickAndUpload(setOwnershipDocumentUrl, { type: "document" })}
                  />
                </View>
              </View>
            </View>

            {/* SECTION 3: ĐỊA CHỈ CỬA HÀNG */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-1 h-6 bg-gold dark:bg-mint rounded-full mr-3" />
                <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                  Địa chỉ cửa hàng
                </Text>
                </View>

              <View className="gap-4">
                {/* Shop Address */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Địa chỉ chi tiết <Text className="text-coral">*</Text>
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="123 Đường ABC"
                    placeholderTextColor="#9CA3AF"
                    value={shopAddress}
                    onChangeText={setShopAddress}
                    editable={!isRegistering}
                  />
                </View>

                {/* Province */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Tỉnh/Thành phố <Text className="text-coral">*</Text>
                  </Text>
                  <TouchableOpacity
                    className="bg-white dark:bg-dark-card px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border flex-row items-center justify-between"
                    onPress={() => setShowProvinceModal(true)}
                    disabled={isRegistering || isLoadingProvinces}
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
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Quận/Huyện <Text className="text-coral">*</Text>
                  </Text>
                  <TouchableOpacity
                    className="bg-white dark:bg-dark-card px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border flex-row items-center justify-between"
                    onPress={() => setShowDistrictModal(true)}
                    disabled={isRegistering || !provinceId || isLoadingDistricts}
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

                {/* Ward */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Phường/Xã <Text className="text-coral">*</Text>
                  </Text>
                  <TouchableOpacity
                    className="bg-white dark:bg-dark-card px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border flex-row items-center justify-between"
                    onPress={() => setShowWardModal(true)}
                    disabled={isRegistering || !districtId || isLoadingWards}
                  >
                    <Text
                      className={`${
                        wardName
                          ? "text-light-text dark:text-dark-text"
                          : "text-gray-400"
                      }`}
                    >
                      {wardName || (districtId ? "Chọn phường/xã" : "Chọn quận trước")}
                    </Text>
                    <FontAwesome name="chevron-down" size={14} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Terms & Conditions */}
            <TouchableOpacity
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              className="flex-row items-center mb-6 bg-white dark:bg-dark-card p-4 rounded-2xl border-2 border-beige dark:border-dark-border"
              disabled={isRegistering}
            >
              <View
                className={`w-6 h-6 rounded-lg border-2 mr-3 items-center justify-center ${
                  acceptedTerms
                    ? "bg-mint dark:bg-gold border-mint dark:border-gold"
                    : "border-beige dark:border-dark-border"
                }`}
              >
                {acceptedTerms && <Text className="text-white text-sm">✓</Text>}
              </View>
              <Text className="flex-1 text-sm text-light-text dark:text-dark-text">
                Tôi đồng ý với{" "}
                <Text className="text-mint dark:text-gold font-semibold">
                  Điều khoản & Điều kiện
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-gold dark:bg-mint rounded-2xl py-4 items-center justify-center shadow-lg active:opacity-80"
              onPress={handleSubmit}
              disabled={isRegistering}
            >
              {isRegistering ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Đăng ký Shop
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Business Type Modal */}
      <Modal
        visible={showBusinessTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBusinessTypeModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-md">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-beige/50 dark:border-dark-border/50">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Chọn loại hình
              </Text>
              <TouchableOpacity
                onPress={() => setShowBusinessTypeModal(false)}
                className="w-8 h-8 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
              >
                <FontAwesome name="times" size={16} color="#4A5568" />
              </TouchableOpacity>
            </View>

            {/* Business Type Options */}
            <View className="p-6 gap-3">
              {businessTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`p-4 rounded-xl border-2 flex-row items-center ${
                    businessType === option.value
                      ? "border-mint dark:border-gold bg-mint/10 dark:bg-gold/10"
                      : "border-beige/30 dark:border-dark-border/30 bg-white dark:bg-dark-card"
                  }`}
                  onPress={() => {
                    setBusinessType(option.value);
                    setShowBusinessTypeModal(false);
                  }}
                >
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                      businessType === option.value
                        ? "bg-mint/20 dark:bg-gold/20"
                        : "bg-beige/20 dark:bg-dark-border/20"
                    }`}
                  >
                    <FontAwesome
                      name={option.icon as any}
                      size={20}
                      color={businessType === option.value ? "#ACD6B8" : "#9CA3AF"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-base font-bold ${
                        businessType === option.value
                          ? "text-mint dark:text-gold"
                          : "text-light-text dark:text-dark-text"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {businessType === option.value && (
                    <FontAwesome name="check-circle" size={20} color="#ACD6B8" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-md max-h-[80%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-beige/50 dark:border-dark-border/50">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Chọn danh mục
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                className="w-8 h-8 rounded-full bg-beige/50 dark:bg-dark-border/50 items-center justify-center"
              >
                <FontAwesome name="times" size={16} color="#4A5568" />
              </TouchableOpacity>
            </View>

            {/* Categories List */}
            {isLoadingCategories ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#ACD6B8" />
                <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
                  Đang tải danh mục...
                </Text>
              </View>
            ) : (
              <FlatList
                data={categories || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="px-6 py-4 border-b border-beige/30 dark:border-dark-border/30 active:bg-beige/20 dark:active:bg-dark-border/20"
                    onPress={() => {
                      setCategoryId(item.id);
                      setCategoryName(item.name);
                      setShowCategoryModal(false);
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-light-text dark:text-dark-text mb-1">
                          {item.name}
                        </Text>
                        {item.description && (
                          <Text
                            className="text-sm text-light-textSecondary dark:text-dark-textSecondary"
                            numberOfLines={1}
                          >
                            {item.description}
                          </Text>
                        )}
                      </View>
                      {categoryId === item.id && (
                        <FontAwesome name="check-circle" size={20} color="#ACD6B8" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View className="py-12 items-center">
                    <FontAwesome name="inbox" size={48} color="#D1D5DB" />
                    <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
                      Không có danh mục nào
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
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
                      setProvinceId(item.ProvinceID);
                      setProvinceName(item.ProvinceName);
                      // Reset district and ward when province changes
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
                      // Reset ward when district changes
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
    </SafeAreaView>
  );
}