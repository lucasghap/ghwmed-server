import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { AuthUser, CurrentUser } from 'src/auth/jwt/current-user'
import { JwtGuard } from 'src/auth/jwt/jwt-guard'
import { USER_ROLES } from 'src/auth/roles'
import { Roles } from 'src/auth/roles.decorator'
import { RolesGuard } from 'src/auth/roles.guard'
import { AdminSettingsService } from './admin-settings.service'

@Controller('admin/settings')
@UseGuards(JwtGuard, RolesGuard)
@Roles(USER_ROLES.ADMIN)
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings()
  }

  @Put()
  updateSettings(
    @CurrentUser() actor: AuthUser,
    @Body() body: { assist_enabled?: boolean },
  ) {
    return this.settingsService.updateSettings(actor.id, body.assist_enabled)
  }
}
