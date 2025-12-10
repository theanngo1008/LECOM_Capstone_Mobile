// src/api/achievements.ts
import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// =============================
// TYPES
// =============================

export interface AchievementItem {
  id: number
  code: string
  category: string
  imageUrl: string | null
  title: string
  description: string
  currentCount: number
  targetCount: number
  xpReward: number
  coinReward: number
  isCompleted: boolean
  isRewardClaimed: boolean
  completedAt: string | null
}

export interface AchievementListResult {
  achievements: AchievementItem[]
}

export type AchievementListResponse = ApiResponse<AchievementListResult>

// =============================
// API MODULE
// =============================

export const achievementsApi = {
  /**
   * GET /gamification/achievements/all
   */
  getAll: async (): Promise<AchievementListResponse> => {
    const { data } = await apiClient.get<AchievementListResponse>(
      "/gamification/achievements/all"
    )
    return data
  },
}
