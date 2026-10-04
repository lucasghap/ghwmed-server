import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { RolesGuard } from 'src/auth/roles.guard'
import { PrismaService } from 'src/prima.service'
import { AdminAuditService } from './admin-audit.service'
import { AdminBootstrapService } from './admin-bootstrap.service'
import { AdminBrandingController } from './branding/admin-branding.controller'
import { AdminBrandingService } from './branding/admin-branding.service'
import { PublicBrandingController } from './branding/public-branding.controller'
import { AdminDashboardController } from './dashboard/admin-dashboard.controller'
import { AdminDashboardService } from './dashboard/admin-dashboard.service'
import { AdminIntegrationsController } from './integrations/admin-integrations.controller'
import { AdminIntegrationsService } from './integrations/admin-integrations.service'
import { AdminUsersController } from './users/admin-users.controller'
import { AdminUsersService } from './users/admin-users.service'

@Module({
  imports: [AuthModule],
  controllers: [
    AdminDashboardController,
    AdminUsersController,
    AdminBrandingController,
    PublicBrandingController,
    AdminIntegrationsController,
  ],
  providers: [
    PrismaService,
    RolesGuard,
    AdminAuditService,
    AdminBootstrapService,
    AdminDashboardService,
    AdminUsersService,
    AdminBrandingService,
    AdminIntegrationsService,
  ],
})
export class AdminModule {}
