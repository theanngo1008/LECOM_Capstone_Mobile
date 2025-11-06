import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CoursesStackScreenProps } from '@/navigation/types';
import { ThemedButton } from '@/components/themed-button';

type Props = CoursesStackScreenProps<'VideoPlayer'>;

export function VideoPlayerScreen({ route, navigation }: Props) {
  const { courseId, videoId, videoTitle } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Video Player */}
      <View className="aspect-video bg-black items-center justify-center">
        <Text className="text-8xl mb-4">🎥</Text>
        <TouchableOpacity onPress={handlePlayPause}>
          <Text className="text-6xl">{isPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="px-6 py-4 bg-light-background dark:bg-dark-background">
        <View className="h-2 bg-light-surface dark:bg-dark-surface rounded-full overflow-hidden">
          <View
            className="h-full bg-primary-light dark:bg-primary-dark"
            style={{ width: `${progress}%` }}
          />
        </View>
        <Text className="text-center text-sm text-light-textSecondary dark:text-dark-textSecondary mt-2">
          {progress}%
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 bg-light-background dark:bg-dark-background p-6">
        <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
          {videoTitle}
        </Text>

        <Text className="text-base text-light-textSecondary dark:text-dark-textSecondary mb-6">
          Video ID: {videoId} | Course ID: {courseId}
        </Text>

        {/* Controls */}
        <View className="gap-3">
          <ThemedButton
            title={isPlaying ? 'Tạm dừng' : 'Phát'}
            variant="primary"
            fullWidth
            onPress={handlePlayPause}
          />

          <ThemedButton
            title="Video tiếp theo"
            variant="secondary"
            fullWidth
            onPress={() => Alert.alert('Video tiếp theo')}
          />

          <ThemedButton
            title="Tải xuống"
            variant="outline"
            fullWidth
            onPress={() => Alert.alert('Tải xuống video')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
