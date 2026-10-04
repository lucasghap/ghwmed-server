import { Controller, Get } from '@nestjs/common'
import { AdminSettingsService } from './admin-settings.service'

@Controller('platform')
export class PublicSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get('settings')
  getSettings() {
    return this.settingsService.getSettings()
  }
}
