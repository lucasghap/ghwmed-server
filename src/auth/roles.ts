export const USER_ROLES = {
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
} as const

export type UserRoleValue = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const

/** Returned when a doctor created through the PEP signs in by CPF before setting a password. */
export const PASSWORD_NOT_SET_MESSAGE = 'Cadastre uma senha para acessar'
