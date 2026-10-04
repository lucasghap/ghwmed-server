import { UserRole } from '@prisma/client'

export class CreateAdminUserDto {
  name: string
  email: string
  password: string
  cpf?: string | null
  role: UserRole
}
