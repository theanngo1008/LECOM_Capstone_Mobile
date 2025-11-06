# 📚 LÝ THUYẾT BUỔI 2 - React Navigation Nâng Cao

## 🎯 Mục tiêu buổi học

Sau buổi học này, bạn sẽ:

- ✅ Hiểu và sử dụng được 3 loại Navigator (Stack, Tab, Drawer)
- ✅ Kết hợp nhiều Navigator với nhau (Nested Navigation)
- ✅ Truyền dữ liệu giữa các màn hình
- ✅ Tùy chỉnh Header và Animation
- ✅ Tạo Deep Linking và Dynamic Routes
- ✅ Tổ chức code theo Feature-based pattern

---

## 📖 PHẦN 1: REACT NAVIGATION LÀ GÌ?

### 🤔 Giải thích cho trẻ 12 tuổi

**Tưởng tượng app của bạn là một ngôi nhà:**

- **Các màn hình (Screens)** = Các phòng trong nhà
- **Navigation** = Cách bạn di chuyển giữa các phòng
- **Navigator** = Hệ thống cửa và hành lang giúp bạn đi lại

**Ví dụ thực tế:**

- 🏠 **Stack Navigator**: Như đi từ phòng khách → phòng ngủ → nhà tắm. Bạn có thể quay lại phòng trước đó.
- 📱 **Tab Navigator**: Như có 5 phòng cùng tầng, bạn có thể nhảy qua bất kỳ phòng nào.
- 🗂️ **Drawer Navigator**: Như mở ngăn kéo ra chọn phòng muốn đến.

---

## 📖 PHẦN 2: 3 LOẠI NAVIGATOR CƠ BẢN

### 1️⃣ Stack Navigator (Điều hướng chồng)

**Là gì?**

- Màn hình mới xuất hiện từ bên phải (iOS) hoặc từ dưới lên (Android)
- Có nút "Back" để quay lại màn hình trước
- Giống như một chồng thẻ bài

**Khi nào dùng?**

- ✅ Xem chi tiết sản phẩm
- ✅ Đăng nhập → Đăng ký
- ✅ Danh sách → Chi tiết → Chỉnh sửa

**Ví dụ thực tế:**

```
[Trang chủ] → [Chi tiết khóa học] → [Video bài giảng]
    ↑              ↑                      ↑
  Có thể quay lại  Có thể quay lại     Có thể quay lại
```

**Code cơ bản:**

```typescript
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}
```

**Cách di chuyển:**

```typescript
// Đi đến màn hình Details
navigation.navigate("Details");

// Quay lại màn hình trước
navigation.goBack();

// Quay về màn hình đầu tiên
navigation.popToTop();
```

---

### 2️⃣ Tab Navigator (Điều hướng thanh tab)

**Là gì?**

- Có thanh tab ở dưới (iOS) hoặc trên (Android)
- Chuyển màn hình bằng cách nhấn vào tab
- Giống như các tab trong trình duyệt

**Khi nào dùng?**

- ✅ Màn hình chính của app (Home, Search, Profile...)
- ✅ Các tính năng quan trọng, hay dùng
- ✅ Cần truy cập nhanh giữa các phần

**Ví dụ thực tế:**

```
┌────────────────────────────────────┐
│        Nội dung màn hình          │
│                                    │
└────────────────────────────────────┘
[🏠 Trang chủ] [🔍 Tìm kiếm] [👤 Cá nhân]
```

**Code cơ bản:**

```typescript
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

**Tùy chỉnh icon:**

```typescript
<Tab.Screen
  name="Home"
  component={HomeScreen}
  options={{
    tabBarIcon: ({ color, size }) => (
      <Icon name="home" color={color} size={size} />
    ),
  }}
/>
```

---

### 3️⃣ Drawer Navigator (Điều hướng ngăn kéo)

**Là gì?**

- Menu trượt từ bên trái (hoặc phải)
- Phải vuốt hoặc nhấn nút để mở
- Giống như ngăn kéo trong tủ

**Khi nào dùng?**

- ✅ Menu phụ, không cần truy cập thường xuyên
- ✅ Cài đặt, Hỗ trợ, Giới thiệu
- ✅ Nhiều mục menu (>5 mục)

**Ví dụ thực tế:**

```
┌──────────┐ ┌─────────────────────┐
│ 🏠 Home  │ │   Nội dung màn hình│
│ ⚙️ Settings│←│                    │
│ 📧 Contact│ │                    │
│ ℹ️ About  │ │                    │
└──────────┘ └─────────────────────┘
   Drawer          Main Content
```

**Code cơ bản:**

```typescript
import { createDrawerNavigator } from "@react-navigation/drawer";

const Drawer = createDrawerNavigator();

function MyDrawer() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}
```

**Cách mở Drawer:**

```typescript
// Mở drawer
navigation.openDrawer();

// Đóng drawer
navigation.closeDrawer();

// Toggle (đóng/mở)
navigation.toggleDrawer();
```

---

## 📖 PHẦN 3: NESTED NAVIGATION (NAVIGATOR LỒNG NHAU)

### 🤔 Nested Navigation là gì?

**Giải thích đơn giản:**
Đặt một Navigator bên trong Navigator khác. Giống như:

- 🏢 Tòa nhà (Drawer Navigator)
  - 🏠 Mỗi tầng (Tab Navigator)
    - 🚪 Mỗi phòng (Stack Navigator)

**Ví dụ thực tế - App Facebook:**

```
Drawer Navigator (Menu chính)
├── Tab Navigator (Bottom tabs)
│   ├── Home Tab (Stack)
│   │   ├── Feed
│   │   └── Post Detail
│   ├── Videos Tab (Stack)
│   │   ├── Videos List
│   │   └── Video Player
│   └── Profile Tab (Stack)
│       ├── Profile View
│       └── Edit Profile
└── Settings (Screen riêng)
```

### 📊 So sánh các mô hình phổ biến

#### Model 1: Tab bên trong Stack

```
Stack Navigator (Chính)
├── Login Screen
├── Tab Navigator
│   ├── Home Tab
│   ├── Search Tab
│   └── Profile Tab
└── Details Screen
```

**Khi nào dùng:** Login → Tab → Chi tiết
**Ứng dụng:** E-commerce, Social media

#### Model 2: Stack bên trong Tab

```
Tab Navigator (Chính)
├── Home Tab (Stack)
│   ├── Home Screen
│   └── Details Screen
├── Search Tab (Stack)
│   ├── Search Screen
│   └── Results Screen
└── Profile Tab (Stack)
    ├── Profile Screen
    └── Edit Screen
```

**Khi nào dùng:** Mỗi tab có flow riêng
**Ứng dụng:** App học tập, App tin tức

#### Model 3: Drawer → Tab → Stack

```
Drawer Navigator (Menu)
├── Tab Navigator (Main)
│   ├── Home Tab (Stack)
│   ├── Course Tab (Stack)
│   └── Profile Tab (Stack)
├── Settings Screen
└── About Screen
```

**Khi nào dùng:** App phức tạp, nhiều tính năng
**Ứng dụng:** App doanh nghiệp, LMS

---

## 📖 PHẦN 4: TRUYỀN PARAMS GIỮA CÁC SCREENS

### 🎯 Params là gì?

**Giải thích đơn giản:**
Params = Dữ liệu bạn mang theo khi chuyển màn hình.
Giống như khi đi chơi nhà bạn, bạn mang theo quà tặng.

### 📤 Cách gửi params

**Cách 1: Navigate với params**

```typescript
// Gửi 1 param
navigation.navigate("Details", { id: 123 });

// Gửi nhiều params
navigation.navigate("Details", {
  id: 123,
  title: "React Native",
  price: 99000,
});
```

**Cách 2: Push với params (Stack Navigator)**

```typescript
navigation.push("Details", { id: 456 });
```

### 📥 Cách nhận params

**Cách 1: Từ route.params**

```typescript
function DetailsScreen({ route }) {
  const { id, title, price } = route.params;

  return (
    <View>
      <Text>ID: {id}</Text>
      <Text>Tên: {title}</Text>
      <Text>Giá: {price}</Text>
    </View>
  );
}
```

**Cách 2: Với default value**

```typescript
function DetailsScreen({ route }) {
  const { id = 0, title = "Không có tên" } = route.params || {};

  return <Text>{title}</Text>;
}
```

**Cách 3: TypeScript (an toàn hơn)**

```typescript
type RootStackParamList = {
  Details: { id: number; title: string };
};

function DetailsScreen({
  route,
}: NativeStackScreenProps<RootStackParamList, "Details">) {
  const { id, title } = route.params;
  return <Text>{title}</Text>;
}
```

### 🔄 Update params

```typescript
// Cập nhật params của màn hình hiện tại
navigation.setParams({ id: 999 });

// Params sẽ merge với params cũ
```

### 📊 Ví dụ thực tế - App Khóa học

```typescript
// CourseListScreen.tsx
function CourseListScreen({ navigation }) {
  const courses = [
    { id: 1, title: "React Native", price: 99000 },
    { id: 2, title: "JavaScript", price: 79000 },
  ];

  return (
    <View>
      {courses.map((course) => (
        <TouchableOpacity
          key={course.id}
          onPress={() =>
            navigation.navigate("CourseDetail", {
              courseId: course.id,
              courseName: course.title,
              coursePrice: course.price,
            })
          }
        >
          <Text>{course.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// CourseDetailScreen.tsx
function CourseDetailScreen({ route, navigation }) {
  const { courseId, courseName, coursePrice } = route.params;

  return (
    <View>
      <Text>Khóa học: {courseName}</Text>
      <Text>Giá: {coursePrice.toLocaleString("vi-VN")}đ</Text>

      <Button
        title="Xem Video"
        onPress={() =>
          navigation.navigate("VideoPlayer", {
            courseId,
            videoTitle: "Bài 1: Giới thiệu",
          })
        }
      />
    </View>
  );
}
```

---

## 📖 PHẦN 5: CUSTOM HEADER (TÙY CHỈNH THANH TIÊU ĐỀ)

### 🎨 Các cách tùy chỉnh Header

### 1️⃣ Thay đổi tiêu đề

**Cách 1: Static title**

```typescript
<Stack.Screen
  name="Home"
  component={HomeScreen}
  options={{ title: "Trang chủ" }}
/>
```

**Cách 2: Dynamic title**

```typescript
<Stack.Screen
  name="Details"
  component={DetailsScreen}
  options={({ route }) => ({
    title: route.params.courseName,
  })}
/>
```

**Cách 3: Từ component**

```typescript
function HomeScreen({ navigation }) {
  useEffect(() => {
    navigation.setOptions({ title: "Trang chủ mới" });
  }, []);
}
```

### 2️⃣ Thêm nút vào Header

**Header Left (nút trái):**

```typescript
options={{
  headerLeft: () => (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Icon name="arrow-back" size={24} />
    </TouchableOpacity>
  )
}}
```

**Header Right (nút phải):**

```typescript
options={{
  headerRight: () => (
    <TouchableOpacity onPress={() => console.log('Menu')}>
      <Icon name="menu" size={24} />
    </TouchableOpacity>
  )
}}
```

**Nhiều nút:**

```typescript
options={{
  headerRight: () => (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <TouchableOpacity onPress={() => {}}>
        <Icon name="search" size={24} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {}}>
        <Icon name="notifications" size={24} />
      </TouchableOpacity>
    </View>
  )
}}
```

### 3️⃣ Tùy chỉnh màu sắc

```typescript
options={{
  headerStyle: {
    backgroundColor: '#007AFF',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
}}
```

### 4️⃣ Custom Header hoàn toàn

```typescript
options={{
  header: ({ navigation, route }) => (
    <View className="bg-primary-light dark:bg-primary-dark p-4">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">
          {route.params.title}
        </Text>
        <TouchableOpacity onPress={() => {}}>
          <Icon name="share" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}}
```

### 5️⃣ Ẩn Header

```typescript
options={{ headerShown: false }}
```

### 6️⃣ Header với Theme

```typescript
function MyStack() {
  const { colors, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}
```

---

## 📖 PHẦN 6: ANIMATION TRANSITIONS (HIỆU ỨNG CHUYỂN ĐỔI)

### 🎬 Các loại Animation có sẵn

### 1️⃣ Stack Animation

**Slide từ phải (mặc định iOS):**

```typescript
<Stack.Navigator
  screenOptions={{
    animation: 'slide_from_right'
  }}
>
```

**Slide từ dưới (mặc định Android):**

```typescript
screenOptions={{
  animation: 'slide_from_bottom'
}}
```

**Fade (mờ dần):**

```typescript
screenOptions={{
  animation: 'fade'
}}
```

**Flip (lật):**

```typescript
screenOptions={{
  animation: 'flip'
}}
```

**None (không có):**

```typescript
screenOptions={{
  animation: 'none'
}}
```

### 2️⃣ Custom Animation với transitionSpec

```typescript
<Stack.Navigator
  screenOptions={{
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        },
      },
    },
  }}
>
```

### 3️⃣ Custom Animation phức tạp

**Zoom In:**

```typescript
screenOptions={{
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
        opacity: current.progress,
      },
    };
  },
}}
```

**Slide + Fade:**

```typescript
cardStyleInterpolator: ({ current, layouts }) => ({
  cardStyle: {
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width, 0],
        }),
      },
    ],
    opacity: current.progress,
  },
});
```

### 4️⃣ Gestures (Cử chỉ)

**Vuốt để quay lại:**

```typescript
screenOptions={{
  gestureEnabled: true,
  gestureDirection: 'horizontal',
}}
```

**Tùy chỉnh gesture:**

```typescript
screenOptions={{
  gestureResponseDistance: 100, // Khoảng cách để kích hoạt
  gestureVelocityImpact: 0.3,   // Độ nhạy
}}
```

---

## 📖 PHẦN 7: DEEP LINKING (LIÊN KẾT SÂU)

### 🔗 Deep Linking là gì?

**Giải thích đơn giản:**
Deep Linking = Mở app và đi thẳng đến màn hình cụ thể bằng URL.

**Ví dụ thực tế:**

- Click link `myapp://course/123` → Mở app → Xem khóa học ID 123
- Click link `myapp://profile/john` → Mở app → Xem profile của John

### 🛠️ Cấu hình Deep Linking

**Bước 1: Cấu hình trong app.json (Expo)**

```json
{
  "expo": {
    "scheme": "coursehub",
    "ios": {
      "bundleIdentifier": "com.yourcompany.coursehub",
      "associatedDomains": ["applinks:coursehub.com"]
    },
    "android": {
      "package": "com.yourcompany.coursehub",
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "coursehub",
              "host": "*"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

**Bước 2: Cấu hình Linking**

```typescript
import { LinkingOptions } from "@react-navigation/native";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["coursehub://", "https://coursehub.com"],
  config: {
    screens: {
      Home: "",
      CourseDetail: "course/:id",
      Profile: "profile/:username",
      Video: "course/:courseId/video/:videoId",
    },
  },
};

function App() {
  return (
    <NavigationContainer linking={linking}>
      <RootStack />
    </NavigationContainer>
  );
}
```

### 📱 Các loại URL

**1. App Scheme (Custom URL):**

```
coursehub://course/123
coursehub://profile/john
coursehub://video/456
```

**2. Universal Links (iOS) / App Links (Android):**

```
https://coursehub.com/course/123
https://coursehub.com/profile/john
```

### 🎯 Ví dụ thực tế

```typescript
// Cấu hình
const linking = {
  prefixes: ["coursehub://", "https://coursehub.com"],
  config: {
    screens: {
      Home: "",
      CourseDetail: {
        path: "course/:id",
        parse: {
          id: (id: string) => parseInt(id, 10),
        },
      },
      VideoPlayer: {
        path: "course/:courseId/video/:videoId",
        parse: {
          courseId: Number,
          videoId: Number,
        },
      },
    },
  },
};

// Khi user click: coursehub://course/123
// App sẽ navigate đến CourseDetail với params: { id: 123 }

// Khi user click: coursehub://course/5/video/10
// App sẽ navigate đến VideoPlayer với params: { courseId: 5, videoId: 10 }
```

### 🔍 Nhận Deep Link trong component

```typescript
import { useEffect } from "react";
import { Linking } from "react-native";

function HomeScreen() {
  useEffect(() => {
    // Lấy initial URL (khi app mở từ link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("Opened from:", url);
      }
    });

    // Lắng nghe URL khi app đang mở
    const subscription = Linking.addEventListener("url", ({ url }) => {
      console.log("New URL:", url);
    });

    return () => subscription.remove();
  }, []);
}
```

---

## 📖 PHẦN 8: DYNAMIC ROUTING (ĐỊNH TUYẾN ĐỘNG)

### 🎯 Dynamic Routing là gì?

**Giải thích:**
Tạo routes dựa trên dữ liệu động, không hard-code tên màn hình.

### 📊 Ví dụ: Tabs động

```typescript
function DynamicTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />

      {/* Chỉ hiện khi user đã login */}
      {user && <Tab.Screen name="MyCourses" component={MyCoursesScreen} />}

      {/* Chỉ hiện khi user là admin */}
      {user?.role === "admin" && (
        <Tab.Screen name="Admin" component={AdminScreen} />
      )}

      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

### 🗂️ Routes từ API

```typescript
function DynamicStack() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch categories từ API
    fetch("https://api.example.com/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* Tạo màn hình cho mỗi category */}
      {categories.map((category) => (
        <Stack.Screen
          key={category.id}
          name={`Category${category.id}`}
          component={CategoryScreen}
          options={{ title: category.name }}
          initialParams={{ categoryId: category.id }}
        />
      ))}
    </Stack.Navigator>
  );
}
```

### 🎯 Conditional Navigation

```typescript
function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        // Màn hình khi đã đăng nhập
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="CourseDetail" component={CourseDetail} />
        </>
      ) : (
        // Màn hình khi chưa đăng nhập
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
```

---

## 📖 PHẦN 9: CẤU TRÚC THƯ MỤC DỰ ÁN

### 🗂️ Feature-based Structure (Khuyến nghị)

**Ý tưởng:** Nhóm code theo tính năng, không theo loại file.

```
src/
├── features/                    # Các tính năng chính
│   ├── auth/                    # Tính năng xác thực
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SocialLoginButtons.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── store/
│   │   │   └── authStore.ts
│   │   └── types/
│   │       └── auth.types.ts
│   │
│   ├── courses/                 # Tính năng khóa học
│   │   ├── screens/
│   │   │   ├── CourseListScreen.tsx
│   │   │   ├── CourseDetailScreen.tsx
│   │   │   └── VideoPlayerScreen.tsx
│   │   ├── components/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── VideoList.tsx
│   │   │   └── CourseReviews.tsx
│   │   ├── hooks/
│   │   │   ├── useCourses.ts
│   │   │   └── useVideoPlayer.ts
│   │   ├── store/
│   │   │   └── courseStore.ts
│   │   └── types/
│   │       └── course.types.ts
│   │
│   ├── profile/                 # Tính năng hồ sơ
│   │   ├── screens/
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── EditProfileScreen.tsx
│   │   ├── components/
│   │   │   └── ProfileStats.tsx
│   │   └── hooks/
│   │       └── useProfile.ts
│   │
│   └── home/                    # Tính năng trang chủ
│       ├── screens/
│       │   └── HomeScreen.tsx
│       └── components/
│           ├── FeaturedCourses.tsx
│           └── Categories.tsx
│
├── navigation/                  # Cấu hình navigation
│   ├── RootNavigator.tsx       # Navigator gốc
│   ├── MainTabNavigator.tsx    # Tab chính
│   ├── AuthStackNavigator.tsx  # Stack đăng nhập
│   └── types.ts                # TypeScript types cho navigation
│
├── components/                  # Components dùng chung
│   ├── ui/                     # UI cơ bản
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── layout/                 # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Container.tsx
│   └── theme/
│       ├── ThemeToggle.tsx
│       └── ThemedButton.tsx
│
├── hooks/                       # Hooks dùng chung
│   ├── useTheme.ts
│   ├── useAuth.ts
│   └── useApi.ts
│
├── store/                       # Global state
│   ├── themeStore.ts
│   └── appStore.ts
│
├── services/                    # Services/API
│   ├── api/
│   │   ├── axios.config.ts
│   │   ├── auth.api.ts
│   │   └── courses.api.ts
│   └── storage/
│       └── storage.service.ts
│
├── utils/                       # Utilities
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
│
├── constants/                   # Constants
│   ├── colors.ts
│   ├── config.ts
│   └── routes.ts
│
├── types/                       # Global TypeScript types
│   ├── global.d.ts
│   └── api.types.ts
│
└── assets/                      # Static assets
    ├── images/
    ├── fonts/
    └── icons/
```

### 📝 Giải thích cấu trúc

**1. features/** - Mỗi folder = 1 tính năng

- ✅ Dễ tìm code liên quan
- ✅ Dễ xóa/thêm tính năng
- ✅ Team có thể làm việc song song

**2. navigation/** - Tất cả về điều hướng

- Navigator configs
- Route types
- Deep linking config

**3. components/** - Components dùng chung

- UI cơ bản (Button, Input...)
- Layout (Header, Container...)
- Theme components

**4. services/** - Logic nghiệp vụ

- API calls
- Storage
- External services

**5. store/** - State management

- Global state
- Zustand stores

### 🎯 Ví dụ: Feature "Courses"

```
features/courses/
├── screens/                     # Màn hình
│   ├── CourseListScreen.tsx     # Danh sách khóa học
│   ├── CourseDetailScreen.tsx   # Chi tiết khóa học
│   └── VideoPlayerScreen.tsx    # Xem video
│
├── components/                  # Components của feature
│   ├── CourseCard.tsx           # Card hiển thị khóa học
│   ├── VideoList.tsx            # Danh sách video
│   ├── CourseReviews.tsx        # Đánh giá khóa học
│   └── EnrollButton.tsx         # Nút đăng ký
│
├── hooks/                       # Custom hooks
│   ├── useCourses.ts            # Hook lấy danh sách
│   ├── useCourseDetail.ts       # Hook lấy chi tiết
│   └── useVideoPlayer.ts        # Hook quản lý video
│
├── store/                       # State management
│   └── courseStore.ts           # Zustand store
│
├── services/                    # API calls
│   └── courses.api.ts           # API functions
│
└── types/                       # TypeScript types
    └── course.types.ts          # Interface, Type
```

### 📦 Modular Pattern

**Mỗi feature là một module độc lập:**

```typescript
// features/courses/index.ts - Export tất cả
export { CourseListScreen } from "./screens/CourseListScreen";
export { CourseDetailScreen } from "./screens/CourseDetailScreen";
export { useCourses } from "./hooks/useCourses";
export { courseStore } from "./store/courseStore";
export type { Course, CourseDetail } from "./types/course.types";

// Sử dụng từ nơi khác
import { CourseListScreen, useCourses, Course } from "@/features/courses";
```

---

## 📖 PHẦN 10: BEST PRACTICES (THỰC HÀNH TỐT)

### ✅ Navigation

1. **TypeScript cho Navigation**

```typescript
// Định nghĩa types
type RootStackParamList = {
  Home: undefined;
  CourseDetail: { courseId: number };
  VideoPlayer: { videoId: number; courseId: number };
};

// Sử dụng
navigation.navigate("CourseDetail", { courseId: 123 }); // ✅ Type-safe
navigation.navigate("CourseDetail", { id: 123 }); // ❌ Type error
```

2. **Tách navigation logic**

```typescript
// ❌ Không tốt - Logic trong component
function CourseCard({ course }) {
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("CourseDetail", { courseId: course.id })
      }
    >
      <Text>{course.title}</Text>
    </TouchableOpacity>
  );
}

// ✅ Tốt - Dùng callback
function CourseCard({ course, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{course.title}</Text>
    </TouchableOpacity>
  );
}

// Sử dụng
<CourseCard
  course={course}
  onPress={() => navigation.navigate("CourseDetail", { courseId: course.id })}
/>;
```

3. **Centralized Routes**

```typescript
// constants/routes.ts
export const ROUTES = {
  HOME: "Home",
  COURSE_DETAIL: "CourseDetail",
  VIDEO_PLAYER: "VideoPlayer",
} as const;

// Sử dụng
navigation.navigate(ROUTES.COURSE_DETAIL, { courseId: 123 });
```

### ✅ Performance

1. **Lazy Loading Screens**

```typescript
const CourseDetailScreen = lazy(() => import("./screens/CourseDetailScreen"));
```

2. **Memoize Navigation Options**

```typescript
const screenOptions = useMemo(
  () => ({
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: colors.text,
  }),
  [colors]
);
```

3. **Avoid Re-renders**

```typescript
// Sử dụng React.memo
export const CourseCard = React.memo(({ course, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{course.title}</Text>
    </TouchableOpacity>
  );
});
```

### ✅ Code Organization

1. **Feature-based structure**
2. **Single Responsibility**: Mỗi file một nhiệm vụ
3. **DRY**: Don't Repeat Yourself
4. **Clear naming**: Tên rõ ràng, dễ hiểu

---

## 🎓 TÓM TẮT

### 📌 Các khái niệm quan trọng

1. **3 loại Navigator:**

   - Stack: Chồng màn hình
   - Tab: Thanh tab
   - Drawer: Menu trượt

2. **Nested Navigation:**

   - Đặt Navigator trong Navigator
   - Mô hình phổ biến: Drawer → Tab → Stack

3. **Params:**

   - Truyền dữ liệu giữa màn hình
   - `navigation.navigate('Screen', { data })`
   - `route.params.data`

4. **Custom Header:**

   - Thay đổi title, màu sắc
   - Thêm buttons
   - Custom hoàn toàn

5. **Animation:**

   - Slide, Fade, Flip
   - Custom với interpolation
   - Gestures

6. **Deep Linking:**

   - Mở app từ URL
   - Universal Links
   - Custom schemes

7. **Dynamic Routing:**

   - Routes từ dữ liệu
   - Conditional navigation
   - Tabs động

8. **Feature-based Structure:**
   - Nhóm theo tính năng
   - Modular pattern
   - Dễ maintain

---

## 📚 TÀI LIỆU THAM KHẢO

1. **React Navigation Docs:** https://reactnavigation.org/
2. **TypeScript Guide:** https://reactnavigation.org/docs/typescript
3. **Deep Linking Guide:** https://reactnavigation.org/docs/deep-linking
4. **Animation Guide:** https://reactnavigation.org/docs/animations

---

## 🎯 BÀI TẬP VỀ NHÀ

1. Vẽ sơ đồ navigation cho app của bạn
2. Liệt kê tất cả params cần truyền
3. Thiết kế custom header cho từng màn hình
4. Lập kế hoạch cấu trúc thư mục

---

**🎉 CHÚC BẠN HỌC TỐT! 🎉**

Ở buổi thực hành, chúng ta sẽ code toàn bộ những gì đã học!
