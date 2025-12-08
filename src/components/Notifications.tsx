import { useMarkAllAsRead } from "@/hooks/useMarkAllAsRead";
import { useMarkAsRead } from "@/hooks/useMarkAsRead";
import { useNotificationsHub } from "@/hooks/useNotificationsHub";
import { useNotificationsList } from "@/hooks/useNotificationsList";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useEffect, useState } from "react";
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

export function Notifications({ onNotificationPress }: NotificationsProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const slideAnim = useState(new Animated.Value(height))[0];

  // SignalR Hub
  const { unreadCount, latestNotification, setUnreadCount } = useNotificationsHub();

  // REST API
  const { data, isLoading, refetch, isFetching } = useNotificationsList(page, 20);
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const notifications = data?.result || [];

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

  // Update unread count when new notification arrives
  useEffect(() => {
    if (latestNotification) {
      refetch();
    }
  }, [latestNotification]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      refetch();
    } catch (error) {
      console.error("❌ Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      setUnreadCount(0);
      refetch();
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
        return "#3B82F6";
      case "System":
        return "#F59E0B";
      default:
        return "#6B7280";
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setIsModalVisible(false)}
          />
          <Animated.View 
            style={{ 
              backgroundColor: '#F5F5F5',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
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
              backgroundColor: '#F5F5F5',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: '#1F2937', letterSpacing: -0.5 }}>
                  Thông báo
                </Text>
                <Pressable 
                  onPress={() => setIsModalVisible(false)}
                  style={({ pressed }) => ({
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: pressed ? '#E5E7EB' : '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  <FontAwesome name="times" size={18} color="#6B7280" />
                </Pressable>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#9CA3AF', fontWeight: '500' }}>
                  {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Tất cả đã đọc'}
                </Text>
                
                {notifications.length > 0 && unreadCount > 0 && (
                  <Pressable 
                    onPress={handleMarkAllAsRead}
                    style={({ pressed }) => ({
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: pressed ? '#DBEAFE' : '#EFF6FF',
                    })}
                  >
                    <Text style={{ fontSize: 13, color: '#3B82F6', fontWeight: '600' }}>
                      Đọc tất cả
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Content */}
            <ScrollView
              style={{ flex: 1, backgroundColor: '#F5F5F5' }}
              contentContainerStyle={{ 
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: 24,
              }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl 
                  refreshing={isFetching} 
                  onRefresh={refetch}
                  tintColor="#3B82F6"
                />
              }
            >
              {isLoading ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
                  <ActivityIndicator size="large" color="#3B82F6" />
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
                        marginBottom: 12,
                        padding: 16,
                        borderRadius: 20,
                        backgroundColor: notif.isRead ? '#FFFFFF' : '#F0F9FF',
                        opacity: pressed ? 0.9 : 1,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        elevation: 3,
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
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 14,
                            backgroundColor: `${getNotificationColor(notif.type)}20`,
                          }}
                        >
                          <FontAwesome
                            name={getNotificationIcon(notif.type)}
                            size={22}
                            color={getNotificationColor(notif.type)}
                          />
                        </View>

                        <View style={{ flex: 1, paddingRight: 4 }}>
                          <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'flex-start',
                            marginBottom: 5 
                          }}>
                            <Text style={{ 
                              fontSize: 15, 
                              fontWeight: '700', 
                              color: '#1F2937',
                              flex: 1,
                              lineHeight: 20,
                              letterSpacing: -0.2,
                            }}>
                              {notif.title}
                            </Text>
                            {!notif.isRead && (
                              <View style={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: 4, 
                                backgroundColor: '#3B82F6',
                                marginLeft: 8,
                                marginTop: 6,
                              }} />
                            )}
                          </View>
                          <Text style={{ 
                            fontSize: 14, 
                            color: '#6B7280',
                            marginBottom: 8,
                            lineHeight: 19,
                          }}>
                            {notif.content}
                          </Text>
                          <Text style={{ 
                            fontSize: 12, 
                            color: '#9CA3AF',
                            fontWeight: '500',
                          }}>
                            {formatDistanceToNow(new Date(notif.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </Text>
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