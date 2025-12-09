import { ApiResponse } from "../types/common"
import { apiClient } from "./client"

// =============================
// ENUMS
// =============================
export type QuestPeriod = "Daily" | "Weekly" | "Monthly"

export type QuestStatus = "InProgress" | "Completed" | "Claimed"

export type RewardType = "Booster" | "Voucher"

// =============================
// QUEST TYPE
// =============================
export interface QuestDTO {
  id: string
  title: string
  description: string
  period: QuestPeriod

  currentValue: number
  targetValue: number

  rewardXP: number
  rewardPoints: number

  status: QuestStatus
  isRewardClaimed: boolean
}

// =============================
// GAMIFICATION PROFILE
// =============================
export interface GamificationProfile {
  level: number
  currentXP: number
  xpToNextLevel: number
  coins: number
  dailyStreak: number

  dailyQuests: QuestDTO[]
  weeklyQuests: QuestDTO[]
  monthlyQuests: QuestDTO[]
}
// =============================
// REDEEM REQUEST / RESPONSE
// =============================
export interface RedeemRequest {
  rewardCode: string
}

export type RedeemResponse = ApiResponse<string | null>


export type GamificationProfileResponse = ApiResponse<GamificationProfile>

// =============================
// REWARD ITEM TYPE
// =============================
export interface RewardItem {
  id: string
  rewardCode: string
  title: string
  description: string
  coinCost: number
  type: RewardType
  imageUrl: string | null
  durationDescription: string
  redeemable: boolean
}

// =============================
// REWARD RESPONSE
// =============================
export interface RewardCategoryResult {
  balance: number
  boosters: RewardItem[]
  vouchers: RewardItem[]
}

export type GamificationRewardResponse = ApiResponse<RewardCategoryResult>

// =============================
// API MODULE
// =============================
export const gamificationApi = {
  // GET /gamification/profile
  getProfile: async (): Promise<GamificationProfileResponse> => {
    const { data } = await apiClient.get<GamificationProfileResponse>(
      "/gamification/profile"
    )
    return data
  },

  // GET /gamification/rewards
  getRewards: async (): Promise<GamificationRewardResponse> => {
    const { data } = await apiClient.get<GamificationRewardResponse>(
      "/gamification/rewards"
    )
    return data
  },

  // POST /gamification/redeem
  redeemReward: async (
    payload: RedeemRequest
  ): Promise<RedeemResponse> => {
    const { data } = await apiClient.post<RedeemResponse>(
      "/gamification/redeem",
      payload
    )
    return data
  },
}

