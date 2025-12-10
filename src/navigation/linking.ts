import { LinkingOptions } from "@react-navigation/native";

export const linking: LinkingOptions<any> = {
  prefixes: [
    "lecom://",
    "https://lecom-fe.vercel.app",
  ],

  config: {
    screens: {
      // ============================
      // AUTH STACK
      // ============================
      Welcome: "welcome",
      Login: "login",
      Register: "register",

      EmailConfirm: {
        path: "auth/email-confirmed",
      },

      ResetPasswordConfirm: {
        path: "auth/reset-password",
        parse: {
          email: (value: string) => value,
          token: (value: string) => value,
        },
      },

      // ============================
      // MAIN TABS
      // ============================
      MainTabs: {
        screens: {
          // HOME → match "/" và "home"
          Home: {
            path: "", // 👈 match root: /
            screens: ["home"],
          },

          // COURSES TAB
          CoursesTab: {
            screens: {
              CourseList: "courses",
              CourseDetail: "courses/:courseId",
              VideoPlayer: "courses/:courseId/video/:videoId",
            },
          },

          // ORDERS TAB
          OrdersTab: {
            screens: {
              OrdersMain: "orders",
              OrderDetail: "orders/:orderId",
            },
          },

          // POSTS TAB
          PostsTab: {
            screens: {
              PostList: "posts",
              PostDetail: "posts/:postId",
            },
          },

          // SHOP TAB
          ShopTab: {
            screens: {
              ShopMain: "shop",
              UpdateShop: "shop/edit",
              RegisterShop: "shop/register",
            },
          },

          // PROFILE TAB
          ProfileTab: {
            screens: {
              ProfileMain: "profile",
              EditProfile: "profile/edit",
              ChangePassword: "profile/change-password",
            },
          },
        },
      },

      // ============================
      // DRAWER (nếu có)
      // ============================
      Settings: "settings",
      Help: "help",

      // ============================
      // WILDCARD
      // ============================
      NotFound: "*",
    },
  },
};
