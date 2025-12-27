import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { DrawerScreenProps as RNDrawerScreenProps } from "@react-navigation/drawer";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// ==============================================
// AUTH STACK
// ==============================================
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  EmailConfirm: undefined;
  ResetPassword: undefined;
  ResetPasswordConfirm: {
    email?: string;
    token?: string;
  }
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// ==============================================
// COURSES STACK
// ==============================================
export type CoursesStackParamList = {
  CoursesList: undefined;
  CourseDetail: {
    slug: string;
  };
  LessonPlayer: {
    courseId: string;
    courseTitle: string;
    sectionId: string;
};
ProductDetail: {
    slug: string;
  };
};
export type CoursesStackScreenProps<T extends keyof CoursesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<CoursesStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList>,
      RNDrawerScreenProps<DrawerParamList>
    >
  >;

// ==============================================
// HOME STACK
// ==============================================
export type HomeStackParamList = {
  HomeMain: undefined;
  CourseDetail: {
    slug: string;
  };
  ProductDetail: {
    slug: string;
  };
  CartMain: undefined;
  Checkout: undefined;
  ChatDetail: {
    conversationId: string;
    isAIChat?: boolean;
  };
  OrdersMain: undefined;
  OrderDetail: {
    orderId: string;
  };
};

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList>,
      RNDrawerScreenProps<DrawerParamList>
    >
  >;

// ==============================================
// PROFILE STACK
// ==============================================
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  WalletMain: undefined;
  WalletTransactions: undefined;
  MissionsMain: undefined;
  RewardsStore: undefined;
  MyVouchers: undefined;  
  Leaderboard: undefined;
  Achievements: undefined;
  MyEnrollments: undefined;
};

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList>,
      RNDrawerScreenProps<DrawerParamList>
    >
  >;

// ==============================================
// POSTS STACK (TanStack Query Demo)
// ==============================================
export type PostsStackParamList = {
  PostList: undefined;
  PostDetail: {
    postId: number;
  };
};

export type PostsStackScreenProps<T extends keyof PostsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<PostsStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList>,
      RNDrawerScreenProps<DrawerParamList>
    >
  >;

// ==============================================
// SHOP STACK
// ==============================================
export type ShopStackParamList = {
  ShopMain: undefined;
  UpdateShop: undefined;
  RegisterShop: undefined;
  ShopProductsMain: undefined;
  CreateShopProduct: undefined;
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
  ShopOrderDetail: {
    orderId: string;
  };
  SellerChatList: undefined;
  ChatDetail: {
    conversationId: string;
    isAIChat?: boolean;
  };
  ShopWalletMain: undefined;
  ShopWalletTransactions: undefined;
  ShopWithdrawals: undefined;
  ShopDashboard: undefined;
  ShopRefundsMain: undefined;
  ShopFeedbackMain: undefined;
  ShopSetting: undefined;
};
export type ShopStackScreenProps<T extends keyof ShopStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ShopStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList>,
      RNDrawerScreenProps<DrawerParamList>
    >
  >;

// ==============================================
// MAIN TAB NAVIGATOR
// ==============================================
export type MainTabParamList = {
  Home: undefined;
  CoursesTab: undefined;
  PostsTab: undefined;
  ShopTab: undefined; // ✅ Add Shop tab
  ProfileTab: undefined;
  CartMain: undefined;
  Checkout: undefined;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RNDrawerScreenProps<DrawerParamList>
  >;

// ==============================================
// DRAWER NAVIGATOR
// ==============================================
export type DrawerParamList = {
  MainTabs: undefined;
  Settings: undefined;
  Help: undefined;
  ShopStack: undefined;
  OrdersMain: undefined;
  ChatList: undefined; 
  CommunityList: undefined;
  WalletMain: undefined;
};

export type DrawerScreenProps<T extends keyof DrawerParamList> =
  RNDrawerScreenProps<DrawerParamList, T>;

// ==============================================
// ROOT NAVIGATOR
// ==============================================
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// ==============================================
// DECLARE GLOBAL TYPE
// ==============================================
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// ==============================================
// PRODUCTS STACK
// ==============================================
export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductDetail: {
    slug: string;
  };
  ShopDetail: {
    shopId: number;
  };
  CourseDetail: {
    slug: string;
  };
  CartMain: undefined;
  Checkout: undefined;
  CartProductDetail: {
    productId: string;       
  };
  ChatDetail: {
    conversationId: string;
    isAIChat?: boolean;
  };
    OrdersMain: undefined;
  OrderDetail: {
    orderId: string;
  };
};

export type ProductsStackScreenProps<T extends keyof ProductsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProductsStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList>,
      RNDrawerScreenProps<DrawerParamList>
    >
  >;


// ==============================================
// ORDERS STACK
// ==============================================
export type OrdersStackParamList = {
  OrdersMain: undefined;
  OrderDetail: {
    orderId: string;
  };
  CheckoutSuccess: {
    orderId?: string;
  };
  CustomerRefunds: undefined;
};

export type OrdersStackScreenProps<T extends keyof OrdersStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<OrdersStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList>,
      RNDrawerScreenProps<DrawerParamList>
    >
  >;

// ==============================================
// CHAT STACK
// ==============================================
export type ChatStackParamList = {
  ChatList: undefined;
  ChatDetail: {
    conversationId: string;
    isAIChat?: boolean;
  };
  StartChat?: {
    productId?: string;
    productSlug?: string;
  };
  SellerChatList: undefined;
};

// ==============================================
// CART STACK
// ==============================================
export type CartStackParamList = {
  CartMain: undefined;
  Checkout: undefined;
  CartProductDetail: {
    productId: string;
  };
};

export type CartStackScreenProps<T extends keyof CartStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<CartStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList>,
      RNDrawerScreenProps<DrawerParamList>
    >
  >;

export type ChatStackScreenProps<T extends keyof ChatStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ChatStackParamList, T>,
    RNDrawerScreenProps<DrawerParamList>
  >;

  // ==============================================
// COMMUNITY STACK
// ==============================================
export type CommunityStackParamList = {
  CommunityList: undefined;
  CreateCommunityPost: undefined;
  PostDetail: {
    postId: string;
  };
};

export type CommunityStackScreenProps<
  T extends keyof CommunityStackParamList
> = CompositeScreenProps<
  NativeStackScreenProps<CommunityStackParamList, T>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList>,
    RNDrawerScreenProps<DrawerParamList>
  >
>;
// ==============================================
// WALLET STACK
// ==============================================
export type WalletStackParamList = {
  WalletMain: undefined;
  Withdrawals: undefined;
};

export type WalletStackScreenProps<T extends keyof WalletStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<WalletStackParamList, T>,
    RNDrawerScreenProps<DrawerParamList>
  >;