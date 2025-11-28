import { LinkingOptions } from "@react-navigation/native";

export const linking: LinkingOptions<any> = {
  prefixes: [
    "lecom://",
    "https://lecom-fe.vercel.app",
    "https://*.lecom-fe.vercel.app",
  ],
  config: {
    screens: {
      // Auth Stack
      Welcome: "welcome",
      Login: "login",
      Register: "register",

      // Drawer
      MainTabs: {
        screens: {
          // Home Tab
          Home: "home",

          // Courses Tab
          CoursesTab: {
            screens: {
              CourseList: "courses",
              CourseDetail: "courses/:courseId",
              VideoPlayer: "courses/:courseId/video/:videoId",
            },
          },
 OrdersTab: {
            screens: {
              OrdersMain: "orders",
              OrderDetail: "orders/:orderId",
            },
          },
          // Posts Tab
          PostsTab: {
            screens: {
              PostList: "posts",
              PostDetail: "posts/:postId",
            },
          },

          // Shop Tab
          ShopTab: {
            screens: {
              ShopMain: "shop",
              UpdateShop: "shop/edit",
              RegisterShop: "shop/register",
            },
          },

          // Profile Tab
          ProfileTab: {
            screens: {
              ProfileMain: "profile",
              EditProfile: "profile/edit",
              ChangePassword: "profile/change-password",
            },
          },
        },
      },

      // Drawer Items
      Settings: "settings",
      Help: "help",

      // Not Found
      NotFound: "*",
    },
  },
};
