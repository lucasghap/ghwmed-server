import { UserRole, UserStatus } from '@prisma/client'

export class ListAdminUsersDto {
  role?: UserRole
  status?: UserStatus
  search?: string
  page?: string
  perPage?: string
}
