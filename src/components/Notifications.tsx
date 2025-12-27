import { useMarkAllAsRead } from "@/hooks/useMarkAllAsRead";
import { useMarkAsRead } from "@/hooks/useMarkAsRead";
import { useNotificationsHub } from "@/hooks/useNotificationsHub";
import { useNotificationsList } from "@/hooks/useNotificationsList";
import { useNotificationsStore } from "@/store/notifications-store";
import { toVietnamTime } from "@/utils/dateUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
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
  const [page] = useState(1);
  const slideAnim = useState(new Animated.Value(height))[0];

  const { latestNotification } = useNotificationsHub();

  const { data, isLoading, refetch, isFetching } = useNotificationsList(page, 20);
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const { unreadCount } = useNotificationsStore();

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const prevUnreadCountRef = useRef(unreadCount);

  const notifications = data?.result || [];

  useEffect(() => {
    const apiUnreadCount = notifications.filter(notif => !notif.isRead).length;
    const { setUnreadCount } = useNotificationsStore.getState();
    setUnreadCount(apiUnreadCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.result]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible]);

  // Update when new notification arrives
  useEffect(() => {
    if (latestNotification) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestNotification]);

  useEffect(() => {
    if (unreadCount > 0 && prevUnreadCountRef.current !== unreadCount) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const animationLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (animationLoopRef.current) {
      animationLoopRef.current.stop();
      animationLoopRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (unreadCount > 0 && !isModalVisible) {
      const createShakeAnimation = () => {
        return Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]);
      };

      const runAnimation = () => {
        const { unreadCount: currentUnreadCount } = useNotificationsStore.getState();
        
        if (currentUnreadCount > 0 && !isModalVisible) {
          const animation = createShakeAnimation();
          
          animationLoopRef.current = animation;
          
          animation.start(() => {
            const { unreadCount: checkUnreadCount } = useNotificationsStore.getState();
            
            if (checkUnreadCount > 0 && !isModalVisible) {
              timeoutRef.current = setTimeout(() => {
                runAnimation();
              }, 2000);
            } else {
              Animated.timing(shakeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }).start();
            }
          });
        } else {
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      };

      runAnimation();
    } else {
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (animationLoopRef.current) {
        animationLoopRef.current.stop();
        animationLoopRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadCount, isModalVisible]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      const { decrementUnreadCount } = useNotificationsStore.getState();
      decrementUnreadCount();
      refetch();
    } catch (error) {
      console.error("❌ Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      const { resetUnreadCount } = useNotificationsStore.getState();
      resetUnreadCount();
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
      <Animated.View
        style={{
          transform: [
            { translateX: shakeAnim },
          ],
        }}
      >
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
      </Animated.View>

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
                paddingTop: 16,
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
                        marginBottom: 16,
                        padding: 16,
                        borderRadius: 16,
                        backgroundColor: getNotificationBgColor(notif.type, notif.isRead),
                        opacity: pressed ? 0.95 : 1,
                        borderWidth: 1,
                        borderColor: notif.isRead ? '#E5E7EB' : getNotificationColor(notif.type) + '30',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 3,
                        elevation: 2,
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
                            marginRight: 14,
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
                            marginBottom: 8,
                            gap: 6,
                            flexWrap: 'wrap',
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
                            marginBottom: 6,
                            lineHeight: 22,
                          }}>
                            {notif.title}
                          </Text>

                          <Text style={{ 
                            fontSize: 14, 
                            color: '#4B5563',
                            lineHeight: 20,
                            marginTop: 2,
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