import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { AuthUser, CurrentUser } from 'src/auth/jwt/current-user'
import { JwtGuard } from 'src/auth/jwt/jwt-guard'
import { USER_ROLES } from 'src/auth/roles'
import { Roles } from 'src/auth/roles.decorator'
import { RolesGuard } from 'src/auth/roles.guard'
import {
  AdminBrandingService,
  BrandingAssetKind,
  UploadedImage,
} from './admin-branding.service'

@Controller('admin/branding')
@UseGuards(JwtGuard, RolesGuard)
@Roles(USER_ROLES.ADMIN)
export class AdminBrandingController {
  constructor(private readonly brandingService: AdminBrandingService) {}

  @Get()
  getSettings() {
    return this.brandingService.getSettings()
  }

  @Put()
  updateColors(
    @CurrentUser() actor: AuthUser,
    @Body()
    body: {
      primary_color?: string | null
      secondary_color?: string | null
    },
  ) {
    return this.brandingService.updateColors(
      actor.id,
      body.primary_color,
      body.secondary_color,
    )
  }

  @Post('assets/:kind')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  updateAsset(
    @CurrentUser() actor: AuthUser,
    @Param('kind') kind: BrandingAssetKind,
    @UploadedFile() file: UploadedImage,
  ) {
    return this.brandingService.updateAsset(actor.id, kind, file)
  }

  @Delete('assets/:kind')
  removeAsset(
    @CurrentUser() actor: AuthUser,
    @Param('kind') kind: BrandingAssetKind,
  ) {
    return this.brandingService.removeAsset(actor.id, kind)
  }
}
