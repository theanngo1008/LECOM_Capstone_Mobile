import { CourseSection } from "@/api/shopCourses";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface SectionItemProps {
  section: CourseSection;
  romanIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (sectionId: string, sectionTitle: string) => void;
  onAddLesson: () => void;
  isDeleting: boolean;
  getApprovalStatusColor: (status: "Approved" | "Pending" | "Rejected") => string;
  getApprovalStatusTextColor: (status: "Approved" | "Pending" | "Rejected") => string;
  getApprovalStatusText: (status: "Approved" | "Pending" | "Rejected") => string;
  toRomanNumeral: (num: number) => string;
  renderLessons: () => React.ReactNode;
}

export function SectionItem({
  section,
  romanIndex,
  isExpanded,
  onToggle,
  onDelete,
  onAddLesson,
  isDeleting,
  getApprovalStatusColor,
  getApprovalStatusTextColor,
  getApprovalStatusText,
  toRomanNumeral,
  renderLessons,
}: SectionItemProps) {
  return (
    <View className="mb-4 bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-beige/30 dark:border-dark-border/30">
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity
          className="flex-1 flex-row items-center"
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <View className="w-8 h-8 rounded-lg bg-mint/10 dark:bg-gold/10 items-center justify-center mr-3">
            <Text className="text-black dark:text-white font-bold text-sm">
              {toRomanNumeral(romanIndex)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-light-text dark:text-dark-text mb-1">
              {section.title}
            </Text>
            <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1">
              {section.lessons.length}{" "}
              {section.lessons.length === 1 ? "bài học" : "bài học"}
            </Text>
            <View className="flex-row items-center mb-1">
              <View
                className={`px-2 py-1 rounded-lg border ${getApprovalStatusColor(
                  section.approvalStatus
                )}`}
              >
                <Text
                  className={`text-xs font-semibold ${getApprovalStatusTextColor(
                    section.approvalStatus
                  )}`}
                >
                  {getApprovalStatusText(section.approvalStatus)}
                </Text>
              </View>
            </View>
            {section.moderatorNote && (
              <View className="mt-1 px-2 py-1 bg-beige/30 dark:bg-dark-border/30 rounded">
                <Text className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  <Text className="font-semibold">Ghi chú: </Text>
                  {section.moderatorNote}
                </Text>
              </View>
            )}
          </View>
          <FontAwesome
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#9CA3AF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-coral/10 items-center justify-center ml-2"
          onPress={() => onDelete(section.id, section.title)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <FontAwesome name="trash-o" size={16} color="#FF6B6B" />
          )}
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View className="px-4 pb-4">
          {renderLessons()}

          <TouchableOpacity
            className="flex-row items-center justify-center p-4 bg-mint/10 dark:bg-gold/10 rounded-xl border-2 border-dashed border-mint/30 dark:border-gold/30 mt-2"
            onPress={onAddLesson}
          >
            <FontAwesome name="plus-circle" size={18} color="#ACD6B8" />
            <Text className="text-mint dark:text-gold font-semibold ml-2">
              Thêm bài học
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

