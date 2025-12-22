import FontAwesome from "@expo/vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUploadFile } from "../../../hooks/useUploadFile";
import { useEditProfile } from "../hooks/useEditProfile";
import { useMyProfile } from "../hooks/useMyProfile";

export function EditProfileScreen() {
  const navigation = useNavigation();
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
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
        <View className="items-center">
          <ActivityIndicator size="large" color="#ACD6B8" />
          <Text className="text-light-textSecondary dark:text-dark-textSecondary mt-4 text-base">
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-dark-background px-6" edges={['top', 'bottom']}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-coral/20 items-center justify-center mb-4">
            <FontAwesome name="user-times" size={40} color="#F2A297" />
          </View>
          <Text className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
            No Profile Found
          </Text>
          <Text className="text-light-textSecondary dark:text-dark-textSecondary text-center">
            Please contact administrator
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const pickAndUpload = async () => {
    if (!isEditing) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to photo library");
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

      if (!uploadedUrl) throw new Error("Upload failed");

      setImageUrl(uploadedUrl);
      Alert.alert("✅ Success", "Avatar updated successfully!");
    } catch (err: any) {
      console.error("❌ Upload error:", err);
      Alert.alert("Error", err.message || "Failed to upload image");
    }
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
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
        Alert.alert("✅ Success", "Changes saved successfully!");
      },
      onError: (err: any) => {
        Alert.alert("❌ Error", err.message || "Failed to save profile");
      },
    });
  };

  const handleCancel = () => {
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
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-dark-card border-b border-beige/30 dark:border-dark-border/30">
        <View className="flex-row items-center justify-between mb-4">
          {/* Left - Back Button */}
          <TouchableOpacity
            className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3"
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="arrow-left" size={20} color="#ACD6B8" />
          </TouchableOpacity>

          {/* Center - Title */}
          <View className="flex-1">
            <Text className="text-3xl font-bold text-light-text dark:text-dark-text">
              {isEditing ? "Edit Profile" : "My Profile"}
            </Text>
            <View className="flex-row items-center mt-2">
              <View className={`w-2 h-2 rounded-full ${isEditing ? 'bg-gold' : 'bg-mint dark:bg-gold'} mr-2`} />
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                {isEditing ? "Editing mode" : "View mode"}
              </Text>
            </View>
          </View>
          
          {/* Right - Mode Toggle Button */}
          <TouchableOpacity
            className={`w-12 h-12 rounded-xl items-center justify-center ${
              isEditing 
                ? 'bg-gold/20 dark:bg-gold/20' 
                : 'bg-mint/10 dark:bg-gold/10'
            }`}
            onPress={() => isEditing ? handleCancel() : setIsEditing(true)}
          >
            <FontAwesome 
              name={isEditing ? "times" : "pencil"} 
              size={20} 
              color={isEditing ? "#FFCB66" : "#ACD6B8"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section with Gradient Background */}
        <View className="relative">
          {/* Gradient Background */}
          <View className="h-48 bg-gradient-to-br from-mint/20 via-skyBlue/20 to-lavender/20 dark:from-gold/20 dark:via-lavender/20 dark:to-mint/20" />
          
          {/* Avatar Container */}
          <View className="absolute bottom-0 left-0 right-0 items-center -mb-16">
            <TouchableOpacity 
              onPress={pickAndUpload} 
              disabled={!isEditing}
              activeOpacity={0.8}
              className="relative"
            >
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  className="w-32 h-32 rounded-3xl border-4 border-white dark:border-dark-card shadow-2xl"
                />
              ) : (
                <View className="w-32 h-32 rounded-3xl bg-gradient-to-br from-mint to-skyBlue dark:from-gold dark:to-lavender items-center justify-center border-4 border-white dark:border-dark-card shadow-2xl">
                  <Text className="text-white text-5xl font-bold">
                    {fullName?.charAt(0)?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}
              
              {/* Camera Badge */}
              {isEditing && (
                <View className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-mint dark:bg-gold items-center justify-center border-4 border-white dark:border-dark-card shadow-lg">
                  <FontAwesome name="camera" size={18} color="white" />
                </View>
              )}
              
              {/* Upload Loading */}
              {isUploading && (
                <View className="absolute inset-0 w-32 h-32 rounded-3xl bg-black/60 items-center justify-center">
                  <ActivityIndicator size="large" color="white" />
                  <Text className="text-white text-xs mt-2 font-semibold">Uploading...</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Spacer */}
        <View className="h-20" />

        {/* Edit Hint */}
        {isEditing && (
          <View className="mx-6 mb-6 px-4 py-3 rounded-2xl bg-mint/10 dark:bg-gold/10 border border-mint/30 dark:border-gold/30">
            <View className="flex-row items-center">
              <FontAwesome name="info-circle" size={16} color="#ACD6B8" />
              <Text className="flex-1 ml-3 text-sm font-medium text-black dark:text-gold">
                Tap avatar to change photo
              </Text>
            </View>
          </View>
        )}

        {/* Form Sections */}
        <View className="px-6 gap-6">
          {/* Personal Info */}
          <FormSection icon="user" title="Personal Information">
            <Field
              icon="user-circle"
              label="Full Name"
              value={fullName}
              editable={isEditing}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              required
            />
            
            <Field
              icon="at"
              label="Username"
              value={userName}
              editable={isEditing}
              onChangeText={setUserName}
              placeholder="Enter username"
            />
          </FormSection>

          {/* Contact Info */}
          <FormSection icon="envelope" title="Contact Information">
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
              label="Phone Number"
              value={phoneNumber}
              editable={isEditing}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="0123456789"
            />
            
            <Field
              icon="map-marker"
              label="Address"
              value={address}
              editable={isEditing}
              onChangeText={setAddress}
              placeholder="Enter your address"
              multiline
            />
          </FormSection>

          {/* Additional Info */}
          <FormSection icon="calendar" title="Additional Information">
            <View>
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-lg bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
                  <FontAwesome name="birthday-cake" size={14} color="#ACD6B8" />
                </View>
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                  Date of Birth
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
                <View className={`w-10 h-10 rounded-xl items-center justify-center ${
                  isEditing ? 'bg-mint/10 dark:bg-gold/10' : 'bg-beige/30 dark:bg-dark-border/30'
                }`}>
                  <FontAwesome 
                    name="calendar" 
                    size={18} 
                    color={isEditing ? "#ACD6B8" : "#9CA3AF"} 
                  />
                </View>
                <Text className={`flex-1 ml-3 text-base ${
                  dateOfBirth 
                    ? "text-light-text dark:text-dark-text font-medium" 
                    : "text-light-textSecondary dark:text-dark-textSecondary"
                }`}>
                  {dateOfBirth
                    ? new Date(dateOfBirth).toLocaleDateString("en-US", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : "Select date of birth"}
                </Text>
                {isEditing && (
                  <FontAwesome name="chevron-right" size={14} color="#ACD6B8" />
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
          </FormSection>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View className="px-6 mt-8 gap-3">
            <TouchableOpacity
              className="bg-mint dark:bg-gold rounded-2xl py-4 shadow-lg active:opacity-80"
              onPress={handleSave}
              disabled={isPending || isUploading}
            >
              <View className="flex-row items-center justify-center">
                {isPending || isUploading ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Saving...</Text>
                  </>
                ) : (
                  <>
                    <FontAwesome name="check" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Save Changes</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white dark:bg-dark-card rounded-2xl py-4 border-2 border-coral active:opacity-80"
              onPress={handleCancel}
              disabled={isPending || isUploading}
            >
              <View className="flex-row items-center justify-center">
                <FontAwesome name="times" size={20} color="#F2A297" />
                <Text className="text-coral font-bold text-lg ml-2">Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ===================== COMPONENTS =====================

const FormSection = ({ 
  icon, 
  title, 
  children 
}: { 
  icon: any; 
  title: string; 
  children: React.ReactNode;
}) => (
  <View className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-beige/30 dark:border-dark-border/30 shadow-sm">
    {/* Section Header */}
    <View className="flex-row items-center mb-5 pb-3 border-b border-beige/30 dark:border-dark-border/30">
      <View className="w-10 h-10 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3">
        <FontAwesome name={icon} size={18} color="#ACD6B8" />
      </View>
      <Text className="text-lg font-bold text-light-text dark:text-dark-text">
        {title}
      </Text>
    </View>
    
    {/* Section Content */}
    <View className="gap-4">
      {children}
    </View>
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
    {/* Label */}
    <View className="flex-row items-center mb-2">
      <View className="w-8 h-8 rounded-lg bg-mint/10 dark:bg-gold/10 items-center justify-center mr-2">
        <FontAwesome name={icon} size={14} color="#ACD6B8" />
      </View>
      <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
        {label}
        {required && <Text className="text-coral"> *</Text>}
      </Text>
    </View>
    
    {/* Input */}
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
        <TouchableOpacity 
          onPress={() => onChangeText?.("")}
          className="w-8 h-8 rounded-lg bg-beige/30 dark:bg-dark-border/30 items-center justify-center ml-2"
        >
          <FontAwesome name="times" size={14} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);