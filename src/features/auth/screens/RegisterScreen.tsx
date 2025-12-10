import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthStackScreenProps } from "../../../navigation/types";
import { useRegister } from "../hooks/useRegister";

type Props = AuthStackScreenProps<"Register">;

export function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useRegister();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    return hasUpperCase && hasSpecialChar && isLongEnough;
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return !phone || phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ và tên");
      return;
    }

    if (fullName.trim().length < 2) {
      Alert.alert("Lỗi", "Họ và tên phải có ít nhất 2 ký tự");
      return;
    }

    if (!userName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên đăng nhập");
      return;
    }

    if (!validateUsername(userName)) {
      Alert.alert(
        "Lỗi",
        "Tên đăng nhập phải có 3-20 ký tự và chỉ chứa chữ cái, số và dấu gạch dưới"
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      Alert.alert("Lỗi", "Số điện thoại phải có 10-11 chữ số");
      return;
    }

    if (!password) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        "Lỗi",
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa và ký tự đặc biệt"
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    const isoDateOfBirth = dateOfBirth ? dateOfBirth.toISOString() : "";

    try {
      await register({
        fullName: fullName.trim(),
        userName: userName.trim(),
        email: email.trim(),
        dateOfBirth: isoDateOfBirth,
        password,
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      });
      Alert.alert("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.");
      navigation.navigate("Login");
    } catch (error: any) {
      Alert.alert("Đăng ký thất bại", error.message || "Đã xảy ra lỗi");
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Chọn ngày sinh";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-dark-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-8 pb-8">
            <View className="items-center mb-10">
              <View className="relative mb-6">
                <View className="w-28 h-28 rounded-full items-center justify-center bg-gradient-to-br from-mint/30 to-skyBlue/30 dark:from-gold/30 dark:to-lavender/30">
                  <View className="w-24 h-24 rounded-full bg-white/80 dark:bg-dark-card/80 items-center justify-center shadow-xl">
                    <Text className="text-5xl">✨</Text>
                  </View>
                </View>
                <View className="absolute -bottom-1 -right-1 w-9 h-9 bg-mint dark:bg-gold rounded-full items-center justify-center shadow-lg">
                  <FontAwesome name="user-plus" size={16} color="white" />
                </View>
              </View>

              <Text className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
                Tạo tài khoản
              </Text>
              <Text className="text-sm text-light-textSecondary dark:text-dark-textSecondary text-center px-4">
                Tham gia cùng chúng tôi để bắt đầu hành trình học tập
              </Text>
            </View>

            <View className="gap-5 mb-8">
              <View>
                <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-2 ml-1">
                  Họ và tên <Text className="text-coral">*</Text>
                </Text>
                <View className="relative">
                  <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                    <FontAwesome name="user" size={16} color="#9CA3AF" />
                  </View>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text pl-12 pr-4 py-4 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-2 ml-1">
                  Tên đăng nhập <Text className="text-coral">*</Text>
                </Text>
                <View className="relative">
                  <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                    <FontAwesome name="at" size={16} color="#9CA3AF" />
                  </View>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text pl-12 pr-4 py-4 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="nguyenvana (3-20 ký tự)"
                    placeholderTextColor="#9CA3AF"
                    value={userName}
                    onChangeText={setUserName}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-2 ml-1">
                  Email <Text className="text-coral">*</Text>
                </Text>
                <View className="relative">
                  <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                    <FontAwesome name="envelope" size={16} color="#9CA3AF" />
                  </View>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text pl-12 pr-4 py-4 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="example@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-2 ml-1">
                  Ngày sinh
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  disabled={isLoading}
                >
                  <View className="relative">
                    <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                      <FontAwesome name="calendar" size={16} color="#9CA3AF" />
                    </View>
                    <View className="bg-white dark:bg-dark-card pl-12 pr-4 py-4 rounded-2xl border-2 border-beige dark:border-dark-border">
                      <Text
                        className={
                          dateOfBirth
                            ? "text-light-text dark:text-dark-text"
                            : "text-gray-400"
                        }
                      >
                        {formatDate(dateOfBirth)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={dateOfBirth || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                  />
                )}
              </View>

              <View>
                <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-2 ml-1">
                  Số điện thoại
                </Text>
                <View className="relative">
                  <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                    <FontAwesome name="phone" size={16} color="#9CA3AF" />
                  </View>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text pl-12 pr-4 py-4 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="0123456789"
                    placeholderTextColor="#9CA3AF"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-2 ml-1">
                  Địa chỉ
                </Text>
                <View className="relative">
                  <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                    <FontAwesome name="map-marker" size={16} color="#9CA3AF" />
                  </View>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text pl-12 pr-4 py-4 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="123 Đường ABC, Quận XYZ"
                    placeholderTextColor="#9CA3AF"
                    value={address}
                    onChangeText={setAddress}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-2 ml-1">
                  Mật khẩu <Text className="text-coral">*</Text>
                </Text>
                <View className="relative">
                  <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                    <FontAwesome name="lock" size={16} color="#9CA3AF" />
                  </View>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text pl-12 pr-14 py-4 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="Ít nhất 8 ký tự, có chữ hoa và ký tự đặc biệt"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-0 bottom-0 justify-center z-10"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesome
                      name={showPassword ? "eye" : "eye-slash"}
                      size={16}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                {password && !validatePassword(password) && (
                  <Text className="text-xs text-coral mt-1 ml-1">
                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa và ký tự
                    đặc biệt
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-bold text-light-text dark:text-dark-text mb-2 ml-1">
                  Xác nhận mật khẩu <Text className="text-coral">*</Text>
                </Text>
                <View className="relative">
                  <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                    <FontAwesome name="lock" size={16} color="#9CA3AF" />
                  </View>
                  <TextInput
                    className="bg-white dark:bg-dark-card text-light-text dark:text-dark-text pl-12 pr-14 py-4 rounded-2xl border-2 border-beige dark:border-dark-border"
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-0 bottom-0 justify-center z-10"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <FontAwesome
                      name={showConfirmPassword ? "eye" : "eye-slash"}
                      size={16}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPassword && password !== confirmPassword && (
                  <Text className="text-xs text-coral mt-1 ml-1">
                    Mật khẩu xác nhận không khớp
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              className="rounded-2xl py-5 items-center justify-center shadow-lg active:scale-98 mb-8"
              onPress={handleRegister}
              disabled={isLoading}
              style={{
                backgroundColor: "#E3B967",
                shadowColor: "#E3B967",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {isLoading ? (
                <View className="flex-row items-center gap-3">
                  <View className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <Text className="text-black font-bold text-lg">
                    Đang tạo tài khoản...
                  </Text>
                </View>
              ) : (
                <Text className="text-gray-800 font-bold text-lg">
                  Đăng ký tài khoản mới
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center justify-center gap-2 mb-8">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-base">
                Đã có tài khoản?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                className="active:opacity-70"
              >
                <Text className="text-mint dark:text-gold font-bold text-base">
                  Đăng nhập
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-center text-light-textSecondary dark:text-dark-textSecondary px-8 mb-6">
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <Text className="text-mint dark:text-gold font-semibold">
                Điều khoản dịch vụ
              </Text>{" "}
              và{" "}
              <Text className="text-mint dark:text-gold font-semibold">
                Chính sách bảo mật
              </Text>
            </Text>

            <View className="items-center pb-4">
              <Text className="text-light-textSecondary dark:text-dark-textSecondary text-xs opacity-60">
                LECOM v1.0.0
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
