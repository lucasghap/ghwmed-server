export const USER_ROLES = {
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
} as const

export type UserRoleValue = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const
