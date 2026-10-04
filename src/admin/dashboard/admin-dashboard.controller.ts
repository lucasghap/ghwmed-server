import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtGuard } from 'src/auth/jwt/jwt-guard'
import { Roles } from 'src/auth/roles.decorator'
import { RolesGuard } from 'src/auth/roles.guard'
import { USER_ROLES } from 'src/auth/roles'
import { AdminDashboardService } from './admin-dashboard.service'

@Controller('admin/dashboard')
@UseGuards(JwtGuard, RolesGuard)
@Roles(USER_ROLES.ADMIN)
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get()
  getSummary() {
    return this.dashboardService.getSummary()
  }
}
