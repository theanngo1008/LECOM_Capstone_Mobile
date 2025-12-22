import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from 'expo-linear-gradient';
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CoursesStackNavigator } from "./CoursesStackNavigator";
import { HomeStackNavigator } from "./HomeStackNavigator";
import { ProductsStackNavigator } from "./ProductsStackNavigator";
import { ProfileStackNavigator } from "./ProfileStackNavigator";

const Tab = createBottomTabNavigator<any>();

// Custom Tab Bar Component with SafeArea
function CustomTabBar(props: any) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ backgroundColor: '#F0FDFA' }}>
      <LinearGradient
        colors={['#FFFFFF', '#F0FDFA']} // White → Teal-50
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          borderTopWidth: 1,
          borderTopColor: "rgba(20, 184, 166, 0.15)",
          paddingTop: 6,
          paddingBottom: 6,
          // Shadow
          shadowColor: "#14B8A6",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 8 }}>
          {props.state.routes.map((route: any, index: number) => {
            const { options } = props.descriptors[route.key];
            const isFocused = props.state.index === index;
            const label = options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

            const onPress = () => {
              const event = props.navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                props.navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              props.navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            const icon = options.tabBarIcon?.({ focused: isFocused, color: isFocused ? "#14B8A6" : "#6B7280", size: 24 });

            return (
              <View key={route.key} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View
                  style={[
                    styles.tabButton,
                    isFocused && styles.tabButtonActive,
                  ]}
                >
                  <TouchableOpacity
                    onPress={onPress}
                    onLongPress={onLongPress}
                    style={styles.tabTouchable}
                    activeOpacity={0.7}
                  >
                    {icon}
                  </TouchableOpacity>
                </View>
                {options.tabBarLabel && (
                  <Text
                    style={[
                      styles.tabLabel,
                      isFocused && styles.tabLabelActive,
                    ]}
                  >
                    {label}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </LinearGradient>
      {/* Safe Area with matching gradient color */}
      <View style={{ height: insets.bottom, backgroundColor: '#F0FDFA' }} />
    </View>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ACD6B8",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        tabBarActiveTintColor: "#14B8A6",
        tabBarInactiveTintColor: "#6B7280",
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: "Trang chủ",
          tabBarLabel: "Trang chủ",
          tabBarIcon: ({ focused, color, size }) => (
            <AntDesign 
              name="home" 
              size={size || 24} 
              color={focused ? "#14B8A6" : color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="CoursesTab"
        component={CoursesStackNavigator}
        options={{
          title: "Học tập",
          tabBarLabel: "Học tập",
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons 
              name="book-open-variant" 
              size={size || 24} 
              color={focused ? "#14B8A6" : color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ProductsTab"
        component={ProductsStackNavigator}
        options={{
          title: "Mua sắm",
          tabBarLabel: "Mua sắm",
          tabBarIcon: ({ focused, color, size }) => (
            <Fontisto 
              name="shopping-store" 
              size={(size || 24) - 2} 
              color={focused ? "#14B8A6" : color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Cá nhân",
          tabBarLabel: "Cá nhân",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size || 24} 
              color={focused ? "#14B8A6" : color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: -3,
  },
  tabButtonActive: {
    // Không có background, chỉ đổi màu icon và text
  },
  tabTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: -3,
  },
  tabLabelActive: {
    color: '#14B8A6',
    fontWeight: '800', // Bold hơn
    fontSize: 12, // Tăng size một chút
  },
});