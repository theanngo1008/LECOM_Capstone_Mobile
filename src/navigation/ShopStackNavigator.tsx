import { ChatDetailScreen } from "@/features/chat/screens/ChatDetailScreen";
import { SellerChatListScreen } from "@/features/chat/screens/SellerChatListScreen";
import { CreateShopCourseScreen } from "@/features/shopCourses/screens/CreateShopCourseScreen";
import { ShopCourseDetailScreen } from "@/features/shopCourses/screens/ShopCourseDetailScreen";
import { ShopCoursesScreen } from "@/features/shopCourses/screens/ShopCoursesScreen";
import { ShopOrdersScreen } from "@/features/shopOrders/screens/ShopOrdersScreen";
import { CreateShopProductScreen } from "@/features/shopProducts/screens/CreateShopProductScreen";
import { EditProductScreen } from "@/features/shopProducts/screens/EditProductScreen";
import { ProductDetailScreen } from "@/features/shopProducts/screens/ShopProductDetailScreen";
import { ShopWalletScreen } from "@/features/shopWallet/screens/ShopWalletScreen";
import { ShopWalletTransactionsScreen } from "@/features/shopWallet/screens/ShopWalletTransactionsScreen";
import { ShopWithdrawalsScreen } from "@/features/shopWallet/screens/ShopWithdrawalsScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ShopRegisterScreen } from "../features/shop/screens/ShopRegisterScreen";
import { ShopScreen } from "../features/shop/screens/ShopScreen";
import { UpdateShopScreen } from "../features/shop/screens/ShopUpdateScreen";
import { ShopProductsScreen } from "../features/shopProducts/screens/ShopProductsScreen";
export type ShopStackParamList = {
  ShopMain: undefined;
  UpdateShop: undefined;
  RegisterShop: undefined;
  ShopProductsMain: undefined;
  CreateShopProduct: undefined; // <-- thêm route
  EditShopProduct: {
    productId: string;
  };
  ShopProductDetail: {
    productId: string;
  };
  ShopCoursesMain: undefined;
  CreateShopCourse: undefined;
  ShopCourseDetail: {
    courseId: string;
  };
  ShopOrdersMain: undefined;
  SellerChatList: undefined;
  ChatDetail: {
    conversationId: string;
  };
  ShopWalletMain: undefined;
  ShopWalletTransactions: undefined;  
  ShopWithdrawals: undefined;
};

const Stack = createNativeStackNavigator<ShopStackParamList>();

export function ShopStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="ShopMain"
        component={ShopScreen}
        options={{ title: "My Shop" }}
      />
       <Stack.Screen
        name="ShopCoursesMain"
        component={ShopCoursesScreen}
        options={{ title: "Shop Courses", presentation: "card" }}
      />

      <Stack.Screen
        name="UpdateShop"
        component={UpdateShopScreen}
        options={{ title: "Edit Shop", presentation: "modal" }}
      />

      <Stack.Screen
        name="RegisterShop"
        component={ShopRegisterScreen}
        options={{ title: "Register Shop", presentation: "modal" }}
      />

      <Stack.Screen
        name="ShopProductsMain"
        component={ShopProductsScreen}
        options={{ title: "Shop Products", presentation: "card" }}
      />

      <Stack.Screen
        name="CreateShopProduct" 
        component={CreateShopProductScreen}
        options={{ title: "Create Product", presentation: "modal" }}
      />

      <Stack.Screen
        name="EditShopProduct"
        component={EditProductScreen}
        options={{ title: "Edit Product", presentation: "modal" }}
      />

      <Stack.Screen
        name="ShopProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Product Detail", presentation: "modal" }}
      />
<Stack.Screen
        name="CreateShopCourse" 
        component={CreateShopCourseScreen}
        options={{ title: "Create Course", presentation: "modal" }}
      />
      <Stack.Screen
        name="ShopCourseDetail"
        component={ShopCourseDetailScreen}
        options={{ title: "Course Detail", presentation: "modal" }}
      />
      <Stack.Screen
        name="ShopOrdersMain"
        component={ShopOrdersScreen}
        options={{ title: "Shop Orders", presentation: "card" }}
      />
       <Stack.Screen
        name="SellerChatList"
        component={SellerChatListScreen}
        options={{ title: "Seller Chat", presentation: "card" }}
      />
        <Stack.Screen
              name="ChatDetail"
              component={ChatDetailScreen}
              options={{
                title: "Chat",
              }}
            />
      <Stack.Screen
        name="ShopWalletMain"
        component={ShopWalletScreen} 
        options={{ title: "Shop Wallet", presentation: "card" }}
      />
      <Stack.Screen
        name="ShopWalletTransactions"
        component={ShopWalletTransactionsScreen}
        options={{ title: "Wallet Transactions", presentation: "card" }}
      />
      <Stack.Screen
        name="ShopWithdrawals"
        component={ShopWithdrawalsScreen}
        options={{ title: "Withdrawals", presentation: "card" }}
      />
    </Stack.Navigator>
  );
}
