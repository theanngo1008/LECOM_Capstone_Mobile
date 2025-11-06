# 🎓 CourseHub - Ứng dụng học trực tuyến

## 📱 Tính năng chính

### ✅ Đã hoàn thành

#### 🔐 Authentication

- ✅ Welcome Screen với giao diện bắt mắt
- ✅ Login với email & password
- ✅ Register với validation
- ✅ Auto-save authentication state với AsyncStorage
- ✅ Logout với confirmation

#### 🏠 Home

- ✅ Welcome message với tên user
- ✅ Categories (Mobile, Web, Backend, DevOps)
- ✅ Featured courses
- ✅ Quick navigation

#### 📚 Courses

- ✅ Course list với filter categories
- ✅ Course detail với full information
- ✅ Video player với progress tracking
- ✅ Course enrollment
- ✅ Lock/unlock video system

#### 👤 Profile

- ✅ User profile với avatar
- ✅ Edit profile form
- ✅ Statistics (courses, hours, certificates)
- ✅ Menu items

#### ⚙️ Settings (Theme Management)

- ✅ **Theme selection screen độc lập**
  - ☀️ Light Mode
  - 🌙 Dark Mode
  - ⚙️ System Theme (auto-detect)
- ✅ Theme persistence với AsyncStorage
- ✅ Real-time theme switching
- ✅ Notification settings
- ✅ Privacy settings
- ✅ Download settings
- ✅ Clear cache
- ✅ Terms & Privacy links

#### 🧭 Navigation

- ✅ Stack Navigator (Auth, Courses, Profile)
- ✅ Tab Navigator (Bottom tabs)
- ✅ Drawer Navigator (Side menu)
- ✅ Nested navigation (Drawer → Tab → Stack)
- ✅ Deep Linking support

#### 🎨 UI/UX

- ✅ NativeWind/Tailwind CSS styling
- ✅ Dark mode support cho tất cả screens
- ✅ Custom colors & themes
- ✅ Smooth animations
- ✅ Responsive layout

---

## 📂 Cấu trúc dự án

```
CourseHubV2/
├── app/
│   ├── _layout.tsx          # Root layout với RootNavigator
│   └── globals.css          # Global Tailwind styles
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── screens/     # Welcome, Login, Register
│   │   │   └── hooks/       # useAuth (Zustand store)
│   │   ├── home/
│   │   │   └── screens/     # HomeScreen
│   │   ├── courses/
│   │   │   ├── screens/     # CourseList, CourseDetail, VideoPlayer
│   │   │   └── components/  # CourseCard
│   │   ├── profile/
│   │   │   └── screens/     # ProfileScreen, EditProfileScreen
│   │   └── settings/
│   │       └── screens/     # SettingsScreen (Theme Management)
│   ├── navigation/
│   │   ├── types.ts         # TypeScript navigation types
│   │   ├── linking.ts       # Deep linking configuration
│   │   ├── AuthStackNavigator.tsx
│   │   ├── CoursesStackNavigator.tsx
│   │   ├── ProfileStackNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   ├── DrawerNavigator.tsx
│   │   └── RootNavigator.tsx
│   ├── components/
│   │   ├── themed-button.tsx
│   │   └── LoadingScreen.tsx
│   ├── hooks/
│   │   └── use-theme.ts
│   └── store/
│       └── theme-store.ts   # Zustand theme store
└── tailwind.config.js
```

---

## 🚀 Cài đặt & Chạy

### 1. Install dependencies:

```bash
npm install
```

### 2. Start Expo:

```bash
npm start
```

### 3. Chạy trên thiết bị:

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

---

## 🎨 Theme Management - Tính năng đặc biệt

### Settings Screen là màn hình độc lập

Thay vì chỉ là button toggle, **Settings Screen** là một màn hình đầy đủ với:

#### 🎨 Theme Selection

- **3 options rõ ràng:**

  - ☀️ **Light Mode**: Giao diện sáng
  - 🌙 **Dark Mode**: Giao diện tối
  - ⚙️ **System**: Tự động theo hệ thống

- **Visual feedback:**
  - Selected theme có border màu primary
  - Checkmark icon cho option đang chọn
  - Background highlight cho selected state

#### 🔔 Additional Settings

- Notification preferences
- Privacy controls
- Download options
- Cache management
- Terms & Privacy access

### Truy cập Settings:

1. **Từ Drawer Menu**: Mở drawer → "Cài đặt"
2. **Direct navigation**: Có thể navigate từ bất kỳ screen nào

### Theme sẽ áp dụng cho:

- ✅ Tất cả navigation screens
- ✅ Auth screens
- ✅ Course screens
- ✅ Profile screens
- ✅ Drawer menu
- ✅ Tab bar
- ✅ Status bar

---

## 📱 Navigation Flow

```
App Launch
    ↓
RootNavigator
    ↓
    ├── Not Authenticated → AuthStack
    │   ├── Welcome
    │   ├── Login
    │   └── Register
    │
    └── Authenticated → DrawerNavigator
        ├── MainTabs (default)
        │   ├── Home Tab
        │   ├── Courses Tab → CoursesStack
        │   │   ├── CourseList
        │   │   ├── CourseDetail
        │   │   └── VideoPlayer
        │   └── Profile Tab → ProfileStack
        │       ├── ProfileMain
        │       └── EditProfile
        │
        ├── Settings (Theme Management) ⭐
        └── Help
```

---

## 🔗 Deep Linking

### Supported URLs:

```bash
# Auth
coursehub://welcome
coursehub://login
coursehub://register

# Main
coursehub://home
coursehub://courses
coursehub://profile

# Course Detail
coursehub://courses/1

# Video Player
coursehub://courses/1/video/1

# Settings (Theme)
coursehub://settings

# Help
coursehub://help
```

### Test Deep Links:

```bash
# iOS Simulator
xcrun simctl openurl booted coursehub://settings

# Android
npx uri-scheme open coursehub://settings --android
```

---

## 🎯 Use Cases

### User Journey 1: Đổi Theme

1. User mở app
2. Mở Drawer menu
3. Tap "Cài đặt"
4. Chọn theme yêu thích (Light/Dark/System)
5. Theme áp dụng ngay lập tức
6. Setting được lưu tự động

### User Journey 2: Xem khóa học

1. User login
2. Browse courses trong Home
3. Tap vào course
4. Xem chi tiết & videos
5. Play video (nếu unlocked)
6. Enroll course

### User Journey 3: Quản lý Profile

1. User vào Profile tab
2. View statistics
3. Edit profile information
4. Logout khi cần

---

## 🛠️ Tech Stack

- **Framework**: React Native + Expo
- **Navigation**: React Navigation v7
  - Stack Navigator
  - Tab Navigator
  - Drawer Navigator
- **State Management**: Zustand
  - Auth store
  - Theme store
- **Styling**: NativeWind v4 + Tailwind CSS
- **Storage**: AsyncStorage
- **TypeScript**: Type-safe navigation
- **Deep Linking**: Custom scheme + Universal links

---

## 📚 Tài liệu tham khảo

Xem thêm:

- [Lý thuyết buổi 2.md](./Lý%20thuyết%20buổi%202.md) - Theory guide
- [Code thực hành buổi 2.md](./Code%20thực%20hành%20buổi%202.md) - Practice guide Part 1
- [Code thực hành buổi 2 - Phần 2.md](./Code%20thực%20hành%20buổi%202%20-%20Phần%202.md) - Practice guide Part 2
- [Code thực hành buổi 2 - Phần 3.md](./Code%20thực%20hành%20buổi%202%20-%20Phần%203.md) - Practice guide Part 3

---

## 🎓 Học gì từ project này?

### Navigation

- ✅ Nested navigation patterns
- ✅ TypeScript navigation types
- ✅ Deep linking configuration
- ✅ Custom navigators

### State Management

- ✅ Zustand stores
- ✅ Persistence with AsyncStorage
- ✅ Global state patterns

### Theme System

- ✅ Dynamic theme switching
- ✅ System theme detection
- ✅ Theme persistence
- ✅ Dark mode implementation

### Best Practices

- ✅ Feature-based folder structure
- ✅ Type-safe code
- ✅ Component reusability
- ✅ Clean architecture

---

## 🐛 Troubleshooting

### Metro Bundler Error

```bash
npx expo start --clear
```

### TypeScript Errors

```bash
npx tsc --noEmit
```

### Deep Linking Not Working

```bash
# Rebuild app
npx expo run:ios
npx expo run:android
```

---

## 📝 Next Steps

### Tính năng có thể thêm:

- [ ] Search trong Course List
- [ ] Favorites system
- [ ] Notifications
- [ ] Video download
- [ ] Progress tracking
- [ ] Certificates
- [ ] Reviews & Ratings
- [ ] Payment integration

---

## 👥 Credits

Developed with ❤️ using:

- React Native
- Expo
- React Navigation
- Zustand
- NativeWind
- TypeScript

---

## 📄 License

MIT License - Feel free to use for learning!

---

**Happy Coding! 🚀**
