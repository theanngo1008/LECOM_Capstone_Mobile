import { useMarkAllAsRead } from "@/hooks/useMarkAllAsRead";
import { useMarkAsRead } from "@/hooks/useMarkAsRead";
import { useNotificationsHub } from "@/hooks/useNotificationsHub";
import { useNotificationsList } from "@/hooks/useNotificationsList";
import { useNotificationsStore } from "@/store/notifications-store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

const { height } = Dimensions.get('window');

interface NotificationsProps {
  onNotificationPress?: (id: string) => void;
}

// ✅ Helper function to convert UTC to Vietnam time (+7 hours)
const toVietnamTime = (utcDateString: string): Date => {
  const utcDate = new Date(utcDateString);
  const vietnamTime = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
  return vietnamTime;
};

export function Notifications({ onNotificationPress }: NotificationsProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const slideAnim = useState(new Animated.Value(height))[0];

  // SignalR Hub (chỉ dùng để trigger refetch)
  const { latestNotification } = useNotificationsHub();

  // REST API - ✅ Fetch ngay khi mount
  const { data, isLoading, refetch, isFetching } = useNotificationsList(page, 20);
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // Get unread count from store
  const { unreadCount } = useNotificationsStore();

  const notifications = data?.result || [];

  // Sync unread count from API to store when notifications change
  useEffect(() => {
    const apiUnreadCount = notifications.filter(notif => !notif.isRead).length;
    const { setUnreadCount } = useNotificationsStore.getState();
    setUnreadCount(apiUnreadCount);
  }, [notifications]);

  // ✅ Fetch data ngay khi component mount
  useEffect(() => {
    refetch();
  }, []);

  // Animate modal
  useEffect(() => {
    if (isModalVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isModalVisible]);

  // Update when new notification arrives
  useEffect(() => {
    if (latestNotification) {
      refetch();
    }
  }, [latestNotification]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      const { decrementUnreadCount } = useNotificationsStore.getState();
      decrementUnreadCount();
      refetch(); // ✅ Refetch để cập nhật danh sách
    } catch (error) {
      console.error("❌ Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      const { resetUnreadCount } = useNotificationsStore.getState();
      resetUnreadCount();
      refetch(); // ✅ Refetch để cập nhật danh sách
    } catch (error) {
      console.error("❌ Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "OrderStatus":
        return "shopping-bag";
      case "ChatMessage":
        return "comment";
      case "System":
        return "info-circle";
      default:
        return "bell";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "OrderStatus":
        return "#10B981";
      case "ChatMessage":
        return "#F59E0B";
      case "System":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return '#FFFFFF';
    
    switch (type) {
      case "OrderStatus":
        return '#F0FDF4'; // green tint
      case "ChatMessage":
        return '#FEF3C7'; // yellow tint
      case "System":
        return '#EFF6FF'; // blue tint
      default:
        return '#F9FAFB';
    }
  };

  return (
    <>
      {/* Bell Icon Button */}
      <Pressable
        className="w-12 h-12 rounded-xl bg-mint/10 dark:bg-gold/10 items-center justify-center relative"
        onPress={() => setIsModalVisible(true)}
      >
        <FontAwesome name="bell" size={20} color="#ACD6B8" />
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-coral items-center justify-center border-2 border-white dark:border-dark-card">
            <Text className="text-white text-[10px] font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </Pressable>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setIsModalVisible(false)}
          />
          <Animated.View 
            style={{ 
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              height: height * 0.85,
              transform: [{ translateY: slideAnim }],
              overflow: 'hidden',
            }}
          >
            {/* Drag Handle */}
            <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
              <View style={{
                width: 40,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: '#D1D5DB',
              }} />
            </View>

            {/* Header */}
            <View style={{ 
              paddingHorizontal: 20, 
              paddingVertical: 16,
              backgroundColor: '#FFFFFF',
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', letterSpacing: -0.5 }}>
                  Thông báo
                </Text>
                <Pressable 
                  onPress={() => setIsModalVisible(false)}
                  style={({ pressed }) => ({
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: pressed ? '#F3F4F6' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  <FontAwesome name="times" size={18} color="#6B7280" />
                </Pressable>
              </View>
              
              {notifications.length > 0 && unreadCount > 0 && (
                <Pressable 
                  onPress={handleMarkAllAsRead}
                  style={({ pressed }) => ({
                    alignSelf: 'flex-end',
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: pressed ? '#D1FAE5' : '#ECFDF5',
                    borderWidth: 1,
                    borderColor: '#86EFAC',
                  })}
                >
                  <Text style={{ fontSize: 13, color: '#059669', fontWeight: '600' }}>
                    ✓ Đánh dấu tất cả đã đọc
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Content */}
            <ScrollView
              style={{ flex: 1, backgroundColor: '#F9FAFB' }}
              contentContainerStyle={{ 
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 24,
              }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl 
                  refreshing={isFetching} 
                  onRefresh={refetch}
                  tintColor="#10B981"
                />
              }
            >
              {isLoading ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
                  <ActivityIndicator size="large" color="#10B981" />
                </View>
              ) : notifications.length === 0 ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 100 }}>
                  <View style={{ 
                    width: 88, 
                    height: 88, 
                    borderRadius: 44, 
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                    <FontAwesome name="bell-slash-o" size={40} color="#D1D5DB" />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8 }}>
                    Không có thông báo
                  </Text>
                  <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 48, lineHeight: 20 }}>
                    Các thông báo mới sẽ xuất hiện ở đây
                  </Text>
                </View>
              ) : (
                <>
                  {notifications.map((notif, index) => (
                    <Pressable
                      key={notif.id}
                      style={({ pressed }) => ({
                        marginBottom: 10,
                        padding: 14,
                        borderRadius: 16,
                        backgroundColor: getNotificationBgColor(notif.type, notif.isRead),
                        opacity: pressed ? 0.95 : 1,
                        borderWidth: 1,
                        borderColor: notif.isRead ? '#F3F4F6' : 'transparent',
                      })}
                      onPress={() => {
                        if (!notif.isRead) {
                          handleMarkAsRead(notif.id);
                        }
                        onNotificationPress?.(notif.id);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            backgroundColor: `${getNotificationColor(notif.type)}20`,
                          }}
                        >
                          <FontAwesome
                            name={getNotificationIcon(notif.type)}
                            size={20}
                            color={getNotificationColor(notif.type)}
                          />
                        </View>

                        <View style={{ flex: 1, paddingRight: 4 }}>
                          <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            marginBottom: 4,
                            gap: 6,
                          }}>
                            <View style={{
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                              backgroundColor: `${getNotificationColor(notif.type)}15`,
                            }}>
                              <Text style={{ 
                                fontSize: 11, 
                                fontWeight: '600',
                                color: getNotificationColor(notif.type),
                              }}>
                                {notif.type === "ChatMessage" ? "ChatMessage" : 
                                 notif.type === "OrderStatus" ? "OrderStatus" : "System"}
                              </Text>
                            </View>
                            
                            <Text style={{ 
                              fontSize: 12, 
                              color: '#9CA3AF',
                              fontWeight: '500',
                            }}>
                              {formatDistanceToNow(toVietnamTime(notif.createdAt), {
                                addSuffix: true,
                                locale: vi,
                              })}
                            </Text>

                            {!notif.isRead && (
                              <View style={{ 
                                width: 7, 
                                height: 7, 
                                borderRadius: 3.5, 
                                backgroundColor: getNotificationColor(notif.type),
                              }} />
                            )}
                          </View>

                          <Text style={{ 
                            fontSize: 15, 
                            fontWeight: '700', 
                            color: '#111827',
                            marginBottom: 4,
                            lineHeight: 20,
                          }}>
                            {notif.title}
                          </Text>

                          <Text style={{ 
                            fontSize: 14, 
                            color: '#4B5563',
                            lineHeight: 19,
                          }}>
                            {notif.content}
                          </Text>

                          {!notif.isRead && (
                            <View style={{ marginTop: 8 }}>
                              <View style={{
                                alignSelf: 'flex-start',
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 12,
                                backgroundColor: '#ECFDF5',
                                borderWidth: 1,
                                borderColor: '#86EFAC',
                              }}>
                                <Text style={{ 
                                  fontSize: 11, 
                                  color: '#059669',
                                  fontWeight: '600',
                                }}>
                                  ✓ Đánh dấu đã đọc
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}