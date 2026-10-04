import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { AuthUser, CurrentUser } from 'src/auth/jwt/current-user'
import { JwtGuard } from 'src/auth/jwt/jwt-guard'
import { USER_ROLES } from 'src/auth/roles'
import { Roles } from 'src/auth/roles.decorator'
import { RolesGuard } from 'src/auth/roles.guard'
import { AdminUsersService } from './admin-users.service'
import { CreateAdminUserDto } from './dto/create-admin-user.dto'
import { ListAdminUsersDto } from './dto/list-admin-users.dto'
import { ResetAdminUserPasswordDto } from './dto/reset-admin-user-password.dto'
import { UpdateAdminUserDto } from './dto/update-admin-user.dto'
import { UpdateAdminUserStatusDto } from './dto/update-admin-user-status.dto'

@Controller('admin/users')
@UseGuards(JwtGuard, RolesGuard)
@Roles(USER_ROLES.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  list(@Query() query: ListAdminUsersDto) {
    return this.adminUsersService.list(query)
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.adminUsersService.findById(id)
  }

  @Post()
  create(
    @CurrentUser() actor: AuthUser,
    @Body() dto: CreateAdminUserDto,
  ) {
    return this.adminUsersService.create(actor.id, dto)
  }

  @Put(':id')
  update(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminUsersService.update(actor.id, id, dto)
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserStatusDto,
  ) {
    return this.adminUsersService.updateStatus(actor.id, id, dto.status)
  }

  @Patch(':id/password')
  resetPassword(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() dto: ResetAdminUserPasswordDto,
  ) {
    return this.adminUsersService.resetPassword(actor.id, id, dto.password)
  }
}
