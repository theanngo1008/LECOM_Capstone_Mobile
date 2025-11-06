import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useUpdateShop } from "../hooks/useUpdateShop";
import { useMyShop } from "../hooks/useMyShop";
import * as ImagePicker from "expo-image-picker";

export function UpdateShopScreen({ navigation, route }: any) {
  const { data, isLoading } = useMyShop();
  const { mutate: updateShop, isPending: isUpdating } = useUpdateShop();
  const shopData = data?.result;

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [shopFacebook, setShopFacebook] = useState("");
  const [shopTiktok, setShopTiktok] = useState("");
  const [shopInstagram, setShopInstagram] = useState("");
  const [shopAvatar, setShopAvatar] = useState("");
  const [shopBanner, setShopBanner] = useState("");

  // Owner info
  const [ownerFullName, setOwnerFullName] = useState("");
  const [ownerDateOfBirth, setOwnerDateOfBirth] = useState("");
  const [ownerPersonalIdNumber, setOwnerPersonalIdNumber] = useState("");

  // ✅ Load data từ shop hiện tại
  useEffect(() => {
    if (shopData) {
      setName(shopData.name || "");
      setDescription(shopData.description || "");
      setPhoneNumber(shopData.phoneNumber || "");
      setAddress(shopData.address || "");
      setBusinessType(shopData.businessType || "");
      setShopFacebook(shopData.shopFacebook || "");
      setShopTiktok(shopData.shopTiktok || "");
      setShopInstagram(shopData.shopInstagram || "");
      setShopAvatar(shopData.shopAvatar || "");
      setShopBanner(shopData.shopBanner || "");
      setOwnerFullName(shopData.ownerFullName || "");
      setOwnerDateOfBirth(shopData.ownerDateOfBirth || "");
      setOwnerPersonalIdNumber(shopData.ownerPersonalIdNumber || "");
    }
  }, [shopData]);

  const handlePickImage = async (type: "avatar" | "banner") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "avatar" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      if (type === "avatar") {
        setShopAvatar(uri);
      } else {
        setShopBanner(uri);
      }
    }
  };

  const handleUpdate = () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Shop name is required");
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Phone number is required");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Error", "Address is required");
      return;
    }

    // Prepare payload - chỉ gửi các field đã thay đổi
    const payload: any = {};

    if (name !== shopData?.name) payload.name = name;
    if (description !== shopData?.description) payload.description = description;
    if (phoneNumber !== shopData?.phoneNumber) payload.phoneNumber = phoneNumber;
    if (address !== shopData?.address) payload.address = address;
    if (businessType !== shopData?.businessType) payload.businessType = businessType;
    if (shopFacebook !== shopData?.shopFacebook) payload.shopFacebook = shopFacebook;
    if (shopTiktok !== shopData?.shopTiktok) payload.shopTiktok = shopTiktok;
    if (shopInstagram !== shopData?.shopInstagram) payload.shopInstagram = shopInstagram;
    if (shopAvatar !== shopData?.shopAvatar) payload.shopAvatar = shopAvatar;
    if (shopBanner !== shopData?.shopBanner) payload.shopBanner = shopBanner;
    if (ownerFullName !== shopData?.ownerFullName) payload.ownerFullName = ownerFullName;
    if (ownerDateOfBirth !== shopData?.ownerDateOfBirth) payload.ownerDateOfBirth = ownerDateOfBirth;
    if (ownerPersonalIdNumber !== shopData?.ownerPersonalIdNumber) payload.ownerPersonalIdNumber = ownerPersonalIdNumber;

    if (Object.keys(payload).length === 0) {
      Alert.alert("Info", "No changes detected");
      return;
    }

    updateShop(
      { id: shopData!.id, payload },
      {
        onSuccess: () => {
          navigation.goBack();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#A5C4FB" />
        </View>
      </SafeAreaView>
    );
  }

  if (!shopData) {
    return (
      <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-light-text dark:text-dark-text text-center">
            No shop data found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-beige/50 dark:border-dark-border/50">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white dark:bg-dark-card items-center justify-center"
          >
            <FontAwesome name="arrow-left" size={16} color="#4A5568" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-light-text dark:text-dark-text">
            Edit Shop
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 py-6 gap-4">
            {/* Shop Images */}
            <View className="gap-3">
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                Shop Images
              </Text>

              {/* Banner */}
              <TouchableOpacity
                onPress={() => handlePickImage("banner")}
                className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden border-2 border-beige dark:border-dark-border"
                disabled={isUpdating}
              >
                {shopBanner ? (
                  <Image
                    source={{ uri: shopBanner }}
                    className="w-full h-40"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-40 items-center justify-center bg-beige/20 dark:bg-dark-border/20">
                    <FontAwesome name="image" size={32} color="#9CA3AF" />
                    <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-2">
                      Tap to select banner
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Avatar */}
              <TouchableOpacity
                onPress={() => handlePickImage("avatar")}
                className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden border-2 border-beige dark:border-dark-border self-start"
                disabled={isUpdating}
              >
                {shopAvatar ? (
                  <Image
                    source={{ uri: shopAvatar }}
                    className="w-24 h-24"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-24 h-24 items-center justify-center bg-beige/20 dark:bg-dark-border/20">
                    <FontAwesome name="user" size={24} color="#9CA3AF" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Shop Information */}
            <View className="gap-3">
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                Shop Information
              </Text>

              <InputField
                label="Shop Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter shop name"
                icon="shopping-bag"
                required
                editable={!isUpdating}
              />

              <InputField
                label="Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Enter shop description"
                icon="align-left"
                multiline
                editable={!isUpdating}
              />

              <InputField
                label="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter phone number"
                icon="phone"
                keyboardType="phone-pad"
                required
                editable={!isUpdating}
              />

              <InputField
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter address"
                icon="map-marker"
                required
                editable={!isUpdating}
              />

              <InputField
                label="Business Type"
                value={businessType}
                onChangeText={setBusinessType}
                placeholder="Enter business type"
                icon="briefcase"
                editable={!isUpdating}
              />
            </View>

            {/* Social Media */}
            <View className="gap-3">
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                Social Media (Optional)
              </Text>

              <InputField
                label="Facebook"
                value={shopFacebook}
                onChangeText={setShopFacebook}
                placeholder="Facebook URL"
                icon="facebook"
                editable={!isUpdating}
              />

              <InputField
                label="TikTok"
                value={shopTiktok}
                onChangeText={setShopTiktok}
                placeholder="TikTok URL"
                icon="music"
                editable={!isUpdating}
              />

              <InputField
                label="Instagram"
                value={shopInstagram}
                onChangeText={setShopInstagram}
                placeholder="Instagram URL"
                icon="instagram"
                editable={!isUpdating}
              />
            </View>

            {/* Owner Information */}
            <View className="gap-3">
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                Owner Information
              </Text>

              <InputField
                label="Owner Full Name"
                value={ownerFullName}
                onChangeText={setOwnerFullName}
                placeholder="Enter owner name"
                icon="user"
                editable={!isUpdating}
              />

              <InputField
                label="Personal ID Number"
                value={ownerPersonalIdNumber}
                onChangeText={setOwnerPersonalIdNumber}
                placeholder="Enter ID number"
                icon="id-card"
                editable={!isUpdating}
              />

              <InputField
                label="Date of Birth"
                value={ownerDateOfBirth}
                onChangeText={setOwnerDateOfBirth}
                placeholder="YYYY-MM-DD"
                icon="birthday-cake"
                editable={!isUpdating}
              />
            </View>

            {/* Update Button */}
            <TouchableOpacity
              className="bg-mint dark:bg-gold rounded-2xl py-4 items-center justify-center shadow-lg active:opacity-80 mt-4"
              onPress={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Update Shop
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  required = false,
  multiline = false,
  keyboardType = "default",
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: string;
  required?: boolean;
  multiline?: boolean;
  keyboardType?: any;
  editable?: boolean;
}) => (
  <View>
    <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
      {label} {required && <Text className="text-coral">*</Text>}
    </Text>
    <View className="flex-row items-center bg-white dark:bg-dark-card rounded-2xl border-2 border-beige dark:border-dark-border px-4">
      <FontAwesome name={icon as any} size={16} color="#9CA3AF" />
      <TextInput
        className="flex-1 text-light-text dark:text-dark-text py-3.5 ml-3"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        editable={editable}
      />
    </View>
  </View>
);