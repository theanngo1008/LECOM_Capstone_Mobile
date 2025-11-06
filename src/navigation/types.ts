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
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// ==============================================
// COURSES STACK
// ==============================================
export type CoursesStackParamList = {
  CourseList: undefined;
  CourseDetail: {
    courseId: number;
    courseName: string;
  };
  VideoPlayer: {
    courseId: number;
    videoId: number;
    videoTitle: string;
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
// PROFILE STACK
// ==============================================
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
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
    productId: string;
    productName: string;
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


