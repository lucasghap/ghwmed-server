import { Controller, Get } from '@nestjs/common'
import { AdminBrandingService } from './admin-branding.service'

@Controller('platform')
export class PublicBrandingController {
  constructor(private readonly brandingService: AdminBrandingService) {}

  @Get('branding')
  getBranding() {
    return this.brandingService.getSettings()
  }
}
