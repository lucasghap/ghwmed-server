import { UserStatus } from '@prisma/client'

export class UpdateAdminUserStatusDto {
  status: UserStatus
}
