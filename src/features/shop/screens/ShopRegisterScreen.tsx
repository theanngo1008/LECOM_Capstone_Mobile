import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RegisterShopPayload } from "../../../api/shop";
import { useUploadFile } from "../../../hooks/useUploadFile";
import { useRegisterShop } from "../hooks/useRegisterShop";

export function ShopRegisterScreen({ navigation }: any) {
  const { mutate: registerShop, isPending: isRegistering } = useRegisterShop();
  const { uploadFile, isLoading: isUploading } = useUploadFile();

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
  const [businessType, setBusinessType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [ownershipDocumentUrl, setOwnershipDocumentUrl] = useState("");
  const [shopAvatar, setShopAvatar] = useState("");
  const [shopBanner, setShopBanner] = useState("");
  const [shopFacebook, setShopFacebook] = useState("");
  const [shopTiktok, setShopTiktok] = useState("");
  const [shopInstagram, setShopInstagram] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // ----- UPDATED: pickImage -> pickAndUpload (supports image & document) -----
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
        Alert.alert("✅ Upload Success", "Document uploaded successfully!");
      } else {
        Alert.alert("❌ Upload failed", "No URL returned from server.");
      }
      return;
    }

    // image flow
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ dùng mảng để fix warning deprecated
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
      Alert.alert("✅ Upload Success", "Image uploaded successfully!");
    } else {
      Alert.alert("❌ Upload failed", "No URL returned from server.");
    }
  } catch (err: any) {
    console.error("❌ Upload error:", err);
    Alert.alert("Upload Failed", err.message || "Could not upload file");
  }
};

  // ---------------------------------------------------------------------------

  const formatDateToISO = (dateString: string): string => {
    // Input format: DD/MM/YYYY
    // Output format: YYYY-MM-DDTHH:mm:ss.sssZ
    const parts = dateString.split("/");
    if (parts.length !== 3) return dateString;

    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];

    return `${year}-${month}-${day}T00:00:00.000Z`;
  };

  const handleSubmit = async () => {
    // Build payload
    const payload: RegisterShopPayload = {
      shopName: shopName.trim(),
      shopDescription: shopDescription.trim(),
      shopPhoneNumber: shopPhoneNumber.trim(),
      shopAddress: shopAddress.trim(),
      businessType: businessType.trim(),
      categoryId: categoryId.trim(),
      shopAvatar: shopAvatar.trim(),
      shopBanner: shopBanner.trim(),
      shopFacebook: shopFacebook.trim() || undefined,
      shopTiktok: shopTiktok.trim() || undefined,
      shopInstagram: shopInstagram.trim() || undefined,
      ownershipDocumentUrl: ownershipDocumentUrl.trim(),
      ownerFullName: ownerFullName.trim(),
      ownerDateOfBirth: formatDateToISO(ownerDateOfBirth.trim()),
      ownerPersonalIdNumber: ownerPersonalIdNumber.trim(),
      ownerPersonalIdFrontUrl: ownerPersonalIdFrontUrl.trim(),
      ownerPersonalIdBackUrl: ownerPersonalIdBackUrl.trim(),
      acceptedTerms,
    };

    console.log("📝 Submitting shop registration:", payload);

    // ✅ Validation tự động chạy trong hook
    registerShop(payload, {
      onSuccess: () => {
        // Navigate back to ShopScreen
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
            disabled={isRegistering}
          >
            <FontAwesome name="arrow-left" size={16} color="#4A5568" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-light-text dark:text-dark-text">
            Register Shop
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
                Register Your Shop
              </Text>
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center">
                Complete the form to start selling
              </Text>
            </View>

            {/* SECTION 1: OWNER INFORMATION */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-1 h-6 bg-skyBlue dark:bg-lavender rounded-full mr-3" />
                <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                  Owner Information
                </Text>
              </View>

              <View className="gap-4">
                {/* Owner Full Name */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Full Name <Text className="text-coral">*</Text>
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="John Doe"
                    placeholderTextColor="#9CA3AF"
                    value={ownerFullName}
                    onChangeText={setOwnerFullName}
                    editable={!isRegistering}
                  />
                </View>

                {/* Date of Birth */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Date of Birth <Text className="text-coral">*</Text>
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
                    Personal ID Number <Text className="text-coral">*</Text>
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
                    Personal ID Front <Text className="text-coral">*</Text>
                  </Text>
                  <ImageUploadButton
                    title="Upload ID Front"
                    imageUrl={ownerPersonalIdFrontUrl}
                    onPress={() => pickAndUpload(setOwnerPersonalIdFrontUrl, { type: "image" })}
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Personal ID Back <Text className="text-coral">*</Text>
                  </Text>
                  <ImageUploadButton
                    title="Upload ID Back"
                    imageUrl={ownerPersonalIdBackUrl}
                    onPress={() => pickAndUpload(setOwnerPersonalIdBackUrl, { type: "image" })}
                  />
                </View>
              </View>
            </View>

            {/* SECTION 2: SHOP INFORMATION */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-1 h-6 bg-mint dark:bg-gold rounded-full mr-3" />
                <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                  Shop Information
                </Text>
              </View>

              <View className="gap-4">
                {/* Shop Name */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Shop Name <Text className="text-coral">*</Text>
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="My Awesome Shop"
                    placeholderTextColor="#9CA3AF"
                    value={shopName}
                    onChangeText={setShopName}
                    editable={!isRegistering}
                  />
                </View>

                {/* Shop Description */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Shop Description <Text className="text-coral">*</Text>
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="Tell us about your shop..."
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
                    Phone Number <Text className="text-coral">*</Text>
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

                {/* Shop Address */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Shop Address <Text className="text-coral">*</Text>
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="123 Street, City"
                    placeholderTextColor="#9CA3AF"
                    value={shopAddress}
                    onChangeText={setShopAddress}
                    editable={!isRegistering}
                  />
                </View>

                {/* Business Type */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Business Type <Text className="text-coral">*</Text>
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="e.g., Retail, Service"
                    placeholderTextColor="#9CA3AF"
                    value={businessType}
                    onChangeText={setBusinessType}
                    editable={!isRegistering}
                  />
                </View>

                {/* Category ID */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Category <Text className="text-coral">*</Text>
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3.5 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="e.g., cfood"
                    placeholderTextColor="#9CA3AF"
                    value={categoryId}
                    onChangeText={setCategoryId}
                    editable={!isRegistering}
                  />
                </View>

                {/* Shop Avatar */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Shop Avatar <Text className="text-coral">*</Text>
                  </Text>
                  <ImageUploadButton
                    title="Upload Shop Avatar"
                    imageUrl={shopAvatar}
                    onPress={() => pickAndUpload(setShopAvatar, { type: "image" })}
                  />
                </View>

                {/* Shop Banner */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Shop Banner <Text className="text-coral">*</Text>
                  </Text>
                  <ImageUploadButton
                    title="Upload Shop Banner"
                    imageUrl={shopBanner}
                    onPress={() => pickAndUpload(setShopBanner, { type: "image" })}
                  />
                </View>

                {/* Ownership Document */}
                <View>
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                    Ownership Document <Text className="text-coral">*</Text>
                  </Text>
                  <ImageUploadButton
                    title="Upload Document"
                    imageUrl={ownershipDocumentUrl}
                    onPress={() => pickAndUpload(setOwnershipDocumentUrl, { type: "document" })}
                  />
                </View>

                {/* Social Media */}
                <View className="bg-skyBlue/10 dark:bg-lavender/10 rounded-2xl p-4 gap-3">
                  <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-1">
                    Social Media (Optional)
                  </Text>

                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3 rounded-xl border border-beige dark:border-dark-border"
                    placeholder="https://facebook.com/yourshop"
                    placeholderTextColor="#9CA3AF"
                    value={shopFacebook}
                    onChangeText={setShopFacebook}
                    autoCapitalize="none"
                    editable={!isRegistering}
                  />

                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3 rounded-xl border border-beige dark:border-dark-border"
                    placeholder="https://tiktok.com/@yourshop"
                    placeholderTextColor="#9CA3AF"
                    value={shopTiktok}
                    onChangeText={setShopTiktok}
                    autoCapitalize="none"
                    editable={!isRegistering}
                  />

                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text px-4 py-3 rounded-xl border border-beige dark:border-dark-border"
                    placeholder="https://instagram.com/yourshop"
                    placeholderTextColor="#9CA3AF"
                    value={shopInstagram}
                    onChangeText={setShopInstagram}
                    autoCapitalize="none"
                    editable={!isRegistering}
                  />
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
                I accept the{" "}
                <Text className="text-mint dark:text-gold font-semibold">
                  Terms & Conditions
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
                  Register Shop
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}