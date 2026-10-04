import { SetMetadata } from '@nestjs/common'
import { UserRoleValue } from './roles'

export const ROLES_KEY = 'roles'

export const Roles = (...roles: UserRoleValue[]) => SetMetadata(ROLES_KEY, roles)
