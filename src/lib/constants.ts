export const MEMBER_PLANS = {
    PREMIUM: { label: 'メンバー枠【プレミアム】', limitDays: 60, id: 'PREMIUM' },
    STANDARD: { label: 'メンバー枠【スタンダード】', limitDays: 30, id: 'STANDARD' },
    TICKET: { label: '回数券', limitDays: 30, id: 'TICKET' },
    DIGITAL_PREPAID: { label: 'デジタルプリカ', limitDays: 7, id: 'DIGITAL_PREPAID' },
} as const

// 型定義のヘルパー
export type MemberPlanId = keyof typeof MEMBER_PLANS

export const BOOKING_TYPES = {
    REGULAR: { id: 'REGULAR', label: '通常予約' },
    ADDITIONAL: { id: 'ADDITIONAL', label: '追加セッション' },
    TRANSFER_MEMBER: { id: 'TRANSFER_MEMBER', label: '振替（自己都合）' },
    TRANSFER_STORE: { id: 'TRANSFER_STORE', label: '振替（店舗都合）' },
    TRIAL: { id: 'TRIAL', label: '体験' }
} as const

export type BookingTypeId = keyof typeof BOOKING_TYPES
export const DEFAULT_BOOKING_TYPE = BOOKING_TYPES.REGULAR.id

export const getPlanFromId = (id: string) => {
    return Object.values(MEMBER_PLANS).find(p => p.id === id) || MEMBER_PLANS.STANDARD
}
