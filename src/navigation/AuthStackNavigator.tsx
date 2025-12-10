import { EmailConfirmScreen } from "@/features/auth/screens/EmailConfirmScreen";
import { LoginScreen } from "@/features/auth/screens/LoginScreen";
import { RegisterScreen } from "@/features/auth/screens/RegisterScreen";
import { ResetPasswordConfirmScreen } from "@/features/auth/screens/ResetPasswordConfirmScreen";
import { ResetPasswordScreen } from "@/features/auth/screens/ResetPasswordScreen";
import { WelcomeScreen } from "@/features/auth/screens/WelcomeScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="EmailConfirm" component={EmailConfirmScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="ResetPasswordConfirm" component={ResetPasswordConfirmScreen} />
    </Stack.Navigator>
  );
}
