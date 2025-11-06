import { ThemedButton } from "@/components/themed-button";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMyProfile } from "../hooks/useMyProfile";
import { useEditProfile } from "../hooks/useEditProfile";
import { useUploadFile } from "../../../hooks/useUploadFile";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export function EditProfileScreen() {
  const { data, isLoading } = useMyProfile();
  const profile = data?.result;

  const { mutate: editProfile, isPending } = useEditProfile();
  const { uploadFile, isLoading: isUploading } = useUploadFile();

  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setUserName(profile.userName || "");
      setEmail(profile.email || "");
      setPhoneNumber(profile.phoneNumber || "");
      setAddress(profile.address || "");
      setDateOfBirth(profile.dateOfBirth || "");
      setImageUrl(profile.imageUrl || undefined);
    }
  }, [profile]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background">
        <ActivityIndicator size="large" color="#ACD6B8" />
        <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4">
          Đang tải thông tin...
        </Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background px-6">
        <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
          <FontAwesome name="user-times" size={40} color="#FF6B6B" />
        </View>
        <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
          Không có thông tin hồ sơ
        </Text>
        <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
          Vui lòng liên hệ quản trị viên
        </Text>
      </SafeAreaView>
    );
  }

  const pickAndUpload = async () => {
    if (!isEditing) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Cần quyền truy cập", "Vui lòng cho phép truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const file: any = {
        uri: asset.uri,
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      };

      const uploaded = await uploadFile(file, "image");
      const uploadedUrl = typeof uploaded === "string" ? uploaded : uploaded?.url;

      if (!uploadedUrl) throw new Error("Upload thất bại");

      setImageUrl(uploadedUrl);
      Alert.alert("✅ Thành công", "Ảnh đại diện đã được cập nhật!");
    } catch (err: any) {
      console.error("❌ Upload error:", err);
      Alert.alert("Lỗi", err.message || "Không thể upload ảnh");
    }
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ và tên");
      return;
    }

    const payload = {
      id: profile.id,
      fullName: fullName.trim(),
      userName: userName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      dateOfBirth,
      ...(imageUrl ? { imageUrl } : {}),
    };

    editProfile(payload, {
      onSuccess: () => {
        setIsEditing(false);
        Alert.alert("✅ Thành công", "Đã lưu thay đổi!");
      },
      onError: (err: any) => {
        Alert.alert("❌ Lỗi", err.message || "Có lỗi xảy ra khi lưu profile");
      },
    });
  };

  const handleCancel = () => {
    // Reset về dữ liệu gốc
    if (profile) {
      setFullName(profile.fullName || "");
      setUserName(profile.userName || "");
      setEmail(profile.email || "");
      setPhoneNumber(profile.phoneNumber || "");
      setAddress(profile.address || "");
      setDateOfBirth(profile.dateOfBirth || "");
      setImageUrl(profile.imageUrl || undefined);
    }
    setIsEditing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
              {isEditing ? "Chỉnh sửa hồ sơ" : "Thông tin cá nhân"}
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-mint dark:bg-gold mr-2" />
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                {isEditing ? "Đang chỉnh sửa" : "Chế độ xem"}
              </Text>
            </View>
          </View>
          <View className="w-14 h-14 rounded-2xl bg-mint/10 dark:bg-gold/10 items-center justify-center">
            <FontAwesome 
              name={isEditing ? "edit" : "user"} 
              size={24} 
              color={isEditing ? "#FFD700" : "#ACD6B8"} 
            />
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View className="items-center py-8 px-6">
          <View className="relative">
            <TouchableOpacity 
              onPress={pickAndUpload} 
              disabled={!isEditing}
              activeOpacity={0.8}
            >
              <View className="relative">
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-dark-card shadow-lg"
                  />
                ) : (
                  <View className="w-32 h-32 rounded-full bg-gradient-to-br from-mint to-skyBlue dark:from-gold dark:to-lavender items-center justify-center border-4 border-white dark:border-dark-card shadow-lg">
                    <Text className="text-white text-5xl font-bold">
                      {fullName?.charAt(0)?.toUpperCase() || "U"}
                    </Text>
                  </View>
                )}
                
                {/* Upload Icon Overlay */}
                {isEditing && (
                  <View className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-mint dark:bg-gold items-center justify-center border-4 border-white dark:border-dark-card shadow-md">
                    <FontAwesome name="camera" size={16} color="white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Loading Overlay */}
            {isUploading && (
              <View className="absolute inset-0 w-32 h-32 rounded-full bg-black/50 items-center justify-center">
                <ActivityIndicator size="large" color="white" />
              </View>
            )}
          </View>

          {isEditing && (
            <View className="mt-4 px-4 py-2 rounded-full bg-mint/10 dark:bg-gold/10">
              <Text className="text-sm font-semibold text-mint dark:text-gold">
                Chạm để thay đổi ảnh
              </Text>
            </View>
          )}
        </View>

        {/* Form Fields */}
        <View className="px-6 gap-4">
          {/* Personal Info Section */}
          <SectionHeader icon="user" title="Thông tin cá nhân" />
          
          <Field
            icon="user-circle"
            label="Họ và tên"
            value={fullName}
            editable={isEditing}
            onChangeText={setFullName}
            placeholder="Nhập họ và tên"
            required
          />
          
          <Field
            icon="at"
            label="Username"
            value={userName}
            editable={isEditing}
            onChangeText={setUserName}
            placeholder="Nhập username"
          />

          {/* Contact Info Section */}
          <SectionHeader icon="envelope" title="Thông tin liên hệ" marginTop />
          
          <Field
            icon="envelope"
            label="Email"
            value={email}
            editable={isEditing}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="example@email.com"
          />
          
          <Field
            icon="phone"
            label="Số điện thoại"
            value={phoneNumber}
            editable={isEditing}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholder="0123456789"
          />
          
          <Field
            icon="map-marker"
            label="Địa chỉ"
            value={address}
            editable={isEditing}
            onChangeText={setAddress}
            placeholder="Nhập địa chỉ"
            multiline
          />

          {/* Other Info Section */}
          <SectionHeader icon="calendar" title="Thông tin khác" marginTop />

          {/* Date of Birth */}
          <View>
            <View className="flex-row items-center mb-2">
              <FontAwesome name="birthday-cake" size={14} color="#ACD6B8" />
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text ml-2">
                Ngày sinh
              </Text>
            </View>
            <TouchableOpacity
              disabled={!isEditing}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
              className={`flex-row items-center px-4 py-4 rounded-2xl border ${
                isEditing
                  ? "bg-white dark:bg-dark-card border-mint/30 dark:border-gold/30"
                  : "bg-beige/20 dark:bg-dark-border/20 border-beige/30 dark:border-dark-border/30"
              }`}
            >
              <FontAwesome 
                name="calendar" 
                size={18} 
                color={isEditing ? "#ACD6B8" : "#9CA3AF"} 
              />
              <Text className={`flex-1 ml-3 text-base ${
                dateOfBirth 
                  ? "text-light-text dark:text-dark-text" 
                  : "text-light-textSecondary dark:text-dark-textSecondary"
              }`}>
                {dateOfBirth
                  ? new Date(dateOfBirth).toLocaleDateString("vi-VN")
                  : "Chọn ngày sinh"}
              </Text>
              {isEditing && (
                <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
              )}
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDateOfBirth(selectedDate.toISOString());
                }}
                maximumDate={new Date()}
              />
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 mt-8 gap-3">
          {isEditing ? (
            <>
              <ThemedButton
                title={isPending || isUploading ? "Đang lưu..." : "💾 Lưu thay đổi"}
                variant="primary"
                size="large"
                fullWidth
                onPress={handleSave}
                disabled={isPending || isUploading}
              />
              <ThemedButton
                title="❌ Hủy"
                variant="secondary"
                size="large"
                fullWidth
                onPress={handleCancel}
                disabled={isPending || isUploading}
              />
            </>
          ) : (
            <ThemedButton
              title="✏️ Chỉnh sửa thông tin"
              variant="primary"
              size="large"
              fullWidth
              onPress={() => setIsEditing(true)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===================== COMPONENTS =====================

const SectionHeader = ({ 
  icon, 
  title, 
  marginTop = false 
}: { 
  icon: any; 
  title: string; 
  marginTop?: boolean;
}) => (
  <View className={`flex-row items-center py-3 ${marginTop ? 'mt-4' : ''}`}>
    <View className="w-8 h-8 rounded-lg bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3">
      <FontAwesome name={icon} size={14} color="#ACD6B8" />
    </View>
    <Text className="text-base font-bold text-light-text dark:text-dark-text">
      {title}
    </Text>
    <View className="flex-1 h-px bg-beige/30 dark:bg-dark-border/30 ml-3" />
  </View>
);

const Field = ({
  icon,
  label,
  value,
  onChangeText,
  editable,
  keyboardType,
  placeholder,
  required = false,
  multiline = false,
}: {
  icon: any;
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
  editable: boolean;
  keyboardType?: any;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
}) => (
  <View>
    <View className="flex-row items-center mb-2">
      <FontAwesome name={icon} size={14} color="#ACD6B8" />
      <Text className="text-sm font-semibold text-light-text dark:text-dark-text ml-2">
        {label}
        {required && <Text className="text-coral"> *</Text>}
      </Text>
    </View>
    <View className={`flex-row items-center px-4 rounded-2xl border ${
      editable
        ? "bg-white dark:bg-dark-card border-mint/30 dark:border-gold/30"
        : "bg-beige/20 dark:bg-dark-border/20 border-beige/30 dark:border-dark-border/30"
    }`}>
      <TextInput
        className={`flex-1 text-base text-light-text dark:text-dark-text ${
          multiline ? 'py-4 min-h-[100px]' : 'py-4'
        }`}
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {editable && value && value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText?.("")}>
          <FontAwesome name="times-circle" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);