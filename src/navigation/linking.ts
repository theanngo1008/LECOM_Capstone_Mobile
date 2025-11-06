import { LinkingOptions } from "@react-navigation/native";

export const linking: LinkingOptions<any> = {
  prefixes: [
    "coursehub://",
    "https://coursehub.app",
    "https://*.coursehub.app",
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

          // Posts Tab
          PostsTab: {
            screens: {
              PostList: "posts",
              PostDetail: "posts/:postId",
            },
          },

          // Shop Tab ✅
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